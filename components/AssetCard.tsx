import Link from "next/link";
import type { Asset } from "@/types/asset";
import { Badge } from "@/components/Badge";
import { cn, formatBytes } from "@/lib/utils";

type AssetCardProps = {
  asset: Asset;
  previewUrl?: string | null;
};

export function AssetCard({ asset, previewUrl }: AssetCardProps) {
  const isImage = asset.type === "png" || asset.type === "background";
  const isVideo = asset.type === "video";
  const isAudio = asset.type === "sfx";

  return (
    <Link
      href={`/asset/${asset.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-voxel border border-white/10 bg-space-900/70 p-4 shadow-voxel transition hover:border-accent-400/60 hover:shadow-glow"
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-voxel bg-space-950">
        {previewUrl && isImage ? (
          <img
            src={previewUrl}
            alt={asset.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/50">
            {isVideo && "Video preview"}
            {isAudio && "Audio wave"}
            {!isVideo && !isAudio && !isImage && "Preset pack"}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-white">
            {asset.title}
          </h3>
          <Badge>{asset.type}</Badge>
        </div>
        <p className="line-clamp-2 text-xs text-white/60">
          {asset.description ?? "No description provided."}
        </p>
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{asset.download_count.toLocaleString()} downloads</span>
          {asset.file_size ? <span>{formatBytes(asset.file_size)}</span> : null}
        </div>
      </div>
    </Link>
  );
}
