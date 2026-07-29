"use client";

import React from "react";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
      </div>
      <div className="flex gap-4 mb-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`th-${i}`} className="h-4 flex-1 bg-gray-300 dark:bg-gray-700 rounded-[4px]" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={`tr-${i}`} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={`td-${i}-${j}`} className="h-6 flex-1 bg-gray-200 dark:bg-gray-800 rounded-[4px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
