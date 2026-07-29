"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, placeholder = "Select an option", className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-medium text-[#1A2820] dark:text-[#F5F5F2] tracking-[0.12em] uppercase">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-sm focus:outline-none focus:border-[#2F4F3A] dark:focus:border-[#4F7F60] focus:ring-1 focus:ring-[#2F4F3A] disabled:opacity-50 disabled:bg-muted/30",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-[12px] text-destructive font-medium">{error}</span>}
        {!error && helperText && <span className="text-[12px] text-muted-foreground/80">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
