"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray, Resolver } from "react-hook-form";
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
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supplierService } from "@/services/supplier.service";

const procurementFormSchema = z.object({
  procurementNumber: z.string().trim().min(3, "PO number must be at least 3 characters").max(50),
  supplierId: z.string().trim().min(1, "Please select a supplier"),
  purchaseDate: z.string().min(1, "Please select purchase date"),
  expectedDeliveryDate: z.string().min(1, "Please select expected delivery date"),
  baseId: z.string().trim().min(1, "Please select destination base"),
  remarks: z.string().trim().max(1000).optional().nullable(),
  items: z.array(
    z.object({
      equipmentId: z.string().min(1, "Please select hardware catalog item"),
      quantity: z.number().int().positive("Quantity must be a positive integer"),
      unitCost: z.coerce.number().positive("Unit cost must be positive"),
    })
  ).min(1, "Procurement must contain at least one item"),
});

export type ProcurementFormValues = z.infer<typeof procurementFormSchema>;

interface ProcurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ProcurementFormValues) => Promise<void>;
  equipmentOptions: { value: string; label: string }[];
  baseOptions: { value: string; label: string }[];
  isLoading?: boolean;
}

export function ProcurementDialog({
  isOpen,
  onClose,
  onConfirm,
  equipmentOptions,
  baseOptions,
  isLoading,
}: ProcurementDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProcurementFormValues>({
    resolver: zodResolver(procurementFormSchema) as unknown as Resolver<ProcurementFormValues>,
    defaultValues: {
      procurementNumber: "",
      supplierId: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      baseId: "",
      remarks: "",
      items: [{ equipmentId: "", quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedBase = watch("baseId");
  const purchaseDateVal = watch("purchaseDate");
  const expectedDateVal = watch("expectedDeliveryDate");

  useEffect(() => {
    if (isOpen) {
      reset({
        procurementNumber: `PO-${Date.now().toString().slice(-6)}`,
        supplierId: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        baseId: "",
        remarks: "",
        items: [{ equipmentId: "", quantity: 1, unitCost: 0 }],
      });
    }
  }, [isOpen, reset]);

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers", "list", { status: "ACTIVE" }],
    queryFn: () => supplierService.getSuppliers({ page: 1, limit: 100, status: "ACTIVE" }),
  });
  const supplierOptions = suppliersData?.data?.suppliers.map((s) => ({ value: s.id, label: s.name })) || [];

  const onSubmit = async (data: ProcurementFormValues) => {
    await onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            Create Procurement Request (RFQ)
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Initiate contract procurement, allocate supplier lines, and configure expected delivery base storage.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="PO Reference Number"
              placeholder="e.g. PO-8022"
              error={errors.procurementNumber?.message as string}
              disabled={isLoading}
              {...register("procurementNumber")}
            />
            <Select
              label="Supplier Vendor"
              placeholder={supplierOptions.length > 0 ? "Select supplier..." : "No suppliers available. Create a supplier first."}
              options={supplierOptions}
              value={watch("supplierId") || ""}
              onChange={(e) => setValue("supplierId", e.target.value)}
              disabled={isLoading || supplierOptions.length === 0}
              error={errors.supplierId?.message as string}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Destination Base"
              placeholder="Select base..."
              options={baseOptions}
              value={selectedBase}
              onChange={(e) => setValue("baseId", e.target.value)}
              disabled={isLoading}
              error={errors.baseId?.message as string}
            />
            <FormField
              label="PO Date"
              type="date"
              error={errors.purchaseDate?.message as string}
              disabled={isLoading}
              value={purchaseDateVal}
              onChange={(e) => setValue("purchaseDate", e.target.value)}
            />
            <FormField
              label="Expected Delivery"
              type="date"
              error={errors.expectedDeliveryDate?.message as string}
              disabled={isLoading}
              value={expectedDateVal}
              onChange={(e) => setValue("expectedDeliveryDate", e.target.value)}
            />
          </div>

          {/* Dynamic Items Array */}
          <div className="border-t border-[#E6E8E6] dark:border-[#22352B] pt-4 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#1A2820] dark:text-[#F5F5F2]">Procured Hardware Items</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ equipmentId: "", quantity: 1, unitCost: 0 })}
                className="h-7 px-2 flex items-center gap-1 text-[10px] uppercase font-bold"
                disabled={isLoading}
              >
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>

            {fields.map((field, index) => {
              const itemEqId = watch(`items.${index}.equipmentId`);
              return (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-end border-b border-[#E6E8E6]/60 dark:border-[#22352B]/60 pb-3 mb-3">
                  <div className="col-span-6">
                    <Select
                      label={`Item #${index + 1}`}
                      placeholder="Select hardware spec..."
                      options={equipmentOptions}
                      value={itemEqId || ""}
                      onChange={(e) => setValue(`items.${index}.equipmentId`, e.target.value)}
                      disabled={isLoading}
                      error={errors.items?.[index]?.equipmentId?.message as string}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      label="Qty"
                      type="number"
                      placeholder="1"
                      disabled={isLoading}
                      error={errors.items?.[index]?.quantity?.message as string}
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      label="Cost ($)"
                      type="number"
                      placeholder="0.00"
                      disabled={isLoading}
                      error={errors.items?.[index]?.unitCost?.message as string}
                      {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 mb-1.5 text-destructive rounded-[6px] hover:bg-destructive/5 shrink-0"
                      disabled={isLoading || fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <FormField
            label="Log Remarks / Notes"
            placeholder="Contract reference details..."
            error={errors.remarks?.message as string}
            disabled={isLoading}
            {...register("remarks")}
          />

          <DialogFooter className="mt-6 border-t border-[#E6E8E6] dark:border-[#22352B] pt-4">
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
              {isLoading ? "Submitting..." : "Submit PO"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
