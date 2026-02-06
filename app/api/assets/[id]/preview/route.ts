import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET_NAME } from "@/lib/constants";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdmin();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: asset } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .single();

  if (!asset) {
    return NextResponse.json({ error: "Asset not available." }, { status: 404 });
  }

  const typedAsset = asset as {
    id: string;
    owner_id: string;
    status: string;
    visibility: string;
    storage_path: string | null;
  };

  if (typedAsset.status !== "ready" || !typedAsset.storage_path) {
    return NextResponse.json({ error: "Asset not available." }, { status: 404 });
  }

  if (
    typedAsset.visibility === "private" &&
    (!user || user.id !== typedAsset.owner_id)
  ) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const expiresIn =
    typedAsset.visibility === "public" ? 60 * 30 : 60 * 5;
  const { data: signed, error: signError } = await admin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(typedAsset.storage_path, expiresIn);

  if (signError || !signed) {
    return NextResponse.json({ error: "Could not sign URL." }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
