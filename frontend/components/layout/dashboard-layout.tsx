"use client";

import React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F2] dark:bg-[#0B120E]">
      {/* Dynamic Collapsible Sidebar */}
      <Sidebar />
      
      {/* Right Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-premium p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
