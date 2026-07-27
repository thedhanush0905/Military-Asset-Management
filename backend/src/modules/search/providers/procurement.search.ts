import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class ProcurementSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "PROCUREMENT";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { procurementNumber: { contains: query, mode: "insensitive" } },
        { supplier: { contains: query, mode: "insensitive" } },
        { remarks: { contains: query, mode: "insensitive" } },
      ],
    };

    if (options?.baseId) {
      where.baseId = options.baseId;
    }

    const procurements = await prisma.procurement.findMany({
      where,
      take: limit,
    });

    return procurements.map((p) => ({
      id: p.id,
      type: "PROCUREMENT",
      title: `Procurement: ${p.procurementNumber}`,
      subtitle: `Supplier: ${p.supplier}`,
      status: p.status,
      url: `/procurements/${p.id}`,
    }));
  }
}

export = ProcurementSearchProvider;
