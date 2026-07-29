import EquipmentRepository = require("./equipment.repository.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import type equipmentTypes = require("./equipment.types.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

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
      supplierId: eq.supplierId,
      supplier: eq.supplier ? { id: eq.supplier.id, name: eq.supplier.name } : null,
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
      supplierId: data.supplierId ?? null,
      model: data.model ? data.model.trim() : null,
      specifications: data.specifications ? data.specifications.trim() : null,
      expectedLifeYears: data.expectedLifeYears ?? null,
      isActive: true,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "EQUIPMENT",
      action: "EQUIPMENT_CREATE",
      entityType: "Equipment",
      entityId: created.id,
      newValues: { name: created.name, category: created.category, unit: created.unit, supplierId: (created as any).supplierId, model: created.model },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "New Equipment Catalog Added",
      message: `Equipment ${created.name} (${created.category}) was added to catalog by ${currentUser.name}.`,
      type: "SYSTEM",
      priority: "LOW",
    });

    return this.sanitizeEquipment(created);
  }

  public async getEquipment(
    currentUser: prismaClientModule.User,
    queryParams: any
  ): Promise<equipmentTypes.PaginatedEquipment> {
    const page = Number(queryParams.page ?? 1);
    const limit = Number(queryParams.limit ?? 10);
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
          supplier: {
            name: {
              contains: search,
              mode: "insensitive",
            },
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
    if (data.supplierId !== undefined) updatePayload.supplierId = data.supplierId;
    if (data.model !== undefined) updatePayload.model = data.model ? data.model.trim() : null;
    if (data.specifications !== undefined) updatePayload.specifications = data.specifications ? data.specifications.trim() : null;
    if (data.expectedLifeYears !== undefined) updatePayload.expectedLifeYears = data.expectedLifeYears;

    const updated = await this.equipmentRepository.update(id, updatePayload);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "EQUIPMENT",
      action: "EQUIPMENT_UPDATE",
      entityType: "Equipment",
      entityId: updated.id,
      oldValues: { name: target.name, category: target.category, unit: target.unit, supplierId: (target as any).supplierId, model: target.model },
      newValues: { name: updated.name, category: updated.category, unit: updated.unit, supplierId: (updated as any).supplierId, model: updated.model },
    });

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

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "EQUIPMENT",
      action: "EQUIPMENT_DELETE",
      entityType: "Equipment",
      entityId: deleted.id,
      oldValues: { name: target.name, category: target.category, unit: target.unit, supplierId: (target as any).supplierId, model: target.model },
    });

    return this.sanitizeEquipment(deleted);
  }
}

export = EquipmentService;
