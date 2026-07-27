import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class ReportRepository {
  public async createJob(
    data: prismaClientModule.Prisma.ReportJobUncheckedCreateInput
  ): Promise<prismaClientModule.ReportJob> {
    return prisma.reportJob.create({ data });
  }

  public async updateJob(
    id: string,
    data: prismaClientModule.Prisma.ReportJobUncheckedUpdateInput
  ): Promise<prismaClientModule.ReportJob> {
    return prisma.reportJob.update({
      where: { id },
      data,
    });
  }

  public async findJobById(id: string): Promise<prismaClientModule.ReportJob | null> {
    return prisma.reportJob.findUnique({
      where: { id },
    });
  }

  public async findManyJobs(
    where: prismaClientModule.Prisma.ReportJobWhereInput
  ): Promise<prismaClientModule.ReportJob[]> {
    return prisma.reportJob.findMany({
      where,
      orderBy: { requestedAt: "desc" },
    });
  }
}

export = ReportRepository;
