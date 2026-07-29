"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "@/services/assignment.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ConfirmationDialog } from "@/components/ui/dialogs";
import { ArrowRightLeft, RotateCw } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export default function AssignmentsPage() {
  const { toast } = useToast();
  const confirm = useConfirmDialog();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;

  // Queries
  const assignmentsQuery = useQuery({
    queryKey: ["assignments", "list", { page, limit, status: "ACTIVE" }],
    queryFn: () => assignmentService.getAssignments({
      page,
      limit,
      status: "ACTIVE",
    }),
  });

  // Mutations
  const returnMutation = useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string | null }) => 
      assignmentService.returnAssignment(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", "list"] });
      queryClient.invalidateQueries({ queryKey: ["assets", "list"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "list"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      toast("Assignment Revoked", "Equipment successfully returned to active base stocks.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || "Failed to return asset.";
      toast("Revoke Failed", errMsg, "error");
    }
  });

  const handleRevoke = (id: string, serial: string) => {
    confirm.open({
      title: "Revoke Active Assignment?",
      description: `Confirm return coordinates for serial ${serial}. This will return the equipment to AVAILABLE inventory state.`,
      onConfirm: async () => {
        await returnMutation.mutateAsync({ id, remarks: "Returned via tactical control dashboard." });
      },
    });
  };

  const assignmentsList = assignmentsQuery.data?.data?.assignments || [];
  const pagination = assignmentsQuery.data?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const isLoading = assignmentsQuery.isLoading;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Active Tactical Deploys</h1>
          <p className="text-xs text-muted-foreground mt-1">Roster of equipment assigned to combat personnel, active duty divisions, or signal commands.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => assignmentsQuery.refetch()}
          className="p-2 border-[#E6E8E6] dark:border-[#22352B]"
          title="Refresh Data"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Roster Data Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Deployment ID</th>
                <th className="py-3 px-4">Equipment / Serial</th>
                <th className="py-3 px-4">Deployed Unit</th>
                <th className="py-3 px-4">Officer In Charge</th>
                <th className="py-3 px-4">Command Base</th>
                <th className="py-3 px-4">Deploy Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
              {assignmentsList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-semibold">
                    No active tactical deployments registered.
                  </td>
                </tr>
              ) : (
                assignmentsList.map((asg) => {
                  const serial = asg.equipmentAsset?.serialNumber || "US-GEN-0000";
                  const name = asg.equipmentAsset?.equipment?.name || "Unknown Spec";
                  const baseName = asg.base?.name || "Depot Command";
                  const officerName = asg.assignedTo || "Officer";

                  return (
                    <tr key={asg.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-muted-foreground">
                        {asg.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                        <div>{name}</div>
                        <div className="text-[10px] text-muted-foreground font-bold">{serial}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">
                        Tactical Unit
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                        {officerName}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                        {baseName}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                        {formatDate(asg.assignedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          onClick={() => handleRevoke(asg.id, serial)}
                          variant="outline"
                          size="sm"
                          className="border-[#E6E8E6] hover:bg-destructive/5 hover:text-destructive text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5 ml-auto"
                          disabled={returnMutation.isPending}
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                          Revoke / Return
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#E6E8E6] dark:border-[#22352B]">
            <span className="text-muted-foreground text-xs font-semibold">
              Showing page {page} of {totalPages} ({total} deployments)
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
      <ConfirmationDialog />
    </div>
  );
}
