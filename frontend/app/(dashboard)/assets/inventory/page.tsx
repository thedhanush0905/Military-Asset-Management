"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventory.service";
import { baseService } from "@/services/base.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  SlidersHorizontal, 
  Search, 
  PlusCircle, 
  AlertTriangle, 
  Archive,
  RotateCw
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export default function InventoryControlPage() {
  const { toast } = useToast();

  // Search & Filtering States
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [baseFilter, setBaseFilter] = useState("ALL");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Queries
  const inventoryQuery = useQuery({
    queryKey: ["inventory", "list", { page, limit, search, baseId: baseFilter }],
    queryFn: () => inventoryService.getInventories({
      page,
      limit,
      search: search || undefined,
      baseId: baseFilter === "ALL" ? undefined : baseFilter,
    }),
  });

  const basesQuery = useQuery({
    queryKey: ["bases", "list", { limit: 100 }],
    queryFn: () => baseService.getBases({ limit: 100 }),
  });

  const baseOptions = useMemo(() => {
    return (basesQuery.data?.data?.bases || []).map((b) => ({
      value: b.id,
      label: b.name,
    }));
  }, [basesQuery.data]);

  const inventories = inventoryQuery.data?.data?.inventories || [];
  const pagination = inventoryQuery.data?.data?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const isLoading = inventoryQuery.isLoading;

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Inventory & Depot Control</h1>
          <p className="text-xs text-muted-foreground mt-1">Monitor bulk reserves, check critical reorder thresholds, and log stock coordinates.</p>
        </div>
        <Button
          onClick={() => {
            toast("Manual Replenishment", "Opening master supply requisition logs wizard.", "info");
          }}
          className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 px-4 py-2 rounded-[10px]"
        >
          <PlusCircle className="h-4 w-4" />
          Request Stock Reorder
        </Button>
      </div>

      {/* Control Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-4 shadow-sm">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search depot supplies by equipment model or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2] dark:bg-[#0B120E] text-[#111B15] dark:text-[#F5F5F2] text-xs placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] focus:ring-1 focus:ring-[#2F4F3A]"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold">
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span>Filters:</span>
          </div>
          <select
            value={baseFilter}
            onChange={(e) => {
              setBaseFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#2F4F3A]"
          >
            <option value="ALL">All Bases</option>
            {baseOptions.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            onClick={() => inventoryQuery.refetch()}
            className="p-2 border-[#E6E8E6] dark:border-[#22352B]"
            title="Refresh Data"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Roster Data Table */}
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm overflow-x-auto">
        {isLoading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E8E6] dark:border-[#22352B] text-muted-foreground uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Depot Item Spec</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4 text-right">Available Qty</th>
                <th className="py-3 px-4 text-right">Allocated</th>
                <th className="py-3 px-4 text-right">In Transit</th>
                <th className="py-3 px-4 text-right">Maint. / Damaged</th>
                <th className="py-3 px-4 text-right">Total Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
              {inventories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground font-semibold">
                    No depot inventory records registered.
                  </td>
                </tr>
              ) : (
                inventories.map((item) => {
                  const isLowStock = item.quantity < item.minimumStock;
                  return (
                    <tr key={item.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#1A2820] dark:text-[#F5F5F2]">
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-bold">{item.equipment?.name || "Unknown Spec"}</div>
                            <div className="text-[10px] text-muted-foreground font-bold">{item.equipment?.model}</div>
                          </div>
                          {isLowStock && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-[4px] bg-destructive/10 text-destructive font-black text-[9px] uppercase border border-destructive/20 animate-pulse">
                              <AlertTriangle className="h-3 w-3" />
                              Critical Low
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-muted-foreground">
                        {item.base?.name || "HQ Depot"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-[#2E7D32]">
                        {item.availableQuantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-muted-foreground">
                        {item.allocatedQuantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-muted-foreground">
                        {item.inTransitQuantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-muted-foreground">
                        {item.maintenanceQuantity + item.damagedQuantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-[#1A2820] dark:text-[#F5F5F2]">
                        {item.quantity}
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
              Showing page {page} of {totalPages} ({total} lines)
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
    </div>
  );
}
