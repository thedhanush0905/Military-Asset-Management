import prismaClientModule = require("../../../generated/prisma/index.js");

export interface ProcurementItemResponse {
  id: string;
  procurementId: string;
  equipmentId: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: string;
  equipment?: {
    id: string;
    name: string;
    category: prismaClientModule.EquipmentCategory;
    unit: prismaClientModule.Unit;
  } | undefined;
}

export interface ProcurementResponse {
  id: string;
  procurementNumber: string;
  supplier: string;
  status: prismaClientModule.ProcurementStatus;
  purchaseDate: Date;
  expectedDeliveryDate: Date;
  receivedDate: Date | null;
  totalCost: string;
  remarks: string | null;
  baseId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items?: ProcurementItemResponse[] | undefined;
  base?: {
    id: string;
    code: string;
    name: string;
  } | undefined;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  } | undefined;
}

export interface PaginatedProcurement {
  procurements: ProcurementResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindProcurementParams {
  page: number;
  limit: number;
  search?: string;
  baseId?: string;
  status?: prismaClientModule.ProcurementStatus;
  supplier?: string;
  sortBy?: "purchaseDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}
