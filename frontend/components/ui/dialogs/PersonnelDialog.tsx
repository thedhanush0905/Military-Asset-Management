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
import { Personnel, PersonnelStatus } from "@/types/personnel";

const personnelFormSchema = z.object({
  serviceNumber: z.string().trim().min(2, "Service Number must be at least 2 characters long").toUpperCase(),
  rank: z.string().trim().min(1, "Rank cannot be empty"),
  firstName: z.string().trim().min(1, "First Name cannot be empty"),
  lastName: z.string().trim().min(1, "Last Name cannot be empty"),
  unitId: z.string().trim().optional().nullable(),
  email: z.string().trim().email("Invalid email format").optional().nullable().or(z.literal("")),
  phone: z.string().trim().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "DEPLOYED", "ON_LEAVE"]).default("ACTIVE"),
});

export type PersonnelFormValues = z.infer<typeof personnelFormSchema>;

interface Option {
  value: string;
  label: string;
}

interface PersonnelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: PersonnelFormValues) => Promise<void>;
  personnel?: Personnel | null;
  unitOptions?: Option[];
  isLoading?: boolean;
}

export function PersonnelDialog({
  isOpen,
  onClose,
  onConfirm,
  personnel = null,
  unitOptions = [],
  isLoading,
}: PersonnelDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelFormSchema) as unknown as Resolver<PersonnelFormValues>,
    defaultValues: {
      serviceNumber: "",
      rank: "Sgt.",
      firstName: "",
      lastName: "",
      unitId: "",
      email: "",
      phone: "",
      status: "ACTIVE",
    },
  });

  const selectedRank = watch("rank");
  const selectedUnit = watch("unitId");
  const selectedStatus = watch("status");

  useEffect(() => {
    if (isOpen) {
      if (personnel) {
        reset({
          serviceNumber: personnel.serviceNumber,
          rank: personnel.rank,
          firstName: personnel.firstName,
          lastName: personnel.lastName,
          unitId: personnel.unitId || "",
          email: personnel.email || "",
          phone: personnel.phone || "",
          status: personnel.status,
        });
      } else {
        reset({
          serviceNumber: "",
          rank: "Sgt.",
          firstName: "",
          lastName: "",
          unitId: "",
          email: "",
          phone: "",
          status: "ACTIVE",
        });
      }
    }
  }, [isOpen, personnel, reset]);

  const onSubmit = async (data: PersonnelFormValues) => {
    const payload = {
      ...data,
      unitId: data.unitId === "" ? null : data.unitId,
      email: data.email === "" ? null : data.email,
    };
    await onConfirm(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {personnel ? "Edit Personnel Profile" : "Enroll New Personnel"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Register new active personnel to assign tactical assets and track command chains.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Service Number (SN)"
              placeholder="e.g. SN-88319-K"
              error={errors.serviceNumber?.message}
              disabled={isLoading || !!personnel}
              {...register("serviceNumber")}
            />
            <Select
              label="Rank Rating"
              options={[
                { value: "Col.", label: "Colonel (Col.)" },
                { value: "Maj.", label: "Major (Maj.)" },
                { value: "Cpt.", label: "Captain (Cpt.)" },
                { value: "Lt.", label: "Lieutenant (Lt.)" },
                { value: "Tech. Sgt.", label: "Technical Sergeant" },
                { value: "Sgt.", label: "Sergeant (Sgt.)" },
                { value: "Pvt.", label: "Private (Pvt.)" },
              ]}
              value={selectedRank}
              onChange={(e) => setValue("rank", e.target.value)}
              disabled={isLoading}
              error={errors.rank?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              placeholder="e.g. Wei"
              error={errors.firstName?.message}
              disabled={isLoading}
              {...register("firstName")}
            />
            <FormField
              label="Last Name"
              placeholder="e.g. Chen"
              error={errors.lastName?.message}
              disabled={isLoading}
              {...register("lastName")}
            />
          </div>

          <FormField
            label="HQ Email Address"
            placeholder="email@military.gov"
            error={errors.email?.message}
            disabled={isLoading}
            {...register("email")}
          />

          <FormField
            label="Direct Roster Phone Line"
            placeholder="+1 (555) 012-3456"
            error={errors.phone?.message}
            disabled={isLoading}
            {...register("phone")}
          />

          <Select
            label="Command Division / Unit"
            placeholder="Select command unit..."
            options={unitOptions}
            value={selectedUnit || ""}
            onChange={(e) => setValue("unitId", e.target.value)}
            disabled={isLoading}
            error={errors.unitId?.message}
          />

          <Select
            label="Active Duty Status"
            options={[
              { value: "ACTIVE", label: "Active Duty" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "DEPLOYED", label: "Deployed" },
              { value: "ON_LEAVE", label: "On Leave" },
            ]}
            value={selectedStatus}
            onChange={(e) => setValue("status", e.target.value as PersonnelStatus)}
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
              {isLoading ? "Saving..." : personnel ? "Update Officer" : "Enroll Officer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
