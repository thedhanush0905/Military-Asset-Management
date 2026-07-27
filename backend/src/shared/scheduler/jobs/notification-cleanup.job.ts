import IJob = require("../job.interface.js");
import prisma = require("../../prisma/prisma.js");

class NotificationCleanupJob implements IJob {
  public readonly name = "NotificationCleanupJob";

  public async execute(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Clear expired notifications or read notifications older than 30 days
    const result = await prisma.notification.deleteMany({
      where: {
        OR: [
          {
            isRead: true,
            createdAt: { lte: thirtyDaysAgo },
          },
          {
            expiresAt: { lte: new Date() },
          },
        ],
      },
    });

    console.log(`[NotificationCleanupJob] Deleted ${result.count} expired/old notifications.`);
  }
}

export = NotificationCleanupJob;
