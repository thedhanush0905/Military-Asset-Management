import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class DisposalSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "DISPOSAL";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { remarks: { contains: query, mode: "insensitive" } },
      ],
    };

    if (options?.baseId) {
      where.equipmentAsset = {
        baseId: options.baseId,
      };
    }

    const disposals = await prisma.disposal.findMany({
      where,
      take: limit,
      include: { equipmentAsset: true },
    });

    return disposals.map((d) => ({
      id: d.id,
      type: "DISPOSAL",
      title: `Disposal: ${d.disposalReason}`,
      subtitle: `Asset: ${d.equipmentAsset.serialNumber}`,
      status: d.status,
      url: `/disposals/${d.id}`,
    }));
  }
}

export = DisposalSearchProvider;
