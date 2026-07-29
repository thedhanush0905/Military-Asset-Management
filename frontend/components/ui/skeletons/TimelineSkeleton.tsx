"use client";

import React from "react";

export function TimelineSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="h-12 w-0.5 bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="flex-1 flex flex-col gap-2 pt-0.5">
            <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-700 rounded-[4px]" />
            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-[4px]" />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-[4px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
