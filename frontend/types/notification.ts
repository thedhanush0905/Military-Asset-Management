import { BaseEntity } from "./common";
import { User } from "./user";

export type NotificationType =
  | "MAINTENANCE"
  | "PROCUREMENT"
  | "TRANSFER"
  | "ASSIGNMENT"
  | "DISPOSAL"
  | "SYSTEM";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Notification extends BaseEntity {
  userId: string | null;
  user?: User | null;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl: string | null;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  expiresAt: string | null;
}
