import prisma = require("../prisma/prisma.js");
import AssignmentService = require("../../modules/assignment/assignment.service.js");
import TransferService = require("../../modules/transfer/transfer.service.js");
import MovementService = require("../../modules/movement/movement.service.js");
import EquipmentAssetService = require("../../modules/equipment-asset/equipment-asset.service.js");
import EquipmentService = require("../../modules/equipment/equipment.service.js");
import MaintenanceService = require("../../modules/maintenance/maintenance.service.js");
import ProcurementService = require("../../modules/procurement/procurement.service.js");
import DisposalService = require("../../modules/disposal/disposal.service.js");
import orchestrator = require("./transactionOrchestration.js");

async function runTests() {
  console.log("=== STARTING EXTENDED INTEGRATION LIFECYCLE TESTS ===");

  const assignmentService = new AssignmentService();
  const transferService = new TransferService();
  const movementService = new MovementService();
  const assetService = new EquipmentAssetService();
  const eqService = new EquipmentService();
  const maintenanceService = new MaintenanceService();
  const procurementService = new ProcurementService();
  const disposalService = new DisposalService();

  // 1. Setup mock users and bases
  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    throw new Error("Seed database with an ADMIN user first!");
  }

  // Create two bases
  const baseA = await prisma.base.upsert({
    where: { code: "BASE_TEST_A" },
    update: {},
    create: { code: "BASE_TEST_A", name: "Fort Test Alpha", location: "Sector 4", isActive: true },
  });

  const baseB = await prisma.base.upsert({
    where: { code: "BASE_TEST_B" },
    update: {},
    create: { code: "BASE_TEST_B", name: "Fort Test Bravo", location: "Sector 9", isActive: true },
  });

  console.log("✔ Mock bases ready:", baseA.code, baseB.code);

  // 2. Create Equipment Catalog Model
  const equipment = await eqService.createEquipment(adminUser, {
    name: "Test Rifle M16",
    category: "WEAPON",
    unit: "NOS",
    description: "Standard issue test weapon",
    manufacturer: "Colt",
    model: "M16A4",
    specifications: "5.56mm caliber",
    expectedLifeYears: 15,
  });
  console.log("✔ Equipment catalog created:", equipment.name);

  // 3. Procurement Lifecycle Tests
  console.log("\n--- Starting Procurement Tests ---");
  const pNumber = `PROC-${Date.now()}`;
  const procurement = await procurementService.createProcurement(adminUser, {
    procurementNumber: pNumber,
    supplier: "Defense Corp",
    purchaseDate: new Date().toISOString(),
    expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
    baseId: baseA.id,
    remarks: "Initial test batch",
    items: [
      {
        equipmentId: equipment.id,
        quantity: 2,
        unitCost: "500.00",
      },
    ],
  });
  console.log("✔ Procurement draft created:", procurement.procurementNumber);

  await procurementService.approveProcurement(adminUser, procurement.id);
  console.log("✔ Procurement approved");

  // Procurement receives failure validations
  // Case A: Incorrect serial number count
  try {
    await procurementService.receiveProcurement(adminUser, procurement.id, {
      items: [
        {
          equipmentId: equipment.id,
          serialNumbers: ["SN-P-01"], // expects 2
        },
      ],
    });
    throw new Error("Expected failure: Incorrect serial number count did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Incorrect serial number count:", err.message);
  }

  // Case B: Duplicate serials in request
  try {
    await procurementService.receiveProcurement(adminUser, procurement.id, {
      items: [
        {
          equipmentId: equipment.id,
          serialNumbers: ["SN-P-DUP", "SN-P-DUP"],
        },
      ],
    });
    throw new Error("Expected failure: Duplicate serial numbers in request did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Duplicate serial numbers in request:", err.message);
  }

  // Case C: Register one SN beforehand to trigger "already exists in DB" conflict
  const existingSN = `SN-EXIST-${Date.now()}`;
  const dummyAsset = await assetService.createAsset(adminUser, {
    equipmentId: equipment.id,
    baseId: baseA.id,
    serialNumber: existingSN,
    purchaseDate: new Date(),
    purchaseCost: "500.00",
    status: "AVAILABLE",
    condition: "NEW",
  });

  try {
    await procurementService.receiveProcurement(adminUser, procurement.id, {
      items: [
        {
          equipmentId: equipment.id,
          serialNumbers: ["SN-P-NEW", existingSN],
        },
      ],
    });
    throw new Error("Expected failure: Serial number already exists in DB did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Serial number already exists in DB:", err.message);
  }

  // Happy path: Receive procurement
  const sn1 = `SN-LIFE-01-${Date.now()}`;
  const sn2 = `SN-LIFE-02-${Date.now()}`;
  const receivedProcurement = await procurementService.receiveProcurement(adminUser, procurement.id, {
    items: [
      {
        equipmentId: equipment.id,
        serialNumbers: [sn1, sn2],
      },
    ],
  });
  console.log("✔ Procurement received fully. Status:", receivedProcurement.status);

  // Retrieve the generated assets
  const asset1 = await prisma.equipmentAsset.findUnique({ where: { serialNumber: sn1 } });
  const asset2 = await prisma.equipmentAsset.findUnique({ where: { serialNumber: sn2 } });
  if (!asset1 || !asset2) {
    throw new Error("Failed to find physical assets created from procurement!");
  }
  console.log("✔ Verification: 2 physical assets registered successfully.");

  // Check inventory at Base A (1 dummyAsset + 2 procuredAssets = 3 total)
  let invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 3 || invA.quantity !== 3) {
    throw new Error(`Inventory sync failure post-procure: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Inventory aggregate verified: available = 3, total = 3");

  // Check movement history logged (1 per asset)
  const movementsAsset1 = await movementService.getMovements(adminUser, { equipmentAssetId: asset1.id });
  const procMov = movementsAsset1.movements.find((m) => m.movementType === "PROCUREMENT");
  if (!procMov) {
    throw new Error("Procurement movement history record not generated!");
  }
  console.log("✔ Procurement movement history logged per asset");

  // 4. Test Assignment & Return
  console.log("\n--- Starting Assignment/Return Tests ---");
  const assignment = await assignmentService.createAssignment(adminUser, {
    equipmentAssetId: asset1.id,
    assignedTo: "Lieutenant Winters",
    remarks: "Mission deployment",
  });
  console.log("✔ Assignment created:", assignment.id);

  // Verify inventory
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 2 || invA.allocatedQuantity !== 1) {
    throw new Error("Inventory sync failure post-assign");
  }
  console.log("✔ Inventory updated: available = 2, allocated = 1");

  await assignmentService.returnAssignment(adminUser, assignment.id, "Returned in perfect condition");
  console.log("✔ Assignment returned successfully");

  // 5. Test Transfer Lifecycle
  console.log("\n--- Starting Transfer Tests ---");
  const transfer = await transferService.createTransfer(adminUser, {
    equipmentAssetId: asset1.id,
    toBaseId: baseB.id,
    remarks: "Relocation to Fort Bravo",
  });
  await transferService.approveTransfer(adminUser, transfer.id);
  await transferService.dispatchTransfer(adminUser, transfer.id, "Convoy dispatch");
  console.log("✔ Transfer dispatched. Asset status is IN_TRANSIT.");

  // Verify Base A inventory (inTransitQuantity = 1)
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 2 || invA.inTransitQuantity !== 1) {
    throw new Error(`Inventory sync failure on transfer dispatch: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Inventory updated at source base: available = 2, inTransit = 1");

  await transferService.receiveTransfer(adminUser, transfer.id, "Received at Bravo");
  console.log("✔ Transfer completed. Asset is at Base B, status is AVAILABLE.");

  // 6. Test Maintenance Lifecycle
  console.log("\n--- Starting Maintenance Tests ---");
  const maintenance = await maintenanceService.scheduleMaintenance(adminUser, {
    equipmentAssetId: asset1.id,
    maintenanceType: "PREVENTIVE",
    description: "Annual cleaning and alignment",
    scheduledDate: new Date().toISOString(),
    expectedCompletionDate: new Date(Date.now() + 86400 * 2000).toISOString(),
    estimatedCost: "50.00",
  });
  console.log("✔ Maintenance scheduled successfully. Status: SCHEDULED");

  // Failure: schedule duplicate maintenance
  try {
    await maintenanceService.scheduleMaintenance(adminUser, {
      equipmentAssetId: asset1.id,
      maintenanceType: "CORRECTIVE",
      description: "Duplicate request",
      scheduledDate: new Date().toISOString(),
    });
    throw new Error("Expected failure: Duplicate maintenance scheduling did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Duplicate maintenance scheduling blocked:", err.message);
  }

  // Happy: Start maintenance
  await maintenanceService.startMaintenance(adminUser, maintenance.id, {
    startedAt: new Date().toISOString(),
    vendorName: "Alpha Armory",
    technicianName: "Sgt. Foley",
    remarks: "Starting clean",
  });
  console.log("✔ Maintenance started. Asset status: MAINTENANCE");

  // Verify Base B inventory (available = 0, maintenance = 1)
  let invB = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseB.id },
  });
  if (!invB || invB.availableQuantity !== 0 || invB.maintenanceQuantity !== 1) {
    throw new Error(`Inventory sync failure on maintenance start: ${JSON.stringify(invB)}`);
  }
  console.log("✔ Inventory updated at Base B: available = 0, maintenance = 1");

  // Failure: Attempt to start twice
  try {
    await maintenanceService.startMaintenance(adminUser, maintenance.id, { remarks: "Start again" });
    throw new Error("Expected failure: Starting maintenance twice did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Starting maintenance twice blocked:", err.message);
  }

  // Failure: Attempt to cancel maintenance already in progress
  try {
    await maintenanceService.cancelMaintenance(adminUser, maintenance.id, { remarks: "Cancel in progress" });
    throw new Error("Expected failure: Cancelling maintenance in progress did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Cancelling maintenance in progress blocked:", err.message);
  }

  // Happy: Complete maintenance
  await maintenanceService.completeMaintenance(adminUser, maintenance.id, {
    completedAt: new Date().toISOString(),
    actualCost: "65.50",
    remarks: "Maintenance completed successfully",
  });
  console.log("✔ Maintenance completed. Asset status: AVAILABLE");

  // Verify inventory restored
  invB = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseB.id },
  });
  if (!invB || invB.availableQuantity !== 1 || invB.maintenanceQuantity !== 0) {
    throw new Error(`Inventory sync failure on maintenance complete: ${JSON.stringify(invB)}`);
  }
  console.log("✔ Inventory updated at Base B: available = 1, maintenance = 0");

  // Verify movement logs
  const maintMovements = await movementService.getMovements(adminUser, { equipmentAssetId: asset1.id });
  const startMov = maintMovements.movements.find((m) => m.movementType === "MAINTENANCE_START");
  const endMov = maintMovements.movements.find((m) => m.movementType === "MAINTENANCE_COMPLETE");
  if (!startMov || !endMov) {
    throw new Error("Maintenance movement log records missing!");
  }
  console.log("✔ Maintenance movement history logs verified");

  // 7. Test Disposal Lifecycle
  console.log("\n--- Starting Disposal Tests ---");

  // Failure: Attempt to dispose an asset that is currently assigned
  const tempAssign = await assignmentService.createAssignment(adminUser, {
    equipmentAssetId: asset1.id,
    assignedTo: "Captain Miller",
  });
  try {
    await disposalService.createDisposal(adminUser, {
      equipmentAssetId: asset1.id,
      disposalReason: "RETIRED",
      bookValue: "150.00",
    });
    throw new Error("Expected failure: Disposing assigned asset did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Disposal of assigned asset blocked:", err.message);
  }
  await assignmentService.returnAssignment(adminUser, tempAssign.id);

  // Failure: Attempt to dispose an asset currently under maintenance
  const tempMaint = await maintenanceService.scheduleMaintenance(adminUser, {
    equipmentAssetId: asset1.id,
    maintenanceType: "INSPECTION",
    description: "Inspection check",
    scheduledDate: new Date().toISOString(),
  });
  await maintenanceService.startMaintenance(adminUser, tempMaint.id, { startedAt: new Date().toISOString() });
  try {
    await disposalService.createDisposal(adminUser, {
      equipmentAssetId: asset1.id,
      disposalReason: "DAMAGED",
    });
    throw new Error("Expected failure: Disposing asset in maintenance did not throw!");
  } catch (err: any) {
    console.log("✔ Validation caught: Disposal of asset in maintenance blocked:", err.message);
  }
  // Complete it to clear
  await maintenanceService.completeMaintenance(adminUser, tempMaint.id, { actualCost: "0.00" });

  // Happy: Create disposal request
  const disposal = await disposalService.createDisposal(adminUser, {
    equipmentAssetId: asset1.id,
    disposalReason: "RETIRED",
    bookValue: "120.00",
    remarks: "Reached end of life cycle",
  });
  console.log("✔ Disposal request created. Status: PENDING");

  await disposalService.approveDisposal(adminUser, disposal.id);
  console.log("✔ Disposal request approved. Status: APPROVED");

  // Happy: Complete disposal
  await disposalService.completeDisposal(adminUser, disposal.id, {
    disposalDate: new Date().toISOString(),
    remarks: "Asset scrapped successfully",
  });
  console.log("✔ Disposal completed. Asset status: RETIRED and soft-deleted (isActive = false)");

  // Verify inventory (Base B inventory for this catalog model goes to 0)
  invB = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseB.id },
  });
  if (invB && invB.quantity !== 0) {
    throw new Error(`Inventory sync failure on disposal complete: ${JSON.stringify(invB)}`);
  }
  console.log("✔ Inventory updated at Base B: quantity = 0");

  // Verify Movement history
  const dispMovements = await movementService.getMovements(adminUser, { equipmentAssetId: asset1.id });
  const dispMov = dispMovements.movements.find((m) => m.movementType === "DISPOSAL");
  if (!dispMov) {
    throw new Error("Disposal movement history log record missing!");
  }
  console.log("✔ Disposal movement history log verified");

  // 8. Test Transaction Rollback Properties
  console.log("\n--- Starting Transaction Rollback Tests ---");
  // We will schedule another disposal for asset2
  const disp2 = await disposalService.createDisposal(adminUser, {
    equipmentAssetId: asset2.id,
    disposalReason: "SOLD",
    bookValue: "300.00",
  });
  await disposalService.approveDisposal(adminUser, disp2.id);

  // We will run a controlled transaction update using orchestrateAssetTransaction
  // but we will force the additionalOperations to throw an error
  try {
    await orchestrator.orchestrateAssetTransaction({
      assetId: asset2.id,
      assetUpdates: {
        status: "RETIRED",
      },
      movement: {
        movementType: "DISPOSAL",
        sourceBaseId: baseA.id,
        referenceType: "DISPOSAL",
        referenceId: disp2.id,
        performedById: adminUser.id,
      },
      additionalOperations: async () => {
        throw new Error("FORCED_TRANSACTION_FAILURE");
      },
    });
    throw new Error("Expected failure: Transaction did not fail and roll back!");
  } catch (err: any) {
    if (err.message !== "FORCED_TRANSACTION_FAILURE") {
      throw err;
    }
    console.log("✔ Controlled failure triggered transaction rollback successfully");
  }

  // Verify asset2 status is still AVAILABLE and NOT RETIRED
  const asset2AfterFail = await prisma.equipmentAsset.findFirst({ where: { id: asset2.id } });
  if (asset2AfterFail?.status !== "AVAILABLE") {
    throw new Error(`Rollback failed: Asset status was modified to '${asset2AfterFail?.status}'`);
  }
  console.log("✔ Rollback verification: Asset status remained AVAILABLE");

  // Verify inventory at Base A remains correct (availableQuantity = 3 - 1 (disposed asset1) = 2)
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 2) {
    throw new Error(`Rollback failed: Inventory counts were corrupted: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Rollback verification: Inventory counts remained unchanged");

  // 9. Cleanup database
  console.log("\nCleaning up test entities...");
  await prisma.disposal.deleteMany({ where: { equipmentAsset: { baseId: { in: [baseA.id, baseB.id] } } } });
  await prisma.movementHistory.deleteMany({
    where: {
      OR: [
        { equipmentAsset: { baseId: { in: [baseA.id, baseB.id] } } },
        { sourceBaseId: { in: [baseA.id, baseB.id] } },
        { destinationBaseId: { in: [baseA.id, baseB.id] } }
      ]
    }
  });
  await prisma.assignment.deleteMany({ where: { baseId: { in: [baseA.id, baseB.id] } } });
  await prisma.transfer.deleteMany({
    where: {
      OR: [
        { fromBaseId: { in: [baseA.id, baseB.id] } },
        { toBaseId: { in: [baseA.id, baseB.id] } }
      ]
    }
  });
  await prisma.maintenance.deleteMany({ where: { equipmentAsset: { baseId: { in: [baseA.id, baseB.id] } } } });
  await prisma.procurementItem.deleteMany({ where: { procurement: { baseId: { in: [baseA.id, baseB.id] } } } });
  await prisma.procurement.deleteMany({ where: { baseId: { in: [baseA.id, baseB.id] } } });
  await prisma.equipmentAsset.deleteMany({ where: { baseId: { in: [baseA.id, baseB.id] } } });
  await prisma.inventory.deleteMany({ where: { baseId: { in: [baseA.id, baseB.id] } } });
  await prisma.equipment.deleteMany({ where: { id: equipment.id } });
  await prisma.base.deleteMany({ where: { id: { in: [baseA.id, baseB.id] } } });
  console.log("✔ Database cleanup completed.");

  console.log("=== ALL EXTENDED INTEGRATION LIFECYCLE TESTS PASSED SUCCESSFULLY ===");
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ TEST FAILED:", err);
      process.exit(1);
    });
}
