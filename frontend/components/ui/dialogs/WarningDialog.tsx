"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function WarningDialog({ isOpen, onClose, title, description }: WarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#F59E0B] font-semibold text-lg">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="bg-[#F59E0B] text-white hover:bg-orange-800">
            Acknowledge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
