import { ASSET_STATUS } from "@/constants/asset-status";
import { EquipmentStatus } from "@/types/common";

export function formatStatus(status: EquipmentStatus) {
  return ASSET_STATUS[status] || { label: status, colorClass: "bg-gray-500 text-white", hex: "#6B7280" };
}
