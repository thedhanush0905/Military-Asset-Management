import ReportRepository = require("./report.repository.js");
import LocalDiskStorageProvider = require("../../shared/providers/local-storage.provider.js");
import NotFoundError = require("../../shared/errors/NotFoundError.js");
import ForbiddenError = require("../../shared/errors/ForbiddenError.js");
import ValidationError = require("../../shared/errors/ValidationError.js");
import prisma = require("../../shared/prisma/prisma.js");
import prismaClientModule = require("../../../generated/prisma/index.js");

class ReportService {
  private readonly reportRepository: ReportRepository;
  private readonly storageProvider: LocalDiskStorageProvider;

  constructor() {
    this.reportRepository = new ReportRepository();
    this.storageProvider = new LocalDiskStorageProvider();
  }

  public async requestReport(
    currentUser: prismaClientModule.User,
    reportType: string,
    exportFormat: string,
    filtersParam: any
  ): Promise<{ jobId: string; status: string }> {
    const filters = filtersParam || {};

    // 1. Scoping Checks
    if (currentUser.role !== "ADMIN") {
      filters.baseId = currentUser.baseId;
    }

    // 2. Base Commanders / Logistics Officers visibility scope validation
    if (currentUser.role === "LOGISTICS_OFFICER" && reportType === "PROCUREMENT") {
      throw new ForbiddenError("Access Denied: Logistics Officers are restricted from financial procurement reports");
    }

    // 3. Register ReportJob PENDING in Database
    const createdJob = await this.reportRepository.createJob({
      reportType,
      exportFormat,
      requestedById: currentUser.id,
      status: "PENDING",
      filters: filters,
    });

    // 4. Trigger asynchronous processing immediately
    this.generateReportInBackground(createdJob.id).catch((error) => {
      console.error(`[ReportService] Background generation failed for job ${createdJob.id}:`, error);
    });

    return {
      jobId: createdJob.id,
      status: "PENDING",
    };
  }

  public async getReportJobStatus(
    currentUser: prismaClientModule.User,
    jobId: string
  ): Promise<prismaClientModule.ReportJob> {
    const job = await this.reportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundError("Report job not found");
    }

    if (currentUser.role !== "ADMIN" && job.requestedById !== currentUser.id) {
      throw new ForbiddenError("Access Denied: You did not request this report");
    }

    return job;
  }

  public async downloadReport(
    currentUser: prismaClientModule.User,
    jobId: string
  ): Promise<{ filename: string; mimeType: string; buffer: Buffer }> {
    const job = await this.reportRepository.findJobById(jobId);
    if (!job) {
      throw new NotFoundError("Report job not found");
    }

    if (job.status !== "COMPLETED" || !job.storageKey) {
      throw new ValidationError(`Report file is not available (Status: ${job.status})`);
    }

    if (currentUser.role !== "ADMIN" && job.requestedById !== currentUser.id) {
      throw new ForbiddenError("Access Denied: You did not request this report");
    }

    const buffer = await this.storageProvider.getFile(job.storageKey);
    const ext = job.exportFormat.toLowerCase();
    
    let mimeType = "text/csv";
    if (ext === "pdf") mimeType = "application/pdf";
    else if (ext === "xlsx") mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return {
      filename: `report-${job.id}.${ext}`,
      mimeType,
      buffer,
    };
  }

  // Background report worker logic
  private async generateReportInBackground(jobId: string): Promise<void> {
    // 1. Update job to GENERATING
    await this.reportRepository.updateJob(jobId, {
      status: "GENERATING",
      startedAt: new Date(),
    });

    try {
      const job = await this.reportRepository.findJobById(jobId);
      if (!job) return;

      const filters = (job.filters as any) || {};
      const format = job.exportFormat;
      const type = job.reportType;

      let fileContent = "";
      
      // 2. Fetch dataset based on type
      if (type === "INVENTORY") {
        const data = await prisma.inventory.findMany({
          where: {
            baseId: filters.baseId,
            isActive: true,
          },
          include: { base: true, equipment: true },
        });
        
        fileContent = this.serializeToCSV([
          ["Base", "Equipment Name", "Total Quantity", "Available Quantity", "Allocated Quantity", "In Transit Quantity", "Maintenance Quantity", "Damaged Quantity"],
          ...data.map((i) => [
            i.base.name,
            i.equipment.name,
            i.quantity,
            i.availableQuantity,
            i.allocatedQuantity,
            i.inTransitQuantity,
            i.maintenanceQuantity,
            i.damagedQuantity,
          ]),
        ]);
      } else if (type === "ASSETS") {
        const data = await prisma.equipmentAsset.findMany({
          where: {
            baseId: filters.baseId,
            isActive: true,
          },
          include: { base: true, equipment: true },
        });

        fileContent = this.serializeToCSV([
          ["Serial Number", "Equipment Name", "Category", "Base Name", "Condition", "Status", "Purchase Date", "Cost"],
          ...data.map((a) => [
            a.serialNumber,
            a.equipment.name,
            a.equipment.category,
            a.base.name,
            a.condition,
            a.status,
            a.purchaseDate ? a.purchaseDate.toISOString() : "N/A",
            a.purchaseCost.toString(),
          ]),
        ]);
      } else if (type === "MAINTENANCE") {
        const where: prismaClientModule.Prisma.MaintenanceWhereInput = { isActive: true };
        if (filters.baseId) {
          where.equipmentAsset = { baseId: filters.baseId };
        }
        const data = await prisma.maintenance.findMany({
          where,
          include: { equipmentAsset: true },
        });

        fileContent = this.serializeToCSV([
          ["Asset Serial", "Type", "Status", "Scheduled Date", "Estimated Cost", "Actual Cost", "Technician", "Vendor", "Description"],
          ...data.map((m) => [
            (m as any).equipmentAsset.serialNumber,
            m.maintenanceType,
            m.status,
            m.scheduledDate.toISOString(),
            m.estimatedCost ? m.estimatedCost.toString() : "0.00",
            m.actualCost ? m.actualCost.toString() : "0.00",
            m.technicianName || "N/A",
            m.vendorName || "N/A",
            m.description,
          ]),
        ]);
      } else if (type === "PROCUREMENT") {
        const data = await prisma.procurement.findMany({
          where: {
            baseId: filters.baseId,
          },
        });

        fileContent = this.serializeToCSV([
          ["Procurement Number", "Supplier Name", "Status", "Total Cost", "Purchase Date", "Expected Delivery Date"],
          ...data.map((p) => [
            p.procurementNumber,
            p.supplier,
            p.status,
            p.totalCost.toString(),
            p.purchaseDate.toISOString(),
            p.expectedDeliveryDate.toISOString(),
          ]),
        ]);
      } else if (type === "DISPOSALS") {
        const where: prismaClientModule.Prisma.DisposalWhereInput = {};
        if (filters.baseId) {
          where.equipmentAsset = { baseId: filters.baseId };
        }
        const data = await prisma.disposal.findMany({
          where,
          include: { equipmentAsset: true },
        });

        fileContent = this.serializeToCSV([
          ["Asset Serial", "Reason", "Status", "Disposal Date", "Book Value", "Remarks"],
          ...data.map((d) => [
            (d as any).equipmentAsset.serialNumber,
            d.disposalReason,
            d.status,
            d.disposalDate ? d.disposalDate.toISOString() : "Pending",
            d.bookValue ? d.bookValue.toString() : "0.00",
            d.remarks || "N/A",
          ]),
        ]);
      }

      // Convert text content to buffer
      const buffer = Buffer.from(fileContent);
      const storageKey = `report-${jobId}.${format.toLowerCase()}`;

      // Upload file to local disk/cloud storage
      await this.storageProvider.uploadFile(storageKey, buffer);

      // 3. Mark completed in DB
      await this.reportRepository.updateJob(jobId, {
        status: "COMPLETED",
        storageKey,
        completedAt: new Date(),
      });
    } catch (err: any) {
      console.error(`[ReportService] Job ${jobId} failed during serialization:`, err);
      await this.reportRepository.updateJob(jobId, {
        status: "FAILED",
        errorMessage: err?.message || String(err),
        completedAt: new Date(),
      });
    }
  }

  // Tabular array to standard double-quoted CSV row mapper
  private serializeToCSV(rows: any[][]): string {
    return rows
      .map((row) =>
        row
          .map((val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(",")
      )
      .join("\n");
  }
}

export = ReportService;
