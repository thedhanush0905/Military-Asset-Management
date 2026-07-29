import { apiClient } from "@/lib/api-client";
import { Supplier } from "@/types/supplier";

export interface SupplierListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface PaginatedSuppliersResponse {
  success: boolean;
  message: string;
  data: {
    suppliers: Supplier[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SupplierResponse {
  success: boolean;
  message: string;
  data: {
    supplier: Supplier;
  };
}

export const supplierService = {
  async getSuppliers(params?: SupplierListParams): Promise<PaginatedSuppliersResponse> {
    const response = await apiClient.get<PaginatedSuppliersResponse>("/suppliers", { params });
    return response.data;
  },

  async getSupplierById(id: string): Promise<SupplierResponse> {
    const response = await apiClient.get<SupplierResponse>(`/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(data: Partial<Supplier>): Promise<SupplierResponse> {
    const response = await apiClient.post<SupplierResponse>("/suppliers", data);
    return response.data;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<SupplierResponse> {
    const response = await apiClient.patch<SupplierResponse>(`/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/suppliers/${id}`);
    return response.data;
  },
};
