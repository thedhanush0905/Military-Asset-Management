import prismaClientModule = require("../../../generated/prisma/index.js");

async function syncInventory(
  equipmentId: string,
  baseId: string,
  tx: prismaClientModule.Prisma.TransactionClient
): Promise<void> {
  const assets = await tx.equipmentAsset.findMany({
    where: {
      equipmentId,
      baseId,
      isActive: true,
    },
    select: {
      status: true,
    },
  });

  let availableQuantity = 0;
  let allocatedQuantity = 0;
  let inTransitQuantity = 0;
  let maintenanceQuantity = 0;
  let damagedQuantity = 0;

  for (const asset of assets) {
    if (asset.status === "AVAILABLE") {
      availableQuantity++;
    } else if (asset.status === "ASSIGNED") {
      allocatedQuantity++;
    } else if (asset.status === "IN_TRANSIT") {
      inTransitQuantity++;
    } else if (asset.status === "MAINTENANCE") {
      maintenanceQuantity++;
    } else if (asset.status === "DAMAGED") {
      damagedQuantity++;
    }
  }

  const quantity =
    availableQuantity +
    allocatedQuantity +
    inTransitQuantity +
    maintenanceQuantity +
    damagedQuantity;

  await tx.inventory.upsert({
    where: {
      equipmentId_baseId: {
        equipmentId,
        baseId,
      },
    },
    create: {
      equipmentId,
      baseId,
      availableQuantity,
      allocatedQuantity,
      inTransitQuantity,
      maintenanceQuantity,
      damagedQuantity,
      quantity,
      minimumStock: 0,
      isActive: true,
    },
    update: {
      availableQuantity,
      allocatedQuantity,
      inTransitQuantity,
      maintenanceQuantity,
      damagedQuantity,
      quantity,
      isActive: true,
    },
  });
}

export = syncInventory;
