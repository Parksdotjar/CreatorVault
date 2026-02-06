import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/Card";
import { ProfileBioForm } from "@/components/ProfileBioForm";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assets } = await supabase
    .from("assets")
    .select("id, download_count, status")
    .eq("owner_id", user?.id ?? "");

  const totalUploads = assets?.length ?? 0;
  const totalDownloads =
    assets?.reduce((sum, asset) => sum + (asset.download_count ?? 0), 0) ?? 0;
  const readyUploads =
    assets?.filter((asset) => asset.status === "ready").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display">Dashboard overview</h1>
        <p className="text-sm text-white/60">
          Track uploads, downloads, and creator metrics.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Uploads
          </div>
          <div className="mt-3 text-2xl font-semibold">{totalUploads}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Ready assets
          </div>
          <div className="mt-3 text-2xl font-semibold">{readyUploads}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-[0.3em] text-white/40">
            Total downloads
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {totalDownloads.toLocaleString()}
          </div>
        </Card>
      </div>
      <ProfileBioForm />
    </div>
  );
}
