import { BaseEntity, EquipmentStatus, EquipmentCondition } from "./common";
import { Equipment } from "./equipment";
import { Base } from "./base";

export interface EquipmentAsset extends BaseEntity {
  equipmentId: string;
  equipment?: Equipment;
  baseId: string;
  base?: Base;
  serialNumber: string;
  purchaseDate: string | null;
  purchaseCost: number;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  remarks: string | null;
  isActive: boolean;
  qrCodeUrl: string | null;
  unitId: string | null;
}
