export const mockDashboardMetrics = {
  totalAssets: 12847,
  availableAssets: 7392,
  assignedAssets: 4218,
  maintenanceAssets: 841,
  transfersAssets: 127,
  procurementAssets: 43,
  basesCount: 18,
  personnelCount: 3642,
  operationalReadiness: 94.2, // Operational readiness score %
  missionStatus: "READY", // NORMAL, CAUTION, STANDBY, DEPLOYED
  alertsCount: 2,
};

export const mockRecentActivity = [
  {
    id: "act-1",
    time: "09:14",
    title: "Asset assigned",
    user: "Cpt. Rodriguez",
    description: "M1117 Guardian #A-2241 — 3rd Infantry Battalion",
    type: "ASSIGNMENT",
  },
  {
    id: "act-2",
    time: "08:52",
    title: "Transfer approved",
    user: "Maj. Chen",
    description: "Batch transfer of 12 HMMWV units to Forward Base Delta",
    type: "TRANSFER",
  },
  {
    id: "act-3",
    time: "08:31",
    title: "Maintenance completed",
    user: "Tech. Sgt. Morris",
    description: "Scheduled service for UH-60 Black Hawk #H-0081",
    type: "MAINTENANCE",
  },
  {
    id: "act-4",
    time: "07:58",
    title: "Procurement submitted",
    user: "Lt. Patel",
    description: "RFQ-2024-0892: 24× SINCGARS radios",
    type: "PROCUREMENT",
  },
  {
    id: "act-5",
    time: "07:22",
    title: "Inspection passed",
    user: "Cpt. Williams",
    description: "Quarterly inspection — Alpha Company, Fort Braxton",
    type: "INSPECTION",
  },
  {
    id: "act-6",
    time: "06:44",
    title: "New personnel registered",
    user: "Admin System",
    description: "Sgt. First Class Kim transferred to HQ Unit",
    type: "SYSTEM",
  },
];

export const mockAssetStatusChart = [
  { name: "Available", value: 7392, color: "#2E7D32" },
  { name: "Assigned", value: 4218, color: "#2563EB" },
  { name: "Maintenance", value: 841, color: "#F59E0B" },
  { name: "Decommissioned", value: 396, color: "#6B7280" },
];

export const mockProcurementTrendsChart = [
  { month: "Jan", amount: 4.2 },
  { month: "Feb", amount: 3.8 },
  { month: "Mar", amount: 5.1 },
  { month: "Apr", amount: 4.9 },
  { month: "May", amount: 6.2 },
  { month: "Jun", amount: 5.8 },
  { month: "Jul", amount: 7.1 },
];

export const mockMaintenanceTrendsChart = [
  { month: "Jan", cost: 120000, scheduled: 14, completed: 12 },
  { month: "Feb", cost: 154000, scheduled: 18, completed: 17 },
  { month: "Mar", cost: 98000, scheduled: 10, completed: 10 },
  { month: "Apr", cost: 210000, scheduled: 25, completed: 22 },
  { month: "May", cost: 175000, scheduled: 20, completed: 20 },
  { month: "Jun", cost: 140000, scheduled: 15, completed: 14 },
  { month: "Jul", cost: 230000, scheduled: 28, completed: 26 },
];

export const mockTransferTrendsChart = [
  { month: "Jan", requests: 45, completed: 42 },
  { month: "Feb", requests: 52, completed: 49 },
  { month: "Mar", requests: 38, completed: 38 },
  { month: "Apr", requests: 62, completed: 58 },
  { month: "May", requests: 71, completed: 68 },
  { month: "Jun", requests: 83, completed: 78 },
  { month: "Jul", requests: 95, completed: 88 },
];

export const mockTopBases = [
  {
    id: "b-1",
    name: "Fort Braxton",
    code: "FB-NC",
    location: "North Carolina, USA",
    assetsCount: 4821,
    readiness: 96.5,
  },
  {
    id: "b-2",
    name: "NAS Hampton",
    code: "NH-VA",
    location: "Virginia, USA",
    assetsCount: 3120,
    readiness: 93.8,
  },
  {
    id: "b-3",
    name: "Camp Ridgeline",
    code: "CR-AK",
    location: "Alaska, USA",
    assetsCount: 2240,
    readiness: 91.2,
  },
  {
    id: "b-4",
    name: "Fort Duncan",
    code: "FD-TX",
    location: "Texas, USA",
    assetsCount: 1621,
    readiness: 95.1,
  },
  {
    id: "b-5",
    name: "Forward Base Delta",
    code: "FBD-OVERSEAS",
    location: "Middle East Command",
    assetsCount: 1045,
    readiness: 89.4,
  },
];
