import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET_NAME } from "@/lib/constants";

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

  const expiresIn = asset.visibility === "public" ? 60 * 30 : 60 * 5;
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(asset.storage_path, expiresIn);

  if (signError || !signed) {
    return NextResponse.json({ error: "Could not sign URL." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
