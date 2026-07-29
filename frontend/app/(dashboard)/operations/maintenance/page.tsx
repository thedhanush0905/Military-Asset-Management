"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "@/services/maintenance.service";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Wrench, CheckCircle, ShieldAlert, Clock, PlusCircle, ClipboardList } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-currency";
import { MaintenanceDialog } from "@/components/ui/dialogs";

export default function MaintenancePage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // 1. Fetch AVAILABLE assets for scheduling dropdown
  const assetsQuery = useQuery({
    queryKey: ["assets", "list", { status: "AVAILABLE" }],
    queryFn: () => equipmentAssetService.getAssets({ status: "AVAILABLE", limit: 100 }),
    enabled: isOpen,
  });

  const assetOptions = useMemo(() => {
    return (assetsQuery.data?.data?.assets || []).map((a) => ({
      value: a.id,
      label: `${a.equipment?.name || "Equipment"} (${a.serialNumber})`,
    }));
  }, [assetsQuery.data]);

  // 2. Fetch Maintenances list
  const maintenanceQuery = useQuery({
    queryKey: ["maintenance", "list", { status: statusFilter, search }],
    queryFn: () =>
      maintenanceService.getMaintenances({
        limit: 100,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: statusFilter === "ALL" ? undefined : (statusFilter as any),
        search: search || undefined,
      }),
  });

  const logs = maintenanceQuery.data?.data?.maintenances || [];

  // Helper helper to invalidate cache
  const invalidateState = (mId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["maintenance", "list"] });
    if (mId) {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "detail", mId] });
    }
    queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
    queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
  };

  // 3. Mutations
  const scheduleMutation = useMutation({
    mutationFn: (data: { equipmentAssetId: string; type: "PREVENTIVE" | "CORRECTIVE"; date: string; description: string }) =>
      maintenanceService.scheduleMaintenance({
        equipmentAssetId: data.equipmentAssetId,
        maintenanceType: data.type,
        scheduledDate: new Date(data.date).toISOString(),
        description: data.description,
        remarks: "Scheduled from maintenance board.",
      }),
    onSuccess: () => {
      invalidateState();
      setIsOpen(false);
      toast("Service Scheduled", "Technicians notified of new scheduled task.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to schedule maintenance.";
      toast("Scheduling Failed", errMsg, "error");
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.startMaintenance(id, new Date().toISOString()),
    onSuccess: (res) => {
      invalidateState(res.data.maintenance.id);
      toast("Service Started", "Maintenance task status is now IN PROGRESS.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to start maintenance.";
      toast("Failed to Start", errMsg, "error");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) =>
      maintenanceService.completeMaintenance(id, {
        completedAt: new Date().toISOString(),
        actualCost: 250, // Standard workshop base fee
        remarks: "Completed operational checks passed.",
      }),
    onSuccess: (res) => {
      invalidateState(res.data.maintenance.id);
      toast("Service Completed", "Maintenance task completed. Operational check pass.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to complete maintenance.";
      toast("Failed to Complete", errMsg, "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.cancelMaintenance(id, "Cancelled by logistics officer."),
    onSuccess: (res) => {
      invalidateState(res.data.maintenance.id);
      toast("Service Cancelled", "Maintenance request cancelled and asset returned.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to cancel maintenance.";
      toast("Failed to Cancel", errMsg, "error");
    },
  });

  const handleScheduleMaintenance = async (data: {
    equipmentAssetId: string;
    type: "PREVENTIVE" | "CORRECTIVE";
    date: string;
    description: string;
  }) => {
    await scheduleMutation.mutateAsync(data);
  };

  const handleStartTask = async (id: string) => {
    await startMutation.mutateAsync(id);
  };

  const handleCompleteTask = async (id: string) => {
    await completeMutation.mutateAsync(id);
  };

  const handleCancelTask = async (id: string) => {
    await cancelMutation.mutateAsync(id);
  };

  const isLogisticsOfficer = currentUser?.role === "LOGISTICS_OFFICER" || currentUser?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Triggers */}
      <MaintenanceDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleScheduleMaintenance}
        assets={assetOptions}
        isLoading={scheduleMutation.isPending}
      />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Depot Maintenance Logs</h1>
          <p className="text-xs text-muted-foreground mt-1">Schedule preventive diagnostics, audit repair costs, and track active technician tasks.</p>
        </div>
        {isLogisticsOfficer && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule Task
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] p-4 rounded-[12px] shadow-sm">
        <div className="flex gap-2">
          {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-[6px] font-bold text-[10px] tracking-wider uppercase transition-colors border ${
                statusFilter === status
                  ? "bg-[#2F4F3A] border-[#2F4F3A] text-white"
                  : "bg-transparent border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground hover:bg-[#EFF1EF]/50 dark:hover:bg-[#1A2820]/50"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search logs description or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#E6E8E6] dark:border-[#22352B] bg-[#F5F5F2] dark:bg-[#0B120E] px-3 py-1.5 rounded-[8px] text-xs w-full sm:w-64"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <th className="py-3 px-4">Log ID</th>
              <th className="py-3 px-4">Equipment / Serial</th>
              <th className="py-3 px-4">Service Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Scheduled Date</th>
              <th className="py-3 px-4 text-right">Cost</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <ClipboardList className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">No maintenance logs found</span>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const serial = log.equipmentAsset?.serialNumber || "Unknown Serial";
                const name = log.equipmentAsset?.equipment?.name || "Unknown Spec";
                return (
                  <tr key={log.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-muted-foreground">
                      {log.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                      <div>{name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold">{serial}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-wider ${
                        log.maintenanceType === "CORRECTIVE" ? "bg-orange-500/10 text-[#F59E0B]" : "bg-blue-500/10 text-[#2563EB]"
                      }`}>
                        {log.maintenanceType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-muted-foreground max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {formatDate(log.scheduledDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#2E7D32]">
                      {log.actualCost ? formatCurrency(log.actualCost) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {log.status === "SCHEDULED" && isLogisticsOfficer && (
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            onClick={() => handleStartTask(log.id)}
                            className="bg-[#F59E0B] hover:bg-orange-700 text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            <Clock className="h-3 w-3 mr-1" /> Start Task
                          </Button>
                          <Button
                            onClick={() => handleCancelTask(log.id)}
                            variant="outline"
                            className="border-destructive/30 hover:bg-destructive/5 text-destructive text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {log.status === "IN_PROGRESS" && isLogisticsOfficer && (
                        <Button
                          onClick={() => handleCompleteTask(log.id)}
                          className="bg-[#2E7D32] hover:bg-green-800 text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Complete
                        </Button>
                      )}
                      {log.status === "COMPLETED" && (
                        <span className="inline-flex items-center gap-1 text-[#2E7D32] font-black uppercase text-[10px] tracking-wider py-1">
                          <CheckCircle className="h-4 w-4" /> Completed
                        </span>
                      )}
                      {log.status === "CANCELLED" && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground font-black uppercase text-[10px] tracking-wider py-1">
                          <ShieldAlert className="h-4 w-4" /> Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
