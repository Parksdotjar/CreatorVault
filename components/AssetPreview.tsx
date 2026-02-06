import type { Asset } from "@/types/asset";

type AssetPreviewProps = {
  asset: Asset;
  previewUrl: string | null;
};

export function AssetPreview({ asset, previewUrl }: AssetPreviewProps) {
  if (!previewUrl) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-voxel border border-white/10 bg-space-900/70 text-sm text-white/50">
        Preview unavailable.
      </div>
    );
  }

  if (asset.type === "png" || asset.type === "background") {
    return (
      <img
        src={previewUrl}
        alt={asset.title}
        className="w-full rounded-voxel border border-white/10 object-cover"
      />
    );
  }

  if (asset.type === "video") {
    return (
      <video
        controls
        className="w-full rounded-voxel border border-white/10"
      >
        <source src={previewUrl} type={asset.mime_type ?? undefined} />
      </video>
    );
  }

  if (asset.type === "sfx") {
    return (
      <audio controls className="w-full">
        <source src={previewUrl} type={asset.mime_type ?? undefined} />
      </audio>
    );
  }

  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-voxel border border-white/10 bg-space-900/70 text-sm text-white/50">
      Preset file ready for download.
    </div>
  );
}
