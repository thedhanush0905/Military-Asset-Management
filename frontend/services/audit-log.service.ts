import { apiClient } from "@/lib/api-client";
import { AuditLog } from "@/types/audit";

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  module?: string;
  action?: string;
  result?: "SUCCESS" | "FAILURE";
  startDate?: string;
  endDate?: string;
}

export interface PaginatedAuditLogsResponse {
  success: boolean;
  message: string;
  data: {
    logs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AuditLogResponse {
  success: boolean;
  message: string;
  data: {
    auditLog: AuditLog;
  };
}

export const auditLogService = {
  async getAuditLogs(params?: AuditLogListParams): Promise<PaginatedAuditLogsResponse> {
    const response = await apiClient.get<PaginatedAuditLogsResponse>("/audit-logs", { params });
    return response.data;
  },

  async getAuditLogById(id: string): Promise<AuditLogResponse> {
    const response = await apiClient.get<AuditLogResponse>(`/audit-logs/${id}`);
    return response.data;
  },
};
