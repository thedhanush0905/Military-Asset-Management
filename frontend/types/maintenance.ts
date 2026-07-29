import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";
import { User } from "./user";

export type MaintenanceType =
  | "PREVENTIVE"
  | "CORRECTIVE"
  | "INSPECTION"
  | "CALIBRATION";

export type MaintenanceStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Maintenance extends BaseEntity {
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: string;
  expectedCompletionDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  vendorName: string | null;
  technicianName: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  remarks: string | null;
  createdById: string;
  createdBy?: User;
  completedById: string | null;
  completedBy?: User | null;
  isActive: boolean;
}
