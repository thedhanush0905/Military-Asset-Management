import prismaClientModule = require("../../../generated/prisma/index.js");

export interface AssignmentResponse {
  id: string;
  baseId: string;
  equipmentAssetId: string;
  assignedTo: string;
  status: prismaClientModule.AssignmentStatus;
  assignedById: string;
  assignedAt: Date;
  returnedAt: Date | null;
  returnedById: string | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
  equipmentAsset?: {
    id: string;
    serialNumber: string;
    equipment: {
      id: string;
      name: string;
    };
  } | undefined;
  base?: {
    id: string;
    code: string;
    name: string;
  } | undefined;
  assignedBy?: {
    id: string;
    name: string;
    email: string;
  } | undefined;
  returnedBy?: {
    id: string;
    name: string;
    email: string;
  } | null | undefined;
}

export interface PaginatedAssignment {
  assignments: AssignmentResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindAssignmentParams {
  page: number;
  limit: number;
  search?: string;
  baseId?: string;
  equipmentAssetId?: string;
  status?: prismaClientModule.AssignmentStatus;
  sortBy?: "assignedAt" | "returnedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}
