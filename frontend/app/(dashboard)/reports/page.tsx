"use client";

import React, { useState, useEffect, useRef } from "react";
import { reportService, ReportRequestPayload } from "@/services/report.service";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/Select";
import { FileText, Download, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface ActiveJob {
  id: string;
  reportType: string;
  exportFormat: string;
  status: "PENDING" | "GENERATING" | "COMPLETED" | "FAILED";
  downloadUrl?: string | null;
  errorMessage?: string | null;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportRequestPayload["reportType"]>("INVENTORY");
  const [exportFormat, setExportFormat] = useState<ReportRequestPayload["exportFormat"]>("PDF");
  const [isLoading, setIsLoading] = useState(false);

  // Active jobs tracked in the state
  const [jobs, setJobs] = useState<ActiveJob[]>([]);

  // Ref to track active polling intervals to clear them on unmount
  const pollIntervals = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    // Cleanup on unmount: clear all running intervals
    return () => {
      Object.values(pollIntervals.current).forEach(clearInterval);
    };
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: ReportRequestPayload = {
        reportType,
        exportFormat,
        filters: {},
      };

      const res = await reportService.requestReport(payload);
      const jobData = res.data;

      // Add to tracked jobs list
      const newJob: ActiveJob = {
        id: jobData.id,
        reportType: jobData.type,
        exportFormat: ((jobData.parameters as Record<string, unknown>)?.exportFormat as string) || exportFormat,
        status: jobData.status,
        downloadUrl: jobData.fileUrl,
        errorMessage: jobData.errorMessage,
      };

      setJobs((prev) => [newJob, ...prev]);
      toast("Generation Started", `Report job accepted. Tracking status...`, "success");

      // Start status polling
      startPolling(jobData.id);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to submit report generation request.";
      toast("Submission Failed", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = (jobId: string) => {
    let elapsed = 0;
    const timeout = 60000; // 60s timeout

    const interval = setInterval(async () => {
      elapsed += 2000;

      if (elapsed >= timeout) {
        clearInterval(interval);
        delete pollIntervals.current[jobId];
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: "FAILED", errorMessage: "Job generation timed out." } : j))
        );
        toast("Generation Timeout", "The report job exceeded the timeout threshold.", "error");
        return;
      }

      try {
        const res = await reportService.getJobStatus(jobId);
        const job = res.data;

        setJobs((prev) =>
          prev.map((j) => {
            if (j.id === jobId) {
              return {
                ...j,
                status: job.status,
                downloadUrl: job.fileUrl,
                errorMessage: job.errorMessage,
              };
            }
            return j;
          })
        );

        if (job.status === "COMPLETED") {
          clearInterval(interval);
          delete pollIntervals.current[jobId];
          toast("Report Complete", `${job.type} report generated. Ready for download.`, "success");
        } else if (job.status === "FAILED") {
          clearInterval(interval);
          delete pollIntervals.current[jobId];
          toast("Report Failed", job.errorMessage || "Generation encountered an internal failure.", "error");
        }
      } catch (error) {
        // Suppress errors and continue polling
      }
    }, 2000);

    pollIntervals.current[jobId] = interval;
  };

  const handleDownload = async (job: ActiveJob) => {
    try {
      const blob = await reportService.downloadReport(job.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Extract file name or default it
      const ext = job.exportFormat.toLowerCase();
      link.setAttribute("download", `${job.reportType.toLowerCase()}_report_${job.id.slice(-6)}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast("Download Failed", "Failed to retrieve report download file.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-xs">
      
      {/* Page Header */}
      <div className="border-b border-[#E6E8E6] dark:border-[#22352B] pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#1A2820] dark:text-[#F5F5F2]">Operational Report Engine</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Display only report types and export formats supported by the backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Panel */}
        <div className="bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm h-fit">
          <h2 className="font-extrabold text-sm text-[#1A2820] dark:text-[#F5F5F2] uppercase tracking-wider mb-4">Request Document Compilation</h2>
          <form onSubmit={handleGenerateReport} className="flex flex-col gap-4">
            <Select
              label="Select Report Target"
              options={[
                { value: "INVENTORY", label: "Depot Inventory Reports" },
                { value: "ASSETS", label: "Unique Serialized Assets" },
                { value: "MAINTENANCE", label: "Active Maintenance Logs" },
                { value: "PROCUREMENT", label: "Procurement Supply Schedules" },
                { value: "DISPOSALS", label: "Decommissioned Disposals Ledger" },
              ]}
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportRequestPayload["reportType"])}
              disabled={isLoading}
            />

            <Select
              label="Export File Format"
              options={[
                { value: "PDF", label: "Adobe PDF Document (.pdf)" },
                { value: "XLSX", label: "Microsoft Excel Worksheet (.xlsx)" },
                { value: "CSV", label: "Comma Separated Values (.csv)" },
              ]}
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ReportRequestPayload["exportFormat"])}
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-bold py-2.5 rounded-[10px] w-full mt-2"
            >
              {isLoading ? "Enqueuing Job..." : "Request Compilation"}
            </Button>
          </form>
        </div>

        {/* Status Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111B15] border border-[#E6E8E6] dark:border-[#22352B] rounded-[12px] p-6 shadow-sm">
          <h2 className="font-extrabold text-sm text-[#1A2820] dark:text-[#F5F5F2] uppercase tracking-wider mb-4">Compilation Job Queue</h2>
          {jobs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground font-semibold flex flex-col items-center justify-center">
              <FileText className="h-8 w-8 mb-2 opacity-30 text-[#2F4F3A]" />
              <span className="font-bold uppercase tracking-wider text-[10px]">No active compilation jobs</span>
              <p className="mt-1 text-xs">Generated documents will appear here for download.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-[#E6E8E6] dark:border-[#22352B] rounded-[10px] bg-[#F5F5F2]/40"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      job.status === "COMPLETED" ? "bg-green-500/10 text-green-700" :
                      job.status === "FAILED" ? "bg-red-500/10 text-red-700" :
                      "bg-blue-500/10 text-blue-700 animate-pulse"
                    }`}>
                      {job.status === "COMPLETED" ? <CheckCircle2 className="h-5 w-5" /> :
                       job.status === "FAILED" ? <AlertCircle className="h-5 w-5" /> :
                       <RefreshCw className="h-4 w-4 animate-spin" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs uppercase text-[#1A2820] dark:text-[#F5F5F2]">
                        {job.reportType} REPORT
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Format: <span className="font-bold text-foreground">{job.exportFormat}</span> • ID: {job.id.slice(-6).toUpperCase()}
                      </p>
                      {job.errorMessage && (
                        <p className="text-[10px] text-red-600 mt-0.5">{job.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    {job.status === "COMPLETED" && (
                      <Button
                        onClick={() => handleDownload(job)}
                        className="bg-[#2E7D32] hover:bg-green-800 text-white font-bold py-1.5 px-3 rounded-[6px] text-[10px] flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download File
                      </Button>
                    )}
                    {(job.status === "PENDING" || job.status === "GENERATING") && (
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                        Compiling...
                      </span>
                    )}
                    {job.status === "FAILED" && (
                      <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                        Failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
