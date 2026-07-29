import { TransferStatus } from "@/types/transfer";

export const TRANSFER_STATUS: Record<TransferStatus, { label: string; colorClass: string; hex: string }> = {
  PENDING: {
    label: "Pending",
    colorClass: "bg-status-maintenance text-white",
    hex: "#F59E0B",
  },
  APPROVED: {
    label: "Approved",
    colorClass: "bg-status-assigned text-white",
    hex: "#2563EB",
  },
  IN_TRANSIT: {
    label: "In Transit",
    colorClass: "bg-status-transfer text-white",
    hex: "#7C3AED",
  },
  COMPLETED: {
    label: "Completed",
    colorClass: "bg-status-available text-white",
    hex: "#2E7D32",
  },
  REJECTED: {
    label: "Rejected",
    colorClass: "bg-status-critical text-white",
    hex: "#DC2626",
  },
  CANCELLED: {
    label: "Cancelled",
    colorClass: "bg-status-disposed text-white",
    hex: "#6B7280",
  },
};
