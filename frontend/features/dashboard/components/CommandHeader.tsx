"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface CommandHeaderProps {
  onRefresh?: () => void;
}

export function CommandHeader({ onRefresh }: CommandHeaderProps) {
  const [currentTime, setCurrentTime] = React.useState("");

  React.useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hrs = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const secs = String(d.getSeconds()).padStart(2, "0");
      setCurrentTime(`${day} ${month} ${year} - ${hrs}:${mins}:${secs} ZULU`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-page-title text-[#1A2820] dark:text-[#F5F5F2]">Command Overview</h1>
        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.12em]">
          <span className="flex items-center gap-1.5 bg-blue-500/5 text-[#2563EB] px-2 py-0.5 rounded border border-blue-500/10">
            MISSION: Logistics Shield
          </span>
          <span className="flex items-center gap-1.5 bg-green-500/5 text-[#2E7D32] px-2 py-0.5 rounded border border-green-500/10">
            READINESS: 94.2% OPTIMAL
          </span>
          <span className="text-muted-foreground/80 font-medium bg-[#EFF1EF] dark:bg-[#1A2820] px-2 py-0.5 rounded border border-[#E6E8E6] dark:border-[#22352B]">
            {currentTime || "Loading..."}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="border-[#E6E8E6] text-xs font-semibold tracking-wider uppercase flex items-center gap-1.5 rounded-[10px] h-9"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
