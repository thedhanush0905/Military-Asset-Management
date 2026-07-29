"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { QrCode } from "lucide-react";

interface QRInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  onScanClick?: () => void;
}

export const QRInput = forwardRef<HTMLInputElement, QRInputProps>(
  ({ label, error, helperText, onScanClick, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            ref={ref}
            className={cn(
              "w-full pr-10 pl-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] text-sm placeholder-muted-foreground/60 transition-all focus:outline-none focus:border-[#2F4F3A] dark:focus:border-[#4F7F60] focus:ring-1 focus:ring-[#2F4F3A] disabled:opacity-50 disabled:bg-muted/30",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={onScanClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#2F4F3A] dark:hover:text-[#4F7F60]"
            title="Scan QR Code"
          >
            <QrCode className="h-5 w-5" />
          </button>
        </div>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
      </div>
    );
  }
);

QRInput.displayName = "QRInput";
