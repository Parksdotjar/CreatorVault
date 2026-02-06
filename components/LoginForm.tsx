"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validators";
import { useToast } from "@/components/ToastProvider";

export function LoginForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid credentials.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    push({
      title: "Welcome back",
      description: "You are logged in.",
      variant: "success",
    });
    const next = searchParams.get("next") ?? "/dashboard";
    router.push(next);
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-display">Log in</h1>
        <p className="text-sm text-white/60">
          Access your CreatorVault dashboard.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/70">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/70">
            Password
          </label>
          <Input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
          />
        </div>
        {error && <div className="text-xs text-rose-300">{error}</div>}
        <Button type="submit" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
    </Card>
  );
}
