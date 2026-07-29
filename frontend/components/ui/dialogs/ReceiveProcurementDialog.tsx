"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/forms/FormField";
import { AlertCircle } from "lucide-react";

interface ProcurementItem {
  id: string;
  equipmentId: string;
  quantity: number;
  receivedQuantity: number;
  equipment?: {
    name: string;
  };
}

interface ProcurementDetail {
  id: string;
  procurementNumber: string;
  items?: ProcurementItem[];
}

interface ReceiveProcurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { items: Array<{ equipmentId: string; serialNumbers: string[] }> }) => Promise<void>;
  procurement: ProcurementDetail | null;
  isLoading?: boolean;
}

export function ReceiveProcurementDialog({
  isOpen,
  onClose,
  onConfirm,
  procurement,
  isLoading,
}: ReceiveProcurementDialogProps) {
  // State to store serials: Record<equipmentId, string[]>
  const [serials, setSerials] = useState<Record<string, string[]>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute outstanding items
  const activeItems = (procurement?.items || []).filter(
    (item) => item.quantity - item.receivedQuantity > 0
  );

  useEffect(() => {
    if (isOpen && procurement) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg(null);
      const initialSerials: Record<string, string[]> = {};
      (procurement.items || []).forEach((item) => {
        const outstanding = item.quantity - item.receivedQuantity;
        if (outstanding > 0) {
          initialSerials[item.equipmentId] = Array(outstanding).fill("");
        }
      });
      setSerials(initialSerials);
    }
  }, [isOpen, procurement]);

  const handleSerialChange = (eqId: string, index: number, value: string) => {
    setSerials((prev) => ({
      ...prev,
      [eqId]: prev[eqId].map((sn, idx) => (idx === index ? value : sn)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const submissionItems: Array<{ equipmentId: string; serialNumbers: string[] }> = [];
    const allSerials: string[] = [];

    for (const item of activeItems) {
      const itemSerials = serials[item.equipmentId] || [];
      const outstanding = item.quantity - item.receivedQuantity;

      // 1. Verify exact count
      if (itemSerials.length !== outstanding) {
        setErrorMsg(`Expected exactly ${outstanding} serial numbers for ${item.equipment?.name || "equipment"}.`);
        return;
      }

      const cleanedSerials: string[] = [];
      for (let i = 0; i < itemSerials.length; i++) {
        const sn = itemSerials[i].trim();
        // 2. Non-empty check
        if (!sn || sn.length < 2) {
          setErrorMsg(`Serial number #${i + 1} for ${item.equipment?.name || "equipment"} must be at least 2 characters.`);
          return;
        }
        // 3. Duplicate check within the form
        if (allSerials.includes(sn)) {
          setErrorMsg(`Duplicate serial number '${sn}' detected. Serials must be unique across all inputs.`);
          return;
        }
        cleanedSerials.push(sn);
        allSerials.push(sn);
      }

      submissionItems.push({
        equipmentId: item.equipmentId,
        serialNumbers: cleanedSerials,
      });
    }

    if (submissionItems.length === 0) {
      setErrorMsg("No items outstanding to receive.");
      return;
    }

    await onConfirm({ items: submissionItems });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            Confirm Shipment Delivery
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Register serial numbers to receive items for Purchase Order <span className="font-bold text-foreground">{procurement?.procurementNumber}</span>.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-[#DC2626] p-3 rounded-[8px] flex items-center gap-2 text-xs font-bold my-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="my-2 flex flex-col gap-4">
          {activeItems.map((item) => {
            const outstanding = item.quantity - item.receivedQuantity;
            const itemSerials = serials[item.equipmentId] || [];

            return (
              <div key={item.id} className="border border-[#E6E8E6] dark:border-[#22352B] p-4 rounded-[8px] space-y-3">
                <div className="flex justify-between items-center border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-1.5 mb-1.5">
                  <span className="font-extrabold text-xs text-[#2F4F3A] dark:text-[#5F9F7A]">
                    {item.equipment?.name || "Unknown Hardware"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-black">
                    Awaiting: {outstanding} units
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {Array.from({ length: outstanding }).map((_, idx) => (
                    <FormField
                      key={`${item.id}-sn-${idx}`}
                      label={`Serial Number #${idx + 1}`}
                      placeholder="e.g. US-TK-0021-H"
                      value={itemSerials[idx] || ""}
                      onChange={(e) => handleSerialChange(item.equipmentId, idx, e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  ))}
                </div>
              </div>
            );
          })}

          <DialogFooter className="mt-4 pt-4 border-t border-[#E6E8E6] dark:border-[#22352B]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-[#E6E8E6] text-[#1A2820] dark:text-[#E6E8E6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-bold"
            >
              {isLoading ? "Receiving..." : "Confirm Delivery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
