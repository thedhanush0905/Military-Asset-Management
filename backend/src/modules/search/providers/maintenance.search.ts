import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class MaintenanceSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "MAINTENANCE";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { description: { contains: query, mode: "insensitive" } },
        { technicianName: { contains: query, mode: "insensitive" } },
        { vendorName: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    };

    if (options?.baseId) {
      where.equipmentAsset = {
        baseId: options.baseId,
      };
    }

    const maintenances = await prisma.maintenance.findMany({
      where,
      take: limit,
      include: { equipmentAsset: true },
    });

    return maintenances.map((m) => ({
      id: m.id,
      type: "MAINTENANCE",
      title: `${m.maintenanceType} Maintenance`,
      subtitle: `Asset: ${m.equipmentAsset.serialNumber} - ${m.description}`,
      status: m.status,
      url: `/maintenances/${m.id}`,
    }));
  }
}

export = MaintenanceSearchProvider;
