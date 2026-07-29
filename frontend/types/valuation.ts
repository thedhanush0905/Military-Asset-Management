import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";

export interface AssetValuation extends BaseEntity {
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  originalCost: number;
  bookValue: number;
  residualValue: number;
  depreciationRate: number;
  lastValuedAt: string;
}
