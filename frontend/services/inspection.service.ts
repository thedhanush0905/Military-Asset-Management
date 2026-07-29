import { apiClient } from "@/lib/api-client";
import { Inspection } from "@/types/inspection";

export interface InspectionListParams {
  page?: number;
  limit?: number;
  search?: string;
  equipmentAssetId?: string;
  sortBy?: "scheduledDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedInspectionsResponse {
  success: boolean;
  message: string;
  data: {
    inspections: Inspection[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface InspectionResponse {
  success: boolean;
  message: string;
  data: Inspection;
}

export const inspectionService = {
  async getInspections(params?: InspectionListParams): Promise<PaginatedInspectionsResponse> {
    const response = await apiClient.get<PaginatedInspectionsResponse>("/inspections", { params });
    return response.data;
  },

  async getInspectionById(id: string): Promise<InspectionResponse> {
    const response = await apiClient.get<InspectionResponse>(`/inspections/${id}`);
    return response.data;
  },

  async scheduleInspection(data: {
    equipmentAssetId: string;
    inspectorName: string;
    scheduledDate: string;
    notes?: string | null;
  }): Promise<InspectionResponse> {
    const response = await apiClient.post<InspectionResponse>("/inspections", {
      equipmentAssetId: data.equipmentAssetId,
      scheduledDate: new Date(data.scheduledDate).toISOString(),
      remarks: data.notes,
    });
    return response.data;
  },

  async completeInspection(id: string, data: { result: "PASS" | "FAIL"; notes: string }): Promise<InspectionResponse> {
    const response = await apiClient.patch<InspectionResponse>(`/inspections/${id}/complete`, {
      result: data.result,
      remarks: data.notes,
      completedDate: new Date().toISOString(),
    });
    return response.data;
  },

  async deleteInspection(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/inspections/${id}`);
    return response.data;
  },
};
