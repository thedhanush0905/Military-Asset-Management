"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            ref={ref}
            className={cn(
              "h-4 w-4 rounded border-[#E6E8E6] dark:border-[#22352B] text-[#2F4F3A] focus:ring-[#2F4F3A] accent-[#2F4F3A] disabled:opacity-50",
              error && "border-destructive focus:ring-destructive",
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm font-medium text-[#1A2820] dark:text-[#F5F5F2]">
              {label}
            </span>
          )}
        </label>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
