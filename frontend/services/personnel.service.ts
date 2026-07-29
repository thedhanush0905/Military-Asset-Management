import { apiClient } from "@/lib/api-client";
import { Personnel, PersonnelStatus } from "@/types/personnel";

export interface PersonnelListParams {
  page?: number;
  limit?: number;
  search?: string;
  unitId?: string;
  status?: PersonnelStatus;
  sortBy?: "serviceNumber" | "rank" | "firstName" | "lastName" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedPersonnelResponse {
  success: boolean;
  message: string;
  data: {
    personnel: Personnel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PersonnelResponse {
  success: boolean;
  message: string;
  data: {
    profile: Personnel;
  };
}

export const personnelService = {
  async getPersonnelList(params?: PersonnelListParams): Promise<PaginatedPersonnelResponse> {
    const response = await apiClient.get<PaginatedPersonnelResponse>("/personnel", { params });
    return response.data;
  },

  async getPersonnelById(id: string): Promise<PersonnelResponse> {
    const response = await apiClient.get<PersonnelResponse>(`/personnel/${id}`);
    return response.data;
  },

  async createPersonnel(data: Partial<Personnel>): Promise<PersonnelResponse> {
    const response = await apiClient.post<PersonnelResponse>("/personnel", data);
    return response.data;
  },

  async updatePersonnel(id: string, data: Partial<Personnel>): Promise<PersonnelResponse> {
    const response = await apiClient.patch<PersonnelResponse>(`/personnel/${id}`, data);
    return response.data;
  },

  async deletePersonnel(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/personnel/${id}`);
    return response.data;
  },
};
