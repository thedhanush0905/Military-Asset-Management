import { BaseEntity } from "./common";

export type OrgLevel =
  | "COMMAND"
  | "DIVISION"
  | "BRIGADE"
  | "BATTALION"
  | "COMPANY"
  | "PLATOON"
  | "SECTION";

export interface OrganizationUnit extends BaseEntity {
  name: string;
  code: string;
  level: OrgLevel;
  parentId: string | null;
  parent?: OrganizationUnit | null;
  children?: OrganizationUnit[];
}
