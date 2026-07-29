import { BaseEntity } from "./common";

export type Role = "ADMIN" | "BASE_COMMANDER" | "LOGISTICS_OFFICER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "DEACTIVATED";

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  baseId: string | null;
  base?: {
    id: string;
    name: string;
    code: string;
  } | null;
}
