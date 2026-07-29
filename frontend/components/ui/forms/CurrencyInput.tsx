"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
            $
          </span>
          <input
            type="number"
            ref={ref}
            className={cn(
              "w-full pl-7 pr-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-sm placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] dark:focus:border-[#4F7F60] focus:ring-1 focus:ring-[#2F4F3A] disabled:opacity-50 disabled:bg-muted/30",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
