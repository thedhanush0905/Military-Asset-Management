import prismaClientModule = require("../../../generated/prisma/index.js");

export interface BaseResponse {
  id: string;
  code: string;
  name: string;
  location: string;
  isActive: boolean;
  _count?: {
    users: number;
    inventories: number;
  } | undefined;
}

export interface PaginatedBases {
  bases: BaseResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FindBasesParams {
  page: any;
  limit: any;
  search?: string | undefined;
  sortBy?: "code" | "name" | "location" | "createdAt" | undefined;
  sortOrder?: "asc" | "desc" | undefined;
  baseIdFilter?: string | undefined;
}
