import AssignmentRepository = require("./assignment.repository.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type assignmentTypes = require("./assignment.types.js");
import statusTransitions = require("../../shared/utils/statusTransitions.js");
import orchestrator = require("../../shared/utils/transactionOrchestration.js");

class AssignmentService {
  private readonly assignmentRepository: AssignmentRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
  }

  private sanitizeAssignment(assign: any): assignmentTypes.AssignmentResponse {
    return {
      id: assign.id,
      baseId: assign.baseId,
      equipmentAssetId: assign.equipmentAssetId,
      assignedTo: assign.assignedTo,
      status: assign.status,
      assignedById: assign.assignedById,
      assignedAt: assign.assignedAt,
      returnedAt: assign.returnedAt,
      returnedById: assign.returnedById,
      remarks: assign.remarks,
      createdAt: assign.createdAt,
      updatedAt: assign.updatedAt,
      equipmentAsset: assign.equipmentAsset ? {
        id: assign.equipmentAsset.id,
        serialNumber: assign.equipmentAsset.serialNumber,
        equipment: {
          id: assign.equipmentAsset.equipment.id,
          name: assign.equipmentAsset.equipment.name,
        },
      } : undefined,
      base: assign.base ? {
        id: assign.base.id,
        code: assign.base.code,
        name: assign.base.name,
      } : undefined,
      assignedBy: assign.assignedBy ? {
        id: assign.assignedBy.id,
        name: assign.assignedBy.name,
        email: assign.assignedBy.email,
      } : undefined,
      returnedBy: assign.returnedBy ? {
        id: assign.returnedBy.id,
        name: assign.returnedBy.name,
        email: assign.returnedBy.email,
      } : null,
    };
  }

  public async createAssignment(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<assignmentTypes.AssignmentResponse> {
    // 1. Fetch physical asset
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: data.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError(`Asset with ID '${data.equipmentAssetId}' not found or inactive`);
    }

    // 2. Base ownership check
    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Asset belongs to another base");
    }

    // 3. Status transition check
    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "ASSIGN");

    // 4. Active assignment check (Defense-in-depth)
    const existingActive = await this.assignmentRepository.findActiveByAssetId(data.equipmentAssetId);
    if (existingActive) {
      throw new ConflictError("Cannot assign: asset already has an active assignment");
    }

    // 5. Orchestrate transaction
    let newAssignmentId = "";
    await orchestrator.orchestrateAssetTransaction({
      assetId: data.equipmentAssetId,
      assetUpdates: {
        status: nextStatus,
      },
      movement: {
        movementType: "ASSIGNMENT",
        sourceBaseId: asset.baseId,
        referenceType: "ASSIGNMENT",
        referenceId: "", // Will be updated or populated once transaction commits or assignment ID is available
        performedById: currentUser.id,
        remarks: data.remarks,
      },
      additionalOperations: async (tx) => {
        const created = await tx.assignment.create({
          data: {
            baseId: asset.baseId,
            equipmentAssetId: data.equipmentAssetId,
            assignedTo: data.assignedTo.trim(),
            status: "ACTIVE",
            assignedById: currentUser.id,
            remarks: data.remarks ? data.remarks.trim() : null,
            assignedAt: new Date(),
          },
        });
        newAssignmentId = created.id;
      },
    });

    // Retroactively update the movement referenceId inside a separate write if needed, or simply log it.
    // To keep it 100% clean and correct, we can update the movement referenceId using the newly generated assignment ID!
    if (newAssignmentId) {
      await prisma.movementHistory.updateMany({
        where: {
          equipmentAssetId: data.equipmentAssetId,
          referenceType: "ASSIGNMENT",
          referenceId: "",
        },
        data: {
          referenceId: newAssignmentId,
        },
      });
    }

    const assignment = await this.assignmentRepository.findById(newAssignmentId);
    if (!assignment) {
      throw new NotFoundError("Assignment record not created successfully");
    }

    return this.sanitizeAssignment(assignment);
  }

  public async returnAssignment(
    currentUser: prismaClientModule.User,
    id: string,
    remarks?: string
  ): Promise<assignmentTypes.AssignmentResponse> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment || assignment.status !== "ACTIVE") {
      throw new NotFoundError("Active assignment record not found");
    }

    // Base scope check
    if (currentUser.role !== "ADMIN" && assignment.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Assignment belongs to another base");
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: assignment.equipmentAssetId, isActive: true },
    });
    if (!asset) {
      throw new NotFoundError("Equipment asset linked to assignment not found or inactive");
    }

    const nextStatus = statusTransitions.validateStatusTransition(asset.status, "RETURN");

    await orchestrator.orchestrateAssetTransaction({
      assetId: assignment.equipmentAssetId,
      assetUpdates: {
        status: nextStatus,
      },
      movement: {
        movementType: "RETURN",
        sourceBaseId: asset.baseId,
        referenceType: "ASSIGNMENT",
        referenceId: id,
        performedById: currentUser.id,
        remarks: remarks || "Asset returned",
      },
      additionalOperations: async (tx) => {
        await tx.assignment.update({
          where: { id },
          data: {
            status: "RETURNED",
            returnedAt: new Date(),
            returnedById: currentUser.id,
            remarks: remarks ? remarks.trim() : assignment.remarks,
          },
        });
      },
    });

    const updated = await this.assignmentRepository.findById(id);
    return this.sanitizeAssignment(updated!);
  }

  public async getAssignmentById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<assignmentTypes.AssignmentResponse> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundError("Assignment record not found");
    }

    // Base scope check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (assignment.baseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Assignment belongs to another base");
      }
    }

    return this.sanitizeAssignment(assignment);
  }

  public async getAssignments(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<assignmentTypes.PaginatedAssignment> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.AssignmentWhereInput = {};

    // Apply base scoping
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.baseId = currentUser.baseId;
    } else if (currentUser.role === "ADMIN" && queryParams.baseId) {
      where.baseId = queryParams.baseId;
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
          assignedTo: {
            contains: search,
            mode: "insensitive",
          },
        },
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
      ];
    }

    const { assignments, total } = await this.assignmentRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      assignments: assignments.map((a) => this.sanitizeAssignment(a)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  public async getActiveAssignments(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<assignmentTypes.PaginatedAssignment> {
    return this.getAssignments(currentUser, { ...queryParams, status: "ACTIVE" });
  }

  public async getAssignmentHistory(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<assignmentTypes.PaginatedAssignment> {
    return this.getAssignments(currentUser, { ...queryParams, status: "RETURNED" });
  }
}

export = AssignmentService;
