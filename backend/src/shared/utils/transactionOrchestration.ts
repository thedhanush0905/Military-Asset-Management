import prisma = require("../prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import syncInventory = require("./inventorySync.js");

interface OrchestrationParams {
  assetId: string;
  assetUpdates?: prismaClientModule.Prisma.EquipmentAssetUncheckedUpdateInput;
  movement?: {
    movementType: prismaClientModule.AssetMovementType;
    sourceBaseId?: string | null;
    destinationBaseId?: string | null;
    referenceType: prismaClientModule.MovementReferenceType;
    referenceId: string;
    performedById: string;
    remarks?: string | null;
  };
  additionalOperations?: (tx: prismaClientModule.Prisma.TransactionClient) => Promise<any>;
}

async function orchestrateAssetTransaction(
  params: OrchestrationParams
): Promise<prismaClientModule.EquipmentAsset> {
  return prisma.$transaction(async (tx) => {
    const asset = await tx.equipmentAsset.findFirst({
      where: { id: params.assetId, isActive: true },
    });
    if (!asset) {
      throw new Error(`Asset with ID '${params.assetId}' not found or inactive`);
    }

    const oldBaseId = asset.baseId;
    const oldEquipmentId = asset.equipmentId;

    let updatedAsset = asset;
    if (params.assetUpdates) {
      updatedAsset = await tx.equipmentAsset.update({
        where: { id: params.assetId },
        data: params.assetUpdates,
      });
    }

    if (params.movement) {
      await tx.movementHistory.create({
        data: {
          equipmentAssetId: params.assetId,
          movementType: params.movement.movementType,
          sourceBaseId: params.movement.sourceBaseId ?? null,
          destinationBaseId: params.movement.destinationBaseId ?? null,
          referenceType: params.movement.referenceType,
          referenceId: params.movement.referenceId,
          performedById: params.movement.performedById,
          remarks: params.movement.remarks ?? null,
        },
      });
    }

    if (params.additionalOperations) {
      await params.additionalOperations(tx);
    }

    await syncInventory(oldEquipmentId, oldBaseId, tx);

    if (updatedAsset.baseId !== oldBaseId) {
      await syncInventory(updatedAsset.equipmentId, updatedAsset.baseId, tx);
    }

    return updatedAsset;
  });
}

const orchestrator = {
  orchestrateAssetTransaction,
};

export = orchestrator;
