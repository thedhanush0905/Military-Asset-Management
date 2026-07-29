import { apiClient } from "@/lib/api-client";
import { EquipmentAsset } from "@/types/equipment-asset";
import { EquipmentStatus, EquipmentCondition } from "@/types/common";

export interface AssetListParams {
  page?: number;
  limit?: number;
  search?: string;
  baseId?: string;
  equipmentId?: string;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
  sortBy?: "serialNumber" | "status" | "condition" | "purchaseCost" | "purchaseDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAssetsResponse {
  success: boolean;
  message: string;
  data: {
    assets: EquipmentAsset[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AssetResponse {
  success: boolean;
  message: string;
  data: {
    asset: EquipmentAsset;
  };
}

export const equipmentAssetService = {
  async getAssets(params?: AssetListParams): Promise<PaginatedAssetsResponse> {
    const response = await apiClient.get<PaginatedAssetsResponse>("/equipment-assets", { params });
    return response.data;
  },

  async getAssetById(id: string): Promise<AssetResponse> {
    const response = await apiClient.get<AssetResponse>(`/equipment-assets/${id}`);
    return response.data;
  },

  async createAsset(data: Omit<EquipmentAsset, "id" | "createdAt" | "updatedAt" | "isActive" | "qrCodeUrl" | "unitId">): Promise<AssetResponse> {
    const response = await apiClient.post<AssetResponse>("/equipment-assets", data);
    return response.data;
  },

  async updateAsset(id: string, data: Partial<Omit<EquipmentAsset, "id" | "createdAt" | "updatedAt" | "equipmentId" | "baseId" | "isActive" | "qrCodeUrl" | "unitId">>): Promise<AssetResponse> {
    const response = await apiClient.patch<AssetResponse>(`/equipment-assets/${id}`, data);
    return response.data;
  },

  async deleteAsset(id: string): Promise<AssetResponse> {
    const response = await apiClient.delete<AssetResponse>(`/equipment-assets/${id}`);
    return response.data;
  },
};
