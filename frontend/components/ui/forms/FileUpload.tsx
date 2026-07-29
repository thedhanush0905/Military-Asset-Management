"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/utils/cn";
import { Upload, X } from "lucide-react";

interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  onFileSelect?: (file: File | null) => void;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ label, error, helperText, onFileSelect, className, ...props }, ref) => {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (file) {
        setFileName(file.name);
        if (onFileSelect) onFileSelect(file);
      }
    };

    const handleClear = () => {
      setFileName(null);
      if (onFileSelect) onFileSelect(null);
    };

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {fileName ? (
            <div className="flex items-center justify-between px-3 py-2 border border-[#2F4F3A] rounded-[10px] bg-white dark:bg-[#111B15] text-sm">
              <span className="text-[#2F4F3A] dark:text-[#4F7F60] truncate">{fileName}</span>
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className={cn(
              "flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-sm cursor-pointer hover:border-[#2F4F3A] dark:hover:border-[#4F7F60]",
              error && "border-destructive hover:border-destructive"
            )}>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">Choose file or drag here</span>
              <input
                type="file"
                ref={ref}
                className="sr-only"
                onChange={handleFileChange}
                {...props}
              />
            </label>
          )}
        </div>
        {error && <span className="text-xs text-destructive font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-muted-foreground">{helperText}</span>}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";
