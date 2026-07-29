"use client";

import React from "react";

interface ProgressChartProps {
  value: number; // 0 to 100
  label?: string;
  subLabel?: string;
  color?: string;
}

export function ProgressChart({ value, label, subLabel, color = "#2E7D32" }: ProgressChartProps) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full">
      {(label || subLabel) && (
        <div className="flex justify-between items-end mb-1">
          {label && <span className="text-xs font-semibold text-[#1A2820] dark:text-[#F5F5F2]">{label}</span>}
          {subLabel && <span className="text-xs font-medium text-muted-foreground">{subLabel}</span>}
        </div>
      )}
      <div className="w-full bg-[#E6E8E6] dark:bg-[#22352B] rounded-full h-2.5 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
