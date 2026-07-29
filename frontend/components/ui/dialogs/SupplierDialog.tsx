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
import { Supplier } from "@/types/supplier";

const supplierFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  code: z.string().trim().min(2, "Code must be at least 2 characters long").toUpperCase(),
  contactName: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Invalid email format").optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: SupplierFormValues) => Promise<void>;
  supplier?: Supplier | null;
  isLoading?: boolean;
}

export function SupplierDialog({
  isOpen,
  onClose,
  onConfirm,
  supplier = null,
  isLoading,
}: SupplierDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema) as unknown as Resolver<SupplierFormValues>,
    defaultValues: {
      name: "",
      code: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      status: "ACTIVE",
    },
  });

  const selectedStatus = watch("status");

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        reset({
          name: supplier.name,
          code: supplier.code,
          contactName: supplier.contactName || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          address: supplier.address || "",
          status: supplier.status,
        });
      } else {
        reset({
          name: "",
          code: "",
          contactName: "",
          email: "",
          phone: "",
          address: "",
          status: "ACTIVE",
        });
      }
    }
  }, [isOpen, supplier, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    // Map empty string email to null for backend validator
    const payload = {
      ...data,
      email: data.email === "" ? null : data.email,
    };
    await onConfirm(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {supplier ? "Edit Supplier Record" : "Register New Supplier"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Fill in supply contractor contact details and organizational codes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <FormField
            label="Supplier Name"
            placeholder="e.g. Northrop Grumman Systems"
            error={errors.name?.message}
            disabled={isLoading}
            {...register("name")}
          />

          <FormField
            label="Unique Code"
            placeholder="e.g. NGC-SYS"
            error={errors.code?.message}
            disabled={isLoading || !!supplier} // Disable code change on edit if preferred
            {...register("code")}
          />

          <FormField
            label="Contact Person Name"
            placeholder="e.g. Col. John Doe"
            error={errors.contactName?.message}
            disabled={isLoading}
            {...register("contactName")}
          />

          <FormField
            label="Email Address"
            placeholder="e.g. gov-procure@ngc.com"
            error={errors.email?.message}
            disabled={isLoading}
            {...register("email")}
          />

          <FormField
            label="Phone / Secure Line"
            placeholder="e.g. +1-555-0199"
            error={errors.phone?.message}
            disabled={isLoading}
            {...register("phone")}
          />

          <FormField
            label="Mailing / Logistics Address"
            placeholder="e.g. Building 4, Logistics Complex..."
            error={errors.address?.message}
            disabled={isLoading}
            {...register("address")}
          />

          <Select
            label="Vendor Status"
            options={[
              { value: "ACTIVE", label: "Active Supplier" },
              { value: "INACTIVE", label: "Inactive / Suspended" },
            ]}
            value={selectedStatus}
            onChange={(e) => setValue("status", e.target.value as "ACTIVE" | "INACTIVE")}
            disabled={isLoading}
            error={errors.status?.message}
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
              className="bg-[#2F4F3A] hover:bg-[#1A2820] text-white font-bold"
            >
              {isLoading ? "Saving..." : supplier ? "Update Supplier" : "Register Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
