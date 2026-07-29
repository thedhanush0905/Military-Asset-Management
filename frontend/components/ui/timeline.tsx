"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  iconColorClass?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("flow-root", className)}>
      <ul className="-mb-8">
        {items.map((item, itemIdx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {itemIdx !== items.length - 1 ? (
                <span 
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-[#E6E8E6] dark:bg-[#22352B]" 
                  aria-hidden="true" 
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-[#111B15] bg-[#EFF1EF] dark:bg-[#1A2820] text-muted-foreground",
                    item.iconColorClass
                  )}>
                    {item.icon ? (
                      item.icon
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-400" />
                    )}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm font-semibold text-[#1A2820] dark:text-[#F5F5F2]">
                      {item.title}
                      {item.subtitle && (
                        <span className="font-normal text-muted-foreground ml-2">
                          {item.subtitle}
                        </span>
                      )}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs whitespace-nowrap text-muted-foreground">
                    <time dateTime={item.timestamp}>{item.timestamp}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
