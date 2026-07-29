"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { personnelService, PersonnelListParams } from "@/services/personnel.service";
import { organizationService } from "@/services/organization.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCheck, PlusCircle, Edit3, Trash2, ShieldAlert } from "lucide-react";
import { PersonnelDialog, PersonnelFormValues } from "@/components/ui/dialogs/PersonnelDialog";
import { DeleteDialog } from "@/components/ui/dialogs/DeleteDialog";
import { OrganizationUnit } from "@/types/organization";
import { Personnel } from "@/types/personnel";

export default function PersonnelPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Filters & State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [unitFilter, setUnitFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);

  // 1. Query organization tree to flatten for select options
  const orgQuery = useQuery({
    queryKey: ["organization", "list"],
    queryFn: () => organizationService.getTree(),
  });

  const unitOptions = useMemo(() => {
    const units = orgQuery.data?.data || [];
    const result: Array<{ value: string; label: string }> = [];
    const traverse = (node: OrganizationUnit) => {
      result.push({ value: node.id, label: `${node.name} (${node.code})` });
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverse);
      }
    };
    units.forEach(traverse);
    return result;
  }, [orgQuery.data]);

  // 2. Query live Personnel actives
  const queryParams = useMemo((): PersonnelListParams => {
    return {
      page,
      limit,
      search: search.trim() || undefined,
      status: statusFilter === "ALL" ? undefined : (statusFilter as PersonnelListParams["status"]),
      unitId: unitFilter === "ALL" ? undefined : unitFilter,
    };
  }, [page, search, statusFilter, unitFilter]);

  const personnelQuery = useQuery({
    queryKey: ["personnel", "list", queryParams],
    queryFn: () => personnelService.getPersonnelList(queryParams),
  });

  const roster = personnelQuery.data?.data?.personnel || [];
  const pagination = personnelQuery.data?.data?.pagination;

  // Cache invalidator helper
  const invalidateState = (pId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["personnel", "list"] });
    if (pId) {
      queryClient.invalidateQueries({ queryKey: ["personnel", "detail", pId] });
    }
  };

  // 3. Mutations
  const createMutation = useMutation({
    mutationFn: (data: PersonnelFormValues) => personnelService.createPersonnel(data),
    onSuccess: () => {
      invalidateState();
      setIsFormOpen(false);
      toast("Officer Enrolled", "Officer successfully enrolled in personnel active directory.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to enroll officer.";
      toast("Enrollment Failed", msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PersonnelFormValues) =>
      personnelService.updatePersonnel(selectedPersonnel!.id, data),
    onSuccess: (res) => {
      invalidateState(res.data.profile.id);
      setIsFormOpen(false);
      setSelectedPersonnel(null);
      toast("Profile Updated", "Officer details saved successfully.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to update profile.";
      toast("Update Failed", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => personnelService.deletePersonnel(id),
    onSuccess: () => {
      invalidateState();
      setIsDeleteOpen(false);
      setPersonnelToDelete(null);
      toast("Officer Removed", "Personnel profile deleted from database registry.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to delete personnel. They may have active assignments.";
      toast("Removal Failed", msg, "error");
    },
  });

  const handleEnrollClick = () => {
    setSelectedPersonnel(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (officer: Personnel) => {
    setSelectedPersonnel(officer);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (officer: Personnel) => {
    setPersonnelToDelete(officer);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: PersonnelFormValues) => {
    if (selectedPersonnel) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Forms & Dialogs */}
      <PersonnelDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onConfirm={handleFormSubmit}
        personnel={selectedPersonnel}
        unitOptions={unitOptions}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (personnelToDelete) {
            await deleteMutation.mutateAsync(personnelToDelete.id);
          }
        }}
        title="Delete Personnel Record"
        description={`Are you sure you want to delete ${personnelToDelete?.rank} ${personnelToDelete?.lastName}? This action will permanently decommission their service file.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Personnel active roster</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage active duty officers, verify command ranks, and review unit division coordinates.</p>
        </div>
        <Button
          onClick={handleEnrollClick}
          className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
        >
          <PlusCircle className="h-4 w-4" />
          Enroll Personnel
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
            placeholder="Search roster by rank, name, or service number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A]"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs font-semibold focus:outline-none focus:border-[#2F4F3A]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Duty</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DEPLOYED">Deployed</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>

          <select
            value={unitFilter}
            onChange={(e) => {
              setUnitFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs font-semibold focus:outline-none focus:border-[#2F4F3A] max-w-[200px]"
          >
            <option value="ALL">All Units</option>
            {unitOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster List / Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {personnelQuery.isLoading ? (
          <div className="py-12 flex justify-center items-center text-muted-foreground font-semibold">
            Loading active personnel directory...
          </div>
        ) : roster.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-center">
            <ShieldAlert className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
            <span className="font-bold uppercase tracking-wider text-[10px]">No personnel matches found</span>
            <p className="mt-1 text-xs">Verify service numbers or check spelling configuration.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Service Number</th>
                  <th className="py-3 px-4">Officer Name</th>
                  <th className="py-3 px-4">HQ Email</th>
                  <th className="py-3 px-4">Roster Phone</th>
                  <th className="py-3 px-4">Command Unit</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
                {roster.map((officer) => (
                  <tr key={officer.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <span>{officer.serviceNumber}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {officer.rank} {officer.lastName}, {officer.firstName}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {officer.email || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {officer.phone || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {officer.unit?.name || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[9px] uppercase border ${
                        officer.status === "ACTIVE"
                          ? "bg-green-500/10 text-[#2E7D32] border-green-500/20"
                          : officer.status === "DEPLOYED"
                          ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                          : "bg-[#7F8C8D]/10 text-[#7F8C8D] border-[#7F8C8D]/20"
                      }`}>
                        {officer.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(officer)}
                          className="p-1.5 text-muted-foreground hover:text-[#2F4F3A] transition-colors rounded hover:bg-[#F5F5F2] dark:hover:bg-[#0B120E]"
                          title="Edit Officer Profile"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(officer)}
                          className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded hover:bg-[#F5F5F2] dark:hover:bg-[#0B120E]"
                          title="Deenroll Officer"
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
