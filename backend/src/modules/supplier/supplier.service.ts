import SupplierRepository = require("./supplier.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ConflictError = require("../../shared/errors/ConflictError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");
import NotificationService = require("../../shared/services/notification.service.js");

class SupplierService {
  private readonly supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  public async createSupplier(
    currentUser: prismaClientModule.User,
    data: any
  ): Promise<prismaClientModule.Supplier> {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "BASE_COMMANDER") {
      throw new ForbiddenError("Access Denied: Insufficient permissions to create supplier");
    }

    const code = data.code.trim().toUpperCase();
    const existing = await this.supplierRepository.findByCode(code);
    if (existing) {
      throw new ConflictError(`Supplier with code '${code}' already exists`);
    }

    const created = await this.supplierRepository.create({
      name: data.name.trim(),
      code,
      contactName: data.contactName ? data.contactName.trim() : null,
      email: data.email ? data.email.trim() : null,
      phone: data.phone ? data.phone.trim() : null,
      address: data.address ? data.address.trim() : null,
      status: data.status,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "SUPPLIER",
      action: "SUPPLIER_CREATE",
      entityType: "Supplier",
      entityId: created.id,
      newValues: { name: created.name, code: created.code, status: created.status },
    });

    await NotificationService.createNotification({
      userId: null,
      title: "New Supplier Registered",
      message: `Supplier ${created.name} (${created.code}) has been registered by ${currentUser.name}.`,
      type: "SYSTEM",
      priority: "LOW",
    });

    return created;
  }

  public async updateSupplier(
    currentUser: prismaClientModule.User,
    id: string,
    data: any
  ): Promise<prismaClientModule.Supplier> {
    if (currentUser.role !== "ADMIN" && currentUser.role !== "BASE_COMMANDER") {
      throw new ForbiddenError("Access Denied: Insufficient permissions to update supplier");
    }

    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    if (data.code && data.code.trim().toUpperCase() !== supplier.code) {
      const code = data.code.trim().toUpperCase();
      const codeCollision = await this.supplierRepository.findByCode(code);
      if (codeCollision) {
        throw new ConflictError(`Supplier with code '${code}' already exists`);
      }
    }

    const updated = await this.supplierRepository.update(id, {
      name: data.name !== undefined ? data.name.trim() : undefined,
      code: data.code !== undefined ? data.code.trim().toUpperCase() : undefined,
      contactName: data.contactName !== undefined ? (data.contactName ? data.contactName.trim() : null) : undefined,
      email: data.email !== undefined ? (data.email ? data.email.trim() : null) : undefined,
      phone: data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : undefined,
      address: data.address !== undefined ? (data.address ? data.address.trim() : null) : undefined,
      status: data.status,
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "SUPPLIER",
      action: "SUPPLIER_UPDATE",
      entityType: "Supplier",
      entityId: id,
      oldValues: { name: supplier.name, code: supplier.code, status: supplier.status },
      newValues: { name: updated.name, code: updated.code, status: updated.status },
    });

    return updated;
  }

  public async getSupplierById(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<prismaClientModule.Supplier> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }
    return supplier;
  }

  public async getSuppliers(currentUser: prismaClientModule.User, query: any) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where: prismaClientModule.Prisma.SupplierWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: "insensitive" } },
        { code: { contains: query.search.trim(), mode: "insensitive" } },
        { contactName: { contains: query.search.trim(), mode: "insensitive" } },
      ];
    }

    const { suppliers, total } = await this.supplierRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    });

    return {
      suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async deleteSupplier(currentUser: prismaClientModule.User, id: string): Promise<prismaClientModule.Supplier> {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Administrators only can delete suppliers");
    }

    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError("Supplier not found");
    }

    const deleted = await this.supplierRepository.softDelete(id);

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "SUPPLIER",
      action: "SUPPLIER_DELETE",
      entityType: "Supplier",
      entityId: id,
    });

    return deleted;
  }
}

export = SupplierService;
