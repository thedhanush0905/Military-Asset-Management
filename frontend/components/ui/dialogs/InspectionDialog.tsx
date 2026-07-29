"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/Select";
import { Textarea } from "@/components/ui/forms/Textarea";

interface Option {
  value: string;
  label: string;
}

interface InspectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { equipmentAssetId?: string; result: "PASS" | "FAIL"; notes: string }) => void;
  assets?: Option[];
  fixedAssetId?: string | null;
  fixedAssetName?: string | null;
  assetName?: string;
  isLoading?: boolean;
}

export function InspectionDialog({
  isOpen,
  onClose,
  onConfirm,
  assets = [],
  fixedAssetId = null,
  fixedAssetName = null,
  assetName = "",
  isLoading,
}: InspectionDialogProps) {
  const [equipmentAssetId, setEquipmentAssetId] = useState("");
  const [result, setResult] = useState<"PASS" | "FAIL">("PASS");
  const [notes, setNotes] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setEquipmentAssetId(fixedAssetId || "");
      setResult("PASS");
      setNotes("");
    }
  }, [isOpen, fixedAssetId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleConfirm = () => {
    const targetAssetId = fixedAssetId || equipmentAssetId;
    onConfirm({ equipmentAssetId: targetAssetId || undefined, result, notes });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">Log Inspection Report</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Submit a safety and operational integrity report for hardware assets.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 flex flex-col gap-4">
          {(fixedAssetId && fixedAssetName) || assetName ? (
            <div className="p-3 bg-[#EFF1EF]/60 dark:bg-[#1A2820]/60 border border-[#E6E8E6] dark:border-[#22352B] rounded-[8px]">
              <span className="text-muted-foreground font-semibold">Target Asset: </span>
              <span className="font-bold text-foreground">{fixedAssetName || assetName}</span>
            </div>
          ) : (
            <Select
              label="Select Equipment Asset"
              placeholder="Select asset serial..."
              options={assets}
              value={equipmentAssetId}
              onChange={(e) => setEquipmentAssetId(e.target.value)}
              disabled={isLoading}
            />
          )}

          <Select
            label="Inspection Result"
            options={[
              { value: "PASS", label: "PASS - Ready for active service" },
              { value: "FAIL", label: "FAIL - Flagged for maintenance" },
            ]}
            value={result}
            onChange={(e) => setResult(e.target.value as "PASS" | "FAIL")}
            disabled={isLoading}
          />
          <Textarea
            label="Inspector Notes / Observation logs"
            placeholder="Document all findings, checks, or warning indicators..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-[#E6E8E6] text-[#1A2820]">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!(fixedAssetId || equipmentAssetId) || isLoading} 
            className="bg-[#2E7D32] text-white hover:bg-green-800"
          >
            {isLoading ? "Saving..." : "Log Inspection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
