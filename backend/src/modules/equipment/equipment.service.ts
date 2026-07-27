import EquipmentRepository = require("./equipment.repository.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type equipmentTypes = require("./equipment.types.js");

const categoryValues: prismaClientModule.EquipmentCategory[] = [
  "WEAPON",
  "VEHICLE",
  "AMMUNITION",
  "COMMUNICATION",
  "MEDICAL",
  "OTHER"
];

class EquipmentService {
  private readonly equipmentRepository: EquipmentRepository;

  constructor() {
    this.equipmentRepository = new EquipmentRepository();
  }

  private sanitizeEquipment(eq: any): equipmentTypes.EquipmentResponse {
    return {
      id: eq.id,
      name: eq.name,
      category: eq.category,
      unit: eq.unit,
      description: eq.description,
      manufacturer: eq.manufacturer,
      model: eq.model,
      specifications: eq.specifications,
      expectedLifeYears: eq.expectedLifeYears,
      isActive: eq.isActive,
      createdAt: eq.createdAt,
      updatedAt: eq.updatedAt,
      assetCount: eq._count?.assets,
      inventoryCount: eq._count?.inventories,
    };
  }

  public async createEquipment(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<equipmentTypes.EquipmentResponse> {
    const created = await this.equipmentRepository.create({
      name: data.name.trim(),
      category: data.category,
      unit: data.unit,
      description: data.description ? data.description.trim() : null,
      manufacturer: data.manufacturer ? data.manufacturer.trim() : null,
      model: data.model ? data.model.trim() : null,
      specifications: data.specifications ? data.specifications.trim() : null,
      expectedLifeYears: data.expectedLifeYears ?? null,
      isActive: true,
    });

    // TODO: Trigger Audit Log hook here (auditLogService.logAction(...))

    return this.sanitizeEquipment(created);
  }

  public async getEquipment(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<equipmentTypes.PaginatedEquipment> {
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 10;
    const sortBy = queryParams.sortBy ?? "createdAt";
    const sortOrder = queryParams.sortOrder ?? "desc";
    const search = queryParams.search ? queryParams.search.trim() : undefined;

    const where: prismaClientModule.Prisma.EquipmentWhereInput = {
      isActive: true,
    };

    if (queryParams.category) {
      where.category = queryParams.category;
    }

    if (search) {
      const orConditions: prismaClientModule.Prisma.EquipmentWhereInput[] = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          manufacturer: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          model: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];

      // Add enum search match if substring matches a valid EquipmentCategory
      const matchedCategory = categoryValues.find((c) =>
        c.toLowerCase().includes(search.toLowerCase())
      );
      if (matchedCategory) {
        orConditions.push({ category: matchedCategory });
      }

      where.OR = orConditions;
    }

    const { equipment, total } = await this.equipmentRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      equipment: equipment.map((e) => this.sanitizeEquipment(e)),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
      },
    };
  }

  public async getEquipmentById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<equipmentTypes.EquipmentResponse> {
    const equipment = await this.equipmentRepository.findById(id);
    if (!equipment) {
      throw new NotFoundError("Equipment model not found");
    }

    return this.sanitizeEquipment(equipment);
  }

  public async updateEquipment(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<equipmentTypes.EquipmentResponse> {
    const target = await this.equipmentRepository.findById(id);
    if (!target) {
      throw new NotFoundError("Equipment model not found");
    }

    const updatePayload: prismaClientModule.Prisma.EquipmentUncheckedUpdateInput = {};

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.unit !== undefined) updatePayload.unit = data.unit;
    if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;
    if (data.manufacturer !== undefined) updatePayload.manufacturer = data.manufacturer ? data.manufacturer.trim() : null;
    if (data.model !== undefined) updatePayload.model = data.model ? data.model.trim() : null;
    if (data.specifications !== undefined) updatePayload.specifications = data.specifications ? data.specifications.trim() : null;
    if (data.expectedLifeYears !== undefined) updatePayload.expectedLifeYears = data.expectedLifeYears;

    const updated = await this.equipmentRepository.update(id, updatePayload);

    // TODO: Trigger Audit Log hook here (auditLogService.logAction(...))

    return this.sanitizeEquipment(updated);
  }

  public async deleteEquipment(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<equipmentTypes.EquipmentResponse> {
    const target = await this.equipmentRepository.findById(id);
    if (!target) {
      throw new NotFoundError("Equipment model not found");
    }

    const activeAssetsCount = await this.equipmentRepository.countActiveAssets(id);
    if (activeAssetsCount > 0) {
      throw new ConflictError("Cannot delete equipment catalog record: active assets exist for this model");
    }

    const deleted = await this.equipmentRepository.softDelete(id);

    // TODO: Trigger Audit Log hook here (auditLogService.logAction(...))

    return this.sanitizeEquipment(deleted);
  }
}

export = EquipmentService;
