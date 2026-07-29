import { apiClient } from "@/lib/api-client";
import { Procurement } from "@/types/procurement";

export interface ProcurementListParams {
  page?: number;
  limit?: number;
  search?: string;
  baseId?: string;
  supplier?: string;
  status?: "DRAFT" | "APPROVED" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";
  sortBy?: "purchaseDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedProcurementsResponse {
  success: boolean;
  message: string;
  data: {
    procurements: Procurement[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProcurementResponse {
  success: boolean;
  message: string;
  data: {
    procurement: Procurement;
  };
}

export const procurementService = {
  async getProcurements(params?: ProcurementListParams): Promise<PaginatedProcurementsResponse> {
    const response = await apiClient.get<PaginatedProcurementsResponse>("/procurements", { params });
    return response.data;
  },

  async getProcurementById(id: string): Promise<ProcurementResponse> {
    const response = await apiClient.get<ProcurementResponse>(`/procurements/${id}`);
    return response.data;
  },

  async createProcurement(data: {
    procurementNumber: string;
    supplier: string;
    purchaseDate: string;
    expectedDeliveryDate: string;
    baseId: string;
    remarks?: string | null;
    items: Array<{ equipmentId: string; quantity: number; unitCost: number | string }>;
  }): Promise<ProcurementResponse> {
    const payload = {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        unitCost: item.unitCost !== undefined && item.unitCost !== null ? String(item.unitCost) : item.unitCost,
      })),
    };
    const response = await apiClient.post<ProcurementResponse>("/procurements", payload);
    return response.data;
  },

  async approveProcurement(id: string): Promise<ProcurementResponse> {
    const response = await apiClient.patch<ProcurementResponse>(`/procurements/${id}/approve`);
    return response.data;
  },

  async receiveProcurement(id: string, data: { items: Array<{ equipmentId: string; serialNumbers: string[] }> }): Promise<ProcurementResponse> {
    const response = await apiClient.patch<ProcurementResponse>(`/procurements/${id}/receive`, data);
    return response.data;
  },

  async cancelProcurement(id: string): Promise<ProcurementResponse> {
    const response = await apiClient.patch<ProcurementResponse>(`/procurements/${id}/cancel`);
    return response.data;
  },
};
