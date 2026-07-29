"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { TableSkeleton } from "@/components/ui/skeletons/TableSkeleton";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F5F2] dark:bg-[#0B120E] p-8">
        <TableSkeleton rows={8} cols={6} />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
