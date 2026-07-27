import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class AuditLogRepository {
  public async findById(id: string): Promise<prismaClientModule.AuditLog | null> {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.AuditLogWhereInput,
    options: {
      skip: number;
      take: number;
      orderBy: prismaClientModule.Prisma.AuditLogOrderByWithRelationInput;
    }
  ): Promise<{ logs: prismaClientModule.AuditLog[]; total: number }> {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export = AuditLogRepository;
