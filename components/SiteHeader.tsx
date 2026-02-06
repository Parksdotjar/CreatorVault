"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/Button";
import { useAuth } from "@/components/Providers";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, profile, loading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/5 bg-space-950/70 backdrop-blur",
        scrolled && "shadow-voxel"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg">
          <span className="h-4 w-4 rounded-sm bg-accent-500 shadow-glow" />
          CreatorVault
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/80 md:flex">
          <Link href="/browse" className="hover:text-white">
            Browse
          </Link>
          <Link href="/dashboard/uploads" className="hover:text-white">
            Upload
          </Link>
          <Link href="/dashboard/assets" className="hover:text-white">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <div className="hidden text-xs text-white/60 sm:block">
                {profile?.display_name
                  ? profile.display_name
                  : profile?.username
                  ? `@${profile.username}`
                  : user.email}
              </div>
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className={buttonVariants({ size: "sm" })}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
