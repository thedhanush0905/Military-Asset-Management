"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, NotificationListParams } from "@/services/notification.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Check, Trash2, ShieldAlert } from "lucide-react";
import { formatDate } from "@/utils/format-date";
import { DeleteDialog } from "@/components/ui/dialogs";

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const limit = 15;

  // 1. Query Notifications
  const queryParams: NotificationListParams = {
    page,
    limit,
  };

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "list", queryParams],
    queryFn: () => notificationService.getNotifications(queryParams),
    refetchInterval: 30000, // Auto-refresh polling every 30 seconds
  });

  const alerts = notificationsQuery.data?.data?.notifications || [];
  const pagination = notificationsQuery.data?.data?.pagination;

  // Invalidate query cache keys
  const invalidateState = (nId?: string) => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    if (nId) {
      queryClient.invalidateQueries({ queryKey: ["notifications", "detail", nId] });
    }
  };

  // 2. Mutations
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: (res) => {
      invalidateState(res.data.notification.id);
      toast("Alert Acknowledged", "Message marked as read.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to mark read.";
      toast("Action Failed", msg, "error");
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      invalidateState();
      toast("All Read", "Acknowledged all operational alerts.", "success");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to mark all read.";
      toast("Action Failed", msg, "error");
    },
  });

  const clearAlertMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      invalidateState();
      toast("Alert Cleared", "Message removed from active buffers.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to clear notification.";
      toast("Action Failed", msg, "error");
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => notificationService.deleteAllNotifications(),
    onSuccess: () => {
      invalidateState();
      setIsDeleteAllOpen(false);
      toast("Alerts Cleared", "All notifications have been permanently deleted.", "warning");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to delete notifications.";
      toast("Action Failed", msg, "error");
    },
  });

  const handleMarkRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleClearAlert = (id: string) => {
    clearAlertMutation.mutate(id);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Operational Alert Hub</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time mechanical diagnostics, hardware transfers notifications, and administrative approvals requests.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {alerts.length > 0 && (
            <Button
              onClick={() => setIsDeleteAllOpen(true)}
              disabled={deleteAllMutation.isPending || markAllReadMutation.isPending}
              variant="destructive"
              className="text-xs font-bold tracking-wider uppercase rounded-[10px]"
            >
              {deleteAllMutation.isPending ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></span>
                  Deleting...
                </>
              ) : (
                "Delete All Notifications"
              )}
            </Button>
          )}
          <Button
            onClick={() => markAllReadMutation.mutate()}
            disabled={alerts.length === 0 || !alerts.some((a) => !a.isRead) || markAllReadMutation.isPending || deleteAllMutation.isPending}
            variant="outline"
            className="border-[#E6E8E6] text-xs font-bold tracking-wider uppercase rounded-[10px]"
          >
            {markAllReadMutation.isPending ? "Acknowledging..." : "Mark All Acknowledged"}
          </Button>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-4 max-w-3xl">
        {notificationsQuery.isLoading ? (
          <div className="text-center py-12 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] text-muted-foreground font-semibold">
            Checking alert streams...
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] text-muted-foreground font-semibold">
            All system logs cleared. No active notifications.
          </div>
        ) : (
          <>
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 border rounded-[12px] bg-white dark:bg-[#111B15] transition-all flex gap-4 items-start ${
                  alert.isRead 
                    ? "border-[#E6E8E6] dark:border-[#22352B] opacity-75" 
                    : "border-[#2F4F3A] dark:border-[#4F7F60] shadow-sm"
                }`}
              >
                {/* Icon Status */}
                <div className={`h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0 ${
                  alert.priority === "CRITICAL" ? "bg-red-500/10 text-[#DC2626]" :
                  alert.priority === "HIGH" ? "bg-orange-500/10 text-[#F59E0B]" :
                  alert.priority === "MEDIUM" ? "bg-blue-500/10 text-[#2563EB]" :
                  "bg-gray-500/10 text-gray-500"
                }`}>
                  <Bell className="h-4.5 w-4.5" />
                </div>

                {/* Message Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-extrabold text-sm text-[#1A2820] dark:text-[#F5F5F2]">
                      {alert.title}
                    </h3>
                    <span className="text-[9px] text-muted-foreground font-bold whitespace-nowrap">
                      {formatDate(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-[#E6E8E6]/60 dark:border-[#22352B]/60 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Scope: {alert.type}</span>
                    <span>Priority: {alert.priority}</span>
                    {alert.isRead && alert.readAt && (
                      <span className="text-[#2E7D32]">Acknowledged: {formatDate(alert.readAt)}</span>
                    )}
                  </div>
                </div>

                {/* Action Operations */}
                <div className="flex gap-1.5 shrink-0 self-center">
                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="p-1.5 rounded-[6px] hover:bg-[#EFF1EF] dark:hover:bg-[#1A2820] text-[#2E7D32] transition-colors border border-transparent hover:border-[#E6E8E6]"
                      title="Acknowledge Alert"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleClearAlert(alert.id)}
                    className="p-1.5 rounded-[6px] hover:bg-destructive/5 text-destructive transition-colors border border-transparent hover:border-destructive/10"
                    title="Clear Alert Buffer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#E6E8E6] dark:border-[#22352B] max-w-3xl">
                <span className="text-muted-foreground font-semibold">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} alerts total)
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
      <DeleteDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={() => deleteAllMutation.mutate()}
        isLoading={deleteAllMutation.isPending}
        title="Delete All Notifications?"
        description="This will permanently delete all notifications from your account. This action cannot be undone."
      />
    </div>
  );
}
