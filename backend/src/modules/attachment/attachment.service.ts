import crypto = require("crypto");
import AttachmentRepository = require("./attachment.repository.js");
import LocalDiskStorageProvider = require("../../shared/providers/local-storage.provider.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");
import AuditService = require("../../shared/services/audit.service.js");

class AttachmentService {
  private readonly attachmentRepository: AttachmentRepository;
  private readonly storageProvider: LocalDiskStorageProvider;

  constructor() {
    this.attachmentRepository = new AttachmentRepository();
    this.storageProvider = new LocalDiskStorageProvider();
  }

  public async uploadAttachment(
    currentUser: prismaClientModule.User,
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    entityType: string,
    entityId: string
  ): Promise<prismaClientModule.Attachment> {
    // 1. Verify associated entity exists
    await this.verifyEntityExists(entityType, entityId);

    const filename = file.originalname;
    const mimeType = file.mimetype;
    const fileSize = file.size;

    // Check versioning
    const latestVersion = await this.attachmentRepository.findLatestByFilenameAndEntity(
      filename,
      entityType,
      entityId
    );

    const nextVersion = latestVersion ? latestVersion.version + 1 : 1;
    const fileId = crypto.randomUUID();
    const extension = filename.split(".").pop() || "bin";
    const storageKey = `${fileId}.${extension}`;

    // Upload to local disk
    await this.storageProvider.uploadFile(storageKey, file.buffer);

    let created: prismaClientModule.Attachment;

    // Save metadata in transaction to guarantee consistency
    created = await prisma.$transaction(async (tx) => {
      if (latestVersion) {
        // Clear isLatest flag on previous versions
        await tx.attachment.updateMany({
          where: { filename, entityType, entityId, isLatest: true },
          data: { isLatest: false },
        });
      }

      return tx.attachment.create({
        data: {
          id: fileId,
          filename,
          mimeType,
          fileSize,
          storageKey,
          entityType,
          entityId,
          version: nextVersion,
          isLatest: true,
          uploadedById: currentUser.id,
        },
      });
    });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "ATTACHMENT",
      action: "ATTACHMENT_UPLOAD",
      entityType,
      entityId,
      newValues: { filename, version: nextVersion, key: storageKey },
    });

    return created;
  }

  public async downloadAttachment(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<{ filename: string; mimeType: string; buffer: Buffer }> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundError("Attachment not found");
    }

    // Verify ownership or RBAC visibility permissions
    await this.verifyScopingAccess(currentUser, attachment.entityType, attachment.entityId);

    const buffer = await this.storageProvider.getFile(attachment.storageKey);

    return {
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      buffer,
    };
  }

  public async getEntityAttachments(
    currentUser: prismaClientModule.User,
    entityType: string,
    entityId: string
  ): Promise<prismaClientModule.Attachment[]> {
    await this.verifyScopingAccess(currentUser, entityType, entityId);
    return this.attachmentRepository.findMany({ entityType, entityId });
  }

  public async deleteAttachment(
    currentUser: prismaClientModule.User,
    id: string
  ): Promise<prismaClientModule.Attachment> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundError("Attachment not found");
    }

    if (currentUser.role !== "ADMIN" && attachment.uploadedById !== currentUser.id) {
      throw new ForbiddenError("Access Denied: You cannot delete files uploaded by other users");
    }

    const updated = await this.attachmentRepository.update(id, { isActive: false });

    await AuditService.logAction({
      userId: currentUser.id,
      performedByType: "USER",
      module: "ATTACHMENT",
      action: "ATTACHMENT_DELETE",
      entityType: attachment.entityType,
      entityId: attachment.entityId,
    });

    return updated;
  }

  // Internal Helpers for scoping check
  private async verifyScopingAccess(
    currentUser: prismaClientModule.User,
    entityType: string,
    entityId: string
  ): Promise<void> {
    if (currentUser.role === "ADMIN") return;

    // Fetch the entity and check its base scope
    let baseId: string | null = null;

    if (entityType === "EQUIPMENT_ASSET") {
      const asset = await prisma.equipmentAsset.findFirst({ where: { id: entityId, isActive: true } });
      baseId = asset?.baseId || null;
    } else if (entityType === "PROCUREMENT") {
      const proc = await prisma.procurement.findFirst({ where: { id: entityId } });
      baseId = proc?.baseId || null;
    } else if (entityType === "MAINTENANCE") {
      const maint = await prisma.maintenance.findFirst({ where: { id: entityId, isActive: true }, include: { equipmentAsset: true } });
      baseId = (maint?.equipmentAsset as any)?.baseId || null;
    } else if (entityType === "DISPOSAL") {
      const disp = await prisma.disposal.findFirst({ where: { id: entityId }, include: { equipmentAsset: true } });
      baseId = (disp?.equipmentAsset as any)?.baseId || null;
    } else if (entityType === "INSPECTION") {
      const insp = await prisma.inspection.findFirst({ where: { id: entityId }, include: { equipmentAsset: true } });
      baseId = (insp?.equipmentAsset as any)?.baseId || null;
    }

    if (baseId && baseId !== currentUser.baseId) {
      throw new ForbiddenError("Access Denied: Entity belongs to another military base scope");
    }
  }

  private async verifyEntityExists(entityType: string, entityId: string): Promise<void> {
    let exists = false;

    if (entityType === "EQUIPMENT_ASSET") {
      const res = await prisma.equipmentAsset.findFirst({ where: { id: entityId, isActive: true } });
      exists = !!res;
    } else if (entityType === "PROCUREMENT") {
      const res = await prisma.procurement.findFirst({ where: { id: entityId } });
      exists = !!res;
    } else if (entityType === "MAINTENANCE") {
      const res = await prisma.maintenance.findFirst({ where: { id: entityId, isActive: true } });
      exists = !!res;
    } else if (entityType === "DISPOSAL") {
      const res = await prisma.disposal.findFirst({ where: { id: entityId } });
      exists = !!res;
    } else if (entityType === "INSPECTION") {
      const res = await prisma.inspection.findFirst({ where: { id: entityId } });
      exists = !!res;
    }

    if (!exists) {
      throw new ValidationError(`Associated entity of type '${entityType}' and ID '${entityId}' does not exist`);
    }
  }
}

export = AttachmentService;
