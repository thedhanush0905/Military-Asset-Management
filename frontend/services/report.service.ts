import { apiClient } from "@/lib/api-client";
import { ReportJob } from "@/types/report";

export interface ReportRequestPayload {
  reportType: "INVENTORY" | "ASSETS" | "MAINTENANCE" | "PROCUREMENT" | "DISPOSALS";
  exportFormat: "PDF" | "XLSX" | "CSV";
  filters?: Record<string, unknown>;
}

export interface ReportJobResponse {
  success: boolean;
  message: string;
  data: ReportJob;
}

export const reportService = {
  async requestReport(data: ReportRequestPayload): Promise<ReportJobResponse> {
    const response = await apiClient.post<ReportJobResponse>("/report", data);
    return response.data;
  },

  async getJobStatus(id: string): Promise<ReportJobResponse> {
    const response = await apiClient.get<ReportJobResponse>(`/report/jobs/${id}`);
    return response.data;
  },

  async downloadReport(id: string): Promise<Blob> {
    const response = await apiClient.get(`/report/download/${id}`, {
      responseType: "blob",
    });
    return response.data;
  },
};
