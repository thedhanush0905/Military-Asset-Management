import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class UserSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "USER";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    if (options?.baseId) {
      where.baseId = options.baseId;
    }

    const users = await prisma.user.findMany({
      where,
      take: limit,
    });

    return users.map((user) => ({
      id: user.id,
      type: "USER",
      title: user.name,
      subtitle: `${user.email} (${user.role})`,
      status: user.status,
      url: `/users/${user.id}`,
    }));
  }
}

export = UserSearchProvider;
