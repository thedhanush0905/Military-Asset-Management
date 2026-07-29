import { apiClient } from "@/lib/api-client";
import { Inventory } from "@/types/inventory";

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  baseId?: string;
  equipmentId?: string;
  lowStock?: boolean;
  sortBy?: "quantity" | "availableQuantity" | "allocatedQuantity" | "maintenanceQuantity" | "damagedQuantity" | "minimumStock" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedInventoryResponse {
  success: boolean;
  message: string;
  data: {
    inventories: Inventory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface InventoryResponse {
  success: boolean;
  message: string;
  data: {
    inventory: Inventory;
  };
}

export const inventoryService = {
  async getInventories(params?: InventoryListParams): Promise<PaginatedInventoryResponse> {
    const response = await apiClient.get<PaginatedInventoryResponse>("/inventory", { params });
    return response.data;
  },

  async getInventoryById(id: string): Promise<InventoryResponse> {
    const response = await apiClient.get<InventoryResponse>(`/inventory/${id}`);
    return response.data;
  },

  async getLowStockInventory(params?: InventoryListParams): Promise<PaginatedInventoryResponse> {
    const response = await apiClient.get<PaginatedInventoryResponse>("/inventory/low-stock", { params });
    return response.data;
  },

  async getInventoryByBaseId(baseId: string, params?: InventoryListParams): Promise<PaginatedInventoryResponse> {
    const response = await apiClient.get<PaginatedInventoryResponse>(`/inventory/base/${baseId}`, { params });
    return response.data;
  },

  async getInventoryByEquipmentId(equipmentId: string, params?: InventoryListParams): Promise<PaginatedInventoryResponse> {
    const response = await apiClient.get<PaginatedInventoryResponse>(`/inventory/equipment/${equipmentId}`, { params });
    return response.data;
  },
};
