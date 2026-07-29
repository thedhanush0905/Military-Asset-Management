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

interface TransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { equipmentAssetId: string; destinationBaseId: string; remarks: string }) => void;
  bases: Option[];
  assets?: Option[];
  fixedAssetId?: string | null;
  fixedAssetName?: string | null;
  isLoading?: boolean;
}

export function TransferDialog({
  isOpen,
  onClose,
  onConfirm,
  bases,
  assets = [],
  fixedAssetId = null,
  fixedAssetName = null,
  isLoading,
}: TransferDialogProps) {
  const [equipmentAssetId, setEquipmentAssetId] = useState("");
  const [destinationBaseId, setDestinationBaseId] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEquipmentAssetId(fixedAssetId || "");
      setDestinationBaseId("");
      setRemarks("");
    }
  }, [isOpen, fixedAssetId]);

  const handleConfirm = () => {
    const targetAssetId = fixedAssetId || equipmentAssetId;
    if (!targetAssetId || !destinationBaseId) return;
    onConfirm({ equipmentAssetId: targetAssetId, destinationBaseId, remarks });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            Request Asset Transfer
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Initiate transfer coordinates to move hardware assets between base facility depots.
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
            label="Destination Base"
            placeholder="Select destination base..."
            options={bases}
            value={destinationBaseId}
            onChange={(e) => setDestinationBaseId(e.target.value)}
            disabled={isLoading}
          />

          <Textarea
            label="Transfer Instructions / Remarks"
            placeholder="Enter reason for transfer or special handling instructions..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-[#E6E8E6] text-[#1A2820] dark:text-[#E6E8E6]">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!(fixedAssetId || equipmentAssetId) || !destinationBaseId || isLoading} 
            className="bg-[#7C3AED] text-white hover:bg-[#6D30D9]"
          >
            {isLoading ? "Requesting..." : "Request Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
