"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, className, type = "text", ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-medium text-[#1A2820] dark:text-[#F5F5F2] tracking-[0.12em] uppercase">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-sm placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] dark:focus:border-[#4F7F60] focus:ring-1 focus:ring-[#2F4F3A] disabled:opacity-50 disabled:bg-muted/30",
            error && "border-destructive focus:border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        />
        {error && <span className="text-[12px] text-destructive font-medium">{error}</span>}
        {!error && helperText && <span className="text-[12px] text-muted-foreground/80">{helperText}</span>}
      </div>
    );
  }
);

FormField.displayName = "FormField";
