"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/forms/Textarea";

interface ApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (remarks: string) => void;
  onReject: (remarks: string) => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export function ApprovalDialog({ isOpen, onClose, onApprove, onReject, title, description, isLoading }: ApprovalDialogProps) {
  const [remarks, setRemarks] = useState("");

  const handleApprove = () => {
    onApprove(remarks);
    setRemarks("");
  };

  const handleReject = () => {
    onReject(remarks);
    setRemarks("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1A2820] dark:text-[#F5F5F2] font-semibold text-lg">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">{description}</DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <Textarea
            label="Remarks / Justification"
            placeholder="Enter justification for approval or reason for rejection..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="border-[#E6E8E6] text-[#1A2820]">
            Cancel
          </Button>
          <Button onClick={handleReject} disabled={isLoading} className="bg-[#DC2626] text-white hover:bg-red-800">
            Reject
          </Button>
          <Button onClick={handleApprove} disabled={isLoading} className="bg-[#2E7D32] text-white hover:bg-green-800">
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
