"use client";

import * as React from "react";
import {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/buttonVariants";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        )}
        {props.children}
      </button>
    );
  }
);

Button.displayName = "Button";
