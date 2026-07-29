"use client";

import React from "react";

export function AssetDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse w-full">
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 h-48 bg-gray-200 dark:bg-gray-800 rounded-[10px]" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-6 w-1/3 bg-gray-300 dark:bg-gray-700 rounded-[6px]" />
          <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-[6px]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-[4px]" />
                <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded-[4px]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-b border-[#E6E8E6] dark:border-[#22352B] flex gap-4 pb-2">
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-[4px]" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-[4px]" />
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-[4px]" />
      </div>
      <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 h-60">
        <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 rounded-[6px] mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-900 rounded-[4px]" />
          <div className="h-4 w-5/6 bg-gray-100 dark:bg-gray-900 rounded-[4px]" />
          <div className="h-4 w-4/5 bg-gray-100 dark:bg-gray-900 rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}
