import qrcode = require("qrcode");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class QRService {
  public async generateAssetQR(
    currentUser: prismaClientModule.User,
    equipmentAssetId: string
  ): Promise<string> {
    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: equipmentAssetId, isActive: true },
      include: { equipment: true },
    });

    if (!asset) {
      throw new NotFoundError("Equipment asset not found or inactive");
    }

    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Associated asset belongs to another base");
    }

    // Embed only the unique immutable asset identifier
    const qrPayload = JSON.stringify({ assetId: equipmentAssetId });
    const dataUrl = await qrcode.toDataURL(qrPayload);

    // Persist url on asset record
    await prisma.equipmentAsset.update({
      where: { id: equipmentAssetId },
      data: { qrCodeUrl: dataUrl },
    });

    return dataUrl;
  }

  public async resolveScannedQR(
    currentUser: prismaClientModule.User,
    payloadString: string
  ): Promise<prismaClientModule.EquipmentAsset> {
    let assetId: string;
    try {
      const data = JSON.parse(payloadString.trim());
      if (!data.assetId) {
        throw new Error("Missing assetId in payload");
      }
      assetId = data.assetId;
    } catch (error: any) {
      throw new ValidationError("Invalid QR Code payload structure. Expected JSON containing assetId");
    }

    const asset = await prisma.equipmentAsset.findFirst({
      where: { id: assetId, isActive: true },
      include: {
        equipment: true,
        base: true,
        unit: true,
      },
    });

    if (!asset) {
      throw new NotFoundError("Scanned asset does not exist or has been deactivated");
    }

    if (currentUser.role !== "ADMIN" && asset.baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Scanned asset belongs to another base scope");
    }

    return asset;
  }
}

export = QRService;
