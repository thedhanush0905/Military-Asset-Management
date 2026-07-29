import AuditLogRepository = require("./audit-log.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class AuditLogService {
  private readonly auditLogRepository: AuditLogRepository;

  constructor() {
    this.auditLogRepository = new AuditLogRepository();
  }

  public async getAuditLogs(currentUser: prismaClientModule.User, query: any) {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Only administrators can view audit logs");
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: prismaClientModule.Prisma.AuditLogWhereInput = {};

    if (query.module) {
      where.module = { equals: query.module.trim(), mode: "insensitive" };
    }
    if (query.userId) {
      where.userId = query.userId.trim();
    }
    if (query.action) {
      where.action = { equals: query.action.trim(), mode: "insensitive" };
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const { logs, total } = await this.auditLogRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getAuditLogById(currentUser: prismaClientModule.User, id: string) {
    if (currentUser.role !== "ADMIN") {
      throw new ForbiddenError("Access Denied: Only administrators can view audit logs");
    }

    const log = await this.auditLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError("Audit log entry not found");
    }

    return log;
  }
}

export = AuditLogService;
