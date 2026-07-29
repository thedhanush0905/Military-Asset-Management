"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transferService } from "@/services/transfer.service";
import { baseService } from "@/services/base.service";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  PlusCircle, 
  Truck, 
  Check, 
  X, 
  AlertTriangle,
  ArrowRight,
  ClipboardList
} from "lucide-react";
import { 
  TransferDialog, 
  ApprovalDialog 
} from "@/components/ui/dialogs";
import { Transfer, TransferStatus } from "@/types/transfer";

export default function TransfersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  // Dialog State Machines
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // 1. Fetch bases for dropdown selection
  const basesQuery = useQuery({
    queryKey: ["bases", "list"],
    queryFn: () => baseService.getBases({ limit: 100 }),
  });

  const baseOptions = useMemo(() => {
    return (basesQuery.data?.data?.bases || [])
      .filter((b) => b.isActive)
      .map((b) => ({ value: b.id, label: b.name }));
  }, [basesQuery.data]);

  // 2. Fetch AVAILABLE assets to initiate transfer
  const assetsQuery = useQuery({
    queryKey: ["assets", "list", { status: "AVAILABLE" }],
    queryFn: () => equipmentAssetService.getAssets({ status: "AVAILABLE", limit: 100 }),
    enabled: isRequestOpen,
  });

  const assetOptions = useMemo(() => {
    return (assetsQuery.data?.data?.assets || []).map((a) => ({
      value: a.id,
      label: `${a.equipment?.name || "Equipment"} (${a.serialNumber})`,
    }));
  }, [assetsQuery.data]);

  // 3. Fetch Transfers list
  const transfersQuery = useQuery({
    queryKey: ["transfers", "list"],
    queryFn: () => transferService.getTransfers({ limit: 100 }),
  });

  const transfers = transfersQuery.data?.data?.transfers || [];

  // Helper helper to invalidate dashboard and assets
  const invalidateState = (tId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["transfers", "list"] });
    if (tId) {
      queryClient.invalidateQueries({ queryKey: ["transfers", "detail", tId] });
    }
    queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
    queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
  };

  // 4. Mutations
  const createMutation = useMutation({
    mutationFn: (data: { equipmentAssetId: string; destinationBaseId: string; remarks: string }) =>
      transferService.createTransfer({
        equipmentAssetId: data.equipmentAssetId,
        toBaseId: data.destinationBaseId,
        remarks: data.remarks || null,
      }),
    onSuccess: () => {
      invalidateState();
      setIsRequestOpen(false);
      toast("Transfer Requested", "Asset transfer request initialized successfully.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to create transfer.";
      toast("Creation Failed", errMsg, "error");
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string | null }) =>
      transferService.approveTransfer(id, remarks),
    onSuccess: (res) => {
      invalidateState(res.data.transfer.id);
      setIsReviewOpen(false);
      setSelectedTransfer(null);
      toast("Transfer Approved", "Coordinates verified and transit route authorized.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to approve.";
      toast("Approval Failed", errMsg, "error");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string | null }) =>
      transferService.rejectTransfer(id, remarks),
    onSuccess: (res) => {
      invalidateState(res.data.transfer.id);
      setIsReviewOpen(false);
      setSelectedTransfer(null);
      toast("Transfer Rejected", "Logistics transfer request declined.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to reject.";
      toast("Rejection Failed", errMsg, "error");
    },
  });

  const dispatchMutation = useMutation({
    mutationFn: (id: string) => transferService.dispatchTransfer(id),
    onSuccess: (res) => {
      invalidateState(res.data.transfer.id);
      toast("Asset Dispatched", "Dispatch logged. Equipment is now IN_TRANSIT.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to dispatch.";
      toast("Dispatch Failed", errMsg, "error");
    },
  });

  const receiveMutation = useMutation({
    mutationFn: (id: string) => transferService.receiveTransfer(id),
    onSuccess: (res) => {
      invalidateState(res.data.transfer.id);
      toast("Asset Received", "Base storage depot arrival logged. Asset availability synced.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to receive.";
      toast("Arrival Logging Failed", errMsg, "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => transferService.cancelTransfer(id),
    onSuccess: (res) => {
      invalidateState(res.data.transfer.id);
      toast("Transfer Cancelled", "Logistics transit request aborted successfully.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to cancel transfer.";
      toast("Cancellation Failed", errMsg, "error");
    },
  });

  const handleRequestTransfer = async (data: { equipmentAssetId: string; destinationBaseId: string; remarks: string }) => {
    await createMutation.mutateAsync(data);
  };

  const handleApprove = async (remarks: string) => {
    if (!selectedTransfer) return;
    await approveMutation.mutateAsync({ id: selectedTransfer.id, remarks });
  };

  const handleReject = async (remarks: string) => {
    if (!selectedTransfer) return;
    await rejectMutation.mutateAsync({ id: selectedTransfer.id, remarks });
  };

  const handleDispatch = async (id: string) => {
    await dispatchMutation.mutateAsync(id);
  };

  const handleReceive = async (id: string) => {
    await receiveMutation.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    await cancelMutation.mutateAsync(id);
  };

  // Kanban Columns Mapping
  const columns: { id: TransferStatus; label: string; color: string; border: string }[] = [
    { id: "PENDING", label: "Pending Review", color: "bg-[#F59E0B]/5 text-[#F59E0B]", border: "border-[#F59E0B]/30" },
    { id: "APPROVED", label: "Approved Logistics", color: "bg-[#2563EB]/5 text-[#2563EB]", border: "border-[#2563EB]/30" },
    { id: "IN_TRANSIT", label: "In Active Transit", color: "bg-[#7C3AED]/5 text-[#7C3AED]", border: "border-[#7C3AED]/30" },
    { id: "COMPLETED", label: "Completed Dispatches", color: "bg-[#2E7D32]/5 text-[#2E7D32]", border: "border-[#2E7D32]/30" },
  ];

  const isLogisticsOfficer = currentUser?.role === "LOGISTICS_OFFICER" || currentUser?.role === "ADMIN";
  const isCommander = currentUser?.role === "BASE_COMMANDER" || currentUser?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Modals */}
      <TransferDialog
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        onConfirm={handleRequestTransfer}
        bases={baseOptions}
        assets={assetOptions}
        isLoading={createMutation.isPending}
      />

      {selectedTransfer && (
        <ApprovalDialog
          isOpen={isReviewOpen}
          onClose={() => {
            setIsReviewOpen(false);
            setSelectedTransfer(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          title="Review Logistics Transfer Request"
          description={`Review coordinates for moving ${selectedTransfer.equipmentAsset?.equipment?.name || "Equipment"} (${selectedTransfer.equipmentAsset?.serialNumber}) from ${selectedTransfer.fromBase?.name || "Source Base"} to ${selectedTransfer.toBase?.name || "Destination Base"}.`}
        />
      )}

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Logistics & Base Transfers</h1>
          <p className="text-xs text-muted-foreground mt-1">Review pipeline transfer coordinates, approve transit logs, and confirm base arrivals.</p>
        </div>
        {isLogisticsOfficer && (
          <Button
            onClick={() => setIsRequestOpen(true)}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Request Transfer
          </Button>
        )}
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colCards = transfers.filter((c) => c.status === col.id);
          return (
            <div 
              key={col.id} 
              className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] flex flex-col max-h-[600px] shadow-sm"
            >
              {/* Column Header */}
              <div className={`p-4 border-b border-[#E6E8E6] dark:border-[#22352B] flex justify-between items-center rounded-t-[12px] ${col.color}`}>
                <span className="font-bold uppercase tracking-wider text-[10px]">{col.label}</span>
                <span className="bg-white dark:bg-[#0B120E] text-[10px] font-black px-2 py-0.5 rounded-full border border-current">
                  {colCards.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[150px]">
                {colCards.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground border border-dashed border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] min-h-[120px]">
                    <ClipboardList className="h-5 w-5 mb-2 opacity-40" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Column Empty</span>
                  </div>
                ) : (
                  colCards.map((card) => (
                    <div
                      key={card.id}
                      className="bg-[#F5F5F2] dark:bg-[#0B120E] border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] p-3 flex flex-col justify-between hover:border-[#2F4F3A] dark:hover:border-[#4F7F60] transition-colors relative text-xs"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-[4px] border bg-blue-500/10 text-[#2563EB] border-blue-500/20">
                          TRANSFER
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground">{card.id.slice(-6).toUpperCase()}</span>
                      </div>

                      {/* Card Title */}
                      <div className="text-xs font-bold text-[#1A2820] dark:text-[#F5F5F2] mb-1">
                        {card.equipmentAsset?.equipment?.name || "Unknown Spec"}
                        <div className="text-[9px] text-muted-foreground font-semibold mt-0.5">SN: {card.equipmentAsset?.serialNumber}</div>
                      </div>

                      {/* Source/Dest routing */}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold my-1.5">
                        <span>{card.fromBase?.name || "Source Base"}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span className="text-[#1A2820] dark:text-[#F5F5F2]">{card.toBase?.name || "Dest Base"}</span>
                      </div>

                      {/* Remarks */}
                      {card.remarks && (
                        <p className="text-[10px] text-muted-foreground/80 leading-relaxed bg-white dark:bg-[#111B15] p-2 rounded border border-[#E6E8E6] dark:border-[#22352B] my-2">
                          {card.remarks}
                        </p>
                      )}

                      {/* Card Footer Details */}
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t border-[#E6E8E6]/60 dark:border-[#22352B]/60 pt-2 mt-2">
                        <span>Req: {card.transferredBy?.email || "Officer"}</span>
                        <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Action buttons based on status column */}
                      <div className="flex gap-2 justify-end mt-3 border-t border-dashed border-[#E6E8E6]/60 dark:border-[#22352B]/60 pt-2.5">
                        {col.id === "PENDING" && isCommander && (
                          <Button
                            onClick={() => {
                              setSelectedTransfer(card);
                              setIsReviewOpen(true);
                            }}
                            className="bg-[#2F4F3A] text-white hover:bg-[#1A2820] font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-[6px] w-full"
                          >
                            Review Coordinates
                          </Button>
                        )}
                        {col.id === "APPROVED" && isLogisticsOfficer && (
                          <div className="flex gap-1.5 w-full">
                            <Button
                              onClick={() => handleDispatch(card.id)}
                              className="bg-[#7C3AED] text-white hover:bg-purple-800 font-bold text-[9px] uppercase tracking-wider px-2 py-1 rounded-[6px] flex-1 flex items-center justify-center gap-1"
                            >
                              <Truck className="h-3 w-3" /> Dispatch
                            </Button>
                            <Button
                              onClick={() => handleCancel(card.id)}
                              variant="outline"
                              className="border-destructive/30 hover:bg-destructive/5 text-destructive font-bold text-[9px] px-2 py-1 rounded-[6px]"
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {col.id === "IN_TRANSIT" && isLogisticsOfficer && (
                          <Button
                            onClick={() => handleReceive(card.id)}
                            className="bg-[#2E7D32] text-white hover:bg-green-800 font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-[6px] w-full flex items-center justify-center gap-1"
                          >
                            <Check className="h-3 w-3" /> Mark Received
                          </Button>
                        )}
                        {col.id === "COMPLETED" && (
                          <span className="text-[9px] text-[#2E7D32] font-black uppercase tracking-wider flex items-center gap-1 py-1">
                            <Check className="h-3.5 w-3.5" /> Received
                          </span>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
