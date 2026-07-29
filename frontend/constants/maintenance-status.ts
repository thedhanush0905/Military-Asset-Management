import { MaintenanceStatus } from "@/types/maintenance";

export const MAINTENANCE_STATUS: Record<MaintenanceStatus, { label: string; colorClass: string; hex: string }> = {
  SCHEDULED: {
    label: "Scheduled",
    colorClass: "bg-status-assigned text-white",
    hex: "#2563EB",
  },
  IN_PROGRESS: {
    label: "In Progress",
    colorClass: "bg-status-maintenance text-white",
    hex: "#F59E0B",
  },
  COMPLETED: {
    label: "Completed",
    colorClass: "bg-status-available text-white",
    hex: "#2E7D32",
  },
  CANCELLED: {
    label: "Cancelled",
    colorClass: "bg-status-disposed text-white",
    hex: "#6B7280",
  },
};
