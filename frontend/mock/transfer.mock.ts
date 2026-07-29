import { Transfer } from "@/types/transfer";

export interface KanbanCard {
  id: string;
  assetId: string;
  assetName: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceBase: string;
  destinationBase: string;
  assignedOfficer: string;
  date: string;
  status: "PENDING" | "APPROVED" | "IN_TRANSIT" | "COMPLETED"; // Kanban columns
  remarks: string;
}

export const mockTransfers: Transfer[] = [
  {
    id: "trn-1",
    equipmentAssetId: "A-0002",
    fromBaseId: "b-2",
    toBaseId: "b-1",
    quantity: 1,
    transferredById: "p-2", // Maj. Chen
    remarks: "Transferring UH-60 unit for regional maneuvers support.",
    status: "PENDING",
    transferredAt: "2026-07-28T08:52:00Z",
    createdAt: "2026-07-28T08:52:00Z",
    updatedAt: "2026-07-28T08:52:00Z",
  },
  {
    id: "trn-2",
    equipmentAssetId: "A-0005",
    fromBaseId: "b-3",
    toBaseId: "b-5",
    quantity: 12,
    transferredById: "p-4", // Lt. Patel
    remarks: "Batch transfer of 12 HMMWV units to Forward Base Delta.",
    status: "APPROVED",
    transferredAt: "2026-07-27T10:00:00Z",
    createdAt: "2026-07-27T10:00:00Z",
    updatedAt: "2026-07-28T08:52:00Z",
  },
  {
    id: "trn-3",
    equipmentAssetId: "A-0003",
    fromBaseId: "b-1",
    toBaseId: "b-4",
    quantity: 1,
    transferredById: "p-3", // Tech. Sgt. Morris
    remarks: "Dispatched M1117 unit for emergency calibration.",
    status: "IN_TRANSIT",
    transferredAt: "2026-07-26T12:00:00Z",
    createdAt: "2026-07-26T12:00:00Z",
    updatedAt: "2026-07-26T12:00:00Z",
  },
  {
    id: "trn-4",
    equipmentAssetId: "A-0001",
    fromBaseId: "b-4",
    toBaseId: "b-2",
    quantity: 1,
    transferredById: "p-5", // Cpt. Williams
    remarks: "Returned combat gear unit back to NAS Hampton storage.",
    status: "COMPLETED",
    transferredAt: "2026-07-25T14:30:00Z",
    createdAt: "2026-07-25T14:30:00Z",
    updatedAt: "2026-07-25T15:00:00Z",
  },
];

export const mockKanbanCards: KanbanCard[] = [
  {
    id: "k-1",
    assetId: "A-0002",
    assetName: "UH-60 Black Hawk (US-HEL-2281-B)",
    priority: "HIGH",
    sourceBase: "NAS Hampton",
    destinationBase: "Fort Braxton",
    assignedOfficer: "Maj. Chen",
    date: "2026-07-28",
    status: "PENDING",
    remarks: "Transferring UH-60 unit for regional maneuvers support.",
  },
  {
    id: "k-2",
    assetId: "A-0005",
    assetName: "HMMWV M1151 (US-WV-4412-E)",
    priority: "MEDIUM",
    sourceBase: "Camp Ridgeline",
    destinationBase: "Forward Base Delta",
    assignedOfficer: "Lt. Patel",
    date: "2026-07-27",
    status: "APPROVED",
    remarks: "Batch transfer of 12 HMMWV units to Forward Base Delta.",
  },
  {
    id: "k-3",
    assetId: "A-0003",
    assetName: "M1117 Guardian (US-APW-0882-C)",
    priority: "CRITICAL",
    sourceBase: "Fort Braxton",
    destinationBase: "Fort Duncan",
    assignedOfficer: "Tech. Sgt. Morris",
    date: "2026-07-26",
    status: "IN_TRANSIT",
    remarks: "Dispatched M1117 unit for emergency calibration.",
  },
  {
    id: "k-4",
    assetId: "A-0001",
    assetName: "M1A2 Abrams (US-TK-1024-A)",
    priority: "LOW",
    sourceBase: "Fort Duncan",
    destinationBase: "NAS Hampton",
    assignedOfficer: "Cpt. Williams",
    date: "2026-07-25",
    status: "COMPLETED",
    remarks: "Returned combat gear unit back to NAS Hampton storage.",
  },
];
