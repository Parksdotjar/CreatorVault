import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AssetGrid } from "@/components/AssetGrid";
import type { Asset } from "@/types/asset";

type PageProps = {
  params: { username: string };
};

export default async function UserProfilePage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, socials")
    .eq("username", params.username)
    .single();

  if (!profile) return notFound();

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("owner_id", profile.id)
    .eq("status", "ready")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  const totalDownloads = (assets ?? []).reduce(
    (sum, asset) => sum + asset.download_count,
    0
  );

  const previewMap = Object.fromEntries(
    (assets ?? []).map((asset) => [asset.id, `/api/assets/${asset.id}/preview`])
  );

  const socials =
    profile.socials && typeof profile.socials === "object"
      ? profile.socials
      : {};
  const socialEntries = Object.entries(socials).filter(
    ([, value]) => typeof value === "string" && value.length > 0
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="rounded-voxel border border-white/10 bg-space-900/70 p-6 shadow-voxel">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/40">
              Creator profile
            </div>
            <h1 className="text-3xl font-display">
              {profile.display_name ?? `@${profile.username}`}
            </h1>
            <div className="text-xs text-white/50">@{profile.username}</div>
            <p className="mt-2 text-sm text-white/60">
              {profile.bio ?? "No bio yet."}
            </p>
            {socialEntries.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-accent-400">
                {socialEntries.map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-accent-500/40 px-3 py-1 hover:text-accent-300"
                  >
                    {key}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-voxel border border-white/10 bg-space-950/70 px-4 py-3 text-sm">
            <div className="text-white/60">Total downloads</div>
            <div className="text-xl font-semibold text-accent-400">
              {totalDownloads.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-display">Assets</h2>
        <AssetGrid assets={(assets ?? []) as Asset[]} previewMap={previewMap} />
      </section>
    </div>
  );
}
