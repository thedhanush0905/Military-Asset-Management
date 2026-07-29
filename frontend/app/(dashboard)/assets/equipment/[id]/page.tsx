"use client";

import React, { use, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { equipmentAssetService } from "@/services/equipment-asset.service";
import { baseService } from "@/services/base.service";
import { assignmentService } from "@/services/assignment.service";
import { personnelService } from "@/services/personnel.service";
import { maintenanceService } from "@/services/maintenance.service";
import { transferService } from "@/services/transfer.service";
import { inspectionService } from "@/services/inspection.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Shield, 
  MapPin, 
  Wrench, 
  ClipboardCheck, 
  DollarSign, 
  Info, 
  History,
  UserCheck,
  Truck,
  FileCheck,
  Activity,
  RotateCw
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Timeline } from "@/components/ui/timeline";
import { 
  AssignDialog, 
  TransferDialog, 
  MaintenanceDialog, 
  InspectionDialog 
} from "@/components/ui/dialogs";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AssetDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "LOGISTICS_OFFICER";

  // Dialog State Machines
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"specs" | "movement" | "service" | "warranty">("specs");

  // Queries
  const assetQuery = useQuery({
    queryKey: ["assets", "detail", id],
    queryFn: () => equipmentAssetService.getAssetById(id),
  });

  const basesQuery = useQuery({
    queryKey: ["bases", "list", { limit: 100 }],
    queryFn: () => baseService.getBases({ limit: 100 }),
    enabled: !!assetQuery.data,
  });

  const personnelQuery = useQuery({
    queryKey: ["personnel", "list", { limit: 100 }],
    queryFn: () => personnelService.getPersonnelList({ limit: 100 }),
    enabled: !!assetQuery.data,
  });

  // Options Mapping
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
  const assignAssetMutation = useMutation({
    mutationFn: assignmentService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Asset Deployed", "Assigned serialized asset to officer rosters.", "success");
      setIsAssignOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to assign asset.";
      toast("Assignment Failed", errMsg, "error");
    },
  });

  // Extract variables
  const asset = assetQuery.data?.data?.asset;
  const equipment = asset?.equipment;

  const getBaseName = (bId: string) => {
    return baseOptions.find((b) => b.value === bId)?.label || "HQ Base Depot";
  };

  // Commands handlers
  const handleAssign = async (data: { personnelId: string; remarks: string }) => {
    if (!asset) return;
    const personnelName = personnelOptions.find((p) => p.value === data.personnelId)?.label || "Officer";
    await assignAssetMutation.mutateAsync({
      equipmentAssetId: asset.id,
      assignedTo: personnelName,
      remarks: data.remarks || null,
    });
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
      if (asset) {
        queryClient.invalidateQueries({ queryKey: ["assets", "detail", asset.id] });
      }
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
    if (!asset) return;
    await createTransferMutation.mutateAsync({
      equipmentAssetId: asset.id,
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
      if (asset) {
        queryClient.invalidateQueries({ queryKey: ["assets", "detail", asset.id] });
      }
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
    if (!asset) return;
    await scheduleMaintenanceMutation.mutateAsync({
      equipmentAssetId: asset.id,
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
      if (asset) {
        queryClient.invalidateQueries({ queryKey: ["assets", "detail", asset.id] });
      }
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
    if (!asset) return;
    await logInspectionMutation.mutateAsync({
      equipmentAssetId: asset.id,
      result: data.result,
      notes: data.notes,
    });
  };

  // Straight line depreciation calculator (Pure Presentation Logic)
  const dep = useMemo(() => {
    if (!asset || !equipment) return { salvage: 0, annualDepreciation: 0, currentValue: 0, accumulatedDepreciation: 0 };
    const cost = Number(asset.purchaseCost) || 0;
    const lifeYears = equipment.expectedLifeYears || 15;
    const salvage = cost * 0.15; // Assume 15% salvage value
    const annualDepreciation = (cost - salvage) / lifeYears;
    
    // Years passed since purchase
    const purchaseYear = new Date(asset.purchaseDate || new Date().toISOString()).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsPassed = Math.max(0, currentYear - purchaseYear);
    
    const accumulatedDepreciation = Math.min(cost - salvage, annualDepreciation * yearsPassed);
    const currentValue = Math.max(salvage, cost - accumulatedDepreciation);

    return {
      salvage,
      annualDepreciation,
      currentValue,
      accumulatedDepreciation,
    };
  }, [asset, equipment]);

  if (assetQuery.isLoading) {
    return <TableSkeleton rows={8} cols={4} />;
  }

  if (assetQuery.isError || !asset || !equipment) {
    return (
      <div className="p-6 text-center bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] shadow-sm">
        <h3 className="text-sm font-bold text-destructive">Asset details could not be loaded</h3>
        <p className="text-muted-foreground mt-2">The record may not exist or access scope is restricted.</p>
        <Button onClick={() => assetQuery.refetch()} className="mt-4">
          Retry Sync
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Triggers */}
      <AssignDialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onConfirm={handleAssign}
        personnel={personnelOptions}
        fixedAssetId={asset.id}
        assetName={`${equipment.name} (${asset.serialNumber})`}
        isLoading={assignAssetMutation.isPending}
      />

      <TransferDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onConfirm={handleTransferMock}
        bases={baseOptions}
        fixedAssetId={asset.id}
        fixedAssetName={`${equipment.name} (${asset.serialNumber})`}
        isLoading={createTransferMutation.isPending}
      />

      <MaintenanceDialog
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        onConfirm={handleMaintenanceMock}
        fixedAssetId={asset.id}
        fixedAssetName={`${equipment.name} (${asset.serialNumber})`}
        isLoading={scheduleMaintenanceMutation.isPending}
      />

      <InspectionDialog
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        onConfirm={handleInspectionMock}
        fixedAssetId={asset.id}
        assetName={`${equipment.name} (${asset.serialNumber})`}
        isLoading={logInspectionMutation.isPending}
      />

      {/* Hero Summary Header Block */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[10px] bg-[#2F4F3A]/10 text-[#2F4F3A] flex items-center justify-center shrink-0 border border-[#2F4F3A]/20">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">
                {equipment.name}
              </h1>
              <StatusBadge status={asset.status} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">
              UID: {asset.serialNumber} • {equipment.supplier?.name || "No Supplier"} ({equipment.model})
            </p>
            <div className="flex gap-4 mt-2 text-muted-foreground font-semibold text-[10px]">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {getBaseName(asset.baseId)}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                Condition: <span className="font-extrabold text-[#2F4F3A] dark:text-[#4F7F60]">{asset.condition}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2.5">
          {canEdit && asset.status === "AVAILABLE" && (
            <Button
              onClick={() => setIsAssignOpen(true)}
              variant="outline"
              className="border-[#E6E8E6] text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5"
            >
              <UserCheck className="h-3.5 w-3.5 text-[#2563EB]" />
              Assign
            </Button>
          )}
          {canEdit && (
            <Button
              onClick={() => setIsTransferOpen(true)}
              variant="outline"
              className="border-[#E6E8E6] text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5"
            >
              <Truck className="h-3.5 w-3.5 text-[#7C3AED]" />
              Transfer
            </Button>
          )}
          {canEdit && (
            <Button
              onClick={() => setIsMaintenanceOpen(true)}
              variant="outline"
              className="border-[#E6E8E6] text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5"
            >
              <Wrench className="h-3.5 w-3.5 text-[#F59E0B]" />
              Maintenance
            </Button>
          )}
          {canEdit && (
            <Button
              onClick={() => setIsInspectionOpen(true)}
              variant="outline"
              className="border-[#E6E8E6] text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5"
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-[#2E7D32]" />
              Inspect
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => assetQuery.refetch()}
            className="border-[#E6E8E6] p-2"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col gap-6">
        <div className="border-b border-[#E6E8E6] dark:border-[#22352B] flex gap-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "specs" 
                ? "text-[#2F4F3A] dark:text-[#4F7F60] border-b-2 border-[#2F4F3A] dark:border-[#4F7F60]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Physical Specs
          </button>
          <button
            onClick={() => setActiveTab("movement")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "movement" 
                ? "text-[#2F4F3A] dark:text-[#4F7F60] border-b-2 border-[#2F4F3A] dark:border-[#4F7F60]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Movement Timeline
          </button>
          <button
            onClick={() => setActiveTab("service")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "service" 
                ? "text-[#2F4F3A] dark:text-[#4F7F60] border-b-2 border-[#2F4F3A] dark:border-[#4F7F60]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Service Logs
          </button>
          <button
            onClick={() => setActiveTab("warranty")}
            className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "warranty" 
                ? "text-[#2F4F3A] dark:text-[#4F7F60] border-b-2 border-[#2F4F3A] dark:border-[#4F7F60]" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Warranty & Valuations
          </button>
        </div>

        {/* Active Tab Panel */}
        <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm min-h-[250px]">
          
          {activeTab === "specs" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-1.5">
                <Info className="h-4.5 w-4.5 text-muted-foreground" />
                Physical Specifications
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {equipment.description || "No description logged for this specification catalog spec."}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E6E8E6] dark:border-[#22352B]">
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Supplier:</span>
                    <span className="font-bold text-foreground">{equipment.supplier?.name || "No Supplier"}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Model Class:</span>
                    <span className="font-bold text-foreground">{equipment.model}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Service Life Target:</span>
                    <span className="font-bold text-foreground">{equipment.expectedLifeYears} Years</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Category Scope:</span>
                    <span className="font-bold text-foreground">{equipment.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Technical Summary:</span>
                    <span className="font-bold text-foreground max-w-xs text-right truncate">
                      {equipment.specifications}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "movement" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-1.5 mb-6">
                <History className="h-4.5 w-4.5 text-muted-foreground" />
                Asset Movement Timeline
              </h3>
              <Timeline
                items={[
                  {
                    id: "m-1",
                    title: "Status Update",
                    subtitle: "Roster Sync",
                    description: asset.remarks || "No custom remarks logged for this asset registry.",
                    timestamp: formatDate(asset.updatedAt),
                    icon: <FileCheck className="h-4 w-4" />,
                    iconColorClass: "text-[#2E7D32]"
                  },
                  {
                    id: "m-2",
                    title: "Base Allocation Registered",
                    subtitle: "Logistics HQ",
                    description: `Allocated to ${getBaseName(asset.baseId)}.`,
                    timestamp: formatDate(asset.purchaseDate || asset.createdAt),
                    icon: <MapPin className="h-4 w-4" />,
                    iconColorClass: "text-[#2563EB]"
                  }
                ]}
              />
            </div>
          )}

          {activeTab === "service" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-1.5 mb-4">
                <Wrench className="h-4.5 w-4.5 text-muted-foreground" />
                Service Record Logs
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-2.5">Task ID</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5">Service Notes</th>
                      <th className="py-2.5">Tech Roster</th>
                      <th className="py-2.5 text-right">Cost</th>
                      <th className="py-2.5 text-right">Scheduled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground font-semibold">
                        No service records logged for this serial asset.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "warranty" && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-1.5">
                <DollarSign className="h-4.5 w-4.5 text-muted-foreground" />
                Procurement Valuations & Straight-Line Depreciation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Valuations list */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Original Purchase Cost:</span>
                    <span className="font-extrabold text-[#2E7D32] text-sm">{formatCurrency(Number(asset.purchaseCost))}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Estimated Salvage (15%):</span>
                    <span className="font-bold text-foreground">{formatCurrency(dep.salvage)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Annual Depreciation Rate:</span>
                    <span className="font-bold text-[#DC2626]">{formatCurrency(dep.annualDepreciation)} / year</span>
                  </div>
                </div>

                {/* Accumulated panel */}
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Accumulated Depreciation:</span>
                    <span className="font-bold text-[#DC2626]">{formatCurrency(dep.accumulatedDepreciation)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5 bg-[#EFF1EF]/30 dark:bg-[#1A2820]/30 p-2 rounded bg-opacity-30">
                    <span className="text-[#1A2820] dark:text-[#F5F5F2] font-extrabold">Current Net Book Value:</span>
                    <span className="font-black text-[#2E7D32] text-sm">{formatCurrency(dep.currentValue)}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5">
                    <span className="text-muted-foreground font-semibold">Procurement Date:</span>
                    <span className="font-semibold text-foreground">{formatDate(asset.purchaseDate || asset.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
