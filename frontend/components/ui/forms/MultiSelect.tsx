"use client";

import React, { useState } from "react";
import { cn } from "@/utils/cn";
import { Check, ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
}

export function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Select options",
  error,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const selectedLabels = options
    .filter((o) => selectedValues.includes(o.value))
    .map((o) => o.label);

  return (
    <div className="w-full flex flex-col gap-1.5 relative">
      {label && (
        <label className="text-xs font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] text-sm text-left focus:outline-none focus:border-[#2F4F3A] dark:focus:border-[#4F7F60]",
            error && "border-destructive"
          )}
        >
          <span className="truncate text-[#111B15] dark:text-[#F5F5F2]">
            {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-white dark:bg-[#111B15] shadow-lg z-20">
              {options.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handleToggleOption(opt.value)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#EFF1EF] dark:hover:bg-[#22352B] text-left text-[#111B15] dark:text-[#F5F5F2]"
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#2F4F3A] dark:text-[#4F7F60]" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
      {error && <span className="text-xs text-destructive font-medium">{error}</span>}
    </div>
  );
}
