import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class AssignmentSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "ASSIGNMENT";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { assignedTo: { contains: query, mode: "insensitive" } },
        { remarks: { contains: query, mode: "insensitive" } },
      ],
    };

    if (options?.baseId) {
      where.baseId = options.baseId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      take: limit,
      include: { equipmentAsset: true },
    });

    return assignments.map((asg) => ({
      id: asg.id,
      type: "ASSIGNMENT",
      title: `Assigned to: ${asg.assignedTo}`,
      subtitle: `Asset: ${asg.equipmentAsset.serialNumber}`,
      status: asg.status,
      url: `/assignments/${asg.id}`,
    }));
  }
}

export = AssignmentSearchProvider;
