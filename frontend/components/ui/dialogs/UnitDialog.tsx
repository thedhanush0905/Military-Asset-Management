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
import { OrganizationUnit, OrgLevel } from "@/types/organization";

const unitFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  code: z.string().trim().min(2, "Code must be at least 2 characters long").toUpperCase(),
  level: z.enum(["COMMAND", "DIVISION", "BRIGADE", "BATTALION", "COMPANY", "PLATOON", "SECTION"]),
  parentId: z.string().trim().optional().nullable(),
});

export type UnitFormValues = z.infer<typeof unitFormSchema>;

interface Option {
  value: string;
  label: string;
}

interface UnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: UnitFormValues) => Promise<void>;
  unit?: OrganizationUnit | null;
  parentOptions?: Option[];
  isLoading?: boolean;
}

export function UnitDialog({
  isOpen,
  onClose,
  onConfirm,
  unit = null,
  parentOptions = [],
  isLoading,
}: UnitDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema) as unknown as Resolver<UnitFormValues>,
    defaultValues: {
      name: "",
      code: "",
      level: "COMMAND",
      parentId: "",
    },
  });

  const selectedLevel = watch("level");
  const selectedParent = watch("parentId");

  useEffect(() => {
    if (isOpen) {
      if (unit) {
        reset({
          name: unit.name,
          code: unit.code,
          level: unit.level,
          parentId: unit.parentId || "",
        });
      } else {
        reset({
          name: "",
          code: "",
          level: "COMMAND",
          parentId: "",
        });
      }
    }
  }, [isOpen, unit, reset]);

  const onSubmit = async (data: UnitFormValues) => {
    const payload = {
      ...data,
      parentId: data.parentId === "" ? null : data.parentId,
    };
    await onConfirm(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {unit ? "Edit Organizational Unit" : "Establish New Command / Unit"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Define structural level, abbreviation codes, and hierarchical parent command nodes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <FormField
            label="Command / Unit Name"
            placeholder="e.g. 101st Airborne Division"
            error={errors.name?.message}
            disabled={isLoading}
            {...register("name")}
          />

          <FormField
            label="Abbreviation / Code"
            placeholder="e.g. 101-ABN-DIV"
            error={errors.code?.message}
            disabled={isLoading}
            {...register("code")}
          />

          <Select
            label="Command level"
            options={[
              { value: "COMMAND", label: "Command HQ" },
              { value: "DIVISION", label: "Division" },
              { value: "BRIGADE", label: "Brigade" },
              { value: "BATTALION", label: "Battalion" },
              { value: "COMPANY", label: "Company" },
              { value: "PLATOON", label: "Platoon" },
              { value: "SECTION", label: "Section" },
            ]}
            value={selectedLevel}
            onChange={(e) => setValue("level", e.target.value as OrgLevel)}
            disabled={isLoading}
            error={errors.level?.message}
          />

          <Select
            label="Supervising Parent Command Node"
            placeholder="No parent (Top level Command HQ)"
            options={parentOptions}
            value={selectedParent || ""}
            onChange={(e) => setValue("parentId", e.target.value)}
            disabled={isLoading}
            error={errors.parentId?.message}
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
              {isLoading ? "Saving..." : unit ? "Update Unit" : "Establish Unit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
