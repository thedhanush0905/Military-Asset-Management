"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { procurementService } from "@/services/procurement.service";
import { baseService } from "@/services/base.service";
import { equipmentService } from "@/services/equipment.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, CheckCircle, Clock, PlusCircle, ClipboardList } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { formatCurrency } from "@/utils/format-currency";
import { 
  ProcurementDialog, 
  ReceiveProcurementDialog,
  ProcurementFormValues
} from "@/components/ui/dialogs";
import { Procurement } from "@/types/procurement";

export default function ProcurementPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState<Procurement | null>(null);

  // 1. Fetch Bases for dropdowns
  const basesQuery = useQuery({
    queryKey: ["bases", "list"],
    queryFn: () => baseService.getBases({ limit: 100 }),
  });

  const baseOptions = useMemo(() => {
    return (basesQuery.data?.data?.bases || [])
      .filter((b) => b.isActive)
      .map((b) => ({ value: b.id, label: b.name }));
  }, [basesQuery.data]);

  // 2. Fetch Equipment Specs for dropdowns
  const equipmentQuery = useQuery({
    queryKey: ["equipment", "list"],
    queryFn: () => equipmentService.getEquipment({ limit: 100 }),
  });

  const equipmentOptions = useMemo(() => {
    return (equipmentQuery.data?.data?.equipment || [])
      .filter((e) => e.isActive)
      .map((e) => ({ value: e.id, label: e.name }));
  }, [equipmentQuery.data]);

  // 3. Fetch Procurements list
  const procurementsQuery = useQuery({
    queryKey: ["procurement", "list"],
    queryFn: () => procurementService.getProcurements({ limit: 100 }),
  });

  const orders = procurementsQuery.data?.data?.procurements || [];

  // Helper helper to invalidate cache
  const invalidateState = (pId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["procurement", "list"] });
    if (pId) {
      queryClient.invalidateQueries({ queryKey: ["procurement", "detail", pId] });
    }
    queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
    queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
  };

  // 4. Mutations
  const createMutation = useMutation({
    mutationFn: (data: ProcurementFormValues) => {
      const items = data.items.map((i) => ({
        equipmentId: i.equipmentId,
        quantity: i.quantity,
        unitCost: Number(i.unitCost),
      }));
      return procurementService.createProcurement({
        procurementNumber: data.procurementNumber,
        supplier: data.supplier,
        purchaseDate: new Date(data.purchaseDate).toISOString(),
        expectedDeliveryDate: new Date(data.expectedDeliveryDate).toISOString(),
        baseId: data.baseId,
        remarks: data.remarks || null,
        items,
      });
    },
    onSuccess: () => {
      invalidateState();
      setIsCreateOpen(false);
      toast("RFQ Created", "New procurement request logged successfully.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to create RFQ.";
      toast("Submission Failed", errMsg, "error");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => procurementService.approveProcurement(id),
    onSuccess: (res) => {
      invalidateState(res.data.procurement.id);
      toast("RFQ Approved", "PO approved and suppliers authorized.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to approve PO.";
      toast("Approval Failed", errMsg, "error");
    },
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, items }: { id: string; items: Array<{ equipmentId: string; serialNumbers: string[] }> }) =>
      procurementService.receiveProcurement(id, { items }),
    onSuccess: (res) => {
      invalidateState(res.data.procurement.id);
      setIsReceiveOpen(false);
      setSelectedProcurement(null);
      toast("Shipment Received", "Delivery logged. Hardware assets registered in base registries.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to receive PO.";
      toast("Delivery Failed", errMsg, "error");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => procurementService.cancelProcurement(id),
    onSuccess: (res) => {
      invalidateState(res.data.procurement.id);
      toast("PO Cancelled", "Procurement contract cancelled successfully.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to cancel PO.";
      toast("Cancellation Failed", errMsg, "error");
    },
  });

  const handleCreateRFQ = async (data: ProcurementFormValues) => {
    await createMutation.mutateAsync(data);
  };

  const handleReceiveConfirm = async (data: { items: Array<{ equipmentId: string; serialNumbers: string[] }> }) => {
    if (!selectedProcurement) return;
    await receiveMutation.mutateAsync({ id: selectedProcurement.id, items: data.items });
  };

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  const handleCancel = async (id: string) => {
    await cancelMutation.mutateAsync(id);
  };

  const isLogisticsOfficer = currentUser?.role === "LOGISTICS_OFFICER" || currentUser?.role === "ADMIN";
  const isCommander = currentUser?.role === "BASE_COMMANDER" || currentUser?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Modals */}
      <ProcurementDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleCreateRFQ}
        equipmentOptions={equipmentOptions}
        baseOptions={baseOptions}
        isLoading={createMutation.isPending}
      />

      <ReceiveProcurementDialog
        isOpen={isReceiveOpen}
        onClose={() => {
          setIsReceiveOpen(false);
          setSelectedProcurement(null);
        }}
        onConfirm={handleReceiveConfirm}
        procurement={selectedProcurement}
        isLoading={receiveMutation.isPending}
      />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Procurement Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-1">Track request for quotes (RFQ), active purchase orders, vendor deliveries, and contract costs.</p>
        </div>
        {isLogisticsOfficer && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Create RFQ
          </Button>
        )}
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
              <th className="py-3 px-4">PO Number</th>
              <th className="py-3 px-4">Supplier Contract</th>
              <th className="py-3 px-4">Destination Base</th>
              <th className="py-3 px-4">Procured items</th>
              <th className="py-3 px-4 text-right">Total Value</th>
              <th className="py-3 px-4">PO Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <ClipboardList className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">No procurement contracts found</span>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((ord) => {
                const baseName = ord.base?.name || "Depot Command";
                const isApproved = ord.status === "APPROVED";
                const isPartiallyReceived = ord.status === "PARTIALLY_RECEIVED";
                const isReceived = ord.status === "RECEIVED";
                const isCancelled = ord.status === "CANCELLED";
                const isDraft = ord.status === "DRAFT";

                return (
                  <tr key={ord.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <span>{ord.procurementNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {ord.supplier}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {baseName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-muted-foreground max-w-xs truncate">
                      {ord.remarks || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#2E7D32]">
                      {formatCurrency(Number(ord.totalCost))}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {formatDate(ord.purchaseDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isDraft && isCommander && (
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            onClick={() => handleApprove(ord.id)}
                            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleCancel(ord.id)}
                            variant="outline"
                            className="border-destructive/30 hover:bg-destructive/5 text-destructive text-[10px]"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      {(isApproved || isPartiallyReceived) && isLogisticsOfficer && (
                        <div className="flex gap-1.5 justify-end">
                          <Button
                            onClick={() => {
                              setSelectedProcurement(ord);
                              setIsReceiveOpen(true);
                            }}
                            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                          >
                            Confirm Delivery
                          </Button>
                          {isDraft && (
                            <Button
                              onClick={() => handleCancel(ord.id)}
                              variant="outline"
                              className="border-destructive/30 hover:bg-destructive/5 text-destructive text-[10px]"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                      {isReceived && (
                        <span className="inline-flex items-center gap-1 text-[#2E7D32] font-black uppercase text-[10px] tracking-wider py-1">
                          <CheckCircle className="h-4 w-4" /> Received
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground font-black uppercase text-[10px] tracking-wider py-1">
                          Cancelled
                        </span>
                      )}
                      {isDraft && !isCommander && (
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
