import { BaseEntity } from "./common";
import { User } from "./user";

export interface AuditLog extends BaseEntity {
  userId: string | null;
  user?: User | null;
  performedByType: "USER" | "SYSTEM";
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  result: "SUCCESS" | "FAILURE";
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
}
