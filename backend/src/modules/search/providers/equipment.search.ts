import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class EquipmentSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "EQUIPMENT";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    const equipments = await prisma.equipment.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { model: { contains: query, mode: "insensitive" } },
          { supplier: { name: { contains: query, mode: "insensitive" } } },
        ],
        isActive: true,
      },
      include: {
        supplier: true,
      },
      take: limit,
    });

    return equipments.map((eq) => ({
      id: eq.id,
      type: "EQUIPMENT",
      title: eq.name,
      subtitle: `${eq.model || "N/A"} - ${(eq as any).supplier?.name || "N/A"}`,
      status: eq.isActive ? "ACTIVE" : "INACTIVE",
      url: `/equipment/${eq.id}`,
    }));
  }
}

export = EquipmentSearchProvider;
