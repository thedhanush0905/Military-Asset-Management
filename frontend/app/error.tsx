"use client";

import React, { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App Error Boundary caught exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F2] dark:bg-[#0B120E] text-center p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-[10px] bg-destructive/10 text-destructive mb-4">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="text-sm font-semibold tracking-wider uppercase mb-1">System Error Encountered</h2>
      <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
        An unexpected error has disrupted operational database links. Data records remain secure.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} className="bg-[#2F4F3A] text-white hover:bg-[#1A2820] font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-[10px]">
          Retry Link Connection
        </Button>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/dashboard"}
          className="border-[#E6E8E6] text-[#1A2820] dark:text-[#F5F5F2] font-semibold text-xs tracking-wider uppercase px-4 py-2 rounded-[10px]"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
