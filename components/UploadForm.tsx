"use client";

import { useMemo, useRef, useState } from "react";
import { assetSchema } from "@/lib/validators";
import { ACCEPT_STRINGS, ASSET_TYPES, LICENSES, MAX_UPLOAD_SIZES, MIME_ACCEPT } from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/components/ToastProvider";
import { formatBytes } from "@/lib/utils";

type UploadState = {
  status: "idle" | "uploading" | "success" | "failed";
  progress: number;
  assetId?: string;
  error?: string;
};

export function UploadForm() {
  const supabase = createSupabaseBrowserClient();
  const { push } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "png",
    tags: "",
    minecraft_version: "",
    license: "personal",
    visibility: "public",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const accept = useMemo(
    () => ACCEPT_STRINGS[form.type as (typeof ASSET_TYPES)[number]],
    [form.type]
  );

  const resetUpload = async () => {
    if (uploadState.assetId) {
      await supabase
        .from("assets")
        .update({ status: "failed" })
        .eq("id", uploadState.assetId);
    }
    setUploadState({ status: "idle", progress: 0 });
    xhrRef.current?.abort();
    xhrRef.current = null;
  };

  const handleUpload = async (assetId?: string) => {
    if (!file) return;
    const sizeLimit =
      MAX_UPLOAD_SIZES[form.type as (typeof ASSET_TYPES)[number]];
    if (file.size > sizeLimit) {
      push({
        title: "File too large",
        description: `Max size is ${formatBytes(sizeLimit)} for this type.`,
        variant: "error",
      });
      return;
    }

    if (
      !MIME_ACCEPT[form.type as (typeof ASSET_TYPES)[number]].includes(
        file.type
      )
    ) {
      push({
        title: "Invalid file type",
        description: `Your file must match ${form.type} requirements.`,
        variant: "error",
      });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token || !session.user) {
      push({
        title: "Sign in required",
        description: "Please log in before uploading assets.",
        variant: "error",
      });
      return;
    }

    const storagePath = `${session.user.id}/${assetId}/${file.name}`;

    setUploadState({ status: "uploading", progress: 0, assetId });

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open(
      "POST",
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/creatorvault-assets/${encodeURI(
        storagePath
      )}`
    );
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader(
      "apikey",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    );
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const progress = Math.round((event.loaded / event.total) * 100);
      setUploadState((prev) => ({ ...prev, progress }));
    };
    xhr.onerror = async () => {
      if (assetId) {
        await supabase
          .from("assets")
          .update({ status: "failed" })
          .eq("id", assetId);
      }
      setUploadState((prev) => ({
        ...prev,
        status: "failed",
        error: "Upload failed. Please retry.",
      }));
    };
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        await supabase
          .from("assets")
          .update({
            storage_path: storagePath,
            mime_type: file.type,
            file_size: file.size,
            status: "ready",
          })
          .eq("id", assetId);
        setUploadState((prev) => ({ ...prev, status: "success", progress: 100 }));
        push({
          title: "Upload complete",
          description: "Your asset is now live.",
          variant: "success",
        });
      } else {
        await supabase
          .from("assets")
          .update({ status: "failed" })
          .eq("id", assetId);
        setUploadState((prev) => ({
          ...prev,
          status: "failed",
          error: xhr.responseText || "Upload failed. Please retry.",
        }));
      }
    };
    xhr.send(file);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = assetSchema.safeParse({
      title: form.title,
      description: form.description || null,
      type: form.type,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      minecraft_version: form.minecraft_version || null,
      license: form.license,
      visibility: form.visibility,
    });

    if (!parsed.success) {
      push({
        title: "Invalid data",
        description: parsed.error.issues[0]?.message ?? "Check your inputs.",
        variant: "error",
      });
      return;
    }

    if (!file) {
      push({
        title: "File required",
        description: "Select a file to upload.",
        variant: "error",
      });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      push({
        title: "Sign in required",
        description: "Please log in before uploading assets.",
        variant: "error",
      });
      return;
    }

    setUploadState({ status: "uploading", progress: 0 });

    const { data: asset, error } = await supabase
      .from("assets")
      .insert({
        owner_id: user.id,
        title: parsed.data.title,
        description: parsed.data.description,
        type: parsed.data.type,
        tags: parsed.data.tags ?? [],
        minecraft_version: parsed.data.minecraft_version,
        license: parsed.data.license,
        visibility: parsed.data.visibility,
        status: "uploading",
      })
      .select("id")
      .single();

    if (error || !asset) {
      setUploadState({ status: "failed", progress: 0, error: error?.message });
      push({
        title: "Upload failed",
        description: error?.message ?? "Could not create asset record.",
        variant: "error",
      });
      return;
    }

    await handleUpload(asset.id);
  };

  const retry = async () => {
    if (!uploadState.assetId) return;
    await supabase
      .from("assets")
      .update({ status: "uploading" })
      .eq("id", uploadState.assetId);
    await handleUpload(uploadState.assetId);
  };

  return (
    <Card>
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Title</label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Crystal pickaxe glow"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Type</label>
            <Select
              value={form.type}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, type: event.target.value }))
              }
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/70">
            Description
          </label>
          <Textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="What makes this asset special?"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">Tags</label>
            <Input
              value={form.tags}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tags: event.target.value }))
              }
              placeholder="neon, glow, sci-fi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">
              Minecraft version
            </label>
            <Input
              value={form.minecraft_version}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  minecraft_version: event.target.value,
                }))
              }
              placeholder="1.20+"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">License</label>
            <Select
              value={form.license}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, license: event.target.value }))
              }
            >
              {LICENSES.map((license) => (
                <option key={license} value={license}>
                  {license}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">
              Visibility
            </label>
            <Select
              value={form.visibility}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, visibility: event.target.value }))
              }
            >
              <option value="public">public</option>
              <option value="private">private</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/70">
              Upload file
            </label>
            <Input
              type="file"
              accept={accept}
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file && (
              <div className="text-xs text-white/50">
                {file.name} · {formatBytes(file.size)}
              </div>
            )}
          </div>
        </div>

        {uploadState.status !== "idle" && (
          <ProgressBar
            value={uploadState.progress}
            label={
              uploadState.status === "uploading"
                ? "Uploading..."
                : uploadState.status === "success"
                ? "Upload complete"
                : "Upload failed"
            }
          />
        )}

        {uploadState.error && (
          <div className="text-xs text-rose-300">{uploadState.error}</div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            loading={uploadState.status === "uploading"}
            disabled={uploadState.status === "uploading"}
          >
            Start upload
          </Button>
          {uploadState.status === "uploading" && (
            <Button variant="outline" type="button" onClick={resetUpload}>
              Cancel upload
            </Button>
          )}
          {uploadState.status === "failed" && (
            <Button type="button" onClick={retry}>
              Retry upload
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
