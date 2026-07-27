import IJob = require("../job.interface.js");
import prisma = require("../../prisma/prisma.js");
import NotificationService = require("../../services/notification.service.js");

class MaintenanceReminderJob implements IJob {
  public readonly name = "MaintenanceReminderJob";

  public async execute(): Promise<void> {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const pendingMaintenances = await prisma.maintenance.findMany({
      where: {
        status: "SCHEDULED",
        scheduledDate: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
        isActive: true,
      },
      include: { equipmentAsset: true },
    });

    for (const m of pendingMaintenances) {
      await NotificationService.createNotification({
        userId: m.createdById,
        title: "Upcoming Maintenance Scheduled",
        message: `Asset ${m.equipmentAsset.serialNumber} is scheduled for maintenance on ${m.scheduledDate.toLocaleDateString()}.`,
        type: "MAINTENANCE",
        priority: "MEDIUM",
        actionUrl: `/maintenances/${m.id}`,
      });
    }
  }
}

export = MaintenanceReminderJob;
