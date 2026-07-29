"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditLogService, AuditLogListParams } from "@/services/audit-log.service";
import { AuditLog } from "@/types/audit";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/format-date";
import { Database, Search, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

// Centralized formatting and styling helpers
const formatOperationLabel = (action: string) => {
  if (!action) return "";
  
  const labels: Record<string, string> = {
    LOGIN: "Login",
    LOGOUT: "Logout",
    EQUIPMENT_CREATE: "Equipment Created",
    EQUIPMENT_UPDATE: "Equipment Updated",
    EQUIPMENT_DELETE: "Equipment Deleted",
    ASSET_CREATE: "Asset Created",
    ASSET_ASSIGN: "Asset Assigned",
    ASSET_RETURN: "Asset Returned",
    ASSET_TRANSFER: "Asset Transferred",
    ASSET_DISPOSAL: "Asset Disposed",
    ASSIGNMENT_CREATE: "Assignment Created",
    ASSIGNMENT_RETURN: "Assignment Returned",
    MAINTENANCE_SCHEDULE: "Maintenance Scheduled",
    MAINTENANCE_START: "Maintenance Started",
    MAINTENANCE_COMPLETE: "Maintenance Completed",
    MAINTENANCE_CANCEL: "Maintenance Cancelled",
    TRANSFER_CREATE: "Transfer Created",
    TRANSFER_APPROVE: "Transfer Approved",
    TRANSFER_DISPATCH: "Transfer Dispatched",
    TRANSFER_RECEIVE: "Transfer Received",
    TRANSFER_REJECT: "Transfer Rejected",
    TRANSFER_CANCEL: "Transfer Cancelled",
    PROCUREMENT_CREATE: "Procurement Requested",
    PROCUREMENT_APPROVE: "Procurement Approved",
    PROCUREMENT_RECEIVE: "Procurement Received",
    PROCUREMENT_CANCEL: "Procurement Cancelled",
    DISPOSAL_CREATE: "Disposal Requested",
    DISPOSAL_APPROVE: "Disposal Approved",
    DISPOSAL_COMPLETE: "Disposal Completed",
    DISPOSAL_CANCEL: "Disposal Cancelled",
    SUPPLIER_CREATE: "Supplier Created",
    SUPPLIER_UPDATE: "Supplier Updated",
    SUPPLIER_DELETE: "Supplier Deleted",
    USER_CREATE: "User Created",
    USER_UPDATE: "User Updated",
    USER_DELETE: "User Deleted",
    BASE_CREATE: "Base Created",
    BASE_UPDATE: "Base Updated",
    BASE_DELETE: "Base Deleted",
    CONFIG_CREATE: "Setting Parameter Added",
    CONFIG_UPDATE: "Setting Parameter Saved",
    CONFIG_DELETE: "Setting Parameter Deleted",
  };

  if (labels[action]) return labels[action];
  
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatTargetEntity = (log: AuditLog) => {
  const type = log.entityType;
  const idShort = log.entityId.slice(-8).toUpperCase();
  
  const details = (log.newValues || log.oldValues || {}) as Record<string, string | undefined>;
  const readableId = 
    details.serialNumber || 
    details.procurementNumber || 
    details.code || 
    details.transferNumber ||
    details.assignmentNumber;

  if (readableId) {
    return `${type} (${readableId})`;
  }
  return `${type} (${idShort})`;
};

const getResultBadgeStyles = (result: string) => {
  const normalized = result.toUpperCase();
  if (normalized === "SUCCESS") {
    return "bg-green-500/10 text-[#2E7D32] border-green-500/20";
  }
  if (normalized === "PENDING") {
    return "bg-blue-500/10 text-[#2563EB] border-blue-500/20";
  }
  if (normalized === "WARNING") {
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
  if (normalized === "FAILED" || normalized === "FAILURE") {
    return "bg-red-500/10 text-red-600 border-red-500/20";
  }
  return "bg-gray-500/10 text-gray-600 border-gray-500/20";
};

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");
  const [resultFilter, setResultFilter] = useState<string>("ALL");
  const limit = 20;

  // 1. Query Audit Logs
  const queryParams = useMemo((): AuditLogListParams => {
    return {
      page,
      limit,
      search: search.trim() || undefined,
      module: moduleFilter === "ALL" ? undefined : moduleFilter,
      result: resultFilter === "ALL" ? undefined : (resultFilter as "SUCCESS" | "FAILURE"),
    };
  }, [page, search, moduleFilter, resultFilter]);

  const auditQuery = useQuery({
    queryKey: ["audit", "list", queryParams],
    queryFn: () => auditLogService.getAuditLogs(queryParams),
  });

  const logs = auditQuery.data?.data?.logs || [];
  const pagination = auditQuery.data?.data?.pagination;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Change Ledger & Audit Logs</h1>
          <p className="text-xs text-muted-foreground mt-1">Audit active system database mutations, trace administrator IP signatures, and log database health.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search logs by action, username, or entity ID..."
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
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Modules</option>
            <option value="AUTH">Authentication</option>
            <option value="ASSET">Equipment Assets</option>
            <option value="INVENTORY">Depot Inventory</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="TRANSFER">Transfers</option>
            <option value="PROCUREMENT">Procurement</option>
            <option value="DISPOSAL">Disposal</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => {
              setResultFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILURE">Failures Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {auditQuery.isLoading ? (
          <div className="py-12 text-center text-muted-foreground font-semibold">
            Retrieving ledger transactions...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-center">
            <ShieldAlert className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
            <span className="font-bold uppercase tracking-wider text-[10px]">No ledger logs found</span>
            <p className="mt-1 text-xs">Verify your search keywords or parameters.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Audit ID</th>
                  <th className="py-3 px-4">Log Module</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-muted-foreground">
                      {log.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>{log.module}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1A2820] dark:text-[#F5F5F2]">
                      {formatOperationLabel(log.action)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      {log.user ? (
                        <div>
                          <div className="font-bold text-[#1A2820] dark:text-[#F5F5F2]">{log.user.name}</div>
                          <div className="text-[10px] text-muted-foreground font-bold">{log.user.role}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">System</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#1A2820] dark:text-[#F5F5F2]">
                      {formatTargetEntity(log)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                      {log.ipAddress || "System"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-semibold">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[4px] font-black text-[9px] uppercase border ${getResultBadgeStyles(log.result)}`}>
                        {log.result === "SUCCESS" ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {log.result.toLowerCase()}
                      </span>
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
