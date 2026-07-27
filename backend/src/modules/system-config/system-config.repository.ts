import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class SystemConfigRepository {
  public async findByKey(key: string): Promise<prismaClientModule.SystemConfig | null> {
    return prisma.systemConfig.findUnique({
      where: { key },
    });
  }

  public async upsert(
    key: string,
    value: string,
    description?: string | null
  ): Promise<prismaClientModule.SystemConfig> {
    return prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        ...(description !== undefined ? { description } : {}),
      },
      create: {
        key,
        value,
        description: description || null,
      },
    });
  }

  public async findMany(): Promise<prismaClientModule.SystemConfig[]> {
    return prisma.systemConfig.findMany({
      orderBy: { key: "asc" },
    });
  }

  public async delete(key: string): Promise<prismaClientModule.SystemConfig> {
    return prisma.systemConfig.delete({
      where: { key },
    });
  }
}

export = SystemConfigRepository;
