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
import { FormField, Select, Textarea } from "@/components/ui/forms";
import { Equipment } from "@/services/equipment.service";

const equipmentFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  category: z.enum(["WEAPON", "VEHICLE", "AMMUNITION", "COMMUNICATION", "MEDICAL", "OTHER"]),
  unit: z.enum(["NOS", "ROUNDS", "BOXES", "LITRES", "KGS", "METRES"]),
  description: z.string().trim().max(1000).optional().nullable(),
  manufacturer: z.string().trim().max(100).optional().nullable(),
  model: z.string().trim().max(100).optional().nullable(),
  specifications: z.string().trim().max(2000).optional().nullable(),
  expectedLifeYears: z.coerce.number().int().positive("Expected life years must be positive").optional().nullable(),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface EquipmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: EquipmentFormValues) => Promise<void>;
  equipment?: Equipment | null;
  isLoading?: boolean;
}

export function EquipmentDialog({ isOpen, onClose, onConfirm, equipment, isLoading }: EquipmentDialogProps) {
  const mode = equipment ? "edit" : "create";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema) as unknown as Resolver<EquipmentFormValues>,
    defaultValues: {
      name: "",
      category: "VEHICLE",
      unit: "NOS",
      description: "",
      manufacturer: "",
      model: "",
      specifications: "",
      expectedLifeYears: 10,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (equipment) {
        reset({
          name: equipment.name,
          category: equipment.category,
          unit: equipment.unit,
          description: equipment.description || "",
          manufacturer: equipment.manufacturer || "",
          model: equipment.model || "",
          specifications: equipment.specifications || "",
          expectedLifeYears: equipment.expectedLifeYears || 10,
        });
      } else {
        reset({
          name: "",
          category: "VEHICLE",
          unit: "NOS",
          description: "",
          manufacturer: "",
          model: "",
          specifications: "",
          expectedLifeYears: 10,
        });
      }
    }
  }, [isOpen, equipment, reset]);

  const onSubmit = async (data: EquipmentFormValues) => {
    const sanitizedData = {
      ...data,
      description: data.description?.trim() || null,
      manufacturer: data.manufacturer?.trim() || null,
      model: data.model?.trim() || null,
      specifications: data.specifications?.trim() || null,
      expectedLifeYears: data.expectedLifeYears || null,
    };
    await onConfirm(sanitizedData);
  };

  const selectedCategory = watch("category");
  const selectedUnit = watch("unit");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
              {mode === "create" ? "Add Equipment Specification" : "Modify Equipment Spec"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              {mode === "create"
                ? "Register a new hardware spec class to list under the master equipment catalog."
                : `Modify manufacturing details and specifications for ${equipment?.name}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="System / Item Name"
                placeholder="e.g. M1A2 Abrams"
                error={errors.name?.message}
                disabled={isLoading}
                {...register("name")}
              />
              <FormField
                label="Model Specification"
                placeholder="e.g. SEP v3"
                error={errors.model?.message}
                disabled={isLoading}
                {...register("model")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Manufacturer"
                placeholder="e.g. General Dynamics"
                error={errors.manufacturer?.message}
                disabled={isLoading}
                {...register("manufacturer")}
              />
              <Select
                label="Hardware Category"
                options={[
                  { value: "VEHICLE", label: "Vehicles & Transport" },
                  { value: "WEAPON", label: "Weapons & Howitzers" },
                  { value: "AMMUNITION", label: "Ammunition & Ordnance" },
                  { value: "COMMUNICATION", label: "Communications" },
                  { value: "MEDICAL", label: "Medical Kits" },
                  { value: "OTHER", label: "Other Supplies" },
                ]}
                value={selectedCategory}
                onChange={(e) => setValue("category", e.target.value as "WEAPON" | "VEHICLE" | "AMMUNITION" | "COMMUNICATION" | "MEDICAL" | "OTHER")}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Measurement Unit"
                options={[
                  { value: "NOS", label: "Number (NOS)" },
                  { value: "ROUNDS", label: "Rounds (ROUNDS)" },
                  { value: "BOXES", label: "Boxes (BOXES)" },
                  { value: "LITRES", label: "Litres (LITRES)" },
                  { value: "KGS", label: "Kilograms (KGS)" },
                  { value: "METRES", label: "Metres (METRES)" },
                ]}
                value={selectedUnit}
                onChange={(e) => setValue("unit", e.target.value as "NOS" | "ROUNDS" | "BOXES" | "LITRES" | "KGS" | "METRES")}
                disabled={isLoading}
              />
              <FormField
                label="Expected Life (Years)"
                type="number"
                error={errors.expectedLifeYears?.message}
                disabled={isLoading}
                {...register("expectedLifeYears")}
              />
            </div>

            <FormField
              label="Brief Description"
              placeholder="Provide a brief summary of the asset class purpose..."
              error={errors.description?.message}
              disabled={isLoading}
              {...register("description")}
            />

            <Textarea
              label="Technical Specifications Summary"
              placeholder="Weight: 64t, Engine: Turbine, Weaponry: 120mm Smoothbore..."
              error={errors.specifications?.message}
              disabled={isLoading}
              {...register("specifications")}
            />
          </div>

          <DialogFooter>
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
              {isLoading
                ? mode === "create"
                  ? "Registering..."
                  : "Updating..."
                : mode === "create"
                ? "Register Specs"
                : "Update Specs"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
