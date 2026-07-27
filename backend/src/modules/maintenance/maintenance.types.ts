import prismaClientModule = require("../../../generated/prisma/index.js");

export interface MaintenanceResponse {
  id: string;
  equipmentAssetId: string;
  maintenanceType: prismaClientModule.MaintenanceType;
  status: prismaClientModule.MaintenanceStatus;
  description: string;
  scheduledDate: Date;
  expectedCompletionDate: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  vendorName: string | null;
  technicianName: string | null;
  estimatedCost: string | null;
  actualCost: string | null;
  remarks: string | null;
  createdById: string;
  completedById: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  equipmentAsset?: {
    id: string;
    serialNumber: string;
    baseId: string;
    equipment: {
      id: string;
      name: string;
    };
  } | undefined;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | undefined;
  completedBy?: {
    id: string;
    name: string;
    email: string;
  } | null | undefined;
}

export interface PaginatedMaintenance {
  maintenances: MaintenanceResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindMaintenanceParams {
  page: number;
  limit: number;
  search?: string;
  equipmentAssetId?: string;
  baseId?: string;
  maintenanceType?: prismaClientModule.MaintenanceType;
  status?: prismaClientModule.MaintenanceStatus;
  sortBy?: "scheduledDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}
