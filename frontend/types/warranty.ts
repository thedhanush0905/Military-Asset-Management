import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";
import { Supplier } from "./supplier";

export type WarrantyStatus = "ACTIVE" | "EXPIRED" | "VOIDED";

export interface Warranty extends BaseEntity {
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  providerId: string;
  provider?: Supplier;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  terms: string | null;
}
