"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { equipmentService } from "@/services/equipment.service";
import { baseService } from "@/services/base.service";
import { assignmentService } from "@/services/assignment.service";
import { personnelService } from "@/services/personnel.service";
import { maintenanceService } from "@/services/maintenance.service";
import { transferService } from "@/services/transfer.service";
import { inspectionService } from "@/services/inspection.service";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  PlusCircle, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  UserCheck, 
  Truck, 
  Wrench, 
  ClipboardCheck,
  QrCode,
  Edit,
  RotateCw
} from "lucide-react";
import { 
  AssignDialog, 
  TransferDialog, 
  MaintenanceDialog, 
  InspectionDialog,
  DeleteDialog,
  AssetDialog,
  AssetFormValues
} from "@/components/ui/dialogs";
import { formatCurrency } from "@/utils/format-currency";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import Link from "next/link";
import { EquipmentStatus } from "@/types/common";
import { EquipmentAsset } from "@/types/equipment-asset";

export default function EquipmentAssetsPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = currentUser?.role === "ADMIN";
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "LOGISTICS_OFFICER";

  // Search & Filtering States
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [baseFilter, setBaseFilter] = useState("ALL");

  const [selectedAsset, setSelectedAsset] = useState<EquipmentAsset | null>(null);

  // Dialog State Machines
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Queries
  const assetsQuery = useQuery({
    queryKey: ["assets", "list", { page, limit, search, status: statusFilter, baseId: baseFilter }],
    queryFn: () => equipmentAssetService.getAssets({
      page,
      limit,
      search: search || undefined,
      status: statusFilter === "ALL" ? undefined : (statusFilter as EquipmentStatus),
      baseId: baseFilter === "ALL" ? undefined : baseFilter,
    }),
  });

  const equipmentQuery = useQuery({
    queryKey: ["equipment", "list", { limit: 100 }],
    queryFn: () => equipmentService.getEquipment({ limit: 100 }),
  });

  const basesQuery = useQuery({
    queryKey: ["bases", "list", { limit: 100 }],
    queryFn: () => baseService.getBases({ limit: 100 }),
  });

  const personnelQuery = useQuery({
    queryKey: ["personnel", "list", { limit: 100 }],
    queryFn: () => personnelService.getPersonnelList({ limit: 100 }),
  });

  // Extract Option Lists
  const equipmentOptions = useMemo(() => {
    return (equipmentQuery.data?.data?.equipment || []).map((e) => ({
      value: e.id,
      label: e.name,
    }));
  }, [equipmentQuery.data]);

  const baseOptions = useMemo(() => {
    return (basesQuery.data?.data?.bases || []).map((b) => ({
      value: b.id,
      label: b.name,
    }));
  }, [basesQuery.data]);

  const personnelOptions = useMemo(() => {
    return (personnelQuery.data?.data?.personnel || []).map((p) => ({
      value: p.id,
      label: `${p.rank} ${p.firstName} ${p.lastName}`,
    }));
  }, [personnelQuery.data]);

  // Mutations
  const createAssetMutation = useMutation({
    mutationFn: equipmentAssetService.createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Asset Registered", "New physical serial registry enrolled in base rosters.", "success");
      setIsFormOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to register asset.";
      toast("Registration Failed", errMsg, "error");
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<AssetFormValues, "equipmentId" | "baseId">> }) =>
      equipmentAssetService.updateAsset(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      if (data.data?.asset?.id) {
        queryClient.invalidateQueries({ queryKey: ["assets", "detail", data.data.asset.id] });
      }
      toast("Asset Updated", "Registry specifications modified successfully.", "success");
      setIsFormOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to update asset.";
      toast("Update Failed", errMsg, "error");
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: equipmentAssetService.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Asset Deleted", "Registry record permanently removed from logs.", "warning");
      setIsDeleteOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to delete registry.";
      toast("Deletion Failed", errMsg, "error");
      setIsDeleteOpen(false);
    },
  });

  const assignAssetMutation = useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "list"] });
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Asset Deployed", "Tactical personnel deploy logged successfully.", "success");
      setIsAssignOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to assign asset.";
      toast("Assignment Failed", errMsg, "error");
    },
  });

  const handleCreateOrUpdate = async (data: AssetFormValues) => {
    const formattedData = {
      serialNumber: data.serialNumber,
      equipmentId: data.equipmentId,
      baseId: data.baseId,
      purchaseCost: Number(data.purchaseCost),
      purchaseDate: data.purchaseDate || null,
      status: data.status,
      condition: data.condition,
      remarks: data.remarks || null,
    };

    if (selectedAsset) {
      const { ...rest } = formattedData;
      await updateAssetMutation.mutateAsync({ id: selectedAsset.id, data: rest });
    } else {
      await createAssetMutation.mutateAsync(formattedData);
    }
  };

  const handleAssign = async (data: { personnelId: string; remarks: string }) => {
    if (!selectedAsset) return;
    const personnelName = personnelOptions.find((p) => p.value === data.personnelId)?.label || "Officer";
    await assignAssetMutation.mutateAsync({
      equipmentAssetId: selectedAsset.id,
      assignedTo: personnelName,
      remarks: data.remarks || null,
    });
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    await deleteAssetMutation.mutateAsync(selectedAsset.id);
  };

  const createTransferMutation = useMutation({
    mutationFn: (data: { equipmentAssetId: string; destinationBaseId: string; remarks: string }) =>
      transferService.createTransfer({
        equipmentAssetId: data.equipmentAssetId,
        toBaseId: data.destinationBaseId,
        remarks: data.remarks || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers", "list"] });
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Transfer Requested", "Asset transfer request initialized successfully.", "success");
      setIsTransferOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to create transfer.";
      toast("Transfer Failed", errMsg, "error");
    },
  });

  const handleTransferMock = async (data: { destinationBaseId: string; remarks: string }) => {
    if (!selectedAsset) return;
    await createTransferMutation.mutateAsync({
      equipmentAssetId: selectedAsset.id,
      destinationBaseId: data.destinationBaseId,
      remarks: data.remarks,
    });
  };

  const scheduleMaintenanceMutation = useMutation({
    mutationFn: maintenanceService.scheduleMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "list"] });
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Service Booked", "Asset scheduled for depot maintenance service.", "success");
      setIsMaintenanceOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to schedule maintenance.";
      toast("Scheduling Failed", errMsg, "error");
    },
  });

  const handleMaintenanceMock = async (data: { type: "PREVENTIVE" | "CORRECTIVE"; date: string; description: string }) => {
    if (!selectedAsset) return;
    await scheduleMaintenanceMutation.mutateAsync({
      equipmentAssetId: selectedAsset.id,
      maintenanceType: data.type,
      scheduledDate: new Date(data.date).toISOString(),
      description: data.description,
    });
  };

  const logInspectionMutation = useMutation({
    mutationFn: async (data: { equipmentAssetId: string; result: "PASS" | "FAIL"; notes: string }) => {
      const scheduleRes = await inspectionService.scheduleInspection({
        equipmentAssetId: data.equipmentAssetId,
        inspectorName: "",
        scheduledDate: new Date().toISOString(),
        notes: data.notes,
      });
      const inspectionId = scheduleRes.data.id;
      const completeRes = await inspectionService.completeInspection(inspectionId, {
        result: data.result,
        notes: data.notes,
      });
      return completeRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections", "list"] });
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Inspection Logged", "Readiness check processed successfully.", "success");
      setIsInspectionOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to log inspection.";
      toast("Logging Failed", errMsg, "error");
    },
  });

  const handleInspectionMock = async (data: { result: "PASS" | "FAIL"; notes: string }) => {
    if (!selectedAsset) return;
    await logInspectionMutation.mutateAsync({
      equipmentAssetId: selectedAsset.id,
      result: data.result,
      notes: data.notes,
    });
  };

  const assetsList = assetsQuery.data?.data?.assets || [];
  const pagination = assetsQuery.data?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const getEquipmentName = (eqId: string) => {
    return equipmentOptions.find((e) => e.value === eqId)?.label || "Unknown Spec";
  };

  const getBaseName = (bId: string) => {
    return baseOptions.find((b) => b.value === bId)?.label || "HQ Division";
  };

  const isLoading = assetsQuery.isLoading;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Form Dialog */}
      <AssetDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onConfirm={handleCreateOrUpdate}
        asset={selectedAsset}
        equipmentOptions={equipmentOptions}
        baseOptions={baseOptions}
        isLoading={createAssetMutation.isPending || updateAssetMutation.isPending}
      />

      {/* Dynamic Command Modals */}
      {selectedAsset && (
        <>
          <AssignDialog
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            onConfirm={handleAssign}
            personnel={personnelOptions}
            fixedAssetId={selectedAsset.id}
            assetName={`${getEquipmentName(selectedAsset.equipmentId)} (${selectedAsset.serialNumber})`}
            isLoading={assignAssetMutation.isPending}
          />

          <TransferDialog
            isOpen={isTransferOpen}
            onClose={() => setIsTransferOpen(false)}
            onConfirm={handleTransferMock}
            bases={baseOptions}
            fixedAssetId={selectedAsset.id}
            fixedAssetName={`${getEquipmentName(selectedAsset.equipmentId)} (${selectedAsset.serialNumber})`}
            isLoading={createTransferMutation.isPending}
          />

          <MaintenanceDialog
            isOpen={isMaintenanceOpen}
            onClose={() => setIsMaintenanceOpen(false)}
            onConfirm={handleMaintenanceMock}
            fixedAssetId={selectedAsset.id}
            fixedAssetName={`${getEquipmentName(selectedAsset.equipmentId)} (${selectedAsset.serialNumber})`}
            isLoading={scheduleMaintenanceMutation.isPending}
          />

          <InspectionDialog
            isOpen={isInspectionOpen}
            onClose={() => setIsInspectionOpen(false)}
            onConfirm={handleInspectionMock}
            fixedAssetId={selectedAsset.id}
            assetName={`${getEquipmentName(selectedAsset.equipmentId)} (${selectedAsset.serialNumber})`}
            isLoading={logInspectionMutation.isPending}
          />

          <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            title="Delete Asset Registry"
            description={`Are you sure you want to completely delete serial registration ${selectedAsset.serialNumber}? This removes all history ledger tracking.`}
            isLoading={deleteAssetMutation.isPending}
          />
        </>
      )}

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Equipment Assets Registry</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage unique serial numbers, dispatch transfer coordinates, and update readiness states.</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setSelectedAsset(null);
              setIsFormOpen(true);
            }}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Add Asset
          </Button>
        )}
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by serial number, remarks log..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-[#111B15] dark:text-[#F5F5F2] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] focus:ring-1 focus:ring-[#2F4F3A]"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold">
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2F4F3A]"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DAMAGED">Damaged</option>
            <option value="LOST">Lost</option>
            <option value="RETIRED">Retired</option>
          </select>
          <select
            value={baseFilter}
            onChange={(e) => {
              setBaseFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2F4F3A]"
          >
            <option value="ALL">All Bases</option>
            {baseOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => assetsQuery.refetch()}
            className="p-2 border-[#E6E8E6] dark:border-[#22352B]"
            title="Refresh Data"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Hardware Type</th>
                <th className="py-3 px-4">Command Base</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
              {assetsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-semibold">
                    No active assets registered matching filters.
                  </td>
                </tr>
              ) : (
                assetsList.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                      <Link 
                        href={`/assets/equipment/${asset.id}`}
                        className="flex items-center gap-2 hover:underline text-[#2F4F3A] dark:text-[#5F9F7A]"
                      >
                        <QrCode className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{asset.serialNumber}</span>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {getEquipmentName(asset.equipmentId)}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {getBaseName(asset.baseId)}
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[10px] uppercase border ${
                        asset.condition === "NEW" ? "bg-green-500/10 text-[#2E7D32] border-green-500/20" :
                        asset.condition === "GOOD" ? "bg-blue-500/10 text-[#2563EB] border-blue-500/20" :
                        asset.condition === "FAIR" ? "bg-orange-500/10 text-[#F59E0B] border-orange-500/20" :
                        "bg-destructive/10 text-destructive border-destructive/20"
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-muted-foreground">
                      {formatCurrency(Number(asset.purchaseCost))}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        {canEdit && asset.status === "AVAILABLE" && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsAssignOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-[#2563EB] transition-all"
                            title="Assign Asset"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsTransferOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-[#7C3AED] transition-all"
                            title="Request Transfer"
                          >
                            <Truck className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsMaintenanceOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-[#F59E0B] transition-all"
                            title="Book Service"
                          >
                            <Wrench className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsInspectionOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-[#2E7D32] transition-all"
                            title="Log Inspection"
                          >
                            <ClipboardCheck className="h-4 w-4" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-[#2F4F3A] dark:text-[#5F9F7A] transition-all"
                            title="Edit Asset"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedAsset(asset);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-[6px] hover:bg-destructive/5 text-destructive transition-all"
                            title="Delete Registry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#E6E8E6] dark:border-[#22352B]">
            <span className="text-muted-foreground text-xs font-semibold">
              Showing page {page} of {totalPages} ({total} assets)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
