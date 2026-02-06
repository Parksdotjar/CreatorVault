"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  push: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    setToasts((prev) => [
      ...prev,
      { ...toast, id: `${Date.now()}-${Math.random()}` },
    ]);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 4200)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed right-6 top-6 z-50 flex w-full max-w-sm flex-col gap-3"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-voxel border border-white/10 bg-space-900/90 px-4 py-3 shadow-voxel backdrop-blur",
              toast.variant === "success" && "border-emerald-400/60",
              toast.variant === "error" && "border-rose-400/60"
            )}
          >
            <div className="font-semibold text-sm">{toast.title}</div>
            {toast.description && (
              <p className="text-xs text-slate-300">{toast.description}</p>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
