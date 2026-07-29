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

const configFormSchema = z.object({
  key: z.string().trim().min(2, "Key must be at least 2 characters long"),
  value: z.string().trim().min(1, "Value cannot be empty"),
  description: z.string().trim().optional(),
});

export type ConfigFormValues = z.infer<typeof configFormSchema>;

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ConfigFormValues) => Promise<void>;
  config?: { key: string; value: string; description: string | null } | null;
  isLoading?: boolean;
}

export function ConfigDialog({
  isOpen,
  onClose,
  onConfirm,
  config = null,
  isLoading,
}: ConfigDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configFormSchema) as unknown as Resolver<ConfigFormValues>,
    defaultValues: {
      key: "",
      value: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (config) {
        reset({
          key: config.key,
          value: config.value,
          description: config.description || "",
        });
      } else {
        reset({
          key: "",
          value: "",
          description: "",
        });
      }
    }
  }, [isOpen, config, reset]);

  const onSubmit = async (data: ConfigFormValues) => {
    await onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {config ? "Modify Config Parameter" : "Register Config Parameter"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Specify configuration settings and metadata parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <FormField
            label="Configuration Key"
            placeholder="e.g. TACTICAL_ALERT_LEVEL"
            error={errors.key?.message}
            disabled={isLoading || !!config} // Cannot rename key on edit
            {...register("key")}
          />

          <FormField
            label="Value"
            placeholder="e.g. RED"
            error={errors.value?.message}
            disabled={isLoading}
            {...register("value")}
          />

          <FormField
            label="Description / Purpose"
            placeholder="Describe the utilization parameters..."
            error={errors.description?.message}
            disabled={isLoading}
            {...register("description")}
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
              {isLoading ? "Saving..." : config ? "Update Parameter" : "Register Parameter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
