import OrganizationUnitRepository = require("./organization-unit.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");

const LEVEL_ORDER = ["COMMAND", "DIVISION", "BRIGADE", "BATTALION", "COMPANY", "PLATOON", "SECTION"];

class OrganizationUnitService {
  private readonly unitRepository: OrganizationUnitRepository;

  constructor() {
    this.unitRepository = new OrganizationUnitRepository();
  }

  public async createUnit(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<prismaClientModule.OrganizationUnit> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only can manage organizational units");
    }

    const code = data.code.trim().toUpperCase();
    const existing = await this.unitRepository.findByCode(code);
    if (existing) {
      throw new ConflictError(`Organizational Unit with code '${code}' already exists`);
    }

    if (data.parentId) {
      const parent = await this.unitRepository.findById(data.parentId);
      if (!parent) {
        throw new ValidationError("Parent unit does not exist");
      }

      const parentIdx = LEVEL_ORDER.indexOf(parent.level);
      const childIdx = LEVEL_ORDER.indexOf(data.level);
      if (childIdx <= parentIdx) {
        throw new ValidationError(
          `Hierarchy violation: Level '${data.level}' must be lower in hierarchy than parent level '${parent.level}'`
        );
      }
    }

    const created = await this.unitRepository.create({
      name: data.name.trim(),
      code,
      level: data.level,
      parentId: data.parentId || null,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "ORGANIZATION_UNIT",
      action: "ORG_UNIT_CREATE",
      entityType: "OrganizationUnit",
      entityId: created.id,
      newValues: { name: created.name, code: created.code, level: created.level, parentId: created.parentId },
    });

    return created;
  }

  public async updateUnit(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<prismaClientModule.OrganizationUnit> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only can manage organizational units");
    }

    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Organizational Unit not found");
    }

    if (data.code && data.code.trim().toUpperCase() !== unit.code) {
      const code = data.code.trim().toUpperCase();
      const collision = await this.unitRepository.findByCode(code);
      if (collision) {
        throw new ConflictError(`Organizational Unit with code '${code}' already exists`);
      }
    }

    const targetParentId = data.parentId !== undefined ? data.parentId : unit.parentId;
    const targetLevel = data.level !== undefined ? data.level : unit.level;

    if (targetParentId) {
      if (targetParentId === id) {
        throw new ValidationError("A unit cannot be its own parent");
      }

      const parent = await this.unitRepository.findById(targetParentId);
      if (!parent) {
        throw new ValidationError("Parent unit does not exist");
      }

      const parentIdx = LEVEL_ORDER.indexOf(parent.level);
      const childIdx = LEVEL_ORDER.indexOf(targetLevel);
      if (childIdx <= parentIdx) {
        throw new ValidationError(
          `Hierarchy violation: Level '${targetLevel}' must be lower than parent level '${parent.level}'`
        );
      }
    }

    const updated = await this.unitRepository.update(id, {
      name: data.name !== undefined ? data.name.trim() : undefined,
      code: data.code !== undefined ? data.code.trim().toUpperCase() : undefined,
      level: data.level !== undefined ? data.level : undefined,
      parentId: data.parentId !== undefined ? (data.parentId ? data.parentId : null) : undefined,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "ORGANIZATION_UNIT",
      action: "ORG_UNIT_UPDATE",
      entityType: "OrganizationUnit",
      entityId: id,
      oldValues: { name: unit.name, code: unit.code, level: unit.level, parentId: unit.parentId },
      newValues: { name: updated.name, code: updated.code, level: updated.level, parentId: updated.parentId },
    });

    return updated;
  }

  public async getUnitById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<prismaClientModule.OrganizationUnit> {
    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Organizational Unit not found");
    }
    return unit;
  }

  public async getUnitsTree(_currentUser: prismaClientModule.User): Promise<any[]> {
    const allUnits = await this.unitRepository.findMany({});

    // Map units to structure supporting children nesting
    const map = new Map<string, any>();
    for (const u of allUnits) {
      map.set(u.id, {
        id: u.id,
        name: u.name,
        code: u.code,
        level: u.level,
        parentId: u.parentId,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        personnelCount: (u as any)._count.personnel,
        assetsCount: (u as any)._count.equipmentAssets,
        children: [],
      });
    }

    const roots: any[] = [];
    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  }

  public async deleteUnit(currentUser: prismaClientModule.User, id: string): Promise<prismaClientModule.OrganizationUnit> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only can manage organizational units");
    }

    const unit = await this.unitRepository.findById(id);
    if (!unit) {
      throw new NotFoundError("Organizational Unit not found");
    }

    if ((unit as any).children.length > 0) {
      throw new ConflictError("Cannot delete: Unit has active sub-units assigned under its hierarchy");
    }

    if ((unit as any)._count.personnel > 0) {
      throw new ConflictError("Cannot delete: Unit has personnel assigned to it");
    }

    if ((unit as any)._count.equipmentAssets > 0) {
      throw new ConflictError("Cannot delete: Unit has active equipment assets assigned to it");
    }

    const deleted = await this.unitRepository.delete(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "ORGANIZATION_UNIT",
      action: "ORG_UNIT_DELETE",
      entityType: "OrganizationUnit",
      entityId: id,
    });

    return deleted;
  }
}

export = OrganizationUnitService;
