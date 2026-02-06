import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AssetPreview } from "@/components/AssetPreview";
import { Badge } from "@/components/Badge";
import { AssetGrid } from "@/components/AssetGrid";
import { AssetDetailActions } from "@/components/AssetDetailActions";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Asset } from "@/types/asset";

type PageProps = {
  params: { id: string };
};

export default async function AssetDetailPage({ params }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: asset } = await supabase
    .from("assets")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!asset) {
    return notFound();
  }

  if (
    asset.visibility === "private" &&
    (!user || user.id !== asset.owner_id)
  ) {
    return notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, bio")
    .eq("id", asset.owner_id)
    .single();

  let relatedQuery = supabase
    .from("assets")
    .select("*")
    .eq("status", "ready")
    .eq("visibility", "public")
    .eq("type", asset.type)
    .neq("id", asset.id);

  if (asset.tags?.length) {
    relatedQuery = relatedQuery.overlaps("tags", asset.tags);
  }

  const { data: related } = await relatedQuery.limit(6);

  const previewUrl = `/api/assets/${asset.id}/preview`;
  const previewMap = Object.fromEntries(
    (related ?? []).map((item) => [item.id, `/api/assets/${item.id}/preview`])
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <AssetPreview asset={asset as Asset} previewUrl={previewUrl} />
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{asset.type}</Badge>
              <Badge>{asset.license}</Badge>
              {asset.visibility === "private" && <Badge>private</Badge>}
            </div>
            <h1 className="text-3xl font-display">{asset.title}</h1>
            <p className="text-sm text-white/70">
              {asset.description ?? "No description provided."}
            </p>
          </div>

          <div className="space-y-2 rounded-voxel border border-white/10 bg-space-900/70 p-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Uploader</span>
              {profile?.username ? (
                <Link
                  href={`/u/${profile.username}`}
                  className="text-accent-400 hover:text-accent-300"
                >
                  @{profile.username}
                </Link>
              ) : (
                <span className="text-white/50">Unknown</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Downloads</span>
              <span>{asset.download_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Size</span>
              <span>{asset.file_size ? formatBytes(asset.file_size) : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Uploaded</span>
              <span>{formatDate(asset.created_at)}</span>
            </div>
            {asset.tags?.length ? (
              <div className="flex flex-wrap gap-2 pt-2 text-xs text-accent-400">
                {asset.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-accent-500/40 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <AssetDetailActions assetId={asset.id} />
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-display">Related assets</h2>
        <AssetGrid assets={(related ?? []) as Asset[]} previewMap={previewMap} />
      </section>
    </div>
  );
}
