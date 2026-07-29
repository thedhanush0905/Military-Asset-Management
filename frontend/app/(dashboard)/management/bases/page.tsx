"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { baseService } from "@/services/base.service";
import { BaseDialog, BaseFormValues } from "@/components/ui/dialogs/BaseDialog";
import { MapPin, CheckCircle, PlusCircle, Edit2, ShieldAlert, Search, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { Base } from "@/types/base";

export default function BasesPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = currentUser?.role === "ADMIN";

  const [page, setPage] = useState(1);
  const limit = 12;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBase, setSelectedBase] = useState<Base | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch Bases Query
  const basesQuery = useQuery({
    queryKey: ["bases", "list", { page, limit, search }],
    queryFn: () => baseService.getBases({ page, limit, search: search || undefined }),
  });

  const bases = basesQuery.data?.data?.bases || [];
  const pagination = basesQuery.data?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  // Mutations
  const createBaseMutation = useMutation({
    mutationFn: baseService.createBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bases", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "baseSummary"] });
      toast("Base Enrolled", "Military base location registered in Aegis Command rosters.", "success");
      setIsDialogOpen(false);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errMsg = error.response?.data?.message || "Failed to register base.";
      toast("Registration Failed", errMsg, "error");
    },
  });

  const updateBaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BaseFormValues }) => baseService.updateBase(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bases", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "baseSummary"] });
      if (data.data?.base?.id) {
        queryClient.invalidateQueries({ queryKey: ["bases", "detail", data.data.base.id] });
      }
      toast("Base Updated", "Operational base specifications updated successfully.", "success");
      setIsDialogOpen(false);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errMsg = error.response?.data?.message || "Failed to update base.";
      toast("Update Failed", errMsg, "error");
    },
  });

  const deleteBaseMutation = useMutation({
    mutationFn: baseService.deleteBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bases", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "baseSummary"] });
      toast("Base Deactivated", "Operational base deactivated and removed from active duty roster.", "warning");
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const errMsg = error.response?.data?.message || "Failed to deactivate base.";
      toast("Deactivation Blocked", errMsg, "error");
    },
  });

  const handleCreateOrUpdate = async (data: BaseFormValues) => {
    if (selectedBase) {
      await updateBaseMutation.mutateAsync({ id: selectedBase.id, data });
    } else {
      await createBaseMutation.mutateAsync(data);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to deactivate base: ${name}?`)) {
      await deleteBaseMutation.mutateAsync(id);
    }
  };


  const isMutationLoading = createBaseMutation.isPending || updateBaseMutation.isPending;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Command Base Locations</h1>
          <p className="text-xs text-muted-foreground mt-1">Audit active base locations, dispatch capacities, and track local commander readiness ratings.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedBase(null);
              setIsDialogOpen(true);
            }}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Register Base
          </Button>
        )}
      </div>

      {/* Toolbar / Search */}
      <div className="flex items-center gap-4 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search bases by name, reference code, location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] focus:ring-1 focus:ring-[#2F4F3A]"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchInput("");
            setSearch("");
            setPage(1);
            queryClient.invalidateQueries({ queryKey: ["bases", "list"] });
          }}
          className="border-[#E6E8E6] flex items-center gap-1.5 h-9 text-[#1A2820] dark:text-[#E6E8E6]"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Loading & Empty States */}
      {basesQuery.isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : basesQuery.isError ? (
        <div className="text-center py-12 text-destructive font-medium bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px]">
          Error loading base registry. Please check API server connection.
        </div>
      ) : bases.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-semibold bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px]">
          No bases matching search parameters.
        </div>
      ) : (
        /* Grid of Bases cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bases.map((base) => {
            const inventoriesCount = base._count?.inventories || 0;
            return (
              <div 
                key={base.id}
                className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-5 flex flex-col justify-between hover:border-[#2F4F3A] transition-colors shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2F4F3A] bg-[#EFF1EF] dark:bg-[#1A2820] dark:text-[#4F7F60] px-2 py-0.5 rounded-[4px]">
                      {base.code}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">{base.id}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2820] dark:text-[#F5F5F2] mt-3 tracking-tight">
                    {base.name}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 font-bold">
                    <MapPin className="h-3.5 w-3.5" />
                    {base.location}
                  </p>
                </div>

                <div className="my-5 flex flex-col gap-4 border-t border-b border-[#E6E8E6] dark:border-[#22352B] py-4">
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                    <span>Allocated Users:</span>
                    <span className="font-extrabold text-[#1A2820] dark:text-[#F5F5F2] text-xs">
                      {base._count?.users || 0} officers
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                    <span>Allocated Inventories:</span>
                    <span className="font-extrabold text-[#1A2820] dark:text-[#F5F5F2] text-xs">
                      {inventoriesCount} items
                    </span>
                  </div>

                </div>

                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-[#2E7D32] flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> cleared
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBase(base);
                            setIsDialogOpen(true);
                          }}
                          className="border-[#E6E8E6] hover:bg-muted text-[9px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1 text-[#1A2820] dark:text-[#E6E8E6]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(base.id, base.name)}
                          disabled={deleteBaseMutation.isPending}
                          className="border-[#E6E8E6] hover:bg-destructive/5 hover:text-destructive text-[9px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1 text-[#1A2820] dark:text-[#E6E8E6]"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Suspend
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!basesQuery.isLoading && !basesQuery.isError && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm mt-4">
          <div className="text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} bases
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

      {/* Register/Edit Base Modal */}
      <BaseDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleCreateOrUpdate}
        base={selectedBase}
        isLoading={isMutationLoading}
      />
    </div>
  );
}
