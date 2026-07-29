import { apiClient } from "@/lib/api-client";
import { Base } from "@/types/base";

export interface BaseListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "code" | "name" | "location" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface BaseListResponse {
  success: boolean;
  message: string;
  data: {
    bases: (Base & {
      _count?: {
        users: number;
        inventories: number;
      };
    })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface BaseResponse {
  success: boolean;
  message: string;
  data: {
    base: Base & {
      _count?: {
        users: number;
        inventories: number;
      };
    };
  };
}

export const baseService = {
  async getBases(params?: BaseListParams): Promise<BaseListResponse> {
    const response = await apiClient.get<BaseListResponse>("/bases", { params });
    return response.data;
  },

  async getBaseById(id: string): Promise<BaseResponse> {
    const response = await apiClient.get<BaseResponse>(`/bases/${id}`);
    return response.data;
  },

  async createBase(data: Omit<Base, "id" | "isActive" | "createdAt" | "updatedAt">): Promise<BaseResponse> {
    const response = await apiClient.post<BaseResponse>("/bases", data);
    return response.data;
  },

  async updateBase(id: string, data: Partial<Omit<Base, "id" | "isActive" | "createdAt" | "updatedAt">>): Promise<BaseResponse> {
    const response = await apiClient.patch<BaseResponse>(`/bases/${id}`, data);
    return response.data;
  },

  async deleteBase(id: string): Promise<BaseResponse> {
    const response = await apiClient.delete<BaseResponse>(`/bases/${id}`);
    return response.data;
  },
};
