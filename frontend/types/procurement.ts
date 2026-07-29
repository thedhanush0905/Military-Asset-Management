import { BaseEntity } from "./common";
import { Equipment } from "./equipment";
import { Base } from "./base";
import { User } from "./user";
import { Supplier } from "./supplier";

export type ProcurementStatus =
  | "DRAFT"
  | "APPROVED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface ProcurementItem {
  id: string;
  procurementId: string;
  equipmentId: string;
  equipment?: Equipment;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
}

export interface Procurement extends BaseEntity {
  procurementNumber: string;
  supplier: string;
  supplierId: string | null;
  supplierRef?: Supplier | null;
  status: ProcurementStatus;
  purchaseDate: string;
  expectedDeliveryDate: string;
  receivedDate: string | null;
  totalCost: number;
  remarks: string | null;
  baseId: string;
  base?: Base;
  createdById: string;
  createdBy?: User;
  items?: ProcurementItem[];
}
