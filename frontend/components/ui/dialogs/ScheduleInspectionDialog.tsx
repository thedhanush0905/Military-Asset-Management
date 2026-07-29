"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/Select";
import { DatePicker } from "@/components/ui/forms/DatePicker";
import { FormField } from "@/components/ui/forms/FormField";
import { Textarea } from "@/components/ui/forms/Textarea";

interface Option {
  value: string;
  label: string;
}

interface ScheduleInspectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { equipmentAssetId: string; inspectorName: string; scheduledDate: string; notes?: string | null }) => void;
  assets: Option[];
  isLoading?: boolean;
}

export function ScheduleInspectionDialog({
  isOpen,
  onClose,
  onConfirm,
  assets = [],
  isLoading,
}: ScheduleInspectionDialogProps) {
  const [equipmentAssetId, setEquipmentAssetId] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEquipmentAssetId("");
      setInspectorName("");
      setScheduledDate(new Date().toISOString().split("T")[0]);
      setNotes("");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!equipmentAssetId || !inspectorName || !scheduledDate) return;
    onConfirm({
      equipmentAssetId,
      inspectorName,
      scheduledDate: new Date(scheduledDate).toISOString(),
      notes: notes || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            Schedule Readiness Inspection
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Assign an officer and schedule a formal safety check.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 flex flex-col gap-4">
          <Select
            label="Select Equipment Asset"
            placeholder="Select asset serial..."
            options={assets}
            value={equipmentAssetId}
            onChange={(e) => setEquipmentAssetId(e.target.value)}
            disabled={isLoading}
          />

          <FormField
            label="Inspector Name"
            placeholder="e.g. Cpt. Rodriguez"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            disabled={isLoading}
            required
          />

          <DatePicker
            label="Scheduled Date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            disabled={isLoading}
          />

          <Textarea
            label="Pre-inspection Notes"
            placeholder="Describe inspection goals or focus areas..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-[#E6E8E6] text-[#1A2820] dark:text-[#E6E8E6]">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!equipmentAssetId || !inspectorName || !scheduledDate || isLoading} 
            className="bg-[#2F4F3A] text-white hover:bg-[#1A2820]"
          >
            {isLoading ? "Scheduling..." : "Schedule Inspection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
