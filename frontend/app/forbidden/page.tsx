"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F2] dark:bg-[#0B120E] text-center p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-[10px] bg-destructive/10 text-destructive mb-4">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="text-sm font-semibold tracking-wider uppercase mb-1">403 - Clearance Required</h2>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Your active directory account does not have sufficient security clearance to view this operational sector.
      </p>
      <Link href="/dashboard">
        <Button className="bg-[#2F4F3A] text-white hover:bg-[#1A2820] font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-[10px]">
          Return to Command Center
        </Button>
      </Link>
    </div>
  );
}
