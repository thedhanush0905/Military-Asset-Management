"use client";

import React from "react";
import { ProgressChart } from "@/components/ui/charts/ProgressChart";
import { MapPin } from "lucide-react";

interface Base {
  id: string;
  name: string;
  code: string;
  location: string;
  assetsCount: number;
  readiness: number;
}

interface TopBasesListProps {
  bases: Base[];
}

export function TopBasesList({ bases }: TopBasesListProps) {
  return (
    <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/75 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground/50" />
          Active Bases & Commands
        </h3>
        <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.12em]">HQ Roster</span>
      </div>
      <div className="overflow-x-auto scrollbar-premium">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr>
              <th className="py-2 pr-4">Base Name</th>
              <th className="py-2 px-4 text-right">Assets</th>
              <th className="py-2 pl-4 text-right w-44">Readiness Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E8E6] dark:divide-[#22352B]">
            {bases.map((base) => (
              <tr key={base.id} className="hover:bg-[#EFF1EF]/30 dark:hover:bg-[#1A2820]/30 transition-colors">
                <td className="py-2.5 pr-4 font-semibold text-[#1A2820] dark:text-[#F5F5F2]">
                  <div>{base.name}</div>
                  <div className="text-[11px] text-muted-foreground font-normal mt-0.5">{base.location}</div>
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-muted-foreground">
                  {base.assetsCount.toLocaleString()}
                </td>
                <td className="py-2.5 pl-4">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-24">
                      <ProgressChart value={base.readiness} />
                    </div>
                    <span className="font-semibold text-[11px] text-[#2E7D32] min-w-[36px] text-right">
                      {base.readiness}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
