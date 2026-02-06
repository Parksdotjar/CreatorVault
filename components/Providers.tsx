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
      setProfile(data ?? null);
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
