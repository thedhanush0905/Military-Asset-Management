import { apiClient } from "@/lib/api-client";
import { Assignment, AssignmentStatus } from "@/types/assignment";

export interface AssignmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  baseId?: string;
  equipmentAssetId?: string;
  status?: AssignmentStatus;
  sortBy?: "assignedAt" | "returnedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedAssignmentsResponse {
  success: boolean;
  message: string;
  data: {
    assignments: Assignment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
  data: {
    assignment: Assignment;
  };
}

export const assignmentService = {
  async getAssignments(params?: AssignmentListParams): Promise<PaginatedAssignmentsResponse> {
    const response = await apiClient.get<PaginatedAssignmentsResponse>("/assignments", { params });
    return response.data;
  },

  async getActiveAssignments(params?: AssignmentListParams): Promise<PaginatedAssignmentsResponse> {
    const response = await apiClient.get<PaginatedAssignmentsResponse>("/assignments/active", { params });
    return response.data;
  },

  async getAssignmentHistory(params?: AssignmentListParams): Promise<PaginatedAssignmentsResponse> {
    const response = await apiClient.get<PaginatedAssignmentsResponse>("/assignments/history", { params });
    return response.data;
  },

  async getAssignmentById(id: string): Promise<AssignmentResponse> {
    const response = await apiClient.get<AssignmentResponse>(`/assignments/${id}`);
    return response.data;
  },

  async createAssignment(data: { equipmentAssetId: string; assignedTo: string; remarks?: string | null }): Promise<AssignmentResponse> {
    const response = await apiClient.post<AssignmentResponse>("/assignments", data);
    return response.data;
  },

  async returnAssignment(id: string, remarks?: string | null): Promise<AssignmentResponse> {
    const response = await apiClient.post<AssignmentResponse>(`/assignments/${id}/return`, { remarks });
    return response.data;
  },
};
