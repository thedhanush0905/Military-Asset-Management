import prismaClientModule = require("../../../generated/prisma/index.js");

export interface MovementResponse {
  id: string;
  equipmentAssetId: string;
  movementType: prismaClientModule.AssetMovementType;
  sourceBaseId: string | null;
  destinationBaseId: string | null;
  referenceType: prismaClientModule.MovementReferenceType;
  referenceId: string;
  performedById: string;
  remarks: string | null;
  createdAt: Date;
  equipmentAsset?: {
    id: string;
    serialNumber: string;
    equipment: {
      id: string;
      name: string;
    };
  } | undefined;
  sourceBase?: {
    id: string;
    code: string;
    name: string;
  } | null | undefined;
  destinationBase?: {
    id: string;
    code: string;
    name: string;
  } | null | undefined;
  performedBy?: {
    id: string;
    name: string;
    email: string;
  } | undefined;
}

export interface PaginatedMovement {
  movements: MovementResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindMovementParams {
  page: number;
  limit: number;
  search?: string;
  equipmentAssetId?: string;
  movementType?: prismaClientModule.AssetMovementType;
  sourceBaseId?: string;
  destinationBaseId?: string;
  referenceType?: prismaClientModule.MovementReferenceType;
  referenceId?: string;
  sortBy?: "createdAt";
  sortOrder?: "asc" | "desc";
}
