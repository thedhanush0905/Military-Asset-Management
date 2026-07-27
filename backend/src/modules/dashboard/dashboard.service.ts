import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");

class DashboardService {
  private enforceBaseScoping(currentUser: prismaClientModule.User, baseIdQuery?: string): string | null {
    if (currentUser.role !== "ADMIN") {
      if (baseIdQuery && baseIdQuery !== currentUser.baseId) {
        throw new ForbiddenError("Access Denied: Base scoping restriction applies");
      }
      return currentUser.baseId;
    }
    return baseIdQuery || null;
  }

  public async getOverview(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const baseFilter = targetBaseId ? { baseId: targetBaseId } : {};

    const [totalCatalog, totalAssets, available, assigned, inTransit, maintenance, retired, totalBases, totalUsers] = await Promise.all([
      // Dynamic catalog count - count equipments having active assets at that base (if base scoped)
      prisma.equipment.count({
        where: {
          isActive: true,
          ...(targetBaseId ? { assets: { some: { baseId: targetBaseId, isActive: true } } } : {}),
        },
      }),
      prisma.equipmentAsset.count({ where: { ...baseFilter, isActive: true } }),
      prisma.equipmentAsset.count({ where: { ...baseFilter, status: "AVAILABLE", isActive: true } }),
      prisma.equipmentAsset.count({ where: { ...baseFilter, status: "ASSIGNED", isActive: true } }),
      prisma.equipmentAsset.count({ where: { ...baseFilter, status: "IN_TRANSIT", isActive: true } }),
      prisma.equipmentAsset.count({ where: { ...baseFilter, status: "MAINTENANCE", isActive: true } }),
      prisma.equipmentAsset.count({ where: { ...baseFilter, status: "RETIRED" } }),
      prisma.base.count({ where: { isActive: true, ...(targetBaseId ? { id: targetBaseId } : {}) } }),
      // Exclude user stats for LOGISTICS_OFFICER
      currentUser.role === "LOGISTICS_OFFICER"
        ? Promise.resolve(null)
        : prisma.user.count({
            where: {
              status: "ACTIVE",
              ...(targetBaseId ? { baseId: targetBaseId } : {}),
            },
          }),
    ]);

    return {
      totalEquipmentCatalogItems: totalCatalog,
      totalEquipmentAssets: totalAssets,
      availableAssets: available,
      assignedAssets: assigned,
      assetsInTransit: inTransit,
      assetsUnderMaintenance: maintenance,
      retiredAssets: retired,
      totalBases,
      totalUsers,
    };
  }

  public async getBaseSummary(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);

    const baseFilter = targetBaseId ? { id: targetBaseId } : { isActive: true };
    const bases = await prisma.base.findMany({ where: baseFilter });
    const baseIds = bases.map((b) => b.id);

    const assetCounts = await prisma.equipmentAsset.groupBy({
      by: ["baseId", "status"],
      where: { baseId: { in: baseIds } },
      _count: { _all: true },
    });

    return bases.map((base) => {
      const counts = assetCounts.filter((c) => c.baseId === base.id);
      const getCount = (status: string) => counts.find((c) => c.status === status)?._count._all || 0;
      const total = counts.reduce((acc, c) => acc + c._count._all, 0);

      return {
        baseId: base.id,
        baseCode: base.code,
        baseName: base.name,
        totalAssets: total,
        available: getCount("AVAILABLE"),
        assigned: getCount("ASSIGNED"),
        maintenance: getCount("MAINTENANCE"),
        inTransit: getCount("IN_TRANSIT"),
        retired: getCount("RETIRED"),
      };
    });
  }

  public async getEquipmentSummary(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const { page = 1, limit = 10, search, equipmentId } = query;

    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { manufacturer: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ];
    }
    if (equipmentId) {
      where.id = equipmentId;
    }

    const [equipments, total] = await Promise.all([
      prisma.equipment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.equipment.count({ where }),
    ]);

    const eqIds = equipments.map((e) => e.id);

    const assetCounts = await prisma.equipmentAsset.groupBy({
      by: ["equipmentId", "status"],
      where: {
        equipmentId: { in: eqIds },
        ...(targetBaseId ? { baseId: targetBaseId } : {}),
      },
      _count: { _all: true },
    });

    const summaries = equipments.map((eq) => {
      const counts = assetCounts.filter((c) => c.equipmentId === eq.id);
      const getCount = (status: string) => counts.find((c) => c.status === status)?._count._all || 0;
      const totalAssets = counts.reduce((acc, c) => acc + c._count._all, 0);

      return {
        equipmentId: eq.id,
        equipmentName: eq.name,
        category: eq.category,
        totalAssets,
        available: getCount("AVAILABLE"),
        assigned: getCount("ASSIGNED"),
        maintenance: getCount("MAINTENANCE"),
        inTransit: getCount("IN_TRANSIT"),
        retired: getCount("RETIRED"),
      };
    });

    return {
      equipments: summaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getProcurementSummary(currentUser: prismaClientModule.User, query: any) {
    if (currentUser.role === "LOGISTICS_OFFICER") {
      throw new ForbiddenError("Access Denied: Logistics Officers do not have permission for procurement financial statistics.");
    }

    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const where: any = {};
    if (targetBaseId) {
      where.baseId = targetBaseId;
    }
    if (query.startDate || query.endDate) {
      where.purchaseDate = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const procurements = await prisma.procurement.findMany({
      where,
      select: { status: true, totalCost: true, purchaseDate: true },
    });

    const statusCounts: Record<string, number> = {
      DRAFT: 0,
      APPROVED: 0,
      PARTIALLY_RECEIVED: 0,
      RECEIVED: 0,
      CANCELLED: 0,
    };
    let totalCost = new prismaClientModule.Prisma.Decimal(0);

    for (const p of procurements) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      totalCost = totalCost.plus(p.totalCost);
    }

    // Monthly Trend
    const trendMap = new Map<string, { totalCost: prismaClientModule.Prisma.Decimal; count: number }>();
    for (const p of procurements) {
      const monthKey = p.purchaseDate.toISOString().slice(0, 7);
      const current = trendMap.get(monthKey) || { totalCost: new prismaClientModule.Prisma.Decimal(0), count: 0 };
      trendMap.set(monthKey, {
        totalCost: current.totalCost.plus(p.totalCost),
        count: current.count + 1,
      });
    }

    const trend = Array.from(trendMap.entries())
      .map(([month, val]) => ({
        month,
        totalCost: val.totalCost.toString(),
        count: val.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalProcurements: procurements.length,
      statusCounts,
      totalProcurementCost: totalCost.toString(),
      trend,
    };
  }

  public async getMaintenanceSummary(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const where: any = { isActive: true };
    if (targetBaseId) {
      where.equipmentAsset = { baseId: targetBaseId };
    }
    if (query.startDate || query.endDate) {
      where.scheduledDate = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const records = await prisma.maintenance.findMany({
      where,
      select: { status: true, estimatedCost: true, actualCost: true, expectedCompletionDate: true, scheduledDate: true },
    });

    const statusCounts: Record<string, number> = {
      SCHEDULED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    let totalCost = new prismaClientModule.Prisma.Decimal(0);
    let overdueMaintenance = 0;
    const now = new Date();

    for (const m of records) {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
      const cost = m.actualCost || m.estimatedCost || new prismaClientModule.Prisma.Decimal(0);
      totalCost = totalCost.plus(cost);

      if (
        m.expectedCompletionDate &&
        m.expectedCompletionDate < now &&
        m.status !== "COMPLETED" &&
        m.status !== "CANCELLED"
      ) {
        overdueMaintenance++;
      }
    }

    const trendMap = new Map<string, { cost: prismaClientModule.Prisma.Decimal; count: number }>();
    for (const m of records) {
      const monthKey = m.scheduledDate.toISOString().slice(0, 7);
      const cost = m.actualCost || m.estimatedCost || new prismaClientModule.Prisma.Decimal(0);
      const current = trendMap.get(monthKey) || { cost: new prismaClientModule.Prisma.Decimal(0), count: 0 };
      trendMap.set(monthKey, {
        cost: current.cost.plus(cost),
        count: current.count + 1,
      });
    }

    const trend = Array.from(trendMap.entries())
      .map(([month, val]) => ({
        month,
        totalCost: val.cost.toString(),
        count: val.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      statusCounts,
      overdueMaintenance,
      totalMaintenanceCost: totalCost.toString(),
      trend,
    };
  }

  public async getDisposalSummary(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const where: any = {};
    if (targetBaseId) {
      where.equipmentAsset = { baseId: targetBaseId };
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const records = await prisma.disposal.findMany({
      where,
      select: { status: true, disposalReason: true, bookValue: true, createdAt: true },
    });

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    const reasonsCounts: Record<string, number> = {};
    let totalBookValue = new prismaClientModule.Prisma.Decimal(0);

    for (const d of records) {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
      reasonsCounts[d.disposalReason] = (reasonsCounts[d.disposalReason] || 0) + 1;

      if (d.status === "COMPLETED" && d.bookValue) {
        totalBookValue = totalBookValue.plus(d.bookValue);
      }
    }

    const trendMap = new Map<string, { bookValue: prismaClientModule.Prisma.Decimal; count: number }>();
    for (const d of records) {
      const monthKey = d.createdAt.toISOString().slice(0, 7);
      const value = d.status === "COMPLETED" && d.bookValue ? d.bookValue : new prismaClientModule.Prisma.Decimal(0);
      const current = trendMap.get(monthKey) || { bookValue: new prismaClientModule.Prisma.Decimal(0), count: 0 };
      trendMap.set(monthKey, {
        bookValue: current.bookValue.plus(value),
        count: current.count + 1,
      });
    }

    const trend = Array.from(trendMap.entries())
      .map(([month, val]) => ({
        month,
        bookValueDisposed: val.bookValue.toString(),
        count: val.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      statusCounts,
      reasonsCounts,
      totalBookValueDisposed: totalBookValue.toString(),
      trend,
    };
  }

  public async getTransferSummary(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const where: any = {};
    if (targetBaseId) {
      where.OR = [{ fromBaseId: targetBaseId }, { toBaseId: targetBaseId }];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {
        ...(query.startDate ? { gte: query.startDate } : {}),
        ...(query.endDate ? { lte: query.endDate } : {}),
      };
    }

    const records = await prisma.transfer.findMany({
      where,
      select: { status: true, createdAt: true, updatedAt: true },
    });

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      APPROVED: 0,
      IN_TRANSIT: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    let totalCompletionTimeMs = 0;
    let completedCount = 0;

    for (const t of records) {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;

      if (t.status === "COMPLETED") {
        const diff = t.updatedAt.getTime() - t.createdAt.getTime();
        totalCompletionTimeMs += diff;
        completedCount++;
      }
    }

    const averageCompletionTimeHours =
      completedCount > 0 ? Number((totalCompletionTimeMs / (1000 * 60 * 60 * completedCount)).toFixed(2)) : 0;

    const trendMap = new Map<string, number>();
    for (const t of records) {
      const monthKey = t.createdAt.toISOString().slice(0, 7);
      trendMap.set(monthKey, (trendMap.get(monthKey) || 0) + 1);
    }

    const trend = Array.from(trendMap.entries())
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      statusCounts,
      averageCompletionTimeHours,
      trend,
    };
  }

  public async getRecentActivities(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const baseFilter = targetBaseId ? { baseId: targetBaseId } : {};

    // Parallel fetch top records from each module
    const [procurements, maintenances, transfers, assignments, disposals] = await Promise.all([
      prisma.procurement.findMany({
        where: targetBaseId ? { baseId: targetBaseId } : {},
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { createdBy: true },
      }),
      prisma.maintenance.findMany({
        where: targetBaseId ? { equipmentAsset: { baseId: targetBaseId } } : { isActive: true },
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { createdBy: true, completedBy: true },
      }),
      prisma.transfer.findMany({
        where: targetBaseId ? { OR: [{ fromBaseId: targetBaseId }, { toBaseId: targetBaseId }] } : {},
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { transferredBy: true },
      }),
      prisma.assignment.findMany({
        where: targetBaseId ? { baseId: targetBaseId } : {},
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { assignedBy: true, returnedBy: true },
      }),
      prisma.disposal.findMany({
        where: targetBaseId ? { equipmentAsset: { baseId: targetBaseId } } : {},
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { approvedBy: true, disposedBy: true },
      }),
    ]);

    // Normalize into DTO
    const activities: any[] = [];

    for (const p of procurements) {
      activities.push({
        id: `proc-${p.id}`,
        module: "PROCUREMENT",
        action: p.status,
        title: `Procurement ${p.status}`,
        description: `Procurement order #${p.procurementNumber} from supplier ${p.supplier}`,
        timestamp: p.createdAt,
        user: p.createdBy ? { id: p.createdBy.id, name: p.createdBy.name, email: p.createdBy.email } : null,
        entityId: p.id,
      });
    }

    for (const m of maintenances) {
      activities.push({
        id: `maint-${m.id}`,
        module: "MAINTENANCE",
        action: m.status,
        title: `Maintenance ${m.status}`,
        description: `${m.maintenanceType} maintenance scheduled for asset ID ${m.equipmentAssetId}`,
        timestamp: m.createdAt,
        user: m.createdBy ? { id: m.createdBy.id, name: m.createdBy.name, email: m.createdBy.email } : null,
        entityId: m.id,
      });
    }

    for (const t of transfers) {
      activities.push({
        id: `trans-${t.id}`,
        module: "TRANSFER",
        action: t.status,
        title: `Transfer ${t.status}`,
        description: `Asset transfer from Base ${t.fromBaseId} to Base ${t.toBaseId}`,
        timestamp: t.createdAt,
        user: t.transferredBy ? { id: t.transferredBy.id, name: t.transferredBy.name, email: t.transferredBy.email } : null,
        entityId: t.id,
      });
    }

    for (const a of assignments) {
      activities.push({
        id: `assign-${a.id}`,
        module: "ASSIGNMENT",
        action: a.status,
        title: `Assignment ${a.status}`,
        description: `Asset ${a.equipmentAssetId} assigned to ${a.assignedTo}`,
        timestamp: a.createdAt,
        user: a.assignedBy ? { id: a.assignedBy.id, name: a.assignedBy.name, email: a.assignedBy.email } : null,
        entityId: a.id,
      });
    }

    for (const d of disposals) {
      const performingUser = d.disposedBy || d.approvedBy || null;
      activities.push({
        id: `disp-${d.id}`,
        module: "DISPOSAL",
        action: d.status,
        title: `Disposal ${d.status}`,
        description: `Disposal request (${d.disposalReason}) for asset ID ${d.equipmentAssetId}`,
        timestamp: d.createdAt,
        user: performingUser ? { id: performingUser.id, name: performingUser.name, email: performingUser.email } : null,
        entityId: d.id,
      });
    }

    // Sort by timestamp desc and slice for pagination
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const total = activities.length;
    const startIdx = (page - 1) * limit;
    const paginated = activities.slice(startIdx, startIdx + limit);

    return {
      activities: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getTopLists(currentUser: prismaClientModule.User, query: any) {
    const targetBaseId = this.enforceBaseScoping(currentUser, query.baseId);

    // 1. Most assigned equipment catalog items
    const equipAssigned = await prisma.equipment.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        assets: {
          where: {
            status: "ASSIGNED",
            isActive: true,
            ...(targetBaseId ? { baseId: targetBaseId } : {}),
          },
          select: { id: true },
        },
      },
    });
    const mostAssigned = equipAssigned
      .map((eq) => ({
        id: eq.id,
        name: eq.name,
        category: eq.category,
        count: eq.assets.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 2. Equipment requiring the most maintenance
    const equipMaint = await prisma.equipment.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        assets: {
          where: targetBaseId ? { baseId: targetBaseId } : {},
          select: {
            maintenances: {
              where: { isActive: true },
              select: { id: true },
            },
          },
        },
      },
    });
    const mostMaintenance = equipMaint
      .map((eq) => {
        const count = eq.assets.reduce((sum, a) => sum + a.maintenances.length, 0);
        return {
          id: eq.id,
          name: eq.name,
          category: eq.category,
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 3. Bases with the highest inventory counts
    const baseInv = await prisma.base.findMany({
      where: { isActive: true, ...(targetBaseId ? { id: targetBaseId } : {}) },
      select: {
        id: true,
        code: true,
        name: true,
        equipmentAssets: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });
    const highestInventory = baseInv
      .map((b) => ({
        id: b.id,
        code: b.code,
        name: b.name,
        count: b.equipmentAssets.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Assets with the highest transfer frequency
    const assetTransfers = await prisma.equipmentAsset.findMany({
      where: {
        isActive: true,
        ...(targetBaseId ? { baseId: targetBaseId } : {}),
      },
      select: {
        id: true,
        serialNumber: true,
        equipment: { select: { name: true } },
        transfers: { select: { id: true } },
      },
    });
    const highestTransferFrequency = assetTransfers
      .map((a) => ({
        id: a.id,
        serialNumber: a.serialNumber,
        equipmentName: a.equipment.name,
        count: a.transfers.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      mostAssigned,
      mostMaintenance,
      highestInventory,
      highestTransferFrequency,
    };
  }
}

export = DashboardService;
