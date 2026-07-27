import prisma = require("../../../shared/prisma/prisma.js");
import type SearchTypes = require("../search-provider.interface.js");

class AuditLogSearchProvider implements SearchTypes.ISearchProvider {
  public readonly name = "AUDIT_LOG";

  public async search(query: string, options?: SearchTypes.SearchOptions): Promise<SearchTypes.SearchResultDTO[]> {
    const limit = options?.limit ?? 10;
    
    const where: any = {
      OR: [
        { action: { contains: query, mode: "insensitive" } },
        { module: { contains: query, mode: "insensitive" } },
        { entityType: { contains: query, mode: "insensitive" } },
      ],
    };

    if (options?.baseId) {
      where.user = {
        baseId: options.baseId,
      };
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      take: limit,
      include: { user: true },
    });

    return auditLogs.map((log) => ({
      id: log.id,
      type: "AUDIT_LOG",
      title: `${log.action} (${log.module})`,
      subtitle: `Performed by User: ${log.user?.name || "SYSTEM"}`,
      status: log.result,
      url: `/audit-logs?search=${log.id}`,
    }));
  }
}

export = AuditLogSearchProvider;
