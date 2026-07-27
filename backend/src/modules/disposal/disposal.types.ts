import prismaClientModule = require("../../../generated/prisma/index.js");

export interface DisposalResponse {
  id: string;
  equipmentAssetId: string;
  disposalReason: prismaClientModule.DisposalReason;
  status: prismaClientModule.DisposalStatus;
  remarks: string | null;
  approvedById: string | null;
  disposedById: string | null;
  disposalDate: Date | null;
  bookValue: string | null;
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
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  } | null | undefined;
  disposedBy?: {
    id: string;
    name: string;
    email: string;
  } | null | undefined;
}

export interface PaginatedDisposal {
  disposals: DisposalResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindDisposalParams {
  page: number;
  limit: number;
  search?: string;
  baseId?: string;
  status?: prismaClientModule.DisposalStatus;
  disposalReason?: prismaClientModule.DisposalReason;
  sortBy?: "disposalDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}
