import TransferRepository = require("./transfer.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type transferTypes = require("./transfer.types.js");
import statusTransitions = require("../../shared/utils/statusTransitions.js");
import orchestrator = require("../../shared/utils/transactionOrchestration.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

class TransferService {
  private readonly transferRepository: TransferRepository;

  constructor() {
    this.transferRepository = new TransferRepository();
  }

  private sanitizeTransfer(transfer: any): transferTypes.TransferResponse {
    return {
      id: transfer.id,
      equipmentAssetId: transfer.equipmentAssetId,
      fromBaseId: transfer.fromBaseId,
      toBaseId: transfer.toBaseId,
      quantity: transfer.quantity,
      transferredById: transfer.transferredById,
      remarks: transfer.remarks,
      status: transfer.status,
      transferredAt: transfer.transferredAt,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      equipmentAsset: transfer.equipmentAsset ? {
        id: transfer.equipmentAsset.id,
        serialNumber: transfer.equipmentAsset.serialNumber,
        equipment: {
          id: transfer.equipmentAsset.equipment.id,
          name: transfer.equipmentAsset.equipment.name,
        },
      } : undefined,
      fromBase: transfer.fromBase ? {
        id: transfer.fromBase.id,
        code: transfer.fromBase.code,
        name: transfer.fromBase.name,
      } : undefined,
      toBase: transfer.toBase ? {
        id: transfer.toBase.id,
        code: transfer.toBase.code,
        name: transfer.toBase.name,
      } : undefined,
      transferredBy: transfer.transferredBy ? {
        id: transfer.transferredBy.id,
        name: transfer.transferredBy.name,
        email: transfer.transferredBy.email,
      } : undefined,
    };
  }

  public async createTransfer(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<transferTypes.TransferResponse> {
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError(`Asset with ID '${data.equipmentAssetId}' not found or inactive`);
    }

    // Scoping check for creator base
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Source asset belongs to another base");
    }

    if (asset.status !== "AVAILABLE") {
      throw new ValidationError(`Cannot transfer asset with status '${asset.status}': must be AVAILABLE`);
    }

    // Defense-in-depth: active assignment check
    const activeAssign = await prisma.assignment.findFirst({
      where: { equipmentAssetId: data.equipmentAssetId, status: "ACTIVE" },
    });
    if (activeAssign) {
      throw new ConflictError("Cannot transfer: asset is currently assigned to personnel");
    }

    const toBase = await prisma.base.findFirst({
      where: { id: data.toBaseId, isActive: true },
    });
    if (!toBase) {
      throw new NotFoundError(`Destination base with ID '${data.toBaseId}' not found or inactive`);
    }

    if (asset.baseId === data.toBaseId) {
      throw new ValidationError("Destination base must be different from the source base");
    }

    const transfer = await this.transferRepository.create({
      equipmentAssetId: data.equipmentAssetId,
      fromBaseId: asset.baseId,
      toBaseId: data.toBaseId,
      quantity: 1,
      transferredById: currentUser.id,
      status: "PENDING",
      remarks: data.remarks ? data.remarks.trim() : null,
      transferredAt: new Date(),
    });

    const populated = await this.transferRepository.findById(transfer.id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "TRANSFER",
      action: "TRANSFER_CREATE",
      entityType: "Transfer",
      entityId: transfer.id,
      newValues: { equipmentAssetId: transfer.equipmentAssetId, fromBaseId: transfer.fromBaseId, toBaseId: transfer.toBaseId, status: transfer.status },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "New Transfer Initiated",
      message: `Transfer of asset ${(populated as any)?.equipmentAsset?.serialNumber} from base ${populated?.fromBaseId} to ${populated?.toBaseId} has been requested.`,
      type: "TRANSFER",
      priority: "MEDIUM",
      actionUrl: `/transfers/${transfer.id}`,
    });

    return this.sanitizeTransfer(populated!);
  }

  public async approveTransfer(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<transferTypes.TransferResponse> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found");
    }

    if (transfer.status !== "PENDING") {
      throw new ValidationError(`Cannot approve transfer in status '${transfer.status}': must be PENDING`);
    }

    // Scoping check
    if (currentUser.role !== "ADMIN") {
      if (transfer.fromBaseId !== currentUser.baseId && transfer.toBaseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: You are not authorized for the source or destination base");
      }
    }

    const updated = await this.transferRepository.update(id, {
      status: "APPROVED",
    });

    const populated = await this.transferRepository.findById(updated.id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "TRANSFER",
      action: "TRANSFER_APPROVE",
      entityType: "Transfer",
      entityId: id,
      oldValues: { status: "PENDING" },
      newValues: { status: "APPROVED" },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "Transfer Approved",
      message: `Asset transfer request ${id} has been approved.`,
      type: "TRANSFER",
      priority: "MEDIUM",
      actionUrl: `/transfers/${id}`,
    });

    return this.sanitizeTransfer(populated!);
  }

  public async rejectTransfer(
    currentUser: prismaClientModule.User,
    id: string,
    remarks?: string
  ): Promise<transferTypes.TransferResponse> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found");
    }

    if (transfer.status !== "PENDING" && transfer.status !== "APPROVED") {
      throw new ValidationError(`Cannot reject transfer in status '${transfer.status}': must be PENDING or APPROVED`);
    }

    // Scoping check
    if (currentUser.role !== "ADMIN") {
      if (transfer.fromBaseId !== currentUser.baseId && transfer.toBaseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: You are not authorized for the source or destination base");
      }
    }

    const updated = await this.transferRepository.update(id, {
      status: "REJECTED",
      remarks: remarks ? remarks.trim() : transfer.remarks,
    });

    const populated = await this.transferRepository.findById(updated.id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "TRANSFER",
      action: "TRANSFER_REJECT",
      entityType: "Transfer",
      entityId: id,
      oldValues: { status: transfer.status },
      newValues: { status: "REJECTED" },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "Transfer Rejected",
      message: `Asset transfer request ${id} has been rejected.`,
      type: "TRANSFER",
      priority: "LOW",
      actionUrl: `/transfers/${id}`,
    });

    return this.sanitizeTransfer(populated!);
  }

  public async dispatchTransfer(
    currentUser: prismaClientModule.User,
    id: string,
    remarks?: string
  ): Promise<transferTypes.TransferResponse> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found");
    }

    if (transfer.status !== "APPROVED") {
      throw new ValidationError(`Cannot dispatch transfer in status '${transfer.status}': must be APPROVED`);
    }

    // Scoping check
    if (currentUser.role !== "ADMIN" && transfer.fromBaseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Dispatch must be executed from the source base");
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: transfer.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Asset linked to transfer not found or inactive");
    }

    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "DISPATCH");

    await orchestrator.orchestrateAssetTransaction({
      assetId: transfer.equipmentAssetId,
      assetUpdates: {
        status: nextStatus,
      },
      movement: {
        movementType: "TRANSFER_OUT",
        sourceBaseId: transfer.fromBaseId,
        destinationBaseId: transfer.toBaseId,
        referenceType: "TRANSFER",
        referenceId: id,
        performedById: currentUser.id,
        remarks: remarks || "Transfer dispatched",
      },
      additionalOperations: async (tx) => {
        await tx.transfer.update({
          where: { id },
          data: {
            status: "IN_TRANSIT",
            remarks: remarks ? remarks.trim() : transfer.remarks,
          },
        });
      },
    });

    const populated = await this.transferRepository.findById(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "TRANSFER",
      action: "TRANSFER_DISPATCH",
      entityType: "Transfer",
      entityId: id,
      oldValues: { status: "APPROVED" },
      newValues: { status: "IN_TRANSIT" },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "Transfer Dispatched",
      message: `Transfer of asset ${(populated as any)?.equipmentAsset?.serialNumber} has been dispatched.`,
      type: "TRANSFER",
      priority: "MEDIUM",
      actionUrl: `/transfers/${id}`,
    });

    return this.sanitizeTransfer(populated!);
  }

  public async receiveTransfer(
    currentUser: prismaClientModule.User,
    id: string,
    remarks?: string
  ): Promise<transferTypes.TransferResponse> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found");
    }

    if (transfer.status !== "IN_TRANSIT") {
      throw new ValidationError(`Cannot receive transfer in status '${transfer.status}': must be IN_TRANSIT`);
    }

    // Scoping check
    if (currentUser.role !== "ADMIN" && transfer.toBaseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Receiving must be executed at the destination base");
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: transfer.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Asset linked to transfer not found or inactive");
    }

    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "RECEIVE");

    await orchestrator.orchestrateAssetTransaction({
      assetId: transfer.equipmentAssetId,
      assetUpdates: {
        baseId: transfer.toBaseId, // Location updated to destination base!
        status: nextStatus,
      },
      movement: {
        movementType: "TRANSFER_IN",
        sourceBaseId: transfer.fromBaseId,
        destinationBaseId: transfer.toBaseId,
        referenceType: "TRANSFER",
        referenceId: id,
        performedById: currentUser.id,
        remarks: remarks || "Transfer received",
      },
      additionalOperations: async (tx) => {
        await tx.transfer.update({
          where: { id },
          data: {
            status: "COMPLETED",
            remarks: remarks ? remarks.trim() : transfer.remarks,
          },
        });
      },
    });

    const populated = await this.transferRepository.findById(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "TRANSFER",
      action: "TRANSFER_RECEIVE",
      entityType: "Transfer",
      entityId: id,
      oldValues: { status: "IN_TRANSIT" },
      newValues: { status: "COMPLETED" },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "Transfer Completed",
      message: `Asset ${(populated as any)?.equipmentAsset?.serialNumber} transfer from base ${populated?.fromBaseId} to ${populated?.toBaseId} has been successfully completed.`,
      type: "TRANSFER",
      priority: "MEDIUM",
      actionUrl: `/transfers/${id}`,
    });

    return this.sanitizeTransfer(populated!);
  }

  public async cancelTransfer(
    currentUser: prismaClientModule.User,
    id: string,
    remarks?: string
  ): Promise<transferTypes.TransferResponse> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found");
    }

    const cancellableStatuses: prismaClientModule.TransferStatus[] = ["PENDING", "APPROVED", "IN_TRANSIT"];
    if (!cancellableStatuses.includes(transfer.status)) {
      throw new ValidationError(`Cannot cancel transfer in status '${transfer.status}': must be PENDING, APPROVED, or IN_TRANSIT`);
    }

    // Scoping check
    if (currentUser.role !== "ADMIN" && transfer.fromBaseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Cancellation must be requested by the source base");
    }

    if (transfer.status === "IN_TRANSIT") {
      // Dispatched: revert asset status to AVAILABLE
      const asset = await prisma.equipmentAsset.findFirst({
        where: { id: transfer.equipmentAssetId, isActive: true },
      });
      if (!asset) {
        throw new NotFoundError("Asset linked to transfer not found or inactive");
      }

      await orchestrator.orchestrateAssetTransaction({
        assetId: transfer.equipmentAssetId,
        assetUpdates: {
          status: "AVAILABLE",
        },
        additionalOperations: async (tx) => {
          await tx.transfer.update({
            where: { id },
            data: {
              status: "CANCELLED",
              remarks: remarks ? remarks.trim() : transfer.remarks,
            },
          });
        },
      });
    } else {
      // Not dispatched yet: simply mark transfer CANCELLED
      await this.transferRepository.update(id, {
        status: "CANCELLED",
        remarks: remarks ? remarks.trim() : transfer.remarks,
      });
    }

    const populated = await this.transferRepository.findById(id);
    return this.sanitizeTransfer(populated!);
  }

  public async getTransferById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<transferTypes.TransferResponse> {
    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found");
    }

    // Base scope check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (transfer.fromBaseId !== currentUser.baseId && transfer.toBaseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Transfer belongs to other bases");
      }
    }

    return this.sanitizeTransfer(transfer);
  }

  public async getTransfers(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<transferTypes.PaginatedTransfer> {
    const page = Number(queryParams.page ?? 1);
    const limit = Number(queryParams.limit ?? 10);
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.TransferWhereInput = {};

    // Apply base scoping
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.OR = [
        { fromBaseId: currentUser.baseId },
        { toBaseId: currentUser.baseId },
      ];
    } else if (currentUser.role === "ADMIN") {
      if (queryParams.fromBaseId || queryParams.toBaseId) {
        const filters: any[] = [];
        if (queryParams.fromBaseId) filters.push({ fromBaseId: queryParams.fromBaseId });
        if (queryParams.toBaseId) filters.push({ toBaseId: queryParams.toBaseId });
        where.AND = filters;
      }
    }

    if (queryParams.equipmentAssetId) {
      where.equipmentAssetId = queryParams.equipmentAssetId;
    }

    if (queryParams.status) {
      where.status = queryParams.status;
    }

    if (search) {
      where.OR = [
        {
          remarks: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          equipmentAsset: {
            serialNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          fromBase: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          toBase: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const { transfers, total } = await this.transferRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      transfers: transfers.map((t) => this.sanitizeTransfer(t)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }
}

export = TransferService;
