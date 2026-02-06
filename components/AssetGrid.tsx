import type { Asset } from "@/types/asset";
import { AssetCard } from "@/components/AssetCard";

type AssetGridProps = {
  assets: Asset[];
  previewMap?: Record<string, string>;
};

export function AssetGrid({ assets, previewMap = {} }: AssetGridProps) {
  if (!assets.length) {
    return (
      <div className="rounded-voxel border border-dashed border-white/10 bg-space-900/50 p-8 text-center text-sm text-white/60">
        Nothing to show yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          previewUrl={previewMap[asset.id]}
        />
      ))}
    </div>
  );
}
