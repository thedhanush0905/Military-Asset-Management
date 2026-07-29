"use client";

import React from "react";
import { CardSkeleton } from "./CardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 h-80 flex flex-col gap-4">
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-[6px]" />
        </div>
        <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 h-80 flex flex-col gap-4">
          <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-[6px]" />
        </div>
      </div>
    </div>
  );
}
