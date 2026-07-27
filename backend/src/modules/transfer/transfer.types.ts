import prismaClientModule = require("../../../generated/prisma/index.js");

export interface TransferResponse {
  id: string;
  equipmentAssetId: string;
  fromBaseId: string;
  toBaseId: string;
  quantity: number;
  transferredById: string;
  remarks: string | null;
  status: prismaClientModule.TransferStatus;
  transferredAt: Date;
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
  fromBase?: {
    id: string;
    code: string;
    name: string;
  } | undefined;
  toBase?: {
    id: string;
    code: string;
    name: string;
  } | undefined;
  transferredBy?: {
    id: string;
    name: string;
    email: string;
  } | undefined;
}

export interface PaginatedTransfer {
  transfers: TransferResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindTransferParams {
  page: number;
  limit: number;
  search?: string;
  fromBaseId?: string;
  toBaseId?: string;
  equipmentAssetId?: string;
  status?: prismaClientModule.TransferStatus;
  sortBy?: "transferredAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}
