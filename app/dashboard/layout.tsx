import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio")
    .eq("id", user?.id ?? "")
    .single();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[240px_1fr]">
      <div className="space-y-4">
        <div className="rounded-voxel border border-white/10 bg-space-900/70 p-4 text-sm text-white/70">
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Creator
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {profile?.display_name ?? `@${profile?.username ?? "creator"}`}
          </div>
          <div className="text-xs text-white/50">
            {profile?.bio ?? "Update your bio in settings soon."}
          </div>
        </div>
        <DashboardNav />
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
