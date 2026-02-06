"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={cn(
          "relative w-full max-w-lg rounded-voxel border border-white/10 bg-space-900/95 p-6 shadow-glow"
        )}
      >
        {title && (
          <div className="mb-4 text-lg font-semibold text-white">{title}</div>
        )}
        {children}
      </div>
    </div>
  );
}
