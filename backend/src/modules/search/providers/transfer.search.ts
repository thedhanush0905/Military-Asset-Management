import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class TransferSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "TRANSFER";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { remarks: { contains: query, mode: "insensitive" } },
      ],
    };

    if (options?.baseId) {
      where.OR = [
        { fromBaseId: options.baseId },
        { toBaseId: options.baseId },
      ];
    }

    const transfers = await prisma.transfer.findMany({
      where,
      take: limit,
      include: {
        equipmentAsset: true,
        toBase: true,
      },
    });

    return transfers.map((tr) => ({
      id: tr.id,
      type: "TRANSFER",
      title: `Transfer to Base: ${tr.toBase.name}`,
      subtitle: `Asset: ${tr.equipmentAsset.serialNumber}`,
      status: tr.status,
      url: `/transfers/${tr.id}`,
    }));
  }
}

export = TransferSearchProvider;
