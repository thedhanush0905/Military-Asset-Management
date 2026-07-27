import MovementRepository = require("./movement.repository.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import type movementTypes = require("./movement.types.js");

class MovementService {
  private readonly movementRepository: MovementRepository;

  constructor() {
    this.movementRepository = new MovementRepository();
  }

  private sanitizeMovement(mov: any): movementTypes.MovementResponse {
    return {
      id: mov.id,
      equipmentAssetId: mov.equipmentAssetId,
      movementType: mov.movementType,
      sourceBaseId: mov.sourceBaseId,
      destinationBaseId: mov.destinationBaseId,
      referenceType: mov.referenceType,
      referenceId: mov.referenceId,
      performedById: mov.performedById,
      remarks: mov.remarks,
      createdAt: mov.createdAt,
      equipmentAsset: mov.equipmentAsset ? {
        id: mov.equipmentAsset.id,
        serialNumber: mov.equipmentAsset.serialNumber,
        equipment: {
          id: mov.equipmentAsset.equipment.id,
          name: mov.equipmentAsset.equipment.name,
        },
      } : undefined,
      sourceBase: mov.sourceBase ? {
        id: mov.sourceBase.id,
        code: mov.sourceBase.code,
        name: mov.sourceBase.name,
      } : null,
      destinationBase: mov.destinationBase ? {
        id: mov.destinationBase.id,
        code: mov.destinationBase.code,
        name: mov.destinationBase.name,
      } : null,
      performedBy: mov.performedBy ? {
        id: mov.performedBy.id,
        name: mov.performedBy.name,
        email: mov.performedBy.email,
      } : undefined,
    };
  }

  public async getMovementById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<movementTypes.MovementResponse> {
    const movement = await this.movementRepository.findById(id);
    if (!movement) {
      throw new NotFoundError("Movement history record not found");
    }

    // Scoping check
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (movement.sourceBaseId !== currentUser.baseId && movement.destinationBaseId !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Movement log belongs to another base");
      }
    }

    return this.sanitizeMovement(movement);
  }

  public async getMovements(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<movementTypes.PaginatedMovement> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.MovementHistoryWhereInput = {};

    // Apply base scoping
    if (currentUser.role === "BASE_COMMANDER" || currentUser.role === "LOGISTICS_OFFICER") {
      if (!currentUser.baseId) {
        throw new ForbiddenError("Access Denied: User not assigned to a base");
      }
      where.OR = [
        { sourceBaseId: currentUser.baseId },
        { destinationBaseId: currentUser.baseId },
      ];
    } else if (currentUser.role === "ADMIN") {
      if (queryParams.sourceBaseId || queryParams.destinationBaseId) {
        const filters: any[] = [];
        if (queryParams.sourceBaseId) filters.push({ sourceBaseId: queryParams.sourceBaseId });
        if (queryParams.destinationBaseId) filters.push({ destinationBaseId: queryParams.destinationBaseId });
        where.AND = filters;
      }
    }

    if (queryParams.equipmentAssetId) {
      where.equipmentAssetId = queryParams.equipmentAssetId;
    }

    if (queryParams.movementType) {
      where.movementType = queryParams.movementType;
    }

    if (queryParams.referenceType) {
      where.referenceType = queryParams.referenceType;
    }

    if (queryParams.referenceId) {
      where.referenceId = queryParams.referenceId;
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
      ];
    }

    const { movements, total } = await this.movementRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      movements: movements.map((m) => this.sanitizeMovement(m)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }
}

export = MovementService;
