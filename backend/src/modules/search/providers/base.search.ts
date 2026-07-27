import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class BaseSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "BASE";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    };

    if (options?.baseId) {
      where.id = options.baseId;
    }

    const bases = await prisma.base.findMany({
      where,
      take: limit,
    });

    return bases.map((base) => ({
      id: base.id,
      type: "BASE",
      title: base.name,
      subtitle: `${base.code} - ${base.location}`,
      status: base.isActive ? "ACTIVE" : "INACTIVE",
      url: `/bases/${base.id}`,
    }));
  }
}

export = BaseSearchProvider;
