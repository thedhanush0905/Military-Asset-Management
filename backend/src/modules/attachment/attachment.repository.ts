import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class AttachmentRepository {
  public async create(
    data: prismaClientModule.Prisma.AttachmentUncheckedCreateInput
  ): Promise<prismaClientModule.Attachment> {
    return prisma.attachment.create({ data });
  }

  public async update(
    id: string,
    data: prismaClientModule.Prisma.AttachmentUncheckedUpdateInput
  ): Promise<prismaClientModule.Attachment> {
    return prisma.attachment.update({
      where: { id },
      data,
    });
  }

  public async findById(id: string): Promise<prismaClientModule.Attachment | null> {
    return prisma.attachment.findUnique({
      where: { id, isActive: true },
    });
  }

  public async findLatestByFilenameAndEntity(
    filename: string,
    entityType: string,
    entityId: string
  ): Promise<prismaClientModule.Attachment | null> {
    return prisma.attachment.findFirst({
      where: { filename, entityType, entityId, isActive: true, isLatest: true },
    });
  }

  public async clearLatestFlag(
    filename: string,
    entityType: string,
    entityId: string
  ): Promise<prismaClientModule.Prisma.BatchPayload> {
    return prisma.attachment.updateMany({
      where: { filename, entityType, entityId, isLatest: true },
      data: { isLatest: false },
    });
  }

  public async findMany(where: prismaClientModule.Prisma.AttachmentWhereInput): Promise<prismaClientModule.Attachment[]> {
    return prisma.attachment.findMany({
      where: { ...where, isActive: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export = AttachmentRepository;
