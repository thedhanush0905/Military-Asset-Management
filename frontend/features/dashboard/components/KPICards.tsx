"use client";

import React from "react";
import { Shield, CheckCircle2, UserCheck, Wrench, Truck, ShoppingBag, MapPin, Users } from "lucide-react";

interface KPICardsProps {
  metrics: {
    totalAssets: number;
    availableAssets: number;
    assignedAssets: number;
    maintenanceAssets: number;
    transfersAssets: number;
    procurementAssets: number;
    basesCount: number;
    personnelCount: number;
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    {
      label: "Total Assets",
      value: metrics.totalAssets.toLocaleString(),
      icon: Shield,
      color: "text-[#1A2820] dark:text-[#F5F5F2]"
    },
    {
      label: "Available",
      value: metrics.availableAssets.toLocaleString(),
      icon: CheckCircle2,
      color: "text-[#2E7D32] dark:text-[#4F7F60]"
    },
    {
      label: "Assigned",
      value: metrics.assignedAssets.toLocaleString(),
      icon: UserCheck,
      color: "text-[#2563EB]"
    },
    {
      label: "Maintenance",
      value: metrics.maintenanceAssets.toLocaleString(),
      icon: Wrench,
      color: "text-[#F59E0B]"
    },
    {
      label: "Transfers",
      value: metrics.transfersAssets.toLocaleString(),
      icon: Truck,
      color: "text-[#7C3AED]"
    },
    {
      label: "Procurement",
      value: metrics.procurementAssets.toLocaleString(),
      icon: ShoppingBag,
      color: "text-[#556B2F] dark:text-[#A4B29E]"
    },
    {
      label: "Active Bases",
      value: metrics.basesCount.toLocaleString(),
      icon: MapPin,
      color: "text-[#1A2820] dark:text-[#F5F5F2]"
    },
    {
      label: "Personnel",
      value: metrics.personnelCount.toLocaleString(),
      icon: Users,
      color: "text-[#1A2820] dark:text-[#F5F5F2]"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-5 flex flex-col justify-between h-28 hover:border-[#2F4F3A] dark:hover:border-[#4F7F60] transition-all duration-200 hover:shadow-md cursor-default group"
          >
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">{card.label}</span>
              <Icon className="h-4 w-4 shrink-0 opacity-40 group-hover:opacity-75 transition-opacity" />
            </div>
            <div className="my-1">
              <span className={`text-2xl font-bold tracking-tight ${card.color}`}>
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
