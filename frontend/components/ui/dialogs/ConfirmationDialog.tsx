"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";

export function ConfirmationDialog() {
  const { isOpen, title, description, onConfirm, onCancel, confirmText, cancelText, close } = useConfirmDialog();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1A2820] dark:text-[#F5F5F2] font-semibold text-lg">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancel} className="border-[#E6E8E6] text-[#1A2820]">
            {cancelText}
          </Button>
          <Button onClick={onConfirm} className="bg-[#2F4F3A] text-white hover:bg-[#1A2820]">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
