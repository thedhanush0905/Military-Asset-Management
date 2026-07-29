import { apiClient } from "@/lib/api-client";
import { OrganizationUnit } from "@/types/organization";

export interface OrganizationTreeResponse {
  success: boolean;
  message: string;
  data: OrganizationUnit[];
}

export interface OrganizationResponse {
  success: boolean;
  message: string;
  data: {
    unit: OrganizationUnit;
  };
}

export const organizationService = {
  async getTree(): Promise<OrganizationTreeResponse> {
    const response = await apiClient.get<OrganizationTreeResponse>("/organization-unit/tree");
    return response.data;
  },

  async getUnitById(id: string): Promise<OrganizationResponse> {
    const response = await apiClient.get<OrganizationResponse>(`/organization-unit/${id}`);
    return response.data;
  },

  async createUnit(data: Partial<OrganizationUnit>): Promise<OrganizationResponse> {
    const response = await apiClient.post<OrganizationResponse>("/organization-unit", data);
    return response.data;
  },

  async updateUnit(id: string, data: Partial<OrganizationUnit>): Promise<OrganizationResponse> {
    const response = await apiClient.patch<OrganizationResponse>(`/organization-unit/${id}`, data);
    return response.data;
  },

  async deleteUnit(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/organization-unit/${id}`);
    return response.data;
  },
};
