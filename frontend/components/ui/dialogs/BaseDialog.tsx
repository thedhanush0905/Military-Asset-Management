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
import { Base } from "@/types/base";

const baseFormSchema = z.object({
  code: z.string()
    .trim()
    .toUpperCase()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be at most 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, or underscores"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  location: z.string().trim().min(2, "Location must be at least 2 characters"),
});

export type BaseFormValues = z.infer<typeof baseFormSchema>;

interface BaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BaseFormValues) => Promise<void>;
  base?: Base | null;
  isLoading?: boolean;
}

export function BaseDialog({ isOpen, onClose, onConfirm, base, isLoading }: BaseDialogProps) {
  const mode = base ? "edit" : "create";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BaseFormValues>({
    resolver: zodResolver(baseFormSchema) as unknown as Resolver<BaseFormValues>,
    defaultValues: {
      code: "",
      name: "",
      location: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (base) {
        reset({
          code: base.code,
          name: base.name,
          location: base.location,
        });
      } else {
        reset({
          code: "",
          name: "",
          location: "",
        });
      }
    }
  }, [isOpen, base, reset]);

  const onSubmit = async (data: BaseFormValues) => {
    await onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {mode === "create" ? "Register Military Base" : "Update Base Coordinates"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {mode === "create"
              ? "Enroll a new operational base facility in Aegis Command registers."
              : `Modify name or location details for base ${base?.code}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <FormField
            label="Base Reference Code"
            placeholder="e.g. FB-NC (Alphanumeric/Hyphen)"
            error={errors.code?.message as string}
            disabled={isLoading || mode === "edit"}
            {...register("code")}
          />

          <FormField
            label="Official Facility Name"
            placeholder="e.g. Fort Braxton"
            error={errors.name?.message as string}
            disabled={isLoading}
            {...register("name")}
          />

          <FormField
            label="Geographic Location"
            placeholder="e.g. North Carolina, USA"
            error={errors.location?.message as string}
            disabled={isLoading}
            {...register("location")}
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
              {isLoading
                ? mode === "create"
                  ? "Registering..."
                  : "Updating..."
                : mode === "create"
                ? "Register Base"
                : "Update Base"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
