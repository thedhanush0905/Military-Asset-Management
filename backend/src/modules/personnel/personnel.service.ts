import PersonnelRepository = require("./personnel.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");

class PersonnelService {
  private readonly personnelRepository: PersonnelRepository;

  constructor() {
    this.personnelRepository = new PersonnelRepository();
  }

  public async createPersonnel(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<prismaClientModule.Personnel> {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "BASE_COMMANDER") {
      throw new ForbiddenError("Access Denied: Insufficient permissions to create personnel profile");
    }

    const serviceNumber = data.serviceNumber.trim().toUpperCase();
    const existing = await this.personnelRepository.findByServiceNumber(serviceNumber);
    if (existing) {
      throw new ConflictError(`Personnel profile with service number '${serviceNumber}' already exists`);
    }

    if (data.unitId) {
      const unit = await prisma.organizationUnit.findUnique({
        where: { id: data.unitId },
      });
      if (!unit) {
        throw new ValidationError("Assigned organizational unit not found");
      }
    }

    const created = await this.personnelRepository.create({
      serviceNumber,
      rank: data.rank.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      unitId: data.unitId || null,
      email: data.email ? data.email.trim() : null,
      phone: data.phone ? data.phone.trim() : null,
      status: data.status,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "PERSONNEL",
      action: "PERSONNEL_CREATE",
      entityType: "Personnel",
      entityId: created.id,
      newValues: { serviceNumber: created.serviceNumber, rank: created.rank, name: `${created.firstName} ${created.lastName}`, status: created.status },
    });

    return created;
  }

  public async updatePersonnel(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<prismaClientModule.Personnel> {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "BASE_COMMANDER") {
      throw new ForbiddenError("Access Denied: Insufficient permissions to update personnel profile");
    }

    const profile = await this.personnelRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Personnel profile not found");
    }

    if (data.serviceNumber && data.serviceNumber.trim().toUpperCase() !== profile.serviceNumber) {
      const sn = data.serviceNumber.trim().toUpperCase();
      const collision = await this.personnelRepository.findByServiceNumber(sn);
      if (collision) {
        throw new ConflictError(`Personnel profile with service number '${sn}' already exists`);
      }
    }

    if (data.unitId) {
      const unit = await prisma.organizationUnit.findUnique({
        where: { id: data.unitId },
      });
      if (!unit) {
        throw new ValidationError("Assigned organizational unit not found");
      }
    }

    const updated = await this.personnelRepository.update(id, {
      serviceNumber: data.serviceNumber !== undefined ? data.serviceNumber.trim().toUpperCase() : undefined,
      rank: data.rank !== undefined ? data.rank.trim() : undefined,
      firstName: data.firstName !== undefined ? data.firstName.trim() : undefined,
      lastName: data.lastName !== undefined ? data.lastName.trim() : undefined,
      unitId: data.unitId !== undefined ? (data.unitId ? data.unitId : null) : undefined,
      email: data.email !== undefined ? (data.email ? data.email.trim() : null) : undefined,
      phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : undefined,
      status: data.status,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "PERSONNEL",
      action: "PERSONNEL_UPDATE",
      entityType: "Personnel",
      entityId: id,
      oldValues: { serviceNumber: profile.serviceNumber, rank: profile.rank, status: profile.status },
      newValues: { serviceNumber: updated.serviceNumber, rank: updated.rank, status: updated.status },
    });

    return updated;
  }

  public async getPersonnelById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<prismaClientModule.Personnel> {
    const profile = await this.personnelRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Personnel profile not found");
    }
    return profile;
  }

  public async getPersonnelList(currentUser: prismaClientModule.User, query: any) {
    let page = Number(query.page ?? 1);
    let limit = Number(query.limit ?? 10);

    if (isNaN(page) || page <= 0) {
      page = 1;
    }
    if (isNaN(limit) || limit <= 0) {
      limit = 10;
    }

    const where: prismaClientModule.Prisma.PersonnelWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.unitId) {
      where.unitId = query.unitId;
    }

    if (query.search) {
      where.OR = [
        { serviceNumber: { contains: query.search.trim(), mode: "insensitive" } },
        { firstName: { contains: query.search.trim(), mode: "insensitive" } },
        { lastName: { contains: query.search.trim(), mode: "insensitive" } },
        { rank: { contains: query.search.trim(), mode: "insensitive" } },
      ];
    }

    const { personnel, total } = await this.personnelRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { lastName: "asc" },
    });

    return {
      personnel,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async deletePersonnel(currentUser: prismaClientModule.User, id: string): Promise<prismaClientModule.Personnel> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only can delete personnel records");
    }

    const profile = await this.personnelRepository.findById(id);
    if (!profile) {
      throw new NotFoundError("Personnel profile not found");
    }

    const activeAssignment = (profile as any).assignments.find((a: any) => a.status === "ACTIVE");
    if (activeAssignment) {
      throw new ConflictError("Cannot delete: Personnel currently holds active equipment assignments");
    }

    const deleted = await this.personnelRepository.delete(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "PERSONNEL",
      action: "PERSONNEL_DELETE",
      entityType: "Personnel",
      entityId: id,
    });

    return deleted;
  }
}

export = PersonnelService;
