import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class InspectionSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "INSPECTION";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { remarks: { contains: query, mode: "insensitive" } },
        { equipmentAsset: { serialNumber: { contains: query, mode: "insensitive" } } },
      ],
    };

    if (options?.baseId) {
      where.equipmentAsset = {
        baseId: options.baseId,
      };
    }

    const inspections = await prisma.inspection.findMany({
      where,
      take: limit,
      include: {
        equipmentAsset: {
          include: { equipment: true },
        },
      },
    });

    return inspections.map((inspection) => ({
      id: inspection.id,
      type: "INSPECTION",
      title: `Inspection for ${inspection.equipmentAsset.serialNumber}`,
      subtitle: `${inspection.equipmentAsset.equipment.name} | Remarks: ${inspection.remarks || "No remarks"}`,
      status: inspection.result,
      url: `/operations/inspections`,
    }));
  }
}

export = InspectionSearchProvider;
