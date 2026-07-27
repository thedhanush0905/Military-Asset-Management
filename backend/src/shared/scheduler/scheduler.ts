import prisma = require("../prisma/prisma.js");
import type IJob = require("./job.interface.js");
import MaintenanceReminderJob = require("./jobs/maintenance-reminder.job.js");
import WarrantyReminderJob = require("./jobs/warranty-reminder.job.js");
import InspectionReminderJob = require("./jobs/inspection-reminder.job.js");
import NotificationCleanupJob = require("./jobs/notification-cleanup.job.js");
import InventoryReconciliationJob = require("./jobs/inventory-reconciliation.job.js");
import ReportCleanupJob = require("./jobs/report-cleanup.job.js");

class Scheduler {
  private static instance: Scheduler;
  private readonly jobs = new Map<string, IJob>();
  private activeIntervals: NodeJS.Timeout[] = [];

  private constructor() {}

  public static getInstance(): Scheduler {
    if (!Scheduler.instance) {
      Scheduler.instance = new Scheduler();
      Scheduler.instance.registerJob(new MaintenanceReminderJob());
      Scheduler.instance.registerJob(new WarrantyReminderJob());
      Scheduler.instance.registerJob(new InspectionReminderJob());
      Scheduler.instance.registerJob(new NotificationCleanupJob());
      Scheduler.instance.registerJob(new InventoryReconciliationJob());
      Scheduler.instance.registerJob(new ReportCleanupJob());
    }
    return Scheduler.instance;
  }

  public registerJob(job: IJob): void {
    this.jobs.set(job.name, job);
    console.log(`[Scheduler] Job registered: '${job.name}'`);
  }

  public async triggerJob(name: string): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job '${name}' is not registered with the scheduler`);
    }

    console.log(`[Scheduler] Executing job '${name}'...`);
    const log = await prisma.cronJobLog.create({
      data: {
        jobName: name,
        startedAt: new Date(),
        status: "RUNNING",
      },
    });

    try {
      await job.execute();
      await prisma.cronJobLog.update({
        where: { id: log.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      console.log(`[Scheduler] Job '${name}' completed successfully.`);
    } catch (error: any) {
      console.error(`[Scheduler] Job '${name}' failed:`, error);
      await prisma.cronJobLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: error?.message || String(error),
        },
      });
      throw error;
    }
  }

  public start(): void {
    // Schedule periodic ticks for registered jobs
    // Daily tick: 24 hours
    const dailyMs = 24 * 60 * 60 * 1000;
    
    const tick = setInterval(async () => {
      for (const name of this.jobs.keys()) {
        try {
          await this.triggerJob(name);
        } catch (error) {
          // Failure handled inside triggerJob logs
        }
      }
    }, dailyMs);

    this.activeIntervals.push(tick);
    console.log("[Scheduler] Background scheduler loop started (Daily Ticks)");
  }

  public stop(): void {
    for (const tick of this.activeIntervals) {
      clearInterval(tick);
    }
    this.activeIntervals = [];
    console.log("[Scheduler] Background scheduler loop stopped");
  }

  public getRegisteredJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}

export = Scheduler;
