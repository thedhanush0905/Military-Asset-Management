import { apiClient } from "@/lib/api-client";

export interface SystemConfig {
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfigsResponse {
  success: boolean;
  message: string;
  data: SystemConfig[];
}

export interface SystemConfigResponse {
  success: boolean;
  message: string;
  data: SystemConfig;
}

export const systemConfigService = {
  async getAllConfigs(): Promise<SystemConfigsResponse> {
    const response = await apiClient.get<SystemConfigsResponse>("/system-configs");
    return response.data;
  },

  async getConfigByKey(key: string): Promise<SystemConfigResponse> {
    const response = await apiClient.get<SystemConfigResponse>(`/system-configs/${key}`);
    return response.data;
  },

  async upsertConfig(data: { key: string; value: string; description?: string }): Promise<SystemConfigResponse> {
    const response = await apiClient.post<SystemConfigResponse>("/system-configs", data);
    return response.data;
  },

  async deleteConfig(key: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/system-configs/${key}`);
    return response.data;
  },
};
