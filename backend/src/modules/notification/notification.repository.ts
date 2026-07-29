import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class NotificationRepository {
  public async findById(id: string): Promise<prismaClientModule.Notification | null> {
    return prisma.notification.findUnique({
      where: { id },
    });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.NotificationUncheckedUpdateInput
  ): Promise<prismaClientModule.Notification> {
    return prisma.notification.update({
      where: { id },
      data,
    });
  }

  public async updateMany(
    where: prismaClientModule.Prisma.NotificationWhereInput,
    data: prismaClientModule.Prisma.NotificationUncheckedUpdateManyInput
  ): Promise<prismaClientModule.Prisma.BatchPayload> {
    return prisma.notification.updateMany({
      where,
      data,
    });
  }

  public async findMany(
    where: prismaClientModule.Prisma.NotificationWhereInput,
    options: {
      skip: number;
      take: number;
      orderBy: prismaClientModule.Prisma.NotificationOrderByWithRelationInput;
    }
  ): Promise<{ notifications: prismaClientModule.Notification[]; total: number }> {
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  public async delete(id: string): Promise<prismaClientModule.Notification> {
    return prisma.notification.delete({
      where: { id },
    });
  }

  public async deleteMany(
    where: prismaClientModule.Prisma.NotificationWhereInput
  ): Promise<prismaClientModule.Prisma.BatchPayload> {
    return prisma.notification.deleteMany({
      where,
    });
  }
}

export = NotificationRepository;
