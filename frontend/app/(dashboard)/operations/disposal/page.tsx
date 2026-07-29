"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disposalService } from "@/services/disposal.service";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Trash2, CheckCircle, AlertTriangle, ShieldX, ClipboardList } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-currency";
import { DisposalDialog, DisposalFormValues } from "@/components/ui/dialogs";

export default function DisposalPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);

  // 1. Fetch AVAILABLE assets for disposal dropdown selection
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

  // 2. Fetch Disposals list
  const disposalsQuery = useQuery({
    queryKey: ["disposal", "list"],
    queryFn: () => disposalService.getDisposals({ limit: 100 }),
  });

  const records = disposalsQuery.data?.data?.disposals || [];

  // Helper helper to invalidate cache
  const invalidateState = (dId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["disposal", "list"] });
    if (dId) {
      queryClient.invalidateQueries({ queryKey: ["disposal", "detail", dId] });
    }
    queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
    queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
  };

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: (data: DisposalFormValues) =>
      disposalService.createDisposal({
        equipmentAssetId: data.equipmentAssetId,
        disposalReason: data.disposalReason,
        remarks: data.remarks || null,
      }),
    onSuccess: () => {
      invalidateState();
      setIsOpen(false);
      toast("Retirement Requested", "Asset decommission request logged successfully.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to submit decommission request.";
      toast("Submission Failed", errMsg, "error");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => disposalService.approveDisposal(id),
    onSuccess: (res) => {
      invalidateState(res.data.disposal.id);
      toast("Retirement Approved", "Decommission approved by Commander. Awaiting scrap execution.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to approve decommission request.";
      toast("Approval Failed", errMsg, "error");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) =>
      disposalService.completeDisposal(id, {
        disposalDate: new Date().toISOString(),
        remarks: "Decommissioning process completed. Salvage value logged.",
      }),
    onSuccess: (res) => {
      invalidateState(res.data.disposal.id);
      toast("Asset Decommissioned", "Equipment retired from active duty catalogs. Salvage recorded.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to complete decommission.";
      toast("Completion Failed", errMsg, "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => disposalService.cancelDisposal(id, "Cancelled by logistics supervisor."),
    onSuccess: (res) => {
      invalidateState(res.data.disposal.id);
      toast("Retirement Cancelled", "Decommission request cancelled successfully.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to cancel decommission.";
      toast("Cancellation Failed", errMsg, "error");
    },
  });

  const handleDecommissionSubmit = async (data: DisposalFormValues) => {
    await createMutation.mutateAsync(data);
  };

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  const handleComplete = async (id: string) => {
    await completeMutation.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    await cancelMutation.mutateAsync(id);
  };

  const isLogisticsOfficer = currentUser?.role === "LOGISTICS_OFFICER" || currentUser?.role === "ADMIN";
  const isCommander = currentUser?.role === "BASE_COMMANDER" || currentUser?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Form */}
      <DisposalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDecommissionSubmit}
        assetOptions={assetOptions}
        isLoading={createMutation.isPending}
      />

      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Decommission & Disposals</h1>
          <p className="text-xs text-muted-foreground mt-1">Audit retired weapons systems, review scrapped equipment logs, and track salvage recovery values.</p>
        </div>
        {isLogisticsOfficer && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-[#DC2626] hover:bg-red-800 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <Trash2 className="h-4 w-4" />
            Retire Equipment
          </Button>
        )}
      </div>

      {/* Roster Data Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <th className="py-3 px-4">Disposal ID</th>
              <th className="py-3 px-4">Equipment / Serial</th>
              <th className="py-3 px-4">Decommission Reason</th>
              <th className="py-3 px-4 text-right">Salvage Value</th>
              <th className="py-3 px-4">Authorized By</th>
              <th className="py-3 px-4 text-right">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <ClipboardList className="h-8 w-8 mb-2 opacity-30 text-[#DC2626]" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">No decommission logs found</span>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const isPending = rec.status === "PENDING";
                const isApproved = rec.status === "APPROVED";
                const isCompleted = rec.status === "COMPLETED";
                const isCancelled = rec.status === "CANCELLED";

                return (
                  <tr key={rec.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-muted-foreground">
                      {rec.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                      <div>{rec.equipmentAsset?.equipment?.name || "Unknown Hardware"}</div>
                      <div className="text-[10px] text-muted-foreground font-bold">{rec.equipmentAsset?.serialNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm truncate text-muted-foreground font-medium">
                      {rec.disposalReason} {rec.remarks ? `- ${rec.remarks}` : ""}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-muted-foreground">
                      {rec.bookValue ? formatCurrency(Number(rec.bookValue)) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1A2820] dark:text-[#F5F5F2]">
                      {rec.approvedBy?.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right text-muted-foreground font-semibold">
                      {formatDate(rec.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isPending && isCommander && (
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            onClick={() => handleApprove(rec.id)}
                            className="bg-[#2E7D32] hover:bg-green-800 text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleCancel(rec.id)}
                            variant="outline"
                            className="border-destructive/30 hover:bg-destructive/5 text-destructive text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {isApproved && isLogisticsOfficer && (
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            onClick={() => handleComplete(rec.id)}
                            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Complete Scrap
                          </Button>
                          <Button
                            onClick={() => handleCancel(rec.id)}
                            variant="outline"
                            className="border-destructive/30 hover:bg-destructive/5 text-destructive text-[10px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[#DC2626] font-black uppercase text-[10px] tracking-wider py-1">
                          <ShieldX className="h-4 w-4" /> Scrapped
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider py-1">
                          Cancelled
                        </span>
                      )}
                      {isPending && !isCommander && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider py-1">
                          Pending Approval
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
