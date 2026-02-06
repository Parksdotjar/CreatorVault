import Link from "next/link";
import { buttonVariants } from "@/components/buttonVariants";
import { AssetGrid } from "@/components/AssetGrid";
import { Card } from "@/components/Card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Asset } from "@/types/asset";

export const dynamic = "force-dynamic";

async function getAssets(
  orderBy: "download_count" | "created_at",
  limit = 6
) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("status", "ready")
    .eq("visibility", "public")
    .order(orderBy, { ascending: false })
    .limit(limit);
  return (data ?? []) as Asset[];
}

export default async function HomePage() {
  const [featured, trending, newest, topDownloads] = await Promise.all([
    getAssets("download_count"),
    getAssets("download_count"),
    getAssets("created_at"),
    getAssets("download_count", 3),
  ]);

  const previewMap = Object.fromEntries(
    [...featured, ...trending, ...newest, ...topDownloads].map((asset) => [
      asset.id,
      `/api/assets/${asset.id}/preview`,
    ])
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/40 bg-accent-500/10 px-4 py-1 text-xs font-semibold text-accent-400">
            Blocky space asset vault
          </div>
          <h1 className="text-4xl font-display leading-tight md:text-5xl">
            Upload Minecraft-ready assets with a neon voxel vibe.
          </h1>
          <p className="text-base text-white/70">
            CreatorVault keeps textures, backgrounds, SFX, presets, and video
            packs organized with fast direct downloads and clean creator
            profiles.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/browse" className={buttonVariants({ size: "lg" })}>
              Browse the vault
            </Link>
            <Link
              href="/dashboard/uploads"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Upload an asset
            </Link>
          </div>
        </div>
        <Card className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
            Creator highlights
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-sm bg-accent-500 shadow-glow" />
              Upload once, deliver everywhere with signed download links.
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-sm bg-accent-500 shadow-glow" />
              Track downloads per asset with privacy-safe analytics.
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-sm bg-accent-500 shadow-glow" />
              Control visibility and licensing in seconds.
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display">Featured drops</h2>
          <Link href="/browse" className="text-xs text-accent-400">
            View all
          </Link>
        </div>
        <AssetGrid assets={featured} previewMap={previewMap} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display">Trending now</h2>
        </div>
        <AssetGrid assets={trending} previewMap={previewMap} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display">Top downloads</h2>
        </div>
        <AssetGrid assets={topDownloads} previewMap={previewMap} />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display">Newest uploads</h2>
        </div>
        <AssetGrid assets={newest} previewMap={previewMap} />
      </section>
    </div>
  );
}
