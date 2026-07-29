import { apiClient } from "@/lib/api-client";

export interface SearchResult {
  id: string;
  type: "EQUIPMENT" | "ASSET" | "USER" | "BASE" | "ASSIGNMENT" | "TRANSFER" | "MAINTENANCE" | "PROCUREMENT" | "DISPOSAL" | "AUDIT_LOG" | "SUPPLIER" | "INSPECTION";
  title: string;
  subtitle: string;
  status: string;
  url: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    results: SearchResult[];
  };
}

export const searchService = {
  async globalSearch(query: string, limit?: number): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>("/search", {
      params: { q: query, limit },
    });
    return response.data;
  },
};
