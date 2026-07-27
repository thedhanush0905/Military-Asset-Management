import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class OrganizationUnitRepository {
  public async create(
    data: prismaClientModule.Prisma.OrganizationUnitUncheckedCreateInput
  ): Promise<prismaClientModule.OrganizationUnit> {
    return prisma.organizationUnit.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.OrganizationUnitUncheckedUpdateInput
  ): Promise<prismaClientModule.OrganizationUnit> {
    return prisma.organizationUnit.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.OrganizationUnit | null> {
    return prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { personnel: true, equipmentAssets: true },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<prismaClientModule.OrganizationUnit | null> {
    return prisma.organizationUnit.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
  }

  public async findMany(where: prismaClientModule.Prisma.OrganizationUnitWhereInput): Promise<prismaClientModule.OrganizationUnit[]> {
    return prisma.organizationUnit.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { personnel: true, equipmentAssets: true },
        },
      },
    });
  }

  public async delete(id: string): Promise<prismaClientModule.OrganizationUnit> {
    return prisma.organizationUnit.delete({
      where: { id },
    });
  }
}

export = OrganizationUnitRepository;
