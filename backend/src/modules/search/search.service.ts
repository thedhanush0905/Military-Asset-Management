import type SearchTypes = require("./search-provider.interface.js");
import EquipmentSearchProvider = require("./providers/equipment.search.js");
import EquipmentAssetSearchProvider = require("./providers/equipment-asset.search.js");
import UserSearchProvider = require("./providers/user.search.js");
import BaseSearchProvider = require("./providers/base.search.js");
import AssignmentSearchProvider = require("./providers/assignment.search.js");
import TransferSearchProvider = require("./providers/transfer.search.js");
import MaintenanceSearchProvider = require("./providers/maintenance.search.js");
import ProcurementSearchProvider = require("./providers/procurement.search.js");
import DisposalSearchProvider = require("./providers/disposal.search.js");
import AuditLogSearchProvider = require("./providers/audit-log.search.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class GlobalSearchService {
  private readonly providers: SearchTypes.ISearchProvider[] = [];

  constructor() {
    this.providers.push(new EquipmentSearchProvider());
    this.providers.push(new EquipmentAssetSearchProvider());
    this.providers.push(new UserSearchProvider());
    this.providers.push(new BaseSearchProvider());
    this.providers.push(new AssignmentSearchProvider());
    this.providers.push(new TransferSearchProvider());
    this.providers.push(new MaintenanceSearchProvider());
    this.providers.push(new ProcurementSearchProvider());
    this.providers.push(new DisposalSearchProvider());
    this.providers.push(new AuditLogSearchProvider());
  }

  public async search(
    currentUser: prismaClientModule.User,
    query: string,
    limitParam?: number
  ): Promise<SearchTypes.SearchResultDTO[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const options: SearchTypes.SearchOptions = {
      limit: limitParam ?? 10,
    };
    if (currentUser.role !== "ADMIN" && currentUser.baseId) {
      options.baseId = currentUser.baseId;
    }

    // Enforce RBAC visibility rules:
    // LOGISTICS_OFFICER cannot view user information or audit log activities.
    let activeProviders = this.providers;
    if (currentUser.role === "LOGISTICS_OFFICER") {
      activeProviders = this.providers.filter(
        (p) => p.name !== "USER" && p.name !== "AUDIT_LOG"
      );
    }

    // Execute searches in parallel
    const searchPromises = activeProviders.map((provider) =>
      provider.search(trimmedQuery, options).catch((error) => {
        console.error(`[GlobalSearchService] Provider '${provider.name}' search failed:`, error);
        return [];
      })
    );

    const resultsArray = await Promise.all(searchPromises);
    
    // Flatten, merge, and cap total merged results
    return resultsArray.flat().slice(0, 100);
  }
}

export = GlobalSearchService;
