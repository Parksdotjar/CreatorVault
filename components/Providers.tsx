"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/profile";
import { ToastProvider } from "@/components/ToastProvider";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeSocials(input: unknown): Record<string, string> | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }
  const entries = Object.entries(input as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      if (typeof value === "string" && value.length > 0) {
        acc.push([key, value]);
      }
      return acc;
    },
    [] as [string, string][]
  );
  return entries.length ? Object.fromEntries(entries) : null;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within Providers");
  }
  return context;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (currentUser: User | null) => {
      if (!currentUser) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, bio, socials, role, created_at")
        .eq("id", currentUser.id)
        .single();
      if (!data) {
        setProfile(null);
        return;
      }
      setProfile({
        id: data.id,
        username: data.username,
        display_name: data.display_name ?? null,
        bio: data.bio ?? null,
        socials: normalizeSocials(data.socials),
        role: (data.role as Profile["role"]) ?? "user",
        created_at: data.created_at,
      });
    },
    [supabase]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    setUser(currentUser ?? null);
    await loadProfile(currentUser ?? null);
    setLoading(false);
  }, [loadProfile, supabase]);

  useEffect(() => {
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [loadProfile, refresh, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
