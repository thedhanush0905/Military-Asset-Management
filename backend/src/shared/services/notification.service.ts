import prisma = require("../prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class NotificationService {
  /**
   * Creates an in-app notification for a user or broadcast.
   * Best-effort: failures to create will not disrupt the parent operation.
   */
  public static async createNotification(params: {
    userId?: string | null;
    title: string;
    message: string;
    type: prismaClientModule.NotificationType;
    priority?: prismaClientModule.NotificationPriority;
    actionUrl?: string | null;
    metadata?: any;
    expiresAt?: Date | null;
  }): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: params.userId || null,
          title: params.title,
          message: params.message,
          type: params.type,
          priority: params.priority || "LOW",
          actionUrl: params.actionUrl || null,
          metadata: params.metadata || null,
          expiresAt: params.expiresAt || null,
        },
      });
    } catch (error: any) {
      // Best-effort: do not crash operations if notification creation fails
      console.error("[NotificationService Error] Failed to create notification:", error?.message || error);
    }
  }
}

export = NotificationService;
