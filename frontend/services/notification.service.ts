import { apiClient } from "@/lib/api-client";
import { Notification } from "@/types/notification";

export interface NotificationListParams {
  page?: number;
  limit?: number;
  type?: string;
  priority?: string;
  isRead?: boolean;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    notifications: Notification[];
  };
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: Notification;
  };
}

export const notificationService = {
  async getNotifications(params?: NotificationListParams): Promise<PaginatedNotificationsResponse> {
    const response = await apiClient.get<PaginatedNotificationsResponse>("/notifications", { params });
    return response.data;
  },

  async getUnread(): Promise<UnreadCountResponse> {
    const response = await apiClient.get<UnreadCountResponse>("/notifications/unread");
    return response.data;
  },

  async markAllRead(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.patch<{ success: boolean; message: string }>("/notifications/read-all");
    return response.data;
  },

  async markRead(id: string): Promise<NotificationResponse> {
    const response = await apiClient.patch<NotificationResponse>(`/notifications/${id}/read`);
    return response.data;
  },

  async deleteNotification(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
    return response.data;
  },

  async deleteAllNotifications(): Promise<{ success: boolean; message: string; count?: number }> {
    const response = await apiClient.delete<{ success: boolean; message: string; count?: number }>("/notifications");
    return response.data;
  },
};
