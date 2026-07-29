"use client";

import React from "react";

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 animate-pulse flex flex-col gap-4">
      <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
      <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-700 rounded-[6px]" />
      <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
    </div>
  );
}
