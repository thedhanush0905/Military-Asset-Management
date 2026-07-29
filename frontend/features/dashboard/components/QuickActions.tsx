"use client";

import React from "react";
import { UserCheck, Truck, Wrench, ClipboardCheck, FileText, PlusCircle } from "lucide-react";

interface QuickActionsProps {
  onAssignAsset?: () => void;
  onTransferAsset?: () => void;
  onBookMaintenance?: () => void;
  onLogInspection?: () => void;
  onGenerateReport?: () => void;
  onAddCatalogItem?: () => void;
}

export function QuickActions({
  onAssignAsset,
  onTransferAsset,
  onBookMaintenance,
  onLogInspection,
  onGenerateReport,
  onAddCatalogItem,
}: QuickActionsProps) {
  const actions = [
    {
      label: "Assign Asset",
      description: "Deploy equipment to personnel",
      icon: UserCheck,
      color: "bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/25",
      onClick: onAssignAsset,
    },
    {
      label: "Request Transfer",
      description: "Dispatch units between bases",
      icon: Truck,
      color: "bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/25",
      onClick: onTransferAsset,
    },
    {
      label: "Book Maintenance",
      description: "Schedule repairs or checkups",
      icon: Wrench,
      color: "bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/25",
      onClick: onBookMaintenance,
    },
    {
      label: "Log Inspection",
      description: "Log safety check findings",
      icon: ClipboardCheck,
      color: "bg-[#2E7D32]/10 text-[#2E7D32] hover:bg-[#2E7D32]/25",
      onClick: onLogInspection,
    },
    {
      label: "Generate Report",
      description: "Compile database statistics",
      icon: FileText,
      color: "bg-[#556B2F]/10 text-[#556B2F] hover:bg-[#556B2F]/25",
      onClick: onGenerateReport,
    },
    {
      label: "Add Catalog Item",
      description: "Add new equipment specs",
      icon: PlusCircle,
      color: "bg-[#1A2820]/10 text-[#1A2820] dark:bg-[#F5F5F2]/10 dark:text-[#F5F5F2] hover:bg-[#1A2820]/25",
      onClick: onAddCatalogItem,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/75 mb-4 border-b border-[#E6E8E6] dark:border-[#22352B] pb-2">
        Operational Quick Links
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={act.onClick}
              className="flex items-center gap-4 w-full p-3.5 rounded-[10px] text-left bg-[#F5F5F2] dark:bg-[#0B120E]/50 border border-[#E6E8E6] dark:border-[#22352B] transition-all duration-150 hover:scale-[1.01] hover:border-[#2F4F3A]/30 dark:hover:border-[#4F7F60]/40 hover:bg-white dark:hover:bg-[#111B15] hover:shadow-[0_4px_12px_rgba(26,40,32,0.03)] cursor-pointer group"
            >
              <div className={`h-9 w-9 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${act.color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-[#1A2820] dark:text-[#F5F5F2] group-hover:text-[#2F4F3A] dark:group-hover:text-[#4F7F60] transition-colors">
                  {act.label}
                </div>
                <div className="text-[11px] text-muted-foreground/70 font-normal truncate mt-0.5">{act.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
