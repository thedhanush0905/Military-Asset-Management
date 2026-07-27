import prisma = require("../prisma/prisma.js");
import AssignmentService = require("../../modules/assignment/assignment.service.js");
import TransferService = require("../../modules/transfer/transfer.service.js");
import MovementService = require("../../modules/movement/movement.service.js");
import EquipmentAssetService = require("../../modules/equipment-asset/equipment-asset.service.js");
import EquipmentService = require("../../modules/equipment/equipment.service.js");

async function runTests() {
  console.log("=== STARTING INTEGRATION TESTS ===");

  const assignmentService = new AssignmentService();
  const transferService = new TransferService();
  const movementService = new MovementService();
  const assetService = new EquipmentAssetService();
  const eqService = new EquipmentService();

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

  // 3. Create physical serialized asset at Base A
  const serial = `SN-TST-${Date.now()}`;
  const asset = await assetService.createAsset(adminUser, {
    equipmentId: equipment.id,
    baseId: baseA.id,
    serialNumber: serial,
    purchaseDate: new Date(),
    purchaseCost: "750.50",
    remarks: "Brand new",
    status: "AVAILABLE",
    condition: "NEW",
  });
  console.log("✔ Physical asset created:", asset.serialNumber);

  // Verify initial inventory at Base A
  let invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 1 || invA.allocatedQuantity !== 0 || invA.quantity !== 1) {
    throw new Error(`Inventory sync failure on creation: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Initial inventory verified: available = 1, total = 1");

  // 4. Test Assignment
  console.log("Running Assignment tests...");
  const assignment = await assignmentService.createAssignment(adminUser, {
    equipmentAssetId: asset.id,
    assignedTo: "Lieutenant Winters",
    remarks: "Mission deployment",
  });
  console.log("✔ Assignment created:", assignment.id);

  // Verify inventory at Base A
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 0 || invA.allocatedQuantity !== 1 || invA.quantity !== 1) {
    throw new Error(`Inventory sync failure on assignment: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Post-assignment inventory verified: available = 0, allocated = 1");

  // Verify asset status updated to ASSIGNED
  const assignedAsset = await prisma.equipmentAsset.findFirst({ where: { id: asset.id } });
  if (assignedAsset?.status !== "ASSIGNED") {
    throw new Error("Asset status was not updated to ASSIGNED!");
  }
  console.log("✔ Asset status verified as ASSIGNED");

  // Verify Movement History logged
  let movements = await movementService.getMovements(adminUser, { equipmentAssetId: asset.id });
  const assignMov = movements.movements.find((m) => m.movementType === "ASSIGNMENT");
  if (!assignMov) {
    throw new Error("Movement history log missing for ASSIGNMENT!");
  }
  console.log("✔ Movement history log verified for ASSIGNMENT");

  // 5. Test Return
  console.log("Running Return tests...");
  await assignmentService.returnAssignment(adminUser, assignment.id, "Returned in perfect condition");
  console.log("✔ Assignment returned");

  // Verify inventory restored
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 1 || invA.allocatedQuantity !== 0 || invA.quantity !== 1) {
    throw new Error(`Inventory sync failure on return: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Post-return inventory verified: available = 1, allocated = 0");

  // Verify Movement History logged
  movements = await movementService.getMovements(adminUser, { equipmentAssetId: asset.id });
  const returnMov = movements.movements.find((m) => m.movementType === "RETURN");
  if (!returnMov) {
    throw new Error("Movement history log missing for RETURN!");
  }
  console.log("✔ Movement history log verified for RETURN");

  // 6. Test Transfer Lifecycle
  console.log("Running Transfer tests...");
  const transfer = await transferService.createTransfer(adminUser, {
    equipmentAssetId: asset.id,
    toBaseId: baseB.id,
    remarks: "Relocation to Fort Bravo",
  });
  console.log("✔ Transfer created in PENDING status");

  await transferService.approveTransfer(adminUser, transfer.id);
  console.log("✔ Transfer status approved");

  await transferService.dispatchTransfer(adminUser, transfer.id, "In transit via convoy");
  console.log("✔ Transfer dispatched");

  // Verify asset status is IN_TRANSIT
  const transitAsset = await prisma.equipmentAsset.findFirst({ where: { id: asset.id } });
  if (transitAsset?.status !== "IN_TRANSIT") {
    throw new Error("Asset status was not updated to IN_TRANSIT!");
  }

  // Verify Base A inventory has 1 inTransitQuantity
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  if (!invA || invA.availableQuantity !== 0 || invA.inTransitQuantity !== 1 || invA.quantity !== 1) {
    throw new Error(`Inventory sync failure on dispatch: ${JSON.stringify(invA)}`);
  }
  console.log("✔ Post-dispatch inventory verified: available = 0, inTransit = 1");

  // Verify Movement History has TRANSFER_OUT
  movements = await movementService.getMovements(adminUser, { equipmentAssetId: asset.id });
  const outMov = movements.movements.find((m) => m.movementType === "TRANSFER_OUT");
  if (!outMov) {
    throw new Error("Movement history log missing for TRANSFER_OUT!");
  }
  console.log("✔ Movement history log verified for TRANSFER_OUT");

  // Receive Transfer at Base B
  await transferService.receiveTransfer(adminUser, transfer.id, "Convoy arrived, asset verified");
  console.log("✔ Transfer received");

  // Verify asset baseId is Base B and status is AVAILABLE
  const receivedAsset = await prisma.equipmentAsset.findFirst({ where: { id: asset.id } });
  if (receivedAsset?.baseId !== baseB.id || receivedAsset?.status !== "AVAILABLE") {
    throw new Error(`Asset receive failed: baseId=${receivedAsset?.baseId}, status=${receivedAsset?.status}`);
  }
  console.log("✔ Asset location updated to Base B and status is AVAILABLE");

  // Verify inventories are updated
  invA = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseA.id },
  });
  let invB = await prisma.inventory.findFirst({
    where: { equipmentId: equipment.id, baseId: baseB.id },
  });

  if (invA && invA.quantity !== 0) {
    throw new Error(`Source base inventory not cleared: ${JSON.stringify(invA)}`);
  }
  if (!invB || invB.availableQuantity !== 1 || invB.quantity !== 1) {
    throw new Error(`Destination base inventory not updated: ${JSON.stringify(invB)}`);
  }
  console.log("✔ Inventories synchronized successfully between bases!");

  // Verify Movement History has TRANSFER_IN
  movements = await movementService.getMovements(adminUser, { equipmentAssetId: asset.id });
  const inMov = movements.movements.find((m) => m.movementType === "TRANSFER_IN");
  if (!inMov) {
    throw new Error("Movement history log missing for TRANSFER_IN!");
  }
  console.log("✔ Movement history log verified for TRANSFER_IN");

  // Cleanup test entities to keep database clean
  await prisma.movementHistory.deleteMany({ where: { equipmentAssetId: asset.id } });
  await prisma.assignment.deleteMany({ where: { equipmentAssetId: asset.id } });
  await prisma.transfer.deleteMany({ where: { equipmentAssetId: asset.id } });
  await prisma.equipmentAsset.deleteMany({ where: { id: asset.id } });
  await prisma.inventory.deleteMany({ where: { equipmentId: equipment.id } });
  await prisma.equipment.deleteMany({ where: { id: equipment.id } });
  await prisma.base.deleteMany({ where: { id: { in: [baseA.id, baseB.id] } } });

  console.log("✔ Cleanup complete.");
  console.log("=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY ===");
}

if (require.main === module) {
  runTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ TEST FAILED:", err);
      process.exit(1);
    });
}
