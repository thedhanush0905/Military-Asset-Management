import IJob = require("../job.interface.js");
import prisma = require("../../prisma/prisma.js");
import NotificationService = require("../../services/notification.service.js");

class WarrantyReminderJob implements IJob {
  public readonly name = "WarrantyReminderJob";

  public async execute(): Promise<void> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringWarranties = await prisma.warranty.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      include: { equipmentAsset: true },
    });

    for (const w of expiringWarranties) {
      await NotificationService.createNotification({
        userId: null,
        title: "Asset Warranty Expiring",
        message: `Warranty for asset ${w.equipmentAsset.serialNumber} will expire on ${w.endDate.toLocaleDateString()}.`,
        type: "SYSTEM",
        priority: "MEDIUM",
        actionUrl: `/warranties/${w.id}`,
      });
    }
  }
}

export = WarrantyReminderJob;
