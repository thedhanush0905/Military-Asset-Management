import { BaseEntity } from "./common";

export interface Base extends BaseEntity {
  code: string;
  name: string;
  location: string;
  isActive: boolean;
}
