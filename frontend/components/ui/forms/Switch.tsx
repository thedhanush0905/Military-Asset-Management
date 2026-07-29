"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              ref={ref}
              className="sr-only peer"
              {...props}
            />
            <div className="w-10 h-6 bg-[#E6E8E6] dark:bg-[#22352B] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2F4F3A] dark:peer-checked:bg-[#4F7F60]" />
          </div>
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

Switch.displayName = "Switch";
