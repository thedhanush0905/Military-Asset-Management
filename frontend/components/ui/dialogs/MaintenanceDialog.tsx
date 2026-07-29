"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/Select";
import { DatePicker } from "@/components/ui/forms/DatePicker";
import { Textarea } from "@/components/ui/forms/Textarea";

interface Option {
  value: string;
  label: string;
}

interface MaintenanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { equipmentAssetId: string; type: "PREVENTIVE" | "CORRECTIVE"; date: string; description: string }) => void;
  bases?: Option[];
  assets?: Option[];
  fixedAssetId?: string | null;
  fixedAssetName?: string | null;
  isLoading?: boolean;
}

export function MaintenanceDialog({
  isOpen,
  onClose,
  onConfirm,
  assets = [],
  fixedAssetId = null,
  fixedAssetName = null,
  isLoading,
}: MaintenanceDialogProps) {
  const [equipmentAssetId, setEquipmentAssetId] = useState("");
  const [type, setType] = useState<"PREVENTIVE" | "CORRECTIVE">("PREVENTIVE");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEquipmentAssetId(fixedAssetId || "");
      setType("PREVENTIVE");
      setDate(new Date().toISOString().split("T")[0]);
      setDescription("");
    }
  }, [isOpen, fixedAssetId]);

  const handleConfirm = () => {
    const targetAssetId = fixedAssetId || equipmentAssetId;
    if (!targetAssetId || !date || !description) return;
    onConfirm({
      equipmentAssetId: targetAssetId,
      type,
      date,
      description,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            Schedule Maintenance Task
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Initiate a service log entry for base hardware assets.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 flex flex-col gap-4">
          {fixedAssetId && fixedAssetName ? (
            <div className="p-3 bg-[#EFF1EF]/60 dark:bg-[#1A2820]/60 border border-[#E6E8E6] dark:border-[#22352B] rounded-[8px]">
              <span className="text-muted-foreground font-semibold">Target Asset: </span>
              <span className="font-bold text-foreground">{fixedAssetName}</span>
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
            label="Maintenance Type"
            options={[
              { value: "PREVENTIVE", label: "Preventive Checkup" },
              { value: "CORRECTIVE", label: "Corrective Repair" },
            ]}
            value={type}
            onChange={(e) => setType(e.target.value as "PREVENTIVE" | "CORRECTIVE")}
            disabled={isLoading}
          />
          <DatePicker
            label="Scheduled Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
          />
          <Textarea
            label="Description of Service Required"
            placeholder="Provide technical notes regarding the repair..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-[#E6E8E6] text-[#1A2820] dark:text-[#E6E8E6]">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!(fixedAssetId || equipmentAssetId) || !date || !description || isLoading} 
            className="bg-[#F59E0B] text-white hover:bg-orange-800"
          >
            {isLoading ? "Scheduling..." : "Schedule Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
