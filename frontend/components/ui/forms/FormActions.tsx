import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function FormActions({ onCancel, submitText = "Submit", cancelText = "Cancel", isLoading }: FormActionsProps) {
  return (
    <div className="flex justify-end gap-3 mt-6 border-t border-[#E6E8E6] dark:border-[#22352B] pt-4 w-full">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
      )}
      <Button type="submit" disabled={isLoading} className="bg-[#2F4F3A] text-white hover:bg-[#1A2820]">
        {isLoading ? "Processing..." : submitText}
      </Button>
    </div>
  );
}
