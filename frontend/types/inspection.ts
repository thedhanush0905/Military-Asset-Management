import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";
import { User } from "./user";

export type InspectionResult = "PENDING" | "PASS" | "FAIL";

export interface Inspection extends BaseEntity {
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  inspectorId: string;
  inspector?: User;
  inspectionDate: string;
  result: InspectionResult;
  notes: string | null;
}
