"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { baseService } from "@/services/base.service";
import { userService } from "@/services/user.service";
import { notificationService } from "@/services/notification.service";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { assignmentService } from "@/services/assignment.service";
import { transferService } from "@/services/transfer.service";
import { maintenanceService } from "@/services/maintenance.service";
import { inspectionService } from "@/services/inspection.service";
import { personnelService } from "@/services/personnel.service";
import { EquipmentStatus } from "@/types/common";
import { useRouter } from "next/navigation";
import { 
  CommandHeader, 
  KPICards, 
  QuickActions, 
  ActivityFeed, 
  TopBasesList, 
  DashboardCharts 
} from "@/features/dashboard/components";
import { 
  AssignDialog, 
  TransferDialog, 
  MaintenanceDialog, 
  InspectionDialog 
} from "@/components/ui/dialogs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { RotateCw, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  // State managers for Quick Action modals
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  // State managers for async loading indicators on quick actions
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Queries
  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => dashboardService.getOverview(),
  });

  const baseSummaryQuery = useQuery({
    queryKey: ["dashboard", "baseSummary"],
    queryFn: () => dashboardService.getBaseSummary(),
  });

  const recentActivitiesQuery = useQuery({
    queryKey: ["dashboard", "activities"],
    queryFn: () => dashboardService.getRecentActivities(1, 10),
  });

  const basesQuery = useQuery({
    queryKey: ["bases", "list"],
    queryFn: () => baseService.getBases({ limit: 100 }),
  });

  const usersQuery = useQuery({
    queryKey: ["users", "list"],
    queryFn: () => userService.getUsers({ limit: 100 }),
  });

  const unreadNotificationsQuery = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () => notificationService.getUnread(),
  });

  const unreadCount = unreadNotificationsQuery.data?.data?.count || 0;

  // 1. Available assets (only AVAILABLE status) for Assign & Transfer
  const availableAssetsQuery = useQuery({
    queryKey: ["equipmentAssets", "list", "available"],
    queryFn: () => equipmentAssetService.getAssets({ limit: 100, status: "AVAILABLE" as EquipmentStatus }),
  });

  const availableAssetsList = availableAssetsQuery.data?.data?.assets || [];

  const availableAssetsDropdown = availableAssetsList.map((a) => ({
    value: a.id,
    label: `${a.equipment?.name || "Equipment"} (SN: ${a.serialNumber})`,
  }));

  // 2. Active assets (non-retired statuses) for Maintenance & Inspection
  const activeAssetsQuery = useQuery({
    queryKey: ["equipmentAssets", "list", "active"],
    queryFn: () => equipmentAssetService.getAssets({ limit: 100 }),
  });

  const activeAssetsList = activeAssetsQuery.data?.data?.assets || [];

  const activeAssetsDropdown = activeAssetsList
    .filter((a) => a.status !== "RETIRED")
    .map((a) => ({
      value: a.id,
      label: `${a.equipment?.name || "Equipment"} (SN: ${a.serialNumber}) - Status: ${a.status}`,
    }));

  const personnelQuery = useQuery({
    queryKey: ["personnel", "list", "all"],
    queryFn: () => personnelService.getPersonnelList({ limit: 100 }),
  });

  const personnelList = personnelQuery.data?.data?.personnel || [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["bases", "list"] });
    queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    queryClient.invalidateQueries({ queryKey: ["equipmentAssets"] });
    queryClient.invalidateQueries({ queryKey: ["personnel"] });
    toast("Database Resynced", "HQ systems checked and telemetry resynced successfully.", "success");
  };

  // Map Overview Metrics
  const overview = overviewQuery.data?.data || {
    totalEquipmentCatalogItems: 0,
    totalEquipmentAssets: 0,
    availableAssets: 0,
    assignedAssets: 0,
    assetsInTransit: 0,
    assetsUnderMaintenance: 0,
    retiredAssets: 0,
    totalBases: 0,
    totalUsers: 0
  };

  const kpiMetrics = {
    totalAssets: overview.totalEquipmentAssets,
    availableAssets: overview.availableAssets,
    assignedAssets: overview.assignedAssets,
    maintenanceAssets: overview.assetsUnderMaintenance,
    transfersAssets: overview.assetsInTransit,
    procurementAssets: overview.totalEquipmentCatalogItems,
    basesCount: overview.totalBases,
    personnelCount: overview.totalUsers || 0,
  };



  // Map Bases List
  const basesList = basesQuery.data?.data?.bases || [];
  const topBasesMapped = (baseSummaryQuery.data?.data || []).map((b) => {
    const baseDetails = basesList.find((bl) => bl.id === b.baseId);
    const readinessScore = b.totalAssets > 0 ? Math.min(100, Math.round(((b.available + b.assigned) / b.totalAssets) * 100)) : 100;
    return {
      id: b.baseId,
      name: b.baseName,
      code: b.baseCode,
      location: baseDetails?.location || "Operational Base Coordinates",
      assetsCount: b.totalAssets,
      readiness: readinessScore,
    };
  });

  // Map Dropdown Options for Dialog Modals
  const basesDropdown = basesList.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.code})`,
  }));

  const usersList = usersQuery.data?.data?.users || [];
  const personnelDropdown = usersList.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.role})`,
  }));

  // Map Activity Feed
  const rawActivities = recentActivitiesQuery.data?.data?.activities || [];
  const activitiesMapped = rawActivities.map((act) => {
    const actDate = new Date(act.timestamp);
    const timeFormatted = actDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return {
      id: act.id,
      time: timeFormatted,
      timestamp: act.timestamp,
      title: act.title,
      user: act.user?.name || "System Ledger",
      description: act.description,
      type: act.type,
      entityType: (act as unknown as Record<string, unknown>).entityType as string | undefined,
      entityId: (act as unknown as Record<string, unknown>).entityId as string | undefined,
    };
  });

  const generatePdfReport = () => {
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      toast("Pop-up Blocked", "Please allow pop-ups to export the command report.", "warning");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>AEGIS STRATEGIC COMMAND REPORT</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1a2820; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { border-bottom: 3px double #2f4f3a; padding-bottom: 12px; margin-bottom: 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.1em; color: #1a2820; text-transform: uppercase; }
            .header p { margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; font-weight: 600; color: #666; letter-spacing: 0.05em; }
            .meta-grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; padding: 12px; border: 1px solid #e6e8e6; background-color: #fcfdfc; }
            .meta-item { display: flex; flex-direction: column; }
            .meta-label { font-size: 9px; text-transform: uppercase; color: #666; font-weight: 700; letter-spacing: 0.05em; }
            .meta-value { font-size: 12px; font-weight: bold; color: #1a2820; margin-top: 2px; }
            .section-title { font-size: 12px; text-transform: uppercase; font-weight: 800; border-bottom: 1px solid #2f4f3a; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; letter-spacing: 0.05em; color: #1a2820; }
            .kpi-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .kpi-card { border: 1px solid #e6e8e6; padding: 10px; text-align: center; background-color: #fcfdfc; }
            .kpi-val { font-size: 18px; font-weight: 800; color: #2f4f3a; }
            .kpi-lbl { font-size: 9px; text-transform: uppercase; font-weight: 700; color: #666; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #e6e8e6; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #eff1ef; font-weight: bold; color: #1a2820; text-transform: uppercase; font-size: 9px; letter-spacing: 0.05em; }
            .footer { margin-top: 40px; border-top: 1px solid #e6e8e6; padding-top: 12px; text-align: center; font-size: 9px; color: #888; text-transform: uppercase; font-weight: 600; }
            .btn-print { background-color: #2f4f3a; color: white; border: none; padding: 10px 20px; font-size: 12px; font-weight: bold; cursor: pointer; border-radius: 4px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
            .btn-print:hover { background-color: #1a2820; }
            @media print { .btn-print { display: none; } }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">Export to PDF</button>
          
          <div class="header">
            <h1>AEGIS Strategic Command Report</h1>
            <p>HQ Telemetry & Logistics Division</p>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Generated By</span>
              <span class="meta-value">${user?.name || "System Admin"} (${user?.role || "ADMIN"})</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Generation Time</span>
              <span class="meta-value">${new Date().toLocaleString()}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Assets on Record</span>
              <span class="meta-value">${kpiMetrics.totalAssets} (${kpiMetrics.availableAssets} available)</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Assets Under Maintenance</span>
              <span class="meta-value">${kpiMetrics.maintenanceAssets} unit(s)</span>
            </div>
          </div>

          <div class="section-title">Command KPIs Overview</div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-val">${kpiMetrics.totalAssets}</div>
              <div class="kpi-lbl">Total Assets</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-val">${kpiMetrics.availableAssets}</div>
              <div class="kpi-lbl">Available</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-val">${kpiMetrics.assignedAssets}</div>
              <div class="kpi-lbl">Assigned</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-val">${kpiMetrics.maintenanceAssets}</div>
              <div class="kpi-lbl">Maintenance</div>
            </div>
          </div>

          <div class="section-title">Active Bases Registry</div>
          <table>
            <thead>
              <tr>
                <th>Base Code</th>
                <th>Base Name</th>
                <th>Location Coordinates</th>
                <th>Assets Count</th>
                <th>Readiness</th>
              </tr>
            </thead>
            <tbody>
              ${topBasesMapped.map(b => `
                <tr>
                  <td><strong>${b.code}</strong></td>
                  <td>${b.name}</td>
                  <td>${b.location}</td>
                  <td>${b.assetsCount}</td>
                  <td>${b.readiness}%</td>
                </tr>
              `).join("") || `<tr><td colspan="5" style="text-align: center; color: #888;">No active bases found</td></tr>`}
            </tbody>
          </table>

          <div class="section-title">Recent Operational Log Entries</div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action Module</th>
                <th>Performing Officer</th>
                <th>Action details</th>
              </tr>
            </thead>
            <tbody>
              ${activitiesMapped.slice(0, 10).map(act => `
                <tr>
                  <td style="white-space: nowrap;">${act.time}</td>
                  <td><strong>${act.type}</strong></td>
                  <td>${act.user}</td>
                  <td>${act.description}</td>
                </tr>
              `).join("") || `<tr><td colspan="4" style="text-align: center; color: #888;">No recent activities found</td></tr>`}
            </tbody>
          </table>

          <div class="footer">
            AEGIS Command Data Link — Confidential Defense Ledger
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Modals & Triggers */}
      <AssignDialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onConfirm={async (data) => {
          setIsActionLoading(true);
          try {
            const officer = personnelList.find(p => p.id === data.personnelId);
            const officerLabel = officer ? `${officer.rank} ${officer.firstName} ${officer.lastName}` : "Officer";
            await assignmentService.createAssignment({
              equipmentAssetId: data.equipmentAssetId || "",
              assignedTo: officerLabel,
              remarks: data.remarks
            });
            setIsAssignOpen(false);
            queryClient.invalidateQueries();
            toast("Asset Assigned", `Asset successfully assigned to ${officerLabel}.`, "success");
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to assign asset.";
            toast("Assignment Failed", msg, "error");
          } finally {
            setIsActionLoading(false);
          }
        }}
        personnel={personnelDropdown}
        assets={availableAssetsDropdown}
        isLoading={isActionLoading}
      />

      <TransferDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onConfirm={async (data) => {
          setIsActionLoading(true);
          try {
            await transferService.createTransfer({
              equipmentAssetId: data.equipmentAssetId,
              toBaseId: data.destinationBaseId,
              remarks: data.remarks
            });
            setIsTransferOpen(false);
            queryClient.invalidateQueries();
            const baseName = basesDropdown.find(b => b.value === data.destinationBaseId)?.label || "Destination Base";
            toast("Transfer Dispatched", `Transfer request to ${baseName} submitted.`, "success");
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to initiate transfer.";
            toast("Transfer Request Failed", msg, "error");
          } finally {
            setIsActionLoading(false);
          }
        }}
        bases={basesDropdown}
        assets={availableAssetsDropdown}
        isLoading={isActionLoading}
      />

      <MaintenanceDialog
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        onConfirm={async (data) => {
          setIsActionLoading(true);
          try {
            await maintenanceService.scheduleMaintenance({
              equipmentAssetId: data.equipmentAssetId,
              maintenanceType: data.type,
              scheduledDate: data.date,
              description: data.description
            });
            setIsMaintenanceOpen(false);
            queryClient.invalidateQueries();
            toast("Maintenance Logged", `Task scheduled on ${data.date}. Type: ${data.type}`, "success");
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to book maintenance.";
            toast("Maintenance Booking Failed", msg, "error");
          } finally {
            setIsActionLoading(false);
          }
        }}
        assets={activeAssetsDropdown}
        isLoading={isActionLoading}
      />

      <InspectionDialog
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        onConfirm={async (data) => {
          setIsActionLoading(true);
          try {
            const scheduled = await inspectionService.scheduleInspection({
              equipmentAssetId: data.equipmentAssetId || "",
              inspectorName: user?.name || "Inspector",
              scheduledDate: new Date().toISOString(),
              notes: data.notes
            });
            await inspectionService.completeInspection(scheduled.data.id, {
              result: data.result,
              notes: data.notes
            });
            setIsInspectionOpen(false);
            queryClient.invalidateQueries();
            toast("Inspection Logged", `Safety checklist logged successfully. Result: ${data.result}`, "success");
          } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to log inspection.";
            toast("Inspection Failed", msg, "error");
          } finally {
            setIsActionLoading(false);
          }
        }}
        assets={activeAssetsDropdown}
        isLoading={isActionLoading}
      />

      {/* Top Header */}
      <CommandHeader onRefresh={handleRefresh} />



      {/* KPI Cards Grid */}
      {overviewQuery.isLoading ? (
        <div className="w-full flex items-center justify-center p-8 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px]">
          <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A]" />
          <span className="text-xs ml-2 text-muted-foreground">Loading system overview telemetry...</span>
        </div>
      ) : overviewQuery.isError ? (
        <div className="w-full flex items-center justify-center p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-[12px] text-red-700 dark:text-red-400 gap-2">
          <ShieldAlert className="h-4.5 w-4.5" />
          <span className="text-xs font-semibold">Failed to fetch telemetry metrics overview.</span>
        </div>
      ) : (
        <KPICards metrics={kpiMetrics} />
      )}

      {/* Balanced Two Column Layout (50% Left / 50% Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Area (Interactive charts and Base Table) */}
        <div className="flex flex-col gap-6">
          <div>
            <DashboardCharts />
          </div>
          <div>
            {baseSummaryQuery.isLoading ? (
              <div className="w-full p-8 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] text-center">
                <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A] mx-auto" />
                <span className="text-[10px] text-muted-foreground mt-2 block">Loading command base status...</span>
              </div>
            ) : baseSummaryQuery.isError ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-[12px] text-xs flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Failed to load active base metrics rosters.
              </div>
            ) : (
              <TopBasesList bases={topBasesMapped} />
            )}
          </div>
        </div>

        {/* Right Area (Quick Action shortcuts) */}
        <div className="flex flex-col gap-6">
          <div>
            <QuickActions
              onAssignAsset={() => setIsAssignOpen(true)}
              onTransferAsset={() => setIsTransferOpen(true)}
              onBookMaintenance={() => setIsMaintenanceOpen(true)}
              onLogInspection={() => setIsInspectionOpen(true)}
              onGenerateReport={generatePdfReport}
              onAddCatalogItem={() => router.push("/assets/catalog")}
            />
          </div>
        </div>

      </div>

      {/* Full-Width Recent Activity Ledger */}
      <div className="w-full mt-6">
        {recentActivitiesQuery.isLoading ? (
          <div className="p-8 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] flex flex-col items-center justify-center text-center">
            <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A]" />
            <span className="text-[10px] text-muted-foreground mt-2 block">Loading activity stream...</span>
          </div>
        ) : recentActivitiesQuery.isError ? (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-[12px] text-xs flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Failed to load recent action log entries.
          </div>
        ) : (
          <ActivityFeed activities={activitiesMapped} />
        )}
      </div>
    </div>
  );
}
