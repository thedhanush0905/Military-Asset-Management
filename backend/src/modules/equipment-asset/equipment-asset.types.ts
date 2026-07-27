import prismaClientModule = require("../../../generated/prisma/index.js");

export interface EquipmentAssetResponse {
  id: string;
  equipmentId: string;
  baseId: string;
  serialNumber: string;
  purchaseDate: Date | null;
  purchaseCost: string; // Represent Decimal as string for API boundary safety
  status: prismaClientModule.EquipmentStatus;
  condition: prismaClientModule.EquipmentCondition;
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

export interface PaginatedEquipmentAsset {
  assets: EquipmentAssetResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindEquipmentAssetParams {
  page: number;
  limit: number;
  search?: string;
  baseId?: string;
  equipmentId?: string;
  status?: prismaClientModule.EquipmentStatus;
  condition?: prismaClientModule.EquipmentCondition;
  sortBy?: "serialNumber" | "status" | "condition" | "purchaseCost" | "purchaseDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}
