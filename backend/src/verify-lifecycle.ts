import prisma = require("./shared/prisma/prisma.js");

async function main() {
  console.log("====================================================");
  console.log("PHASE 4 OPERATIONAL LIFECYCLE E2E TEST SUITE");
  console.log("====================================================");

  // Setup: Find active resources
  const sourceBase = await prisma.base.findFirst({ where: { isActive: true } });
  const equipment = await prisma.equipment.findFirst({ where: { isActive: true } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN", status: "ACTIVE" } });

  if (!sourceBase || !equipment || !admin) {
    console.error("Missing baseline databases rows. Make sure database is seeded.");
    process.exit(1);
  }

  const destBase = await prisma.base.findFirst({ where: { id: { not: sourceBase.id }, isActive: true } });
  if (!destBase) {
    console.error("Missing destination base database row.");
    process.exit(1);
  }

  console.log(`Source Base: ${sourceBase.name}`);
  console.log(`Dest Base: ${destBase.name}`);
  console.log(`Catalog Model: ${equipment.name}`);

  const syncInventory = require("./shared/utils/inventorySync.js");

  // Helper functions
  const getInventory = async (baseId: string) => {
    await syncInventory(equipment.id, baseId, prisma);
    const inv = await prisma.inventory.findUnique({
      where: { equipmentId_baseId: { equipmentId: equipment.id, baseId } },
    });
    return inv ? { available: inv.availableQuantity, allocated: inv.allocatedQuantity, total: inv.quantity } : { available: 0, allocated: 0, total: 0 };
  };

  // --------------------------------------------------------------------
  // SCENARIO A: Receive Procurement
  // --------------------------------------------------------------------
  console.log("\n--- Scenario A: Receive Procurement ---");
  const initialSourceInv = await getInventory(sourceBase.id);

  // 1. Create PO
  const poNum = `PO-${Date.now().toString().slice(-6)}`;
  const po = await prisma.procurement.create({
    data: {
      procurementNumber: poNum,
      supplier: "Lockheed Operations",
      purchaseDate: new Date(),
      expectedDeliveryDate: new Date(),
      base: { connect: { id: sourceBase.id } },
      createdBy: { connect: { id: admin.id } },
      status: "APPROVED",
      totalCost: 180000,
      remarks: "E2E verification order",
      items: {
        create: {
          equipment: { connect: { id: equipment.id } },
          quantity: 2,
          unitCost: 90000,
          receivedQuantity: 0,
        }
      }
    }
  });

  // 2. Receive items and register serials
  const serial1 = `SN-A-${Date.now()}`;
  const serial2 = `SN-B-${Date.now()}`;

  const poItem = await prisma.procurementItem.findFirst({ where: { procurementId: po.id } });
  if (!poItem) throw new Error("PO Item not created");

  // Emulate receive service logic: create assets and update PO received quantity
  await prisma.$transaction(async (tx) => {
    await tx.equipmentAsset.createMany({
      data: [
        {
          equipmentId: equipment.id,
          baseId: sourceBase.id,
          serialNumber: serial1,
          purchaseDate: po.purchaseDate,
          purchaseCost: poItem.unitCost,
          status: "AVAILABLE",
          condition: "NEW",
          remarks: `Procured under PO ${po.procurementNumber}`,
          isActive: true,
        },
        {
          equipmentId: equipment.id,
          baseId: sourceBase.id,
          serialNumber: serial2,
          purchaseDate: po.purchaseDate,
          purchaseCost: poItem.unitCost,
          status: "AVAILABLE",
          condition: "NEW",
          remarks: `Procured under PO ${po.procurementNumber}`,
          isActive: true,
        }
      ]
    });

    await tx.procurementItem.update({
      where: { id: poItem.id },
      data: { receivedQuantity: 2 }
    });

    await tx.procurement.update({
      where: { id: po.id },
      data: { status: "RECEIVED" }
    });
  });

  const postProcureInv = await getInventory(sourceBase.id);
  console.log("Initial Source Inv:", initialSourceInv);
  console.log("Post Procurement Source Inv:", postProcureInv);

  if (postProcureInv.available !== initialSourceInv.available + 2) {
    throw new Error("Scenario A Fail: Source base available quantity did not increase by 2");
  }

  // Fetch the created asset for subsequent scenarios
  const asset = await prisma.equipmentAsset.findUnique({ where: { serialNumber: serial1 } });
  if (!asset) throw new Error("Asset not registered");
  console.log("✔ Scenario A PASS");

  // --------------------------------------------------------------------
  // SCENARIO B: Transfer Asset
  // --------------------------------------------------------------------
  console.log("\n--- Scenario B: Transfer Asset ---");
  const preTransferSourceInv = await getInventory(sourceBase.id);
  const preTransferDestInv = await getInventory(destBase.id);

  // 1. Create Transfer Request
  const transfer = await prisma.transfer.create({
    data: {
      equipmentAssetId: asset.id,
      fromBaseId: sourceBase.id,
      toBaseId: destBase.id,
      quantity: 1,
      transferredById: admin.id,
      status: "PENDING",
      remarks: "Transfer test",
      transferredAt: new Date(),
    }
  });

  // Emulate workflow approval -> dispatch -> receive
  // Status transitions: PENDING -> APPROVED -> IN_TRANSIT -> COMPLETED
  // Approval
  await prisma.transfer.update({ where: { id: transfer.id }, data: { status: "APPROVED" } });

  // Dispatch
  await prisma.$transaction(async (tx) => {
    await tx.transfer.update({ where: { id: transfer.id }, data: { status: "IN_TRANSIT" } });
    await tx.equipmentAsset.update({ where: { id: asset.id }, data: { status: "IN_TRANSIT" } });
  });
  await syncInventory(equipment.id, sourceBase.id, prisma);

  const dispatchSourceInv = await getInventory(sourceBase.id);
  console.log("After Dispatch Source Inv (should decrease):", dispatchSourceInv);

  // Receive
  await prisma.$transaction(async (tx) => {
    await tx.transfer.update({ where: { id: transfer.id }, data: { status: "COMPLETED" } });
    await tx.equipmentAsset.update({ where: { id: asset.id }, data: { baseId: destBase.id, status: "AVAILABLE" } });
  });

  const postTransferSourceInv = await getInventory(sourceBase.id);
  const postTransferDestInv = await getInventory(destBase.id);
  console.log("Post Transfer Source Inv:", postTransferSourceInv);
  console.log("Post Transfer Dest Inv:", postTransferDestInv);

  if (postTransferSourceInv.total !== preTransferSourceInv.total - 1) {
    throw new Error("Scenario B Fail: Source inventory total count did not decrement");
  }
  if (postTransferDestInv.available !== preTransferDestInv.available + 1) {
    throw new Error("Scenario B Fail: Destination inventory available count did not increment");
  }
  console.log("✔ Scenario B PASS");

  // --------------------------------------------------------------------
  // SCENARIO C: Maintenance
  // --------------------------------------------------------------------
  console.log("\n--- Scenario C: Maintenance ---");
  const preMaintDestInv = await getInventory(destBase.id);

  // 1. Schedule Maintenance
  const maint = await prisma.maintenance.create({
    data: {
      equipmentAssetId: asset.id,
      maintenanceType: "CORRECTIVE",
      status: "SCHEDULED",
      description: "Repair hydraulic pressure leak",
      scheduledDate: new Date(),
      createdById: admin.id,
    }
  });

  // 2. Start Maintenance
  await prisma.$transaction(async (tx) => {
    await tx.maintenance.update({ where: { id: maint.id }, data: { status: "IN_PROGRESS", startedAt: new Date() } });
    await tx.equipmentAsset.update({ where: { id: asset.id }, data: { status: "MAINTENANCE" } });
  });

  const activeMaintDestInv = await getInventory(destBase.id);
  console.log("Active Maintenance Dest Inv:", activeMaintDestInv);

  if (activeMaintDestInv.available !== preMaintDestInv.available - 1) {
    throw new Error("Scenario C Fail: Available inventory did not decrease during maintenance");
  }

  // 3. Complete Maintenance
  await prisma.$transaction(async (tx) => {
    await tx.maintenance.update({ where: { id: maint.id }, data: { status: "COMPLETED", completedAt: new Date() } });
    await tx.equipmentAsset.update({ where: { id: asset.id }, data: { status: "AVAILABLE" } });
  });

  const postMaintDestInv = await getInventory(destBase.id);
  console.log("Post Maintenance Dest Inv:", postMaintDestInv);

  if (postMaintDestInv.available !== preMaintDestInv.available) {
    throw new Error("Scenario C Fail: Available inventory did not return to initial baseline");
  }
  console.log("✔ Scenario C PASS");

  // --------------------------------------------------------------------
  // SCENARIO D: Safety Inspection
  // --------------------------------------------------------------------
  console.log("\n--- Scenario D: Safety Inspection ---");

  // 1. Schedule
  const insp = await prisma.inspection.create({
    data: {
      equipmentAsset: { connect: { id: asset.id } },
      inspector: { connect: { id: admin.id } },
      scheduledDate: new Date(),
      remarks: "Pre-deployment audit",
    }
  });

  // 2. Complete PASS
  await prisma.inspection.update({
    where: { id: insp.id },
    data: {
      result: "PASS",
      completedDate: new Date(),
      remarks: "System cleared with zero safety failures.",
    }
  });

  const dbInsp = await prisma.inspection.findUnique({ where: { id: insp.id } });
  if (dbInsp?.result !== "PASS") throw new Error("Scenario D Fail: Result was not stored as PASS");
  console.log("✔ Scenario D PASS");

  // --------------------------------------------------------------------
  // SCENARIO E: Disposal & Decommissioning
  // --------------------------------------------------------------------
  console.log("\n--- Scenario E: Disposal ---");
  const preDisposalDestInv = await getInventory(destBase.id);

  // 1. Create disposal
  const disp = await prisma.disposal.create({
    data: {
      equipmentAsset: { connect: { id: asset.id } },
      disposalReason: "SCRAPPED",
      status: "PENDING",
      remarks: "Structural fatigue beyond repair",
    }
  });

  // 2. Approve
  await prisma.disposal.update({ where: { id: disp.id }, data: { status: "APPROVED" } });

  // 3. Complete scrap
  await prisma.$transaction(async (tx) => {
    await tx.disposal.update({ where: { id: disp.id }, data: { status: "COMPLETED", disposalDate: new Date() } });
    await tx.equipmentAsset.update({ where: { id: asset.id }, data: { status: "RETIRED", isActive: false } });
  });

  const postDisposalDestInv = await getInventory(destBase.id);
  console.log("Post Disposal Dest Inv:", postDisposalDestInv);

  if (postDisposalDestInv.total !== preDisposalDestInv.total - 1) {
    throw new Error("Scenario E Fail: Total stock did not decrease by 1 after disposal scrap");
  }
  console.log("✔ Scenario E PASS");

  // --------------------------------------------------------------------
  // CLEANUP
  // --------------------------------------------------------------------
  console.log("\nCleaning up test records...");
  await prisma.inspection.deleteMany({ where: { equipmentAssetId: asset.id } });
  await prisma.disposal.deleteMany({ where: { equipmentAssetId: { in: [asset.id] } } });
  await prisma.maintenance.deleteMany({ where: { equipmentAssetId: asset.id } });
  await prisma.transfer.deleteMany({ where: { equipmentAssetId: asset.id } });
  await prisma.equipmentAsset.deleteMany({ where: { serialNumber: { in: [serial1, serial2] } } });
  await prisma.procurementItem.deleteMany({ where: { procurementId: po.id } });
  await prisma.procurement.delete({ where: { id: po.id } });
  
  await getInventory(sourceBase.id);
  await getInventory(destBase.id);

  console.log("\n====================================================");
  console.log("ALL E2E LIFECYCLE SCENARIOS COMPLETED SUCCESSFULLY!");
  console.log("====================================================");
}

main().catch((e) => {
  console.error("Verification failed:", e);
  process.exit(1);
});
