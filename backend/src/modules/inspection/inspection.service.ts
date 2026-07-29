import InspectionRepository = require("./inspection.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

class InspectionService {
  private readonly inspectionRepository: InspectionRepository;

  constructor() {
    this.inspectionRepository = new InspectionRepository();
  }

  public async scheduleInspection(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<prismaClientModule.Inspection> {
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Associated equipment asset not found or inactive");
    }

    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    const created = await this.inspectionRepository.create({
      equipmentAssetId: data.equipmentAssetId,
      scheduledDate: data.scheduledDate,
      inspectorId: currentUser.id,
      result: "PENDING",
      remarks: data.remarks || null,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "INSPECTION",
      action: "INSPECTION_SCHEDULE",
      entityType: "Inspection",
      entityId: created.id,
      newValues: { equipmentAssetId: created.equipmentAssetId, scheduledDate: created.scheduledDate },
    });

    await NotificationService.createNotification({
      userId: currentUser.id,
      title: "Inspection Scheduled",
      message: `Inspection scheduled for asset ${asset.serialNumber} on ${created.scheduledDate.toLocaleDateString()}.`,
      type: "MAINTENANCE",
      priority: "MEDIUM",
      actionUrl: `/inspections/${created.id}`,
    });

    return created;
  }

  public async completeInspection(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<prismaClientModule.Inspection> {
    const record = await this.inspectionRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Inspection record not found");
    }

    if (record.result !== "PENDING") {
      throw new ValidationError(`Cannot complete inspection: record is in status '${record.result}' (expected PENDING)`);
    }

    if (currentUser.role !== "ADMIN" && (record as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    const completed = await this.inspectionRepository.update(id, {
      completedDate: data.completedDate || new Date(),
      result: data.result || "PASS",
      remarks: data.remarks !== undefined ? data.remarks : record.remarks,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "INSPECTION",
      action: "INSPECTION_COMPLETE",
      entityType: "Inspection",
      entityId: id,
      oldValues: { result: "PENDING" },
      newValues: { result: completed.result, completedDate: completed.completedDate },
    });

    await NotificationService.createNotification({
      userId: currentUser.id,
      title: "Inspection Completed",
      message: `Inspection completed for asset ${(record as any).equipmentAsset.serialNumber} (Result: ${completed.result}).`,
      type: "MAINTENANCE",
      priority: completed.result === "FAIL" ? "HIGH" : "LOW",
      actionUrl: `/inspections/${id}`,
    });

    return completed;
  }

  public async getInspectionById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<prismaClientModule.Inspection> {
    const record = await this.inspectionRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Inspection record not found");
    }

    if (currentUser.role !== "ADMIN" && (record as any).equipmentAsset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    return record;
  }

  public async getInspections(currentUser: prismaClientModule.User, query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: prismaClientModule.Prisma.InspectionWhereInput = {};

    if (query.result) {
      where.result = query.result;
    }

    if (query.equipmentAssetId) {
      where.equipmentAssetId = query.equipmentAssetId;
    }

    // Base scoping restriction
    if (currentUser.role !== "ADMIN") {
      where.equipmentAsset = {
        baseId: currentUser.baseId!,
        isActive: true,
      };
    } else {
      where.equipmentAsset = {
        isActive: true,
      };
    }

    const { inspections, total } = await this.inspectionRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledDate: "desc" },
    });

    return {
      inspections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async deleteInspection(currentUser: prismaClientModule.User, id: string): Promise<prismaClientModule.Inspection> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only can delete inspection records");
    }

    const record = await this.inspectionRepository.findById(id);
    if (!record) {
      throw new NotFoundError("Inspection record not found");
    }

    const deleted = await this.inspectionRepository.delete(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "INSPECTION",
      action: "INSPECTION_DELETE",
      entityType: "Inspection",
      entityId: id,
    });

    return deleted;
  }
}

export = InspectionService;
