import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/uploads", label: "Upload new asset" },
  { href: "/dashboard/assets", label: "Manage assets" },
];

export function DashboardNav({ current }: { current?: string }) {
  return (
    <aside className="space-y-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "block rounded-voxel border border-white/10 bg-space-900/60 px-4 py-3 text-sm text-white/70 transition hover:border-accent-400/60 hover:text-white",
            current === link.href && "border-accent-400/70 text-white"
          )}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}
