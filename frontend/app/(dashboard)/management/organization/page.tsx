"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "@/services/organization.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Shield, PlusCircle, Edit3, Trash2, ChevronRight, Users, MapPin, Network, Search } from "lucide-react";
import { UnitDialog, UnitFormValues } from "@/components/ui/dialogs/UnitDialog";
import { DeleteDialog } from "@/components/ui/dialogs/DeleteDialog";
import { Button } from "@/components/ui/button";
import { OrganizationUnit } from "@/types/organization";

export default function OrganizationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnit | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<OrganizationUnit | null>(null);

  const isAdmin = user?.role === "ADMIN";

  // 1. Query live organization tree
  const treeQuery = useQuery({
    queryKey: ["organization", "list"],
    queryFn: () => organizationService.getTree(),
  });

  const rawTree = treeQuery.data?.data || [];

  // Invalidate handler
  const invalidateState = (uId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["organization", "list"] });
    if (uId) {
      queryClient.invalidateQueries({ queryKey: ["organization", "detail", uId] });
    }
  };

  // 2. Mutations
  const createMutation = useMutation({
    mutationFn: (data: UnitFormValues) => organizationService.createUnit(data),
    onSuccess: () => {
      invalidateState();
      setIsFormOpen(false);
      toast("Unit Established", "Organizational unit created successfully.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to create unit.";
      toast("Creation Failed", msg, "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UnitFormValues) =>
      organizationService.updateUnit(selectedUnit!.id, data),
    onSuccess: (res) => {
      invalidateState(res.data.unit.id);
      setIsFormOpen(false);
      setSelectedUnit(null);
      toast("Unit Updated", "Organizational changes saved successfully.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to update unit.";
      toast("Save Failed", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationService.deleteUnit(id),
    onSuccess: () => {
      invalidateState();
      setIsDeleteOpen(false);
      setUnitToDelete(null);
      toast("Unit Deestablished", "Organizational unit deleted from registry.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete unit. Ensure it has no children or personnel.";
      toast("Deletion Failed", msg, "error");
    },
  });

  // Flat list of units to choose as parent options
  const parentOptions = useMemo(() => {
    const list: Array<{ value: string; label: string }> = [];
    const traverse = (node: OrganizationUnit) => {
      // Prevent selecting yourself as parent
      if (!selectedUnit || selectedUnit.id !== node.id) {
        list.push({ value: node.id, label: `${node.name} (${node.level})` });
      }
      if (node.children && node.children.length > 0) {
        node.children.forEach(traverse);
      }
    };
    rawTree.forEach(traverse);
    return list;
  }, [rawTree, selectedUnit]);

  // Action triggers
  const handleCreateRoot = () => {
    setSelectedUnit(null);
    setDefaultParentId(null);
    setIsFormOpen(true);
  };

  const handleCreateChild = (parentId: string) => {
    setSelectedUnit(null);
    setDefaultParentId(parentId);
    setIsFormOpen(true);
  };

  const handleEditClick = (unit: OrganizationUnit) => {
    setSelectedUnit(unit);
    setDefaultParentId(null);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (unit: OrganizationUnit) => {
    setUnitToDelete(unit);
    setIsDeleteOpen(true);
  };

  const handleFormConfirm = async (data: UnitFormValues) => {
    if (selectedUnit) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync({
        ...data,
        parentId: data.parentId || defaultParentId || null,
      });
    }
  };

  // Helper to check if a node or its children match search filter
  const filterTree = (nodes: OrganizationUnit[], query: string): OrganizationUnit[] => {
    if (!query) return nodes;
    const cleanQuery = query.toLowerCase();

    const result: OrganizationUnit[] = [];
    for (const node of nodes) {
      const matchesSelf =
        node.name.toLowerCase().includes(cleanQuery) ||
        node.code.toLowerCase().includes(cleanQuery) ||
        node.level.toLowerCase().includes(cleanQuery);

      const filteredChildren = node.children ? filterTree(node.children, query) : [];

      if (matchesSelf || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren,
        });
      }
    }
    return result;
  };

  const filteredTree = useMemo(() => {
    return filterTree(rawTree, search);
  }, [rawTree, search]);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: OrganizationUnit, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-3">
        {/* Node Box */}
        <div
          className={`flex items-start gap-4 p-4 border rounded-[10px] transition-all hover:border-[#2F4F3A]/40 bg-white dark:bg-[#0B120E] ${
            depth === 0
              ? "border-[#2F4F3A] bg-[#EFF1EF]/10 dark:bg-[#1A2820]/10"
              : "border-[#E6E8E6] dark:border-[#22352B]"
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className={`h-8 w-8 rounded-[6px] flex items-center justify-center shrink-0 ${
            depth === 0 ? "bg-[#2F4F3A] text-white" : "bg-[#EFF1EF] dark:bg-[#1A2820] text-muted-foreground"
          }`}>
            {depth === 0 ? <Shield className="h-4.5 w-4.5" /> : <ChevronRight className="h-4 w-4" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-[#1A2820] dark:text-[#F5F5F2] uppercase tracking-wider">
                {node.name}
              </span>
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E6E8E6]/60 dark:bg-[#22352B]/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                {node.code}
              </span>
              <span className="px-1.5 py-0.5 rounded-[4px] bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-[#2E7D32]">
                {node.level}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-semibold">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Base Context: Fort Braxton</span>
              </div>
            </div>
          </div>

          {/* Action Row (RBAC Admin protected) */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCreateChild(node.id)}
                className="p-1.5 text-[#2F4F3A] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] rounded transition-colors"
                title="Add Sub-Unit Node"
              >
                <PlusCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEditClick(node)}
                className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] rounded transition-colors"
                title="Edit Unit Details"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDeleteClick(node)}
                className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] rounded transition-colors"
                title="Delete Unit Node"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Children Render */}
        {hasChildren && (
          <div className="relative pl-4 border-l border-[#E6E8E6]/80 dark:border-[#22352B]/80 space-y-3">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialog Controls */}
      <UnitDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onConfirm={handleFormConfirm}
        unit={selectedUnit}
        parentOptions={parentOptions}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (unitToDelete) {
            await deleteMutation.mutateAsync(unitToDelete.id);
          }
        }}
        title="Deestablish Command Unit"
        description={`Are you sure you want to deestablish ${unitToDelete?.name}? This node and all its connection mappings will be deleted.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Operational Command Tree</h1>
          <p className="text-xs text-muted-foreground mt-1">Hierarchical tree of division structures, active commanding officers, base allocations, and manpower coordinates.</p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleCreateRoot}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Establish Command HQ
          </Button>
        )}
      </div>

      {/* Search Filter Bar */}
      <div className="flex bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search hierarchy tree by command level, code, or unit name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A]"
          />
        </div>
      </div>

      {/* Hierarchy Render Box */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm">
        {treeQuery.isLoading ? (
          <div className="py-12 flex justify-center items-center text-muted-foreground font-semibold">
            Loading command tree hierarchy...
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-center">
            <Network className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
            <span className="font-bold uppercase tracking-wider text-[10px]">No command nodes found</span>
            <p className="mt-1 text-xs">Establish a new command hierarchy to log organization divisions.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTree.map((root) => renderTreeNode(root, 0))}
          </div>
        )}
      </div>
    </div>
  );
}
