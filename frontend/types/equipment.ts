import { BaseEntity, EquipmentCategory, Unit } from "./common";

export interface Equipment extends BaseEntity {
  name: string;
  category: EquipmentCategory;
  unit: Unit;
  description: string | null;
  manufacturer: string | null;
  model: string | null;
  specifications: string | null;
  expectedLifeYears: number | null;
  isActive: boolean;
}
