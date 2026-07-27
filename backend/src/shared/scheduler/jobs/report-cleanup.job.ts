import IJob = require("../job.interface.js");
import prisma = require("../../prisma/prisma.js");
import LocalDiskStorageProvider = require("../../providers/local-storage.provider.js");

class ReportCleanupJob implements IJob {
  public readonly name = "ReportCleanupJob";
  private readonly storageProvider: LocalDiskStorageProvider;

  constructor() {
    this.storageProvider = new LocalDiskStorageProvider();
  }

  public async execute(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const expiredJobs = await prisma.reportJob.findMany({
      where: {
        requestedAt: { lte: sevenDaysAgo },
        status: "COMPLETED",
      },
    });

    for (const job of expiredJobs) {
      if (job.storageKey) {
        try {
          await this.storageProvider.deleteFile(job.storageKey);
        } catch (err: any) {
          console.warn(`[ReportCleanupJob] Failed to delete file for job ${job.id}:`, err?.message || err);
        }
      }
    }

    const result = await prisma.reportJob.deleteMany({
      where: {
        requestedAt: { lte: sevenDaysAgo },
      },
    });

    console.log(`[ReportCleanupJob] Purged ${result.count} expired report records.`);
  }
}

export = ReportCleanupJob;
