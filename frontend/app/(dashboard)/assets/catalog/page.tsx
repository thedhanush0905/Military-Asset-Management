"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { equipmentService, Equipment, EquipmentCategory } from "@/services/equipment.service";
import { dashboardService } from "@/services/dashboard.service";
import { EquipmentDialog, EquipmentFormValues } from "@/components/ui/dialogs/EquipmentDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PlusCircle, Search, SlidersHorizontal, Info, Edit2, Trash, Shield, RotateCw } from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export default function EquipmentCatalogPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = currentUser?.role === "ADMIN";
  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "LOGISTICS_OFFICER";

  // Search & Filtering states
  const [page, setPage] = useState(1);
  const limit = 12;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Queries
  const equipmentQuery = useQuery({
    queryKey: ["equipment", "list", { page, limit, search, category: categoryFilter }],
    queryFn: () => equipmentService.getEquipment({
      page,
      limit,
      search: search || undefined,
      category: categoryFilter === "ALL" ? undefined : (categoryFilter as EquipmentCategory),
    }),
  });

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "equipmentSummary"],
    queryFn: () => dashboardService.getEquipmentSummary({ limit: 100 }),
  });

  const equipmentList = equipmentQuery.data?.data?.equipment || [];
  const pagination = equipmentQuery.data?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  const summaryData = summaryQuery.data?.data?.equipments || [];

  // Mutations
  const createEquipmentMutation = useMutation({
    mutationFn: equipmentService.createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Catalog Entry Logged", "Successfully registered new system specifications in hardware directories.", "success");
      setIsDialogOpen(false);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errMsg = error.response?.data?.message || "Failed to register specifications.";
      toast("Registration Failed", errMsg, "error");
    },
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipmentFormValues }) => equipmentService.updateEquipment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["equipment", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
      if (data.data?.equipment?.id) {
        queryClient.invalidateQueries({ queryKey: ["equipment", "detail", data.data.equipment.id] });
      }
      toast("Specs Updated", "Hardware parameters updated successfully.", "success");
      setIsDialogOpen(false);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errMsg = error.response?.data?.message || "Failed to update specifications.";
      toast("Update Failed", errMsg, "error");
    },
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: equipmentService.deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "equipmentSummary"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Catalog Entry Deleted", "Specs class removed from active directory catalogs.", "warning");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errMsg = error.response?.data?.message || "Failed to delete specifications.";
      toast("Deletion Blocked", errMsg, "error");
    },
  });

  const handleCreateOrUpdate = async (data: EquipmentFormValues) => {
    const payload = {
      name: data.name,
      category: data.category,
      unit: data.unit,
      description: data.description ?? null,
      supplierId: data.supplierId ?? null,
      model: data.model ?? null,
      specifications: data.specifications ?? null,
      expectedLifeYears: data.expectedLifeYears ?? null,
    };

    if (selectedEquipment) {
      await updateEquipmentMutation.mutateAsync({
        id: selectedEquipment.id,
        data: payload as unknown as EquipmentFormValues,
      });
    } else {
      await createEquipmentMutation.mutateAsync(
        payload as unknown as Omit<Equipment, "id" | "isActive" | "createdAt" | "updatedAt">
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete equipment specification: ${name}? This action is permanent.`)) {
      await deleteEquipmentMutation.mutateAsync(id);
    }
  };

  const isMutationLoading = createEquipmentMutation.isPending || updateEquipmentMutation.isPending;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Equipment Catalog</h1>
          <p className="text-xs text-muted-foreground mt-1">Master specifications register for weapons systems, aircraft, and armored divisions.</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              setSelectedEquipment(null);
              setIsDialogOpen(true);
            }}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Add Spec
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
            placeholder="Search specs register by name, model, supplier..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] focus:ring-1 focus:ring-[#2F4F3A]"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold">
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2F4F3A]"
          >
            <option value="ALL">All Categories</option>
            <option value="VEHICLE">Vehicles</option>
            <option value="WEAPON">Weapons</option>
            <option value="AMMUNITION">Ammunition</option>
            <option value="COMMUNICATION">Communications</option>
            <option value="MEDICAL">Medical Kits</option>
            <option value="OTHER">Other Supplies</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setCategoryFilter("ALL");
              setPage(1);
              queryClient.invalidateQueries({ queryKey: ["equipment", "list"] });
            }}
            className="border-[#E6E8E6] flex items-center gap-1.5 h-9 text-[#1A2820] dark:text-[#E6E8E6]"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Loading & Empty States */}
      {equipmentQuery.isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : equipmentQuery.isError ? (
        <div className="text-center py-12 text-destructive font-medium bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px]">
          Error loading catalog specifications. Please verify backend connection.
        </div>
      ) : equipmentList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-semibold bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px]">
          No specifications found matching filter parameters.
        </div>
      ) : (
        /* Cards Catalog Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipmentList.map((eq) => {
            const stats = summaryData.find((s) => s.equipmentId === eq.id) || {
              totalAssets: eq.assetCount || 0,
              available: 0,
              assigned: 0,
              maintenance: 0,
            };

            return (
              <div 
                key={eq.id}
                className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-5 flex flex-col justify-between hover:border-[#2F4F3A] dark:hover:border-[#4F7F60] transition-colors shadow-sm"
              >
                {/* Card Title Header */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2F4F3A] dark:text-[#4F7F60] bg-[#EFF1EF] dark:bg-[#1A2820] px-2 py-0.5 rounded-[4px]">
                      {eq.category}
                    </span>
                    <h3 className="text-base font-extrabold text-[#1A2820] dark:text-[#F5F5F2] mt-2 tracking-tight">
                      {eq.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                      {eq.supplier?.name || "No Supplier"} • {eq.model || "N/A"}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-[8px] bg-[#F5F5F2] dark:bg-[#1A2820] border border-[#E6E8E6] dark:border-[#22352B] flex items-center justify-center shrink-0">
                    <Shield className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="my-4 bg-[#F5F5F2] dark:bg-[#0B120E] border border-[#E6E8E6] dark:border-[#22352B] rounded-[8px] p-3 text-[10px] leading-relaxed text-muted-foreground">
                  <div className="font-bold text-[#1A2820] dark:text-[#F5F5F2] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    Technical Parameters
                  </div>
                  <div>{eq.specifications || eq.description || "No specifications registered."}</div>
                  <div className="mt-1.5 flex gap-2 border-t border-[#E6E8E6]/60 dark:border-[#22352B]/60 pt-1.5">
                    <span className="font-bold uppercase tracking-wider">Service Life:</span>
                    <span className="font-semibold text-foreground dark:text-[#F5F5F2]">{eq.expectedLifeYears || 0} Years Expected</span>
                  </div>
                </div>

                {/* Active Statistics Footer */}
                <div className="border-t border-[#E6E8E6] dark:border-[#22352B] pt-4 flex items-center justify-between gap-2">
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                      <span className="text-sm font-extrabold text-[#1A2820] dark:text-[#F5F5F2]">{stats.totalAssets}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Avail</span>
                      <span className="text-sm font-extrabold text-[#2E7D32]">{stats.available}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Assign</span>
                      <span className="text-sm font-extrabold text-[#2563EB]">{stats.assigned}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Maint</span>
                      <span className="text-sm font-extrabold text-[#F59E0B]">{stats.maintenance}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEquipment(eq);
                          setIsDialogOpen(true);
                        }}
                        className="border-[#E6E8E6] text-[9px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1 text-[#1A2820] dark:text-[#E6E8E6]"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(eq.id, eq.name)}
                        className="border-[#E6E8E6] hover:bg-destructive/5 hover:text-destructive text-[9px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1 text-[#1A2820] dark:text-[#E6E8E6]"
                      >
                        <Trash className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                    <Button
                      onClick={() => toast("Details Wizard", `Opening specs logs folder for ${eq.name}...`, "info")}
                      variant="outline"
                      size="sm"
                      className="border-[#E6E8E6] text-[10px] font-bold tracking-wider uppercase rounded-[8px]"
                    >
                      Sheet
                    </Button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!equipmentQuery.isLoading && !equipmentQuery.isError && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm mt-4">
          <div className="text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} items
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="border-[#E6E8E6] text-[#1A2820] dark:text-[#E6E8E6]"
            >
              Previous
            </Button>
            <span className="font-semibold text-[#1A2820] dark:text-[#F5F5F2] text-xs">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="border-[#E6E8E6] text-[#1A2820] dark:text-[#E6E8E6]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Register/Edit Equipment Modal */}
      <EquipmentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleCreateOrUpdate}
        equipment={selectedEquipment}
        isLoading={isMutationLoading}
      />
    </div>
  );
}
