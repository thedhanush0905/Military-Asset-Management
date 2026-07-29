"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { useAuth } from "@/hooks/use-auth";
import { DonutChart, BarChart, LineChart, AreaChart } from "@/components/ui/charts";
import { cn } from "@/utils/cn";
import { RotateCw, ShieldAlert } from "lucide-react";

export function DashboardCharts() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"status" | "procurement" | "maintenance" | "transfers">("status");

  const isLogisticsOfficer = currentUser?.role === "LOGISTICS_OFFICER";

  // Queries
  const baseSummaryQuery = useQuery({
    queryKey: ["dashboard", "baseSummary"],
    queryFn: () => dashboardService.getBaseSummary(),
  });

  const procurementSummaryQuery = useQuery({
    queryKey: ["dashboard", "procurementSummary"],
    queryFn: () => dashboardService.getProcurementSummary(),
    enabled: activeTab === "procurement" && !isLogisticsOfficer,
    retry: false,
  });

  const maintenanceSummaryQuery = useQuery({
    queryKey: ["dashboard", "maintenanceSummary"],
    queryFn: () => dashboardService.getMaintenanceSummary(),
    enabled: activeTab === "maintenance",
  });

  const transferSummaryQuery = useQuery({
    queryKey: ["dashboard", "transferSummary"],
    queryFn: () => dashboardService.getTransferSummary(),
    enabled: activeTab === "transfers",
  });

  const tabs = [
    { id: "status", label: "Asset Status Breakdowns" },
    { id: "procurement", label: "Procurement Trends" },
    { id: "maintenance", label: "Maintenance Trends" },
    { id: "transfers", label: "Transfer Logistics" },
  ] as const;

  // Process Asset Status Chart
  const baseSummary = baseSummaryQuery.data?.data || [];
  let available = 0, assigned = 0, maintenance = 0, retired = 0;
  baseSummary.forEach((b) => {
    available += b.available;
    assigned += b.assigned;
    maintenance += b.maintenance;
    retired += b.retired;
  });

  const assetStatusChart = [
    { name: "Available", value: available, color: "#2E7D32" },
    { name: "Assigned", value: assigned, color: "#2563EB" },
    { name: "Maintenance", value: maintenance, color: "#F59E0B" },
    { name: "Decommissioned", value: retired, color: "#6B7280" },
  ];

  // Process Procurement Trends
  const rawProcurementTrend = procurementSummaryQuery.data?.data?.trend || [];
  const procurementTrendsChart = rawProcurementTrend.map((t) => {
    const date = new Date(t.month + "-02");
    const monthStr = date.toLocaleString("en-US", { month: "short" });
    return {
      month: monthStr,
      amount: parseFloat(t.totalCost) / 1000000, // Millions USD
    };
  });

  // Process Maintenance Trends
  const rawMaintenanceTrend = maintenanceSummaryQuery.data?.data?.trend || [];
  const maintenanceTrendsChart = rawMaintenanceTrend.map((t) => {
    const date = new Date(t.month + "-02");
    const monthStr = date.toLocaleString("en-US", { month: "short" });
    return {
      month: monthStr,
      cost: parseFloat(t.totalCost),
      count: t.count,
    };
  });

  // Process Transfer Trends
  const rawTransferTrend = transferSummaryQuery.data?.data?.trend || [];
  const transferTrendsChart = rawTransferTrend.map((t) => {
    const date = new Date(t.month + "-02");
    const monthStr = date.toLocaleString("en-US", { month: "short" });
    return {
      month: monthStr,
      requests: t.count,
    };
  });

  return (
    <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-5 shadow-sm flex flex-col">
      {/* Tabs list */}
      <div className="flex border-b border-[#E6E8E6] dark:border-[#22352B] mb-4 overflow-x-auto gap-4 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all whitespace-nowrap cursor-pointer relative",
              activeTab === tab.id
                ? "text-[#2F4F3A] dark:text-[#4F7F60] border-b-2 border-[#2F4F3A] dark:border-[#4F7F60]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Chart view */}
      <div className="w-full">
        {activeTab === "status" && (
          baseSummaryQuery.isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A]" />
              <span>Loading asset breakdown metrics...</span>
            </div>
          ) : baseSummaryQuery.isError ? (
            <div className="text-destructive font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5" />
              Failed to load asset status breakdowns.
            </div>
          ) : available + assigned + maintenance + retired === 0 ? (
            <div className="text-muted-foreground font-medium">No assets registered in the system.</div>
          ) : (
            <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-10 py-1">
              <div className="relative w-[150px] h-[150px] flex items-center justify-center shrink-0">
                <DonutChart 
                  data={assetStatusChart} 
                  height="100%" 
                  showLegend={false}
                  innerRadius="65%"
                  outerRadius="85%"
                />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-6 gap-y-2 lg:self-center w-full lg:w-auto lg:min-w-[160px] text-xs">
                {assetStatusChart.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 justify-center lg:justify-start">
                    <span className="h-3 w-3 rounded-full shrink-0 shadow-sm border border-white/10" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-muted-foreground text-[12px]">{item.name}:</span>
                    <span className="font-extrabold text-[#1A2820] dark:text-[#F5F5F2] text-[13px]">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {activeTab === "procurement" && (
          isLogisticsOfficer ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-[8px] text-amber-800 dark:text-amber-400 gap-2 max-w-md">
              <ShieldAlert className="h-5 w-5" />
              <div className="font-bold text-xs uppercase tracking-wider">Access Restrained</div>
              <p className="text-[11px] leading-relaxed">
                Logistics Officers do not have permission for procurement financial statistics.
              </p>
            </div>
          ) : procurementSummaryQuery.isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A]" />
              <span>Loading procurement financial data...</span>
            </div>
          ) : procurementSummaryQuery.isError ? (
            <div className="text-destructive font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5" />
              Failed to load procurement financial statistics.
            </div>
          ) : procurementTrendsChart.length === 0 ? (
            <div className="text-muted-foreground font-medium">No procurement records registered.</div>
          ) : (
            <div className="w-full">
              <AreaChart
                data={procurementTrendsChart}
                dataKey="amount"
                xAxisKey="month"
                color="#556B2F"
                height={180}
              />
              <div className="text-[9px] text-center text-muted-foreground/60 font-bold mt-1.5 uppercase tracking-widest">
                Total monthly procurement spending (Millions USD)
              </div>
            </div>
          )
        )}

        {activeTab === "maintenance" && (
          maintenanceSummaryQuery.isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A]" />
              <span>Loading maintenance task cycles...</span>
            </div>
          ) : maintenanceSummaryQuery.isError ? (
            <div className="text-destructive font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5" />
              Failed to load maintenance trends.
            </div>
          ) : maintenanceTrendsChart.length === 0 ? (
            <div className="text-muted-foreground font-medium">No maintenance tasks recorded.</div>
          ) : (
            <div className="w-full">
              <BarChart
                data={maintenanceTrendsChart}
                bars={[
                  { key: "count", color: "#F59E0B", label: "Maintenance Tasks" },
                ]}
                xAxisKey="month"
                height={180}
              />
            </div>
          )
        )}

        {activeTab === "transfers" && (
          transferSummaryQuery.isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
              <RotateCw className="h-6 w-6 animate-spin text-[#2F4F3A]" />
              <span>Loading transfer logistics data...</span>
            </div>
          ) : transferSummaryQuery.isError ? (
            <div className="text-destructive font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5" />
              Failed to load transfer logs.
            </div>
          ) : transferTrendsChart.length === 0 ? (
            <div className="text-muted-foreground font-medium">No logistical asset transfers recorded.</div>
          ) : (
            <div className="w-full">
              <LineChart
                data={transferTrendsChart}
                lines={[
                  { key: "requests", color: "#7C3AED", label: "Logistics Requests" },
                ]}
                xAxisKey="month"
                height={180}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
