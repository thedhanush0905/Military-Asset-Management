"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F2] dark:bg-[#0B120E] text-center p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-[10px] bg-[#EFF1EF] dark:bg-[#1A2820] text-[#F59E0B] mb-4">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="text-sm font-semibold tracking-wider uppercase mb-1">Session Expired</h2>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
        Your active security session has expired or you are unauthorized to access these resources. Please log in again.
      </p>
      <Link href="/login">
        <Button className="bg-[#2F4F3A] text-white hover:bg-[#1A2820] font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-[10px]">
          Sign In
        </Button>
      </Link>
    </div>
  );
}
