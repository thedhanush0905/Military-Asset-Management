"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inspectionService } from "@/services/inspection.service";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ClipboardCheck, CheckCircle2, AlertTriangle, PlusCircle, Trash2, ClipboardList } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { InspectionDialog, ScheduleInspectionDialog } from "@/components/ui/dialogs";
import { Inspection } from "@/types/inspection";

export default function InspectionsPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // 1. Fetch assets for scheduling dropdown
  const assetsQuery = useQuery({
    queryKey: ["assets", "list"],
    queryFn: () => equipmentAssetService.getAssets({ limit: 100 }),
    enabled: isScheduleOpen,
  });

  const assetOptions = useMemo(() => {
    return (assetsQuery.data?.data?.assets || []).map((a) => ({
      value: a.id,
      label: `${a.equipment?.name || "Equipment"} (${a.serialNumber})`,
    }));
  }, [assetsQuery.data]);

  // 2. Fetch Inspections list
  const inspectionsQuery = useQuery({
    queryKey: ["inspections", "list"],
    queryFn: () => inspectionService.getInspections({ limit: 100 }),
  });

  const inspections = inspectionsQuery.data?.data?.inspections || [];

  // Helper helper to invalidate cache
  const invalidateState = (iId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["inspections", "list"] });
    if (iId) {
      queryClient.invalidateQueries({ queryKey: ["inspections", "detail", iId] });
    }
    queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
  };

  // 3. Mutations
  const scheduleMutation = useMutation({
    mutationFn: inspectionService.scheduleInspection,
    onSuccess: () => {
      invalidateState();
      setIsScheduleOpen(false);
      toast("Inspection Scheduled", "Assigned readiness inspection task to roster logs.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to schedule inspection.";
      toast("Scheduling Failed", errMsg, "error");
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, result, notes }: { id: string; result: "PASS" | "FAIL"; notes: string }) =>
      inspectionService.completeInspection(id, { result, notes }),
    onSuccess: (res) => {
      invalidateState(res.data.id);
      setIsLogOpen(false);
      setSelectedInspection(null);
      toast("Inspection Logged", "Readiness check processed successfully.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to complete inspection.";
      toast("Logging Failed", errMsg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: inspectionService.deleteInspection,
    onSuccess: () => {
      invalidateState();
      toast("Inspection Deleted", "Inspection record removed from database.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to delete inspection.";
      toast("Deletion Failed", errMsg, "error");
    },
  });

  const handleScheduleConfirm = async (data: {
    equipmentAssetId: string;
    inspectorName: string;
    scheduledDate: string;
    notes?: string | null;
  }) => {
    await scheduleMutation.mutateAsync(data);
  };

  const handleLogConfirm = async (data: { result: "PASS" | "FAIL"; notes: string }) => {
    if (!selectedInspection) return;
    await completeMutation.mutateAsync({
      id: selectedInspection.id,
      result: data.result,
      notes: data.notes,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this inspection record?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const isCommander = currentUser?.role === "BASE_COMMANDER" || currentUser?.role === "ADMIN";
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Modals */}
      <ScheduleInspectionDialog
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={handleScheduleConfirm}
        assets={assetOptions}
        isLoading={scheduleMutation.isPending}
      />

      <InspectionDialog
        isOpen={isLogOpen}
        onClose={() => {
          setIsLogOpen(false);
          setSelectedInspection(null);
        }}
        onConfirm={handleLogConfirm}
        assetName={
          selectedInspection
            ? `${selectedInspection.equipmentAsset?.equipment?.name || "Equipment"} (${selectedInspection.equipmentAsset?.serialNumber})`
            : "Equipment"
        }
        isLoading={completeMutation.isPending}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Safety & Readiness Inspections</h1>
          <p className="text-xs text-muted-foreground mt-1">Audit regular checks, record mechanical pass/fail states, and review groundings.</p>
        </div>
        {isCommander && (
          <Button
            onClick={() => setIsScheduleOpen(true)}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule Inspection
          </Button>
        )}
      </div>

      {/* Table grid */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <th className="py-3 px-4">Log ID</th>
              <th className="py-3 px-4">Equipment / Serial</th>
              <th className="py-3 px-4">Inspector Name</th>
              <th className="py-3 px-4">Observation notes</th>
              <th className="py-3 px-4 text-right">Date</th>
              <th className="py-3 px-4 text-right">Result</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
            {inspections.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <ClipboardList className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">No inspection records found</span>
                  </div>
                </td>
              </tr>
            ) : (
              inspections.map((rec) => {
                const isPending = rec.result === "PENDING";
                const isPass = rec.result === "PASS";
                const isFail = rec.result === "FAIL";

                return (
                  <tr key={rec.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-muted-foreground">
                      {rec.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                      <div>{rec.equipmentAsset?.equipment?.name || "Unknown Spec"}</div>
                      <div className="text-[10px] text-muted-foreground font-bold">{rec.equipmentAsset?.serialNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {rec.inspector?.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm truncate text-muted-foreground font-medium">
                      {rec.notes || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-semibold">
                      {formatDate(rec.inspectionDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 text-[#F59E0B] font-bold uppercase text-[10px] tracking-wider py-1">
                          PENDING
                        </span>
                      ) : isPass ? (
                        <span className="inline-flex items-center gap-1 text-[#2E7D32] font-black uppercase text-[10px] tracking-wider py-1">
                          <CheckCircle2 className="h-4 w-4" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#DC2626] font-black uppercase text-[10px] tracking-wider py-1">
                          <AlertTriangle className="h-4 w-4" /> FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {isPending && isCommander && (
                          <Button
                            onClick={() => {
                              setSelectedInspection(rec);
                              setIsLogOpen(true);
                            }}
                            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Log Result
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            onClick={() => handleDelete(rec.id)}
                            variant="outline"
                            className="border-destructive/30 hover:bg-destructive/5 text-destructive p-1 rounded-[6px]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
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
