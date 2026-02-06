import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/Card";
import { formatDate } from "@/lib/utils";

export default async function AdminReportsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: reports } = await supabase
    .from("asset_reports")
    .select("id, reason, details, created_at, asset_id, reporter_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const assetIds = Array.from(
    new Set((reports ?? []).map((report) => report.asset_id))
  );
  const reporterIds = Array.from(
    new Set(
      (reports ?? [])
        .map((report) => report.reporter_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  const { data: assets } = assetIds.length
    ? await supabase.from("assets").select("id, title").in("id", assetIds)
    : { data: [] };
  const { data: profiles } = reporterIds.length
    ? await supabase
        .from("profiles")
        .select("id, username")
        .in("id", reporterIds)
    : { data: [] };

  const assetMap = new Map(assets?.map((asset) => [asset.id, asset]) ?? []);
  const profileMap = new Map(
    profiles?.map((profile) => [profile.id, profile]) ?? []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display">Asset reports</h1>
        <p className="text-sm text-white/60">
          Review reported assets and take action.
        </p>
      </div>
      <div className="space-y-4">
        {(reports ?? []).length === 0 && (
          <div className="rounded-voxel border border-dashed border-white/10 bg-space-900/50 p-6 text-sm text-white/60">
            No reports yet.
          </div>
        )}
        {(reports ?? []).map((report) => {
          const asset = assetMap.get(report.asset_id);
          const reporter = report.reporter_id
            ? profileMap.get(report.reporter_id)
            : null;
          return (
            <Card key={report.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {asset ? asset.title : "Unknown asset"}
                </div>
                <div className="text-xs text-white/50">
                  {formatDate(report.created_at)}
                </div>
              </div>
              <div className="text-xs text-white/60">
                Reason: {report.reason}
              </div>
              {report.details && (
                <div className="text-xs text-white/70">{report.details}</div>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                <span>
                  Reporter: {reporter?.username ? `@${reporter.username}` : "anon"}
                </span>
                <Link
                  href={`/asset/${report.asset_id}`}
                  className="text-accent-400 hover:text-accent-300"
                >
                  View asset
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
