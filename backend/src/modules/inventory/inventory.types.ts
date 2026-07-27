import prismaClientModule = require("../../../generated/prisma/index.js");

export interface InventoryResponse {
  id: string;
  equipmentId: string;
  baseId: string;
  quantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  maintenanceQuantity: number;
  damagedQuantity: number;
  minimumStock: number;
  remarks: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  equipment?: {
    id: string;
    name: string;
    category: prismaClientModule.EquipmentCategory;
    unit: prismaClientModule.Unit;
  } | undefined;
  base?: {
    id: string;
    code: string;
    name: string;
  } | undefined;
}

export interface PaginatedInventory {
  inventories: InventoryResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindInventoryParams {
  page: number;
  limit: number;
  search?: string;
  baseId?: string;
  equipmentId?: string;
  lowStock?: boolean;
  sortBy?: "quantity" | "availableQuantity" | "allocatedQuantity" | "maintenanceQuantity" | "damagedQuantity" | "minimumStock" | "createdAt";
  sortOrder?: "asc" | "desc";
}
