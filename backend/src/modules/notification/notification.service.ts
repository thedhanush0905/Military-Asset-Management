import NotificationRepository = require("./notification.repository.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class NotificationService {
  private readonly notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  public async getNotifications(currentUser: prismaClientModule.User, query: any) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const now = new Date();

    const where: prismaClientModule.Prisma.NotificationWhereInput = {
      // User specific or broadcast
      OR: [
        { userId: currentUser.id },
        { userId: null },
      ],
      // Exclude expired notifications
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: now } },
          ],
        },
      ],
    };

    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }

    const { notifications, total } = await this.notificationRepository.findMany(where, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getUnreadNotifications(currentUser: prismaClientModule.User) {
    const now = new Date();
    const where: prismaClientModule.Prisma.NotificationWhereInput = {
      OR: [
        { userId: currentUser.id },
        { userId: null },
      ],
      isRead: false,
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: now } },
          ],
        },
      ],
    };

    const { notifications } = await this.notificationRepository.findMany(where, {
      skip: 0,
      take: 100, // Reasonable cap for unread list
      orderBy: { createdAt: "desc" },
    });

    return notifications;
  }

  public async markAsRead(currentUser: prismaClientModule.User, id: string) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // Ownership check: if private notification, user must own it
    if (notification.userId && notification.userId !== currentUser.id) {
      throw new ForbiddenError("Access Denied: Cannot modify another user's notifications");
    }

    const updated = await this.notificationRepository.update(id, {
      isRead: true,
      readAt: new Date(),
    });

    return updated;
  }

  public async markAllAsRead(currentUser: prismaClientModule.User) {
    const now = new Date();
    await this.notificationRepository.updateMany(
      {
        OR: [
          { userId: currentUser.id },
          { userId: null },
        ],
        isRead: false,
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } },
            ],
          },
        ],
      },
      {
        isRead: true,
        readAt: now,
      }
    );
  }

  public async deleteNotification(currentUser: prismaClientModule.User, id: string) {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    if (notification.userId && notification.userId !== currentUser.id) {
      throw new ForbiddenError("Access Denied: Cannot delete another user's notifications");
    }

    const deleted = await this.notificationRepository.delete(id);
    return deleted;
  }

  public async deleteAllNotifications(currentUser: prismaClientModule.User) {
    const result = await this.notificationRepository.deleteMany({
      userId: currentUser.id,
    });
    return result;
  }
}

export = NotificationService;
