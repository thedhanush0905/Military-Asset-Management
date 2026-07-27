import prismaClientModule = require("../../../generated/prisma/index.js");

export interface EquipmentResponse {
  id: string;
  name: string;
  category: prismaClientModule.EquipmentCategory;
  unit: prismaClientModule.Unit;
  description: string | null;
  manufacturer: string | null;
  model: string | null;
  specifications: string | null;
  expectedLifeYears: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  assetCount?: number | undefined;
  inventoryCount?: number | undefined;
}

export interface PaginatedEquipment {
  equipment: EquipmentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindEquipmentParams {
  page: number;
  limit: number;
  search?: string;
  category?: prismaClientModule.EquipmentCategory;
  sortBy?: "name" | "category" | "manufacturer" | "model" | "createdAt";
  sortOrder?: "asc" | "desc";
}
