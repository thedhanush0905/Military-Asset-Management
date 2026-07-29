"use client";

import React from "react";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F2] dark:bg-[#0B120E] p-8">
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
