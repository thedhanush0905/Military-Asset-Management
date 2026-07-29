import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";
import { Base } from "./base";
import { User } from "./user";

export type TransferStatus =
  | "PENDING"
  | "APPROVED"
  | "IN_TRANSIT"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface Transfer extends BaseEntity {
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  fromBaseId: string;
  fromBase?: Base;
  toBaseId: string;
  toBase?: Base;
  quantity: number;
  transferredById: string;
  transferredBy?: User;
  remarks: string | null;
  status: TransferStatus;
  transferredAt: string;
}
