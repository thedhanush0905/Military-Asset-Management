import { apiClient } from "@/lib/api-client";
import { Disposal } from "@/types/disposal";

export interface DisposalListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedDisposalsResponse {
  success: boolean;
  message: string;
  data: {
    disposals: Disposal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DisposalResponse {
  success: boolean;
  message: string;
  data: {
    disposal: Disposal;
  };
}

export const disposalService = {
  async getDisposals(params?: DisposalListParams): Promise<PaginatedDisposalsResponse> {
    const response = await apiClient.get<PaginatedDisposalsResponse>("/disposals", { params });
    return response.data;
  },

  async getDisposalById(id: string): Promise<DisposalResponse> {
    const response = await apiClient.get<DisposalResponse>(`/disposals/${id}`);
    return response.data;
  },

  async createDisposal(data: {
    equipmentAssetId: string;
    disposalReason: "RETIRED" | "DAMAGED" | "LOST" | "DESTROYED" | "SOLD" | "SCRAPPED";
    remarks?: string | null;
  }): Promise<DisposalResponse> {
    const response = await apiClient.post<DisposalResponse>("/disposals", data);
    return response.data;
  },

  async approveDisposal(id: string): Promise<DisposalResponse> {
    const response = await apiClient.patch<DisposalResponse>(`/disposals/${id}/approve`);
    return response.data;
  },

  async completeDisposal(id: string, data: { disposalDate?: string | null; remarks?: string | null }): Promise<DisposalResponse> {
    const response = await apiClient.patch<DisposalResponse>(`/disposals/${id}/complete`, data);
    return response.data;
  },

  async cancelDisposal(id: string, remarks?: string | null): Promise<DisposalResponse> {
    const response = await apiClient.patch<DisposalResponse>(`/disposals/${id}/cancel`, { remarks });
    return response.data;
  },
};
