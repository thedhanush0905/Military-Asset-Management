import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class EquipmentAssetSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "ASSET";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { serialNumber: { contains: query, mode: "insensitive" } },
        { remarks: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    };

    if (options?.baseId) {
      where.baseId = options.baseId;
    }

    const assets = await prisma.equipmentAsset.findMany({
      where,
      take: limit,
      include: { equipment: true },
    });

    return assets.map((asset) => ({
      id: asset.id,
      type: "ASSET",
      title: asset.serialNumber,
      subtitle: `${asset.equipment.name} (${asset.condition})`,
      status: asset.status,
      url: `/assets/${asset.id}`,
    }));
  }
}

export = EquipmentAssetSearchProvider;
