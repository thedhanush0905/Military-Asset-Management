import { BaseEntity } from "./common";
import { EquipmentAsset } from "./equipment-asset";
import { Base } from "./base";
import { User } from "./user";
import { Personnel } from "./personnel";

export type AssignmentStatus = "ACTIVE" | "RETURNED";

export interface Assignment extends BaseEntity {
  baseId: string;
  base?: Base;
  equipmentAssetId: string;
  equipmentAsset?: EquipmentAsset;
  assignedTo: string;
  personnelId: string | null;
  personnel?: Personnel | null;
  status: AssignmentStatus;
  assignedById: string;
  assignedBy?: User;
  returnedAt: string | null;
  returnedById: string | null;
  returnedBy?: User | null;
  remarks: string | null;
  assignedAt: string;
}
