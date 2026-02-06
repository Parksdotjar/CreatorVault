"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-voxel border border-white/10 bg-space-900/70 p-6 shadow-voxel backdrop-blur",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
