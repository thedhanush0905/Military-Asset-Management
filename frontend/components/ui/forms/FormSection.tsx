import React from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="border-b border-[#E6E8E6] dark:border-[#22352B] pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
      <h3 className="text-sm font-semibold text-[#1A2820] dark:text-[#F5F5F2] tracking-wider uppercase mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mb-4">{description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}
