"use client";

import React, { useEffect } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/forms/Select";
import { FormField } from "@/components/ui/forms/FormField";

const disposalFormSchema = z.object({
  equipmentAssetId: z.string().trim().min(1, "Please select an asset to decommission"),
  disposalReason: z.enum(["RETIRED", "DAMAGED", "LOST", "DESTROYED", "SOLD", "SCRAPPED"]),
  remarks: z.string().trim().max(1000).optional().nullable(),
});

export type DisposalFormValues = z.infer<typeof disposalFormSchema>;

interface Option {
  value: string;
  label: string;
}

interface DisposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DisposalFormValues) => Promise<void>;
  assetOptions?: Option[];
  fixedAssetId?: string | null;
  fixedAssetName?: string | null;
  isLoading?: boolean;
}

export function DisposalDialog({
  isOpen,
  onClose,
  onConfirm,
  assetOptions = [],
  fixedAssetId = null,
  fixedAssetName = null,
  isLoading,
}: DisposalDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DisposalFormValues>({
    resolver: zodResolver(disposalFormSchema) as unknown as Resolver<DisposalFormValues>,
    defaultValues: {
      equipmentAssetId: "",
      disposalReason: "RETIRED",
      remarks: "",
    },
  });

  const selectedAsset = watch("equipmentAssetId");
  const selectedReason = watch("disposalReason");

  useEffect(() => {
    if (isOpen) {
      reset({
        equipmentAssetId: fixedAssetId || "",
        disposalReason: "RETIRED",
        remarks: "",
      });
    }
  }, [isOpen, fixedAssetId, reset]);

  const onSubmit = async (data: DisposalFormValues) => {
    await onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            Retire Equipment Asset
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Submit a decommission request for hardware items due to combat damage, safety wear, or technological obsolescence.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          {fixedAssetId && fixedAssetName ? (
            <div className="p-3 bg-[#EFF1EF]/60 dark:bg-[#1A2820]/60 border border-[#E6E8E6] dark:border-[#22352B] rounded-[8px]">
              <span className="text-muted-foreground font-semibold">Target Asset: </span>
              <span className="font-bold text-foreground">{fixedAssetName}</span>
            </div>
          ) : (
            <Select
              label="Select Equipment Asset"
              placeholder="Select asset serial..."
              options={assetOptions}
              value={selectedAsset}
              onChange={(e) => setValue("equipmentAssetId", e.target.value)}
              disabled={isLoading}
              error={errors.equipmentAssetId?.message as string}
            />
          )}

          <Select
            label="Decommission Reason"
            options={[
              { value: "RETIRED", label: "Retired / Obsolete" },
              { value: "DAMAGED", label: "Combat Damaged" },
              { value: "LOST", label: "Lost / Missing" },
              { value: "DESTROYED", label: "Destroyed" },
              { value: "SOLD", label: "Military Sales / Auctioned" },
              { value: "SCRAPPED", label: "Scrapped for Parts" },
            ]}
            value={selectedReason}
            onChange={(e) => setValue("disposalReason", e.target.value as "RETIRED" | "DAMAGED" | "LOST" | "DESTROYED" | "SOLD" | "SCRAPPED")}
            disabled={isLoading}
            error={errors.disposalReason?.message as string}
          />

          <FormField
            label="Log Remarks / Decommission Details"
            placeholder="Remarks regarding physical storage location..."
            error={errors.remarks?.message as string}
            disabled={isLoading}
            {...register("remarks")}
          />

          <DialogFooter className="mt-6">
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
              className="bg-[#DC2626] hover:bg-red-800 text-white font-bold"
            >
              {isLoading ? "Submitting..." : "Retire Equipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
