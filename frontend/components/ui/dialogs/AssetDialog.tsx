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
import { FormField } from "@/components/ui/forms/FormField";
import { Select } from "@/components/ui/forms/Select";
import { DatePicker } from "@/components/ui/forms/DatePicker";
import { EquipmentAsset } from "@/types/equipment-asset";

const assetFormSchema = z.object({
  serialNumber: z.string().trim().min(2, "Serial number must be at least 2 characters").max(100),
  equipmentId: z.string().trim().min(1, "Please select an equipment spec"),
  baseId: z.string().trim().min(1, "Please select a command base"),
  purchaseDate: z.string().optional().nullable(),
  purchaseCost: z.preprocess(
    (val) => (typeof val === "string" ? parseFloat(val) : val),
    z.number().nonnegative("Purchase cost cannot be negative")
  ),
  status: z.enum(["AVAILABLE", "ASSIGNED", "IN_TRANSIT", "MAINTENANCE", "DAMAGED", "LOST", "RETIRED"]).default("AVAILABLE"),
  condition: z.enum(["NEW", "GOOD", "FAIR", "DAMAGED", "UNSERVICEABLE"]).default("NEW"),
  remarks: z.string().trim().max(1000).optional().nullable(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

interface AssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AssetFormValues) => Promise<void>;
  asset?: EquipmentAsset | null;
  equipmentOptions: { value: string; label: string }[];
  baseOptions: { value: string; label: string }[];
  isLoading?: boolean;
}

export function AssetDialog({
  isOpen,
  onClose,
  onConfirm,
  asset,
  equipmentOptions,
  baseOptions,
  isLoading,
}: AssetDialogProps) {
  const mode = asset ? "edit" : "create";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema) as unknown as Resolver<AssetFormValues>,
    defaultValues: {
      serialNumber: "",
      equipmentId: "",
      baseId: "",
      purchaseDate: "",
      purchaseCost: 0,
      status: "AVAILABLE",
      condition: "NEW",
      remarks: "",
    },
  });

  const selectedEquipment = watch("equipmentId");
  const selectedBase = watch("baseId");
  const selectedStatus = watch("status");
  const selectedCondition = watch("condition");
  const purchaseDateValue = watch("purchaseDate");

  useEffect(() => {
    if (isOpen) {
      if (asset) {
        // Format purchaseDate safely for HTML inputs
        const rawDate = asset.purchaseDate ? new Date(asset.purchaseDate) : null;
        const formattedDate = rawDate && !isNaN(rawDate.getTime()) 
          ? rawDate.toISOString().split("T")[0] 
          : "";

        reset({
          serialNumber: asset.serialNumber,
          equipmentId: asset.equipmentId,
          baseId: asset.baseId,
          purchaseDate: formattedDate,
          purchaseCost: asset.purchaseCost,
          status: asset.status,
          condition: asset.condition,
          remarks: asset.remarks || "",
        });
      } else {
        reset({
          serialNumber: "",
          equipmentId: "",
          baseId: "",
          purchaseDate: new Date().toISOString().split("T")[0],
          purchaseCost: 0,
          status: "AVAILABLE",
          condition: "NEW",
          remarks: "",
        });
      }
    }
  }, [isOpen, asset, reset]);

  const onSubmit = async (data: AssetFormValues) => {
    // Format payload
    const formattedData = {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
      remarks: data.remarks || null,
    };
    await onConfirm(formattedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {mode === "create" ? "Register Individual Asset" : "Update Asset Registry"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {mode === "create"
              ? "Enter tracking codes and allocation parameters for specific hardware items."
              : `Modify parameters for asset ${asset?.serialNumber}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Serial Number (UID)"
              placeholder="e.g. US-TK-2031-H"
              error={errors.serialNumber?.message as string}
              disabled={isLoading}
              {...register("serialNumber")}
            />
            <Select
              label="Equipment Type Spec"
              placeholder="Select hardware spec..."
              options={equipmentOptions}
              value={selectedEquipment}
              onChange={(e) => setValue("equipmentId", e.target.value)}
              disabled={isLoading || mode === "edit"}
              error={errors.equipmentId?.message as string}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Base Assignment"
              placeholder="Select base..."
              options={baseOptions}
              value={selectedBase}
              onChange={(e) => setValue("baseId", e.target.value)}
              disabled={isLoading || mode === "edit"}
              error={errors.baseId?.message as string}
            />
            <Select
              label="Condition State"
              options={[
                { value: "NEW", label: "NEW - Unused" },
                { value: "GOOD", label: "GOOD - Normal Wear" },
                { value: "FAIR", label: "FAIR - Depreciated" },
                { value: "DAMAGED", label: "DAMAGED - Defective" },
                { value: "UNSERVICEABLE", label: "UNSERVICEABLE - Unusable" },
              ]}
              value={selectedCondition}
              onChange={(e) => setValue("condition", e.target.value as "NEW" | "GOOD" | "FAIR" | "DAMAGED" | "UNSERVICEABLE")}
              disabled={isLoading}
              error={errors.condition?.message as string}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Purchase Cost ($)"
              type="number"
              placeholder="e.g. 850000"
              error={errors.purchaseCost?.message as string}
              disabled={isLoading}
              {...register("purchaseCost", { valueAsNumber: true })}
            />
            <DatePicker
              label="Purchase Date"
              value={purchaseDateValue || ""}
              onChange={(e) => setValue("purchaseDate", e.target.value)}
              disabled={isLoading}
            />
          </div>

          {mode === "edit" && (
            <Select
              label="Asset Status"
              options={[
                { value: "AVAILABLE", label: "AVAILABLE - Ready for service" },
                { value: "ASSIGNED", label: "ASSIGNED - Active duty deploy" },
                { value: "IN_TRANSIT", label: "IN_TRANSIT - In logistics transfer" },
                { value: "MAINTENANCE", label: "MAINTENANCE - Under repair/depot service" },
                { value: "DAMAGED", label: "DAMAGED - Awaiting parts/check" },
                { value: "LOST", label: "LOST - Missing in action" },
                { value: "RETIRED", label: "RETIRED - Decommissioned" },
              ]}
              value={selectedStatus}
              onChange={(e) => setValue("status", e.target.value as "AVAILABLE" | "ASSIGNED" | "IN_TRANSIT" | "MAINTENANCE" | "DAMAGED" | "LOST" | "RETIRED")}
              disabled={isLoading}
              error={errors.status?.message as string}
            />
          )}

          <FormField
            label="Log Remarks"
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
              className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white"
            >
              {isLoading ? "Saving..." : mode === "create" ? "Register Asset" : "Update Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
