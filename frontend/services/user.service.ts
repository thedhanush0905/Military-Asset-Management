import { apiClient } from "@/lib/api-client";
import { User, Role, UserStatus } from "@/types/user";

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
  base?: string;
  sortBy?: "name" | "email" | "role" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsersResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export const userService = {
  async getUsers(params?: UserListParams): Promise<PaginatedUsersResponse> {
    const response = await apiClient.get<PaginatedUsersResponse>("/users", { params });
    return response.data;
  },

  async getUserById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: Omit<User, "id" | "status" | "createdAt" | "updatedAt"> & { password?: string }): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>("/users", data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<UserResponse> {
    const response = await apiClient.patch<UserResponse>(`/users/${id}/status`, { status });
    return response.data;
  },

  async deactivateUser(id: string): Promise<UserResponse> {
    const response = await apiClient.delete<UserResponse>(`/users/${id}`);
    return response.data;
  },
};
