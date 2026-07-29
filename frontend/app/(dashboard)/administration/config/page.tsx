"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemConfigService, SystemConfig } from "@/services/system-config.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Settings, PlusCircle, Edit3, Trash2, ShieldAlert, Lock } from "lucide-react";
import { ConfigDialog, ConfigFormValues } from "@/components/ui/dialogs/ConfigDialog";
import { DeleteDialog } from "@/components/ui/dialogs/DeleteDialog";
import { formatDate } from "@/utils/format-date";

export default function ConfigPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<SystemConfig | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<SystemConfig | null>(null);

  const isAdmin = user?.role === "ADMIN";

  // 1. Query System Configurations (only if Admin)
  const configQuery = useQuery({
    queryKey: ["settings", "list"],
    queryFn: () => systemConfigService.getAllConfigs(),
    enabled: isAdmin,
  });

  const configs = configQuery.data?.data || [];

  const invalidateState = (key?: string) => {
    queryClient.invalidateQueries({ queryKey: ["settings", "list"] });
    if (key) {
      queryClient.invalidateQueries({ queryKey: ["settings", "detail", key] });
    }
  };

  // 2. Mutations
  const upsertMutation = useMutation({
    mutationFn: (data: ConfigFormValues) => systemConfigService.upsertConfig(data),
    onSuccess: (res) => {
      invalidateState(res.data.key);
      setIsFormOpen(false);
      setSelectedConfig(null);
      toast("Configuration Saved", "Key parameter upserted successfully.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to save configuration key.";
      toast("Save Failed", msg, "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (key: string) => systemConfigService.deleteConfig(key),
    onSuccess: () => {
      invalidateState();
      setIsDeleteOpen(false);
      setConfigToDelete(null);
      toast("Parameter Deleted", "Configuration parameter deleted successfully.", "success");
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to delete configuration key.";
      toast("Deletion Failed", msg, "error");
    },
  });

  const handleCreateClick = () => {
    setSelectedConfig(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (cfg: SystemConfig) => {
    setSelectedConfig(cfg);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (cfg: SystemConfig) => {
    setConfigToDelete(cfg);
    setIsDeleteOpen(true);
  };

  const handleFormConfirm = async (data: ConfigFormValues) => {
    await upsertMutation.mutateAsync(data);
  };

  // RBAC Access Lock screen if not ADMIN
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-xs">
        <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mb-4">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-extrabold text-[#1A2820] dark:text-[#F5F5F2] uppercase tracking-wider">
          Classified Configuration Lock
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm">
          System settings parameters are restricted to root system administrators. Contact command operations center.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Dialogs */}
      <ConfigDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onConfirm={handleFormConfirm}
        config={selectedConfig}
        isLoading={upsertMutation.isPending}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          if (configToDelete) {
            await deleteMutation.mutateAsync(configToDelete.key);
          }
        }}
        title="Delete System Config Parameter"
        description={`Are you sure you want to delete settings key '${configToDelete?.key}'? Deleting parameters may cause runtime features relying on default thresholds to malfunction.`}
        isLoading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">System Configuration</h1>
          <p className="text-xs text-muted-foreground mt-1">Configure global logistics thresholds, active synchronization parameters, and operational permissions.</p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
        >
          <PlusCircle className="h-4 w-4" />
          Add Settings Parameter
        </Button>
      </div>

      {/* Security warning notice */}
      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-[12px] flex gap-3 text-[10px] text-destructive leading-relaxed max-w-3xl">
        <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
        <div>
          <span className="font-extrabold uppercase tracking-wide block">HQ Security Mandate</span>
          Modifying these thresholds affects real-time logistics analytics across all bases. Ensure settings correspond to correct military specs.
        </div>
      </div>

      {/* Config list table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto max-w-3xl">
        {configQuery.isLoading ? (
          <div className="py-12 text-center text-muted-foreground font-semibold">
            Retrieving settings configurations...
          </div>
        ) : configs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground font-semibold flex flex-col items-center justify-center">
            <Settings className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
            <span className="font-bold uppercase tracking-wider text-[10px]">No settings keys registered</span>
            <p className="mt-1 text-xs">Create custom configuration keys to start.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Configuration Key</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
              {configs.map((cfg) => (
                <tr key={cfg.key} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                    {cfg.key}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#2F4F3A] dark:text-[#556B2F]">
                    {cfg.value}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-semibold max-w-xs truncate">
                    {cfg.description || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                    {formatDate(cfg.updatedAt)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(cfg)}
                        className="p-1.5 text-muted-foreground hover:text-[#2F4F3A] transition-colors rounded hover:bg-[#F5F5F2] dark:hover:bg-[#0B120E]"
                        title="Edit Settings Parameter"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(cfg)}
                        className="p-1.5 text-muted-foreground hover:text-red-600 transition-colors rounded hover:bg-[#F5F5F2] dark:hover:bg-[#0B120E]"
                        title="Delete Key"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
