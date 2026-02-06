"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signupSchema } from "@/lib/validators";
import { useToast } from "@/components/ToastProvider";

export function SignupForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid data.");
      return;
    }

    setLoading(true);
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", parsed.data.username)
      .maybeSingle();

    if (existing) {
      setLoading(false);
      setError("Username is already taken.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          username: parsed.data.username,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("username")) {
        setError("Username is already taken.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (!data.session) {
      push({
        title: "Confirm your email",
        description: "Check your inbox to finish setting up your account.",
        variant: "info",
      });
      return;
    }

    push({
      title: "Account created",
      description: "Welcome to CreatorVault.",
      variant: "success",
    });
    router.push("/dashboard");
  };

  return (
    <Card className="mx-auto w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-display">Create account</h1>
        <p className="text-sm text-white/60">
          Claim your unique username and start uploading.
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
          <label className="text-xs font-semibold text-white/70">Username</label>
          <Input
            value={form.username}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, username: event.target.value }))
            }
            placeholder="blockybuilder"
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
          Create account
        </Button>
      </form>
    </Card>
  );
}
