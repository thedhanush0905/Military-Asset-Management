import IJob = require("../job.interface.js");
import prisma = require("../../prisma/prisma.js");
import syncInventory = require("../../utils/inventorySync.js");
import NotificationService = require("../../services/notification.service.js");

class InventoryReconciliationJob implements IJob {
  public readonly name = "InventoryReconciliationJob";

  public async execute(): Promise<void> {
    const inventories = await prisma.inventory.findMany({
      where: { isActive: true },
    });

    let correctionCount = 0;

    for (const inv of inventories) {
      const assets = await prisma.equipmentAsset.findMany({
        where: {
          equipmentId: inv.equipmentId,
          baseId: inv.baseId,
          isActive: true,
        },
      });

      // Calculate matching quantities
      const total = assets.length;
      const available = assets.filter((a) => a.status === "AVAILABLE").length;
      const allocated = assets.filter((a) => a.status === "ASSIGNED").length;
      const transit = assets.filter((a) => a.status === "IN_TRANSIT").length;
      const maintenance = assets.filter((a) => a.status === "MAINTENANCE").length;

      // Detect mismatch
      const hasMismatch =
        inv.quantity !== total ||
        inv.availableQuantity !== available ||
        inv.allocatedQuantity !== allocated ||
        inv.inTransitQuantity !== transit ||
        inv.maintenanceQuantity !== maintenance;

      if (hasMismatch) {
        correctionCount++;
        console.warn(
          `[InventoryReconciliation] Discrepancy found at base ${inv.baseId} for equipment ${inv.equipmentId}. Repairing...`
        );

        // Run repair transaction
        await prisma.$transaction(async (tx) => {
          await syncInventory(inv.equipmentId, inv.baseId, tx);
        });
      }
    }

    if (correctionCount > 0) {
      await NotificationService.createNotification({
        userId: null, // Broadcast to administrators
        title: "Inventory Sync Reconciliation Alert",
        message: `Reconciliation job completed. Detected and repaired discrepancies in ${correctionCount} inventory ledger records.`,
        type: "SYSTEM",
        priority: "HIGH",
      });
    }

    console.log(`[InventoryReconciliationJob] Reconciliation complete. Repaired ${correctionCount} entries.`);
  }
}

export = InventoryReconciliationJob;
