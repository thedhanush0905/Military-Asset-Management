import { apiClient } from "@/lib/api-client";

export type EquipmentCategory = "WEAPON" | "VEHICLE" | "AMMUNITION" | "COMMUNICATION" | "MEDICAL" | "OTHER";
export type EquipmentUnit = "NOS" | "ROUNDS" | "BOXES" | "LITRES" | "KGS" | "METRES";

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  unit: EquipmentUnit;
  description: string | null;
  supplierId: string | null;
  supplier?: { id: string; name: string } | null;
  model: string | null;
  specifications: string | null;
  expectedLifeYears: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assetCount?: number;
  inventoryCount?: number;
}

export interface EquipmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: EquipmentCategory;
  sortBy?: "name" | "category" | "supplierId" | "model" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface EquipmentListResponse {
  success: boolean;
  message: string;
  data: {
    equipment: Equipment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface EquipmentResponse {
  success: boolean;
  message: string;
  data: {
    equipment: Equipment;
  };
}

export const equipmentService = {
  async getEquipment(params?: EquipmentListParams): Promise<EquipmentListResponse> {
    const response = await apiClient.get<EquipmentListResponse>("/equipment", { params });
    return response.data;
  },

  async getEquipmentById(id: string): Promise<EquipmentResponse> {
    const response = await apiClient.get<EquipmentResponse>(`/equipment/${id}`);
    return response.data;
  },

  async createEquipment(data: Omit<Equipment, "id" | "isActive" | "createdAt" | "updatedAt">): Promise<EquipmentResponse> {
    const response = await apiClient.post<EquipmentResponse>("/equipment", data);
    return response.data;
  },

  async updateEquipment(id: string, data: Partial<Omit<Equipment, "id" | "isActive" | "createdAt" | "updatedAt">>): Promise<EquipmentResponse> {
    const response = await apiClient.patch<EquipmentResponse>(`/equipment/${id}`, data);
    return response.data;
  },

  async deleteEquipment(id: string): Promise<EquipmentResponse> {
    const response = await apiClient.delete<EquipmentResponse>(`/equipment/${id}`);
    return response.data;
  },
};
