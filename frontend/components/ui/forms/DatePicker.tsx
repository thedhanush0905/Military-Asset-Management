"use client";

import React, { forwardRef } from "react";
import { FormField } from "./FormField";

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, helperText, ...props }, ref) => {
    return (
      <FormField
        type="date"
        label={label}
        error={error}
        helperText={helperText}
        ref={ref}
        {...props}
      />
    );
  }
);

DatePicker.displayName = "DatePicker";
