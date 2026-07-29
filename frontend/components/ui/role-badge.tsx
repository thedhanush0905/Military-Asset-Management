"use client";

import React from "react";
import { Role } from "@/types/user";
import { cn } from "@/utils/cn";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  let label = "Logistics Officer";
  let colorClass = "bg-[#EFF1EF] text-[#2F4F3A] border border-[#2F4F3A]/20 dark:bg-[#1A2820] dark:text-[#4F7F60]";

  if (role === "ADMIN") {
    label = "System Admin";
    colorClass = "bg-destructive/10 text-destructive border border-destructive/20";
  } else if (role === "BASE_COMMANDER") {
    label = "Commander";
    colorClass = "bg-info/10 text-info border border-info/20";
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[13px] font-medium tracking-wide border shadow-sm",
      colorClass,
      className
    )}>
      {label}
    </span>
  );
}
