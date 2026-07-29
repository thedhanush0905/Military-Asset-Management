"use client";

import React from "react";
import Link from "next/link";
import { UserCheck, Truck, Wrench, ClipboardCheck, Package, Trash2, Bell, Shield, ArrowRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface Activity {
  id: string;
  timestamp?: string;
  time: string;
  title: string;
  user: string;
  description: string;
  type: string;
  entityType?: string;
  entityId?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ASSIGNMENT: UserCheck,
  TRANSFER: Truck,
  MAINTENANCE: Wrench,
  PROCUREMENT: Package,
  INSPECTION: ClipboardCheck,
  DISPOSAL: Trash2,
  NOTIFICATION: Bell,
  SYSTEM: Shield,
};

const colorMap: Record<string, string> = {
  ASSIGNMENT: "bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/25",
  TRANSFER: "bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/25",
  MAINTENANCE: "bg-[#D97706]/10 text-[#D97706] border-[#D97706]/25",
  INSPECTION: "bg-[#059669]/10 text-[#059669] border-[#059669]/25",
  PROCUREMENT: "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/25",
  DISPOSAL: "bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/25",
  NOTIFICATION: "bg-[#DB2777]/10 text-[#DB2777] border-[#DB2777]/25",
  SYSTEM: "bg-gray-500/10 text-gray-500 border-gray-500/25",
};

const stripeColorMap: Record<string, string> = {
  ASSIGNMENT: "border-l-blue-500",
  TRANSFER: "border-l-purple-500",
  MAINTENANCE: "border-l-amber-500",
  INSPECTION: "border-l-emerald-500",
  PROCUREMENT: "border-l-green-500",
  DISPOSAL: "border-l-red-500",
  SUPPLIER: "border-l-cyan-500",
  PERSONNEL: "border-l-indigo-500",
  EQUIPMENT: "border-l-slate-500",
  SYSTEM: "border-l-gray-500",
};

const titleColorMap: Record<string, string> = {
  ASSIGNMENT: "text-blue-600 dark:text-blue-400",
  TRANSFER: "text-purple-600 dark:text-purple-400",
  MAINTENANCE: "text-amber-600 dark:text-amber-400",
  INSPECTION: "text-emerald-600 dark:text-emerald-400",
  PROCUREMENT: "text-green-600 dark:text-green-400",
  DISPOSAL: "text-red-600 dark:text-red-400",
  SUPPLIER: "text-cyan-600 dark:text-cyan-400",
  PERSONNEL: "text-indigo-600 dark:text-indigo-400",
  EQUIPMENT: "text-slate-600 dark:text-slate-400",
  SYSTEM: "text-gray-600 dark:text-gray-400",
};

const moduleStyles: Record<string, { bg: string; text: string; border: string; icon: string; label: string }> = {
  ASSIGNMENT: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200/50 dark:border-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: "👤", label: "Assignment" },
  TRANSFER: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200/50 dark:border-purple-900/30", text: "text-purple-700 dark:text-purple-400", icon: "🚚", label: "Transfer" },
  MAINTENANCE: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200/50 dark:border-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: "🔧", label: "Maintenance" },
  INSPECTION: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200/50 dark:border-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: "📋", label: "Inspection" },
  PROCUREMENT: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200/50 dark:border-green-900/30", text: "text-green-700 dark:text-green-400", icon: "📦", label: "Procurement" },
  DISPOSAL: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200/50 dark:border-red-900/30", text: "text-red-700 dark:text-red-400", icon: "🗑", label: "Disposal" },
  SUPPLIER: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200/50 dark:border-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400", icon: "🏢", label: "Supplier" },
  PERSONNEL: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200/50 dark:border-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", icon: "👥", label: "Personnel" },
  EQUIPMENT: { bg: "bg-slate-50 dark:bg-slate-950/30", border: "border-slate-200/50 dark:border-slate-900/30", text: "text-slate-700 dark:text-slate-400", icon: "⚙️", label: "Equipment" },
  SYSTEM: { bg: "bg-gray-50 dark:bg-gray-950/30", border: "border-gray-200/50 dark:border-gray-900/30", text: "text-gray-700 dark:text-gray-400", icon: "🛡️", label: "System" },
};

function deriveModule(type?: string, title?: string): string {
  const normType = (type || "").toUpperCase();
  if (normType && moduleStyles[normType]) return normType;

  const normTitle = (title || "").toLowerCase();
  if (normTitle.includes("assign")) return "ASSIGNMENT";
  if (normTitle.includes("transfer")) return "TRANSFER";
  if (normTitle.includes("maintenance")) return "MAINTENANCE";
  if (normTitle.includes("inspection")) return "INSPECTION";
  if (normTitle.includes("procurement")) return "PROCUREMENT";
  if (normTitle.includes("disposal") || normTitle.includes("decommission")) return "DISPOSAL";
  if (normTitle.includes("supplier") || normTitle.includes("vendor")) return "SUPPLIER";
  if (normTitle.includes("personnel") || normTitle.includes("officer")) return "PERSONNEL";
  if (normTitle.includes("equipment") || normTitle.includes("asset") || normTitle.includes("catalog")) return "EQUIPMENT";

  return "SYSTEM";
}

function getEntityRoute(entityType?: string, entityId?: string): string | null {
  if (!entityType) return null;
  const type = entityType.toUpperCase();
  if (type === "ASSIGNMENT" || type === "ASSET_ASSIGN") return "/operations/assignments";
  if (type === "TRANSFER" || type === "ASSET_TRANSFER") return "/operations/transfers";
  if (type === "MAINTENANCE") return "/operations/maintenance";
  if (type === "INSPECTION") return "/operations/inspections";
  if (type === "PROCUREMENT") return "/operations/procurement";
  if (type === "EQUIPMENT" || type === "EQUIPMENT_ASSET" || type === "EQUIPMENTASSET" || type === "ASSET") {
    return entityId ? `/assets/equipment/${entityId}` : "/assets/equipment";
  }
  return null;
}

function formatRelativeTime(timestampString?: string): string {
  if (!timestampString) return "";
  try {
    const date = new Date(timestampString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return "Just now";
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function cleanDescription(desc: string): string {
  if (!desc) return "";
  const cuidRegex = /\b[a-z0-9]{25}\b/gi;
  const uuidRegex = /\b[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\b/gi;
  let cleaned = desc.replace(cuidRegex, (match) => `ID-#${match.slice(-4).toUpperCase()}`);
  cleaned = cleaned.replace(uuidRegex, (match) => `ID-#${match.slice(-4).toUpperCase()}`);
  return cleaned;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, 10);

  return (
    <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] shadow-sm flex flex-col h-full overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-[#111B15] border-b border-[#E6E8E6] dark:border-[#22352B] p-5 pb-3 flex justify-between items-center z-10 shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/75">
          Recent Activity Ledger
        </h3>
        <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-[0.12em]">Realtime Updates</span>
      </div>

      {/* Scrollable Container (Target approximately 8-10 entries visible before scroll) */}
      <div className="flex-1 overflow-y-auto scrollbar-premium p-5 pt-3 space-y-4 max-h-[720px] min-h-0">
        {displayActivities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center">
            <Shield className="h-10 w-10 text-muted-foreground/25 mb-3" />
            <h4 className="text-sm font-bold text-foreground mb-1">No Recent Operational Activity</h4>
            <p className="text-xs text-muted-foreground max-w-xs mb-4">
              Assignments, maintenance, transfers, inspections and procurements will appear here automatically.
            </p>
            <Link
              href="/monitoring/audit-logs"
              className="text-[10px] font-extrabold text-[#2F4F3A] dark:text-[#4F7F60] hover:underline uppercase tracking-wider border border-[#2F4F3A]/30 dark:border-[#4F7F60]/30 px-3 py-1.5 rounded-[6px]"
            >
              View Audit Log
            </Link>
          </div>
        ) : (
          displayActivities.map((act) => {
            const derivedType = deriveModule(act.type, act.title);
            const Icon = iconMap[derivedType] || Shield;
            const timeLabel = formatRelativeTime(act.timestamp) || act.time;
            const derivedStyle = moduleStyles[derivedType] || moduleStyles.SYSTEM;
            const stripeClass = stripeColorMap[derivedType] || stripeColorMap.SYSTEM;
            const titleColorClass = titleColorMap[derivedType] || titleColorMap.SYSTEM;
            const route = getEntityRoute(act.entityType || derivedType, act.entityId);

            const cardContent = (
              <>
                {/* normalized size & alignment for icons */}
                <div className={cn("h-9 w-9 rounded-[8px] flex items-center justify-center shrink-0 border", colorMap[derivedType] || colorMap.SYSTEM)}>
                  <Icon className="h-5 w-5 stroke-[1.75px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <span className={cn("font-bold text-xs leading-snug transition-colors", titleColorClass)}>
                      {act.title}
                    </span>
                    {/* Timestamp visible badge */}
                    <span className="bg-[#EFF1EF] dark:bg-[#1A2820] text-muted-foreground font-semibold px-2 py-0.5 rounded-full text-[9px] shrink-0">
                      [ {timeLabel} ]
                    </span>
                  </div>
                  {/* Space between title and description */}
                  <p className="text-muted-foreground text-[11px] mt-1.5 leading-relaxed break-words line-clamp-2">
                    {cleanDescription(act.description)}
                  </p>
                  
                  {/* Clean Horizontal Metadata Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-3.5 text-[10px] text-muted-foreground/60 font-medium border-t border-[#E6E8E6]/30 dark:border-[#22352B]/30 pt-2">
                    <span className="flex items-center gap-1">
                      <span className="text-[10px]">👤</span>
                      <span>Performed by: <strong className="text-foreground/80 font-bold">{act.user || "System"}</strong></span>
                    </span>
                    <span className="opacity-40">•</span>
                    <span className={cn("px-1.5 py-0.5 rounded-[4px] border text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 shrink-0", derivedStyle.bg, derivedStyle.text, derivedStyle.border)}>
                      <span className="text-[9px]">{derivedStyle.icon}</span>
                      <span>{derivedStyle.label}</span>
                    </span>
                    {route && (
                      <>
                        <span className="opacity-40">•</span>
                        <span className="text-[#2F4F3A] dark:text-[#4F7F60] text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 group-hover:underline">
                          <span>View details</span>
                          <ArrowRight className="h-2.5 w-2.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </>
            );

            return route ? (
              <Link
                key={act.id}
                href={route}
                className={cn(
                  "flex gap-4 p-4.5 bg-[#FCFDFC] dark:bg-[#0E1712] border border-[#E6E8E6]/60 dark:border-[#22352B]/60 border-l-[4px] hover:shadow-md hover:-translate-y-[1px] rounded-[10px] transition-all duration-200 group cursor-pointer",
                  stripeClass
                )}
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={act.id}
                className={cn(
                  "flex gap-4 p-4.5 bg-[#FCFDFC] dark:bg-[#0E1712] border border-[#E6E8E6]/60 dark:border-[#22352B]/60 border-l-[4px] rounded-[10px] shadow-sm",
                  stripeClass
                )}
              >
                {cardContent}
              </div>
            );
          })
        )}
      </div>

      {/* Pinned Footer Action CTA */}
      <div className="p-4 border-t border-[#E6E8E6] dark:border-[#22352B] bg-[#FCFDFC] dark:bg-[#0E1712] text-center shrink-0">
        <Link
          href="/monitoring/audit-logs"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#2F4F3A] dark:text-[#4F7F60] hover:text-[#1A2820] dark:hover:text-[#F5F5F2] hover:underline tracking-wider uppercase transition-colors"
        >
          <span>📜 View Complete Audit Ledger</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
