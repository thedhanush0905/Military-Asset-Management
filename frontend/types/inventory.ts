import { BaseEntity } from "./common";
import { Equipment } from "./equipment";
import { Base } from "./base";

export interface Inventory extends BaseEntity {
  baseId: string;
  base?: Base;
  equipmentId: string;
  equipment?: Equipment;
  quantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  inTransitQuantity: number;
  maintenanceQuantity: number;
  damagedQuantity: number;
  minimumStock: number;
  remarks: string | null;
  isActive: boolean;
}
