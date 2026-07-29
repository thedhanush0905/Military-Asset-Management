import { apiClient } from "@/lib/api-client";

export interface DashboardOverview {
  totalEquipmentCatalogItems: number;
  totalEquipmentAssets: number;
  availableAssets: number;
  assignedAssets: number;
  assetsInTransit: number;
  assetsUnderMaintenance: number;
  retiredAssets: number;
  totalBases: number;
  totalUsers: number;
}

export interface BaseSummaryItem {
  baseId: string;
  baseCode: string;
  baseName: string;
  totalAssets: number;
  available: number;
  assigned: number;
  maintenance: number;
  inTransit: number;
  retired: number;
}

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  type: "ASSIGNMENT" | "TRANSFER" | "MAINTENANCE" | "INSPECTION" | "DISPOSAL" | "PROCUREMENT" | "SYSTEM";
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface RecentActivitiesResponse {
  success: boolean;
  message: string;
  data: {
    activities: RecentActivityItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProcurementSummaryResponse {
  success: boolean;
  data: {
    totalProcurements: number;
    statusCounts: Record<string, number>;
    totalProcurementCost: string;
    trend: {
      month: string;
      totalCost: string;
      count: number;
    }[];
  };
}

export interface MaintenanceSummaryResponse {
  success: boolean;
  data: {
    statusCounts: Record<string, number>;
    overdueMaintenance: number;
    totalMaintenanceCost: string;
    trend: {
      month: string;
      totalCost: string;
      count: number;
    }[];
  };
}

export interface TransferSummaryResponse {
  success: boolean;
  data: {
    statusCounts: Record<string, number>;
    averageCompletionTimeHours: number;
    trend: {
      month: string;
      count: number;
    }[];
  };
}

export interface EquipmentSummaryResponse {
  success: boolean;
  data: {
    equipments: {
      equipmentId: string;
      equipmentName: string;
      category: string;
      totalAssets: number;
      available: number;
      assigned: number;
      maintenance: number;
      inTransit: number;
      retired: number;
    }[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const dashboardService = {
  async getOverview(): Promise<{ success: boolean; data: DashboardOverview }> {
    const response = await apiClient.get<{ success: boolean; data: DashboardOverview }>("/dashboard/overview");
    return response.data;
  },

  async getBaseSummary(): Promise<{ success: boolean; data: BaseSummaryItem[] }> {
    const response = await apiClient.get<{ success: boolean; data: BaseSummaryItem[] }>("/dashboard/base-summary");
    return response.data;
  },

  async getRecentActivities(page = 1, limit = 10): Promise<RecentActivitiesResponse> {
    const response = await apiClient.get<RecentActivitiesResponse>("/dashboard/recent-activities", {
      params: { page, limit },
    });
    return response.data;
  },

  async getProcurementSummary(): Promise<ProcurementSummaryResponse> {
    const response = await apiClient.get<ProcurementSummaryResponse>("/dashboard/procurement-summary");
    return response.data;
  },

  async getMaintenanceSummary(): Promise<MaintenanceSummaryResponse> {
    const response = await apiClient.get<MaintenanceSummaryResponse>("/dashboard/maintenance-summary");
    return response.data;
  },

  async getTransferSummary(): Promise<TransferSummaryResponse> {
    const response = await apiClient.get<TransferSummaryResponse>("/dashboard/transfer-summary");
    return response.data;
  },

  async getEquipmentSummary(params?: { page?: number; limit?: number; search?: string }): Promise<EquipmentSummaryResponse> {
    const response = await apiClient.get<EquipmentSummaryResponse>("/dashboard/equipment-summary", { params });
    return response.data;
  },
};
