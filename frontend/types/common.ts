export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type EquipmentCategory =
  | "WEAPON"
  | "VEHICLE"
  | "AMMUNITION"
  | "COMMUNICATION"
  | "MEDICAL"
  | "OTHER";

export type Unit =
  | "NOS"
  | "ROUNDS"
  | "BOXES"
  | "LITRES"
  | "KGS"
  | "METRES";

export type EquipmentStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "MAINTENANCE"
  | "DAMAGED"
  | "LOST"
  | "RETIRED";

export type EquipmentCondition =
  | "NEW"
  | "GOOD"
  | "FAIR"
  | "DAMAGED"
  | "UNSERVICEABLE";
