namespace SearchProviderTypes {
  export interface SearchResultDTO {
    id: string;
    type: "EQUIPMENT" | "ASSET" | "USER" | "BASE" | "ASSIGNMENT" | "TRANSFER" | "MAINTENANCE" | "PROCUREMENT" | "DISPOSAL" | "AUDIT_LOG";
    title: string;
    subtitle: string;
    status: string;
    url: string;
  }

  export interface SearchOptions {
    limit?: number;
    baseId?: string;
  }

  export interface ISearchProvider {
    name: string;
    search(query: string, options?: SearchOptions): Promise<SearchResultDTO[]>;
  }

  export const VALUE = true;
}

export = SearchProviderTypes;
