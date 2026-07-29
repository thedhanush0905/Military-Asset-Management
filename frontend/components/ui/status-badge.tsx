"use client";

import React from "react";
import { formatStatus } from "@/utils/format-status";
import { EquipmentStatus } from "@/types/common";
import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  status: EquipmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, colorClass } = formatStatus(status);

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium uppercase tracking-wide border shadow-sm",
      colorClass,
      className
    )}>
      <span className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 opacity-80" />
      {label}
    </span>
  );
}
