import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET_NAME } from "@/lib/constants";
import crypto from "crypto";

type RouteContext = {
  params: { id: string };
};

export async function GET(_: Request, { params }: RouteContext) {
  const supabase = createSupabaseServerClient();
  const admin = createSupabaseAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: asset } = await supabase
    .from("assets")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!asset || asset.status !== "ready" || !asset.storage_path) {
    return NextResponse.json({ error: "Asset not available." }, { status: 404 });
  }

  if (asset.visibility === "private" && (!user || user.id !== asset.owner_id)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const expiresIn = asset.visibility === "public" ? 60 * 60 * 4 : 60 * 15;
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(asset.storage_path, expiresIn);

  if (signError || !signed) {
    return NextResponse.json({ error: "Could not sign URL." }, { status: 500 });
  }

  const requestHeaders = headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = ip
    ? crypto.createHash("sha256").update(ip).digest("hex")
    : null;

  await admin
    .from("assets")
    .update({ download_count: asset.download_count + 1 })
    .eq("id", asset.id);

  await admin.from("asset_downloads").insert({
    asset_id: asset.id,
    downloader_id: user?.id ?? null,
    ip_hash: ipHash,
  });

  return NextResponse.redirect(signed.signedUrl);
}
