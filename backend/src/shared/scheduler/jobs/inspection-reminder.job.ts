import IJob = require("../job.interface.js");
import prisma = require("../../prisma/prisma.js");
import NotificationService = require("../../services/notification.service.js");

class InspectionReminderJob implements IJob {
  public readonly name = "InspectionReminderJob";

  public async execute(): Promise<void> {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const pendingInspections = await prisma.inspection.findMany({
      where: {
        result: "PENDING",
        scheduledDate: {
          lte: twoDaysFromNow,
          gte: new Date(),
        },
      },
      include: { equipmentAsset: true },
    });

    for (const i of pendingInspections) {
      await NotificationService.createNotification({
        userId: i.inspectorId,
        title: "Inspection Reminder",
        message: `You have a scheduled asset inspection due for ${i.equipmentAsset.serialNumber} on ${i.scheduledDate.toLocaleDateString()}.`,
        type: "MAINTENANCE",
        priority: "MEDIUM",
        actionUrl: `/inspections/${i.id}`,
      });
    }
  }
}

export = InspectionReminderJob;
