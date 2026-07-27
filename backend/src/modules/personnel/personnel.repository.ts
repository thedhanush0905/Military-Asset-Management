import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class PersonnelRepository {
  public async create(
    data: prismaClientModule.Prisma.PersonnelUncheckedCreateInput
  ): Promise<prismaClientModule.Personnel> {
    return prisma.personnel.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.PersonnelUncheckedUpdateInput
  ): Promise<prismaClientModule.Personnel> {
    return prisma.personnel.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Personnel | null> {
    return prisma.personnel.findUnique({
      where: { id },
      include: {
        unit: true,
        assignments: {
          orderBy: { assignedAt: "desc" },
        },
      },
    });
  }

  public async findByServiceNumber(serviceNumber: string): Promise<prismaClientModule.Personnel | null> {
    return prisma.personnel.findUnique({
      where: { serviceNumber: serviceNumber.trim().toUpperCase() },
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.PersonnelWhereInput,
    options: {
      skip: number;
      take: number;
      orderBy: prismaClientModule.Prisma.PersonnelOrderByWithRelationInput;
    }
  ): Promise<{ personnel: prismaClientModule.Personnel[]; total: number }> {
    const [personnel, total] = await Promise.all([
      prisma.personnel.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        include: {
          unit: true,
        },
      }),
      prisma.personnel.count({ where }),
    ]);

    return { personnel, total };
  }

  public async delete(id: string): Promise<prismaClientModule.Personnel> {
    return prisma.personnel.delete({
      where: { id },
    });
  }
}

export = PersonnelRepository;
