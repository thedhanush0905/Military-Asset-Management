import { apiClient } from "@/lib/api-client";
import { Maintenance } from "@/types/maintenance";

export interface MaintenanceListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  equipmentAssetId?: string;
  sortBy?: "scheduledDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedMaintenanceResponse {
  success: boolean;
  message: string;
  data: {
    maintenances: Maintenance[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MaintenanceResponse {
  success: boolean;
  message: string;
  data: {
    maintenance: Maintenance;
  };
}

export const maintenanceService = {
  async getMaintenances(params?: MaintenanceListParams): Promise<PaginatedMaintenanceResponse> {
    const response = await apiClient.get<PaginatedMaintenanceResponse>("/maintenance", { params });
    return response.data;
  },

  async getMaintenanceById(id: string): Promise<MaintenanceResponse> {
    const response = await apiClient.get<MaintenanceResponse>(`/maintenance/${id}`);
    return response.data;
  },

  async scheduleMaintenance(data: {
    equipmentAssetId: string;
    maintenanceType: "PREVENTIVE" | "CORRECTIVE";
    scheduledDate: string;
    expectedCompletionDate?: string | null;
    description: string;
    vendorName?: string | null;
    technicianName?: string | null;
    estimatedCost?: number | null;
    remarks?: string | null;
  }): Promise<MaintenanceResponse> {
    const payload = {
      ...data,
      scheduledDate: new Date(data.scheduledDate).toISOString(),
      expectedCompletionDate: data.expectedCompletionDate ? new Date(data.expectedCompletionDate).toISOString() : null,
    };
    const response = await apiClient.post<MaintenanceResponse>("/maintenance", payload);
    return response.data;
  },

  async startMaintenance(id: string, startedAt?: string | null): Promise<MaintenanceResponse> {
    const response = await apiClient.patch<MaintenanceResponse>(`/maintenance/${id}/start`, { startedAt });
    return response.data;
  },

  async completeMaintenance(id: string, data: { completedAt?: string | null; actualCost?: number | string | null; remarks?: string | null }): Promise<MaintenanceResponse> {
    const payload = {
      ...data,
      actualCost: data.actualCost !== undefined && data.actualCost !== null ? String(data.actualCost) : undefined,
    };
    const response = await apiClient.patch<MaintenanceResponse>(`/maintenance/${id}/complete`, payload);
    return response.data;
  },

  async cancelMaintenance(id: string, remarks?: string | null): Promise<MaintenanceResponse> {
    const response = await apiClient.patch<MaintenanceResponse>(`/maintenance/${id}/cancel`, { remarks });
    return response.data;
  },
};
