import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonVariantProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonVariantProps) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-voxel px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-space-950 disabled:cursor-not-allowed disabled:opacity-60",
    "motion-safe:hover:animate-voxel-jitter",
    variant === "primary" &&
      "bg-accent-500 text-black shadow-glow hover:shadow-glow-lg",
    variant === "secondary" && "bg-white/10 text-white hover:bg-white/20",
    variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
    variant === "outline" &&
      "border border-white/20 bg-transparent text-white hover:bg-white/10",
    size === "sm" && "px-3 py-1.5 text-xs",
    size === "lg" && "px-6 py-3 text-base",
    className
  );
}
