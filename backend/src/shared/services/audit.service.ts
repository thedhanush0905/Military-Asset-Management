import prisma = require("../prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class AuditService {
  /**
   * Logs a user or system action.
   * Best-effort: failures to log will not disrupt the parent operation.
   */
  public static async logAction(params: {
    userId?: string | null;
    performedByType: prismaClientModule.PerformedByType;
    module: string;
    action: string;
    entityType: string;
    entityId: string;
    result?: prismaClientModule.AuditResult;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          performedByType: params.performedByType,
          module: params.module,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          result: params.result || "SUCCESS",
          oldValues: params.oldValues || null,
          newValues: params.newValues || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (error: any) {
      // Best-effort: do not crash operations if audit logging fails
      console.error("[AuditService Error] Failed to write audit log:", error?.message || error);
    }
  }
}

export = AuditService;
