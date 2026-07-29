import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class SupplierSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "SUPPLIER";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
      ],
      isActive: true,
    };

    const suppliers = await prisma.supplier.findMany({
      where,
      take: limit,
    });

    return suppliers.map((supplier) => ({
      id: supplier.id,
      type: "SUPPLIER",
      title: supplier.name,
      subtitle: `Code: ${supplier.code} | Phone: ${supplier.phone || "N/A"}`,
      status: supplier.status,
      url: `/management/suppliers`,
    }));
  }
}

export = SupplierSearchProvider;
