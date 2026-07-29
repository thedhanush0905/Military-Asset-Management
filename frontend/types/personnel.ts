import { BaseEntity } from "./common";
import { OrganizationUnit } from "./organization";

export type PersonnelStatus = "ACTIVE" | "INACTIVE" | "DEPLOYED" | "ON_LEAVE";

export interface Personnel extends BaseEntity {
  serviceNumber: string;
  rank: string;
  firstName: string;
  lastName: string;
  unitId: string | null;
  unit?: OrganizationUnit | null;
  email: string | null;
  phone: string | null;
  status: PersonnelStatus;
}
