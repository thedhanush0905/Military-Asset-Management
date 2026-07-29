"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, icon: Icon, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] min-h-[280px] w-full">
      <div className="flex items-center justify-center w-12 h-12 rounded-[10px] bg-[#EFF1EF] dark:bg-[#1A2820] text-[#2F4F3A] dark:text-[#4F7F60] mb-4">
        {Icon ? <Icon className="h-6 w-6" /> : <div className="h-4 w-4 bg-gray-400 rounded" />}
      </div>
      <h3 className="text-sm font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wider uppercase mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} className="bg-[#2F4F3A] text-white hover:bg-[#1A2820] font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-[10px]">
          {actionText}
        </Button>
      )}
    </div>
  );
}
