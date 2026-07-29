import { EquipmentStatus } from "@/types/common";

export const ASSET_STATUS: Record<EquipmentStatus, { label: string; colorClass: string; hex: string }> = {
  AVAILABLE: {
    label: "Available",
    colorClass: "bg-status-available text-white",
    hex: "#2E7D32",
  },
  ASSIGNED: {
    label: "Assigned",
    colorClass: "bg-status-assigned text-white",
    hex: "#2563EB",
  },
  IN_TRANSIT: {
    label: "In Transit",
    colorClass: "bg-status-transfer text-white",
    hex: "#7C3AED",
  },
  MAINTENANCE: {
    label: "Maintenance",
    colorClass: "bg-status-maintenance text-white",
    hex: "#F59E0B",
  },
  DAMAGED: {
    label: "Damaged",
    colorClass: "bg-status-critical text-white",
    hex: "#DC2626",
  },
  LOST: {
    label: "Lost",
    colorClass: "bg-status-critical text-white",
    hex: "#DC2626",
  },
  RETIRED: {
    label: "Retired",
    colorClass: "bg-status-disposed text-white",
    hex: "#6B7280",
  },
};
