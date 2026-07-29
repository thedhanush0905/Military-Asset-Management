import { apiClient } from "@/lib/api-client";
import { Transfer } from "@/types/transfer";

export interface TransferListParams {
  page?: number;
  limit?: number;
  search?: string;
  fromBaseId?: string;
  toBaseId?: string;
  equipmentAssetId?: string;
  status?: "PENDING" | "APPROVED" | "IN_TRANSIT" | "COMPLETED" | "REJECTED" | "CANCELLED";
  sortBy?: "transferredAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedTransfersResponse {
  success: boolean;
  message: string;
  data: {
    transfers: Transfer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TransferResponse {
  success: boolean;
  message: string;
  data: {
    transfer: Transfer;
  };
}

export const transferService = {
  async getTransfers(params?: TransferListParams): Promise<PaginatedTransfersResponse> {
    const response = await apiClient.get<PaginatedTransfersResponse>("/transfers", { params });
    return response.data;
  },

  async getTransferById(id: string): Promise<TransferResponse> {
    const response = await apiClient.get<TransferResponse>(`/transfers/${id}`);
    return response.data;
  },

  async createTransfer(data: { equipmentAssetId: string; toBaseId: string; remarks?: string | null }): Promise<TransferResponse> {
    const response = await apiClient.post<TransferResponse>("/transfers", data);
    return response.data;
  },

  async approveTransfer(id: string, remarks?: string | null): Promise<TransferResponse> {
    const response = await apiClient.patch<TransferResponse>(`/transfers/${id}/approve`, { remarks });
    return response.data;
  },

  async rejectTransfer(id: string, remarks?: string | null): Promise<TransferResponse> {
    const response = await apiClient.patch<TransferResponse>(`/transfers/${id}/reject`, { remarks });
    return response.data;
  },

  async dispatchTransfer(id: string, remarks?: string | null): Promise<TransferResponse> {
    const response = await apiClient.patch<TransferResponse>(`/transfers/${id}/dispatch`, { remarks });
    return response.data;
  },

  async receiveTransfer(id: string, remarks?: string | null): Promise<TransferResponse> {
    const response = await apiClient.patch<TransferResponse>(`/transfers/${id}/receive`, { remarks });
    return response.data;
  },

  async cancelTransfer(id: string, remarks?: string | null): Promise<TransferResponse> {
    const response = await apiClient.patch<TransferResponse>(`/transfers/${id}/cancel`, { remarks });
    return response.data;
  },
};
