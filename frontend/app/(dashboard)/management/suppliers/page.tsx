"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService, SupplierListParams } from "@/services/supplier.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Building2, PlusCircle, CheckCircle, Search, Edit3, Trash2, ShieldAlert } from "lucide-react";
import { SupplierDialog, SupplierFormValues } from "@/components/ui/dialogs/SupplierDialog";
import { DeleteDialog } from "@/components/ui/dialogs/DeleteDialog";
import { Supplier } from "@/types/supplier";

export default function SuppliersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters & State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // 1. Query Suppliers
  const queryParams = useMemo((): SupplierListParams => {
    return {
      page,
      limit,
      search: search.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : (statusFilter as SupplierListParams["status"]),
    };
  }, [page, search, statusFilter]);

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", "list", queryParams],
    queryFn: () => supplierService.getSuppliers(queryParams),
  });

  const list = suppliersQuery.data?.data?.suppliers || [];
  const pagination = suppliersQuery.data?.data?.pagination;

  // Cache invalidator
  const invalidateState = (sId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["suppliers", "list"] });
    if (sId) {
      queryClient.invalidateQueries({ queryKey: ["suppliers", "detail", sId] });
    }
    // Also invalidate procurement keys as per instructions:
    queryClient.invalidateQueries({ queryKey: ["procurement", "list"] });
  };

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data: SupplierFormValues) => supplierService.createSupplier(data),
    onSuccess: () => {
      invalidateState();
      setIsFormOpen(false);
      toast("Supplier Registered", "Supplier details logged successfully.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to register supplier.";
      toast("Registration Failed", msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SupplierFormValues) =>
      supplierService.updateSupplier(selectedSupplier!.id, data),
    onSuccess: (res) => {
      invalidateState(res.data.supplier.id);
      setIsFormOpen(false);
      setSelectedSupplier(null);
      toast("Supplier Record Saved", "Supplier details updated successfully.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to update supplier.";
      toast("Update Failed", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      invalidateState();
      setIsDeleteOpen(false);
      setSupplierToDelete(null);
      toast("Supplier Deleted", "Supplier permanently removed from records.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to delete supplier. Check for procurement references.";
      toast("Deletion Failed", msg, "error");
    },
  });

  const handleRegisterClick = () => {
    setSelectedSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (sup: Supplier) => {
    setSelectedSupplier(sup);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (sup: Supplier) => {
    setSupplierToDelete(sup);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: SupplierFormValues) => {
    if (selectedSupplier) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialogs */}
      <SupplierDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onConfirm={handleFormSubmit}
        supplier={selectedSupplier}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (supplierToDelete) {
            await deleteMutation.mutateAsync(supplierToDelete.id);
          }
        }}
        title="Delete Supplier Record"
        description={`Are you sure you want to delete ${supplierToDelete?.name}? This action will permanently remove their records.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Approved Vendor Registry</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage prime military contractors, verify security clearances, and audit total logistics contracts.</p>
        </div>
        <Button
          onClick={handleRegisterClick}
          className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
        >
          <PlusCircle className="h-4 w-4" />
          Register Supplier
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search suppliers by name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs font-semibold focus:outline-none focus:border-[#2F4F3A]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Vendor</option>
            <option value="INACTIVE">Inactive / Suspended</option>
          </select>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {suppliersQuery.isLoading ? (
          <div className="py-12 flex justify-center items-center text-muted-foreground font-semibold">
            Loading supplier directory...
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-center">
            <ShieldAlert className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
            <span className="font-bold uppercase tracking-wider text-[10px]">No supplier records found</span>
            <p className="mt-1 text-xs">Verify names or search values.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Contractor Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Direct Liaison (POC)</th>
                  <th className="py-3 px-4">HQ Contact Line</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
                {list.map((sup) => (
                  <tr key={sup.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{sup.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-muted-foreground">
                      {sup.code}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      {sup.contactName || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                      <div>{sup.email || "—"}</div>
                      <div className="text-[9px] text-muted-foreground/80 mt-0.5">{sup.phone || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] font-black text-[9px] uppercase border ${
                        sup.status === "ACTIVE"
                          ? "bg-green-500/10 text-[#2E7D32] border-green-500/20"
                          : "bg-red-500/10 text-red-700 border-red-500/20"
                      }`}>
                        {sup.status === "ACTIVE" && <CheckCircle className="h-3 w-3" />}
                        {sup.status === "ACTIVE" ? "cleared" : "inactive"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(sup)}
                          className="p-1.5 text-muted-foreground hover:text-[#2F4F3A] transition-colors rounded hover:bg-[#F5F5F2] dark:hover:bg-[#0B120E]"
                          title="Edit Supplier Record"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sup)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded hover:bg-[#F5F5F2] dark:hover:bg-[#0B120E]"
                          title="Delete Supplier"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#E6E8E6] dark:border-[#22352B]">
                <span className="text-muted-foreground font-semibold">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} records total)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage(prev => prev - 1)}
                    className="border-[#E6E8E6]"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                    className="border-[#E6E8E6]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
