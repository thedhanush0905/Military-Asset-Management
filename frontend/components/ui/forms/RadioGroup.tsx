"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface Option {
  value: string;
  label: string;
}

interface RadioGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  options: Option[];
  error?: string;
  selectedValue?: string;
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ label, options, error, selectedValue, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                ref={ref}
                value={opt.value}
                checked={selectedValue === opt.value}
                className={cn(
                  "h-4 w-4 border-[#E6E8E6] dark:border-[#22352B] text-[#2F4F3A] focus:ring-[#2F4F3A] accent-[#2F4F3A]",
                  className
                )}
                {...props}
              />
              <span className="text-sm font-medium text-[#1A2820] dark:text-[#F5F5F2]">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
