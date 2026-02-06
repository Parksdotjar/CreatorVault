"use client";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

type TabsProps = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
};

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-space-900/60 p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition",
            active === tab.id
              ? "bg-accent-500 text-black shadow-glow"
              : "text-white/70 hover:text-white"
          )}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
