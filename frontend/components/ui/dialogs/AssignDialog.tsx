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

interface AssignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { equipmentAssetId?: string; personnelId: string; remarks: string }) => void;
  personnel: Option[];
  assets?: Option[];
  fixedAssetId?: string | null;
  fixedAssetName?: string | null;
  assetName?: string;
  isLoading?: boolean;
}

export function AssignDialog({
  isOpen,
  onClose,
  onConfirm,
  personnel,
  assets = [],
  fixedAssetId = null,
  fixedAssetName = null,
  assetName = "",
  isLoading,
}: AssignDialogProps) {
  const [equipmentAssetId, setEquipmentAssetId] = useState("");
  const [personnelId, setPersonnelId] = useState("");
  const [remarks, setRemarks] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      setEquipmentAssetId(fixedAssetId || "");
      setPersonnelId("");
      setRemarks("");
    }
  }, [isOpen, fixedAssetId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleConfirm = () => {
    const targetAssetId = fixedAssetId || equipmentAssetId;
    if (!personnelId) return;
    onConfirm({ equipmentAssetId: targetAssetId || undefined, personnelId, remarks });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">Assign Equipment Asset</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Issue hardware assets to active duty personnel.
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
            label="Assigned Officer"
            placeholder="Select personnel..."
            options={personnel}
            value={personnelId}
            onChange={(e) => setPersonnelId(e.target.value)}
            disabled={isLoading}
          />
          <Textarea
            label="Assignment Remarks / Tasks"
            placeholder="Enter specific orders or deployment remarks..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-[#E6E8E6] text-[#1A2820]">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!(fixedAssetId || equipmentAssetId) || !personnelId || isLoading} 
            className="bg-[#2563EB] text-white hover:bg-blue-800"
          >
            {isLoading ? "Assigning..." : "Assign Asset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
