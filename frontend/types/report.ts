import { BaseEntity } from "./common";
import { User } from "./user";

export type ReportJobStatus = "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";

export interface ReportJob extends BaseEntity {
  name: string;
  type: string;
  status: ReportJobStatus;
  requestedById: string;
  requestedBy?: User;
  parameters: Record<string, unknown> | null;
  fileUrl: string | null;
  errorMessage: string | null;
  completedAt: string | null;
}
