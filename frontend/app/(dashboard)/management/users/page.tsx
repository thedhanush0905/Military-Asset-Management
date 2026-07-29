"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { userService } from "@/services/user.service";
import { baseService } from "@/services/base.service";
import { UserDialog, UserFormValues } from "@/components/ui/dialogs/UserDialog";
import { RoleBadge } from "@/components/ui/role-badge";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";
import { Lock, ShieldAlert, PlusCircle, Edit2, Search, RotateCw } from "lucide-react";
import { cn } from "@/utils/cn";
import { User, Role, UserStatus } from "@/types/user";

export default function UsersPage() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const permissions = usePermissions();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const limit = 10;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterStatus, setFilterStatus] = useState<UserStatus | "">("");
  const [filterBase, setFilterBase] = useState<string>("");

  const [sortBy, setSortBy] = useState<"name" | "email" | "role" | "status" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch Bases
  const basesQuery = useQuery({
    queryKey: ["bases", "list"],
    queryFn: () => baseService.getBases(),
  });

  const bases = basesQuery.data?.data?.bases || [];

  // Fetch Users
  const usersQuery = useQuery({
    queryKey: [
      "users",
      "list",
      {
        page,
        limit,
        search,
        role: filterRole || undefined,
        status: filterStatus || undefined,
        base: filterBase || undefined,
        sortBy,
        sortOrder,
      },
    ],
    queryFn: () =>
      userService.getUsers({
        page,
        limit,
        search: search || undefined,
        role: filterRole || undefined,
        status: filterStatus || undefined,
        base: filterBase || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const users = usersQuery.data?.data?.users || [];
  const pagination = usersQuery.data?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      toast("Enrollment Successful", "Officer credentials enrolled and registered in active directory.", "success");
      setIsDialogOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Enrollment failed.";
      toast("Enrollment Failed", errMsg, "error");
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormValues> }) => userService.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      if (data.data?.user?.id) {
        queryClient.invalidateQueries({ queryKey: ["users", "detail", data.data.user.id] });
      }
      toast("Update Successful", "Officer details updated successfully.", "success");
      setIsDialogOpen(false);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Update failed.";
      toast("Update Failed", errMsg, "error");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      toast("Credentials Suspended", "Security tokens invalidated. Access deactivated.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || "Deactivation failed.";
      toast("Deactivation Failed", errMsg, "error");
    },
  });

  const handleCreateOrUpdate = async (data: UserFormValues) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          baseId: data.baseId ?? null,
          status: data.status,
        },
      });
    } else {
      await createUserMutation.mutateAsync({
        name: data.name,
        email: data.email,
        role: data.role,
        baseId: data.baseId ?? null,
        password: data.password || "",
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    if (id === currentUser?.id) {
      toast("Action Blocked", "Self-deactivation is prohibited for security safety.", "error");
      return;
    }
    await deactivateMutation.mutateAsync(id);
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const getBaseName = (baseId: string | null) => {
    if (!baseId) return "Joint Command HQ";
    const found = bases.find((b) => b.id === baseId);
    return found ? found.name : "Unknown Base";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "INACTIVE":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "DEACTIVATED":
      default:
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    }
  };

  const isMutationLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">System Access Control</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage active directory credentials, audit role-based access tokens, and revoke clearances.</p>
        </div>
        {permissions.canManageUsers && (
          <Button
            onClick={() => {
              setSelectedUser(null);
              setIsDialogOpen(true);
            }}
            className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
          >
            <PlusCircle className="h-4 w-4" />
            Enroll Credentials
          </Button>
        )}
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs focus:outline-none focus:ring-1 focus:ring-[#2F4F3A]"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value as Role | "");
            setPage(1);
          }}
          className="px-3 py-1.5 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-xs focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">System Admin</option>
          <option value="BASE_COMMANDER">Base Commander</option>
          <option value="LOGISTICS_OFFICER">Logistics Officer</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as UserStatus | "");
            setPage(1);
          }}
          className="px-3 py-1.5 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-xs focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>

        <select
          value={filterBase}
          onChange={(e) => {
            setFilterBase(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-xs focus:outline-none"
        >
          <option value="">All Bases</option>
          {bases.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearchInput("");
            setFilterRole("");
            setFilterStatus("");
            setFilterBase("");
            setSortBy("createdAt");
            setSortOrder("desc");
            setPage(1);
            queryClient.invalidateQueries({ queryKey: ["users", "list"] });
          }}
          className="border-[#E6E8E6] flex items-center gap-1.5 h-8 text-[#1A2820] dark:text-[#E6E8E6]"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {usersQuery.isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : usersQuery.isError ? (
          <div className="text-center py-12 text-destructive font-medium">
            Error loading credentials database. Please check connection and try again.
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-semibold">
            No registered personnel matches current command search filters.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-[#1A2820] dark:hover:text-[#F5F5F2] transition-colors" onClick={() => handleSort("name")}>
                  Officer Name {sortBy === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-[#1A2820] dark:hover:text-[#F5F5F2] transition-colors" onClick={() => handleSort("email")}>
                  Security Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-[#1A2820] dark:hover:text-[#F5F5F2] transition-colors" onClick={() => handleSort("role")}>
                  System Rank / Role {sortBy === "role" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-[#1A2820] dark:hover:text-[#F5F5F2] transition-colors" onClick={() => handleSort("status")}>
                  Status {sortBy === "status" && (sortOrder === "asc" ? "▲" : "▼")}
                </th>
                <th className="py-3 px-4">Base Allocation</th>
                {permissions.canManageUsers && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
              {users.map((userItem) => {
                const isSelf = userItem.id === currentUser?.id;
                return (
                  <tr key={userItem.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2] flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span>{userItem.name} {isSelf && <span className="text-[9px] text-[#2F4F3A] bg-[#EFF1EF] px-1.5 py-0.5 rounded font-bold uppercase ml-1">You</span>}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                      {userItem.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={userItem.role} />
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn("px-2 py-0.5 rounded-[6px] border text-[10px] font-bold uppercase tracking-wider", getStatusColor(userItem.status))}>
                        {userItem.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                      {getBaseName(userItem.baseId)}
                    </td>
                    {permissions.canManageUsers && (
                      <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                        <Button
                          onClick={() => {
                            setSelectedUser(userItem);
                            setIsDialogOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#E6E8E6] hover:bg-muted text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5 text-[#1A2820] dark:text-[#E6E8E6]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>

                        {userItem.status === "ACTIVE" ? (
                          <Button
                            onClick={() => handleDeactivate(userItem.id)}
                            disabled={isSelf || deactivateMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-[#E6E8E6] hover:bg-destructive/5 hover:text-destructive text-[10px] font-bold tracking-wider uppercase rounded-[8px] flex items-center gap-1.5 text-[#1A2820] dark:text-[#E6E8E6]"
                            title={isSelf ? "Self-deactivation is prohibited" : undefined}
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Suspend
                          </Button>
                        ) : (
                          <span className="text-[10px] font-bold text-destructive uppercase tracking-widest py-1.5 px-2 inline-block">
                            deactivated
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {!usersQuery.isLoading && !usersQuery.isError && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
          <div className="text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} officers
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

      {/* Enrollment / Edit Modal */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleCreateOrUpdate}
        user={selectedUser}
        bases={bases}
        isLoading={isMutationLoading}
      />
    </div>
  );
}
