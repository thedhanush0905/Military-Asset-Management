import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";
import { User } from "./user";

export type DisposalReason =
  | "RETIRED"
  | "DAMAGED"
  | "LOST"
  | "DESTROYED"
  | "SOLD"
  | "SCRAPPED";

export type DisposalStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export interface Disposal extends BaseEntity {
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  disposalReason: DisposalReason;
  status: DisposalStatus;
  remarks: string | null;
  approvedById: string | null;
  approvedBy?: User | null;
  disposedById: string | null;
  disposedBy?: User | null;
  disposalDate: string | null;
  bookValue: number | null;
}
