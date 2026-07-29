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
import { User } from "@/types/user";
import { Base } from "@/types/base";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Email format is invalid"),
  role: z.enum(["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"] as const),
  baseId: z.string().nullable().optional(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  status: z.enum(["ACTIVE", "INACTIVE", "DEACTIVATED"] as const).optional(),
}).refine((data) => {
  if (data.role !== "ADMIN" && !data.baseId) {
    return false;
  }
  return true;
}, {
  message: "Base assignment is required for this role",
  path: ["baseId"],
});

const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Email format is invalid"),
  role: z.enum(["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"] as const),
  baseId: z.string().nullable().optional(),
  password: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DEACTIVATED"] as const),
}).refine((data) => {
  if (data.role !== "ADMIN" && !data.baseId) {
    return false;
  }
  return true;
}, {
  message: "Base assignment is required for this role",
  path: ["baseId"],
});

export interface UserFormValues {
  name: string;
  email: string;
  role: "ADMIN" | "BASE_COMMANDER" | "LOGISTICS_OFFICER";
  baseId?: string | null;
  password?: string;
  status?: "ACTIVE" | "INACTIVE" | "DEACTIVATED";
}

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: UserFormValues) => Promise<void>;
  user?: User | null;
  bases: Base[];
  isLoading?: boolean;
}

export function UserDialog({ isOpen, onClose, onConfirm, user, bases, isLoading }: UserDialogProps) {
  const mode = user ? "edit" : "create";
  const schema = mode === "create" ? createUserSchema : editUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<UserFormValues>,
    defaultValues: {
      name: "",
      email: "",
      role: "LOGISTICS_OFFICER",
      baseId: "",
      password: "",
      status: "ACTIVE",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          role: user.role,
          baseId: user.baseId || "",
          status: user.status,
          password: "",
        });
      } else {
        reset({
          name: "",
          email: "",
          role: "LOGISTICS_OFFICER",
          baseId: "",
          password: "",
          status: "ACTIVE",
        });
      }
    }
  }, [isOpen, user, reset]);

  // Sync selectedRole with baseId requirement
  useEffect(() => {
    if (selectedRole === "ADMIN") {
      setValue("baseId", "");
    }
  }, [selectedRole, setValue]);

  const onSubmit = async (data: UserFormValues) => {
    const payload = { ...data };
    if (payload.role === "ADMIN") {
      payload.baseId = null;
    } else if (!payload.baseId) {
      payload.baseId = null;
    }
    if (mode === "edit") {
      delete payload.password;
    }
    await onConfirm(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#111B15] text-[#111B15] dark:text-[#F5F5F2]">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg text-[#1A2820] dark:text-[#F5F5F2]">
            {mode === "create" ? "Enroll Officer Credentials" : "Modify Officer Credentials"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {mode === "create"
              ? "Register a new military personnel account and assign roles/permissions."
              : `Update credentials or revoke access privileges for ${user?.name}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="my-4 flex flex-col gap-4">
          <FormField
            label="Full Name"
            placeholder="e.g. Capt. Miller"
            error={errors.name?.message as string}
            disabled={isLoading}
            {...register("name")}
          />

          <FormField
            label="Security Email"
            placeholder="service.number@aegis.mil"
            error={errors.email?.message as string}
            disabled={isLoading}
            {...register("email")}
          />

          {mode === "create" && (
            <FormField
              label="Temporary Password"
              placeholder="••••••••"
              type="password"
              error={errors.password?.message as string}
              disabled={isLoading}
              {...register("password")}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="System Rank / Role"
              options={[
                { value: "ADMIN", label: "System Admin" },
                { value: "BASE_COMMANDER", label: "Base Commander" },
                { value: "LOGISTICS_OFFICER", label: "Logistics Officer" },
              ]}
              error={errors.role?.message as string}
              disabled={isLoading}
              {...register("role")}
            />

            <Select
              label="Base Allocation"
              placeholder="Select base..."
              options={bases.map((b) => ({ value: b.id, label: b.name }))}
              error={errors.baseId?.message as string}
              disabled={isLoading || selectedRole === "ADMIN"}
              {...register("baseId")}
            />
          </div>

          {mode === "edit" && (
            <Select
              label="Security Status"
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "DEACTIVATED", label: "Deactivated" },
              ]}
              error={errors.status?.message as string}
              disabled={isLoading}
              {...register("status")}
            />
          )}

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
                  ? "Enrolling..."
                  : "Updating..."
                : mode === "create"
                ? "Enroll Officer"
                : "Update Officer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
