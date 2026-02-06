"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full rounded-voxel border border-white/10 bg-space-900/70 px-3 py-2 text-sm text-white shadow-voxel outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-400/40",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
