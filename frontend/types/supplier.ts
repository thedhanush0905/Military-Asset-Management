import { BaseEntity } from "./common";

export type SupplierStatus = "ACTIVE" | "INACTIVE";

export interface Supplier extends BaseEntity {
  name: string;
  code: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: SupplierStatus;
  isActive: boolean;
}
