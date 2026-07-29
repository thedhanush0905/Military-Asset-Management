import { ReportJob } from "@/types/report";

export const mockReportJobs: ReportJob[] = [
  {
    id: "rep-1",
    name: "Quarterly Readiness Report - Fort Braxton",
    type: "READINESS",
    status: "COMPLETED",
    requestedById: "u-admin",
    parameters: { baseId: "b-1", quarter: "Q2-2026" },
    fileUrl: "/reports/readiness-fb-q2-2026.pdf",
    errorMessage: null,
    completedAt: "2026-07-28T09:00:00Z",
    createdAt: "2026-07-28T08:45:00Z",
    updatedAt: "2026-07-28T09:00:00Z",
  },
  {
    id: "rep-2",
    name: "Depreciation & Asset Valuation Audit",
    type: "VALUATION",
    status: "GENERATING",
    requestedById: "u-admin",
    parameters: { year: 2026 },
    fileUrl: null,
    errorMessage: null,
    completedAt: null,
    createdAt: "2026-07-28T09:15:00Z",
    updatedAt: "2026-07-28T09:15:00Z",
  },
];
