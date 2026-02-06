import { ManageAssets } from "@/components/ManageAssets";

export default function DashboardAssetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display">Manage assets</h1>
        <p className="text-sm text-white/60">
          Edit metadata, toggle visibility, or delete uploads.
        </p>
      </div>
      <ManageAssets />
    </div>
  );
}
