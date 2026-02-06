"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { useToast } from "@/components/ToastProvider";
import { LICENSES, VISIBILITY, BUCKET_NAME } from "@/lib/constants";
import type { Asset } from "@/types/asset";
import { formatBytes, formatDate } from "@/lib/utils";

export function ManageAssets() {
  const supabase = createSupabaseBrowserClient();
  const { push } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    license: "personal",
    visibility: "public",
  });

  const loadAssets = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("assets")
      .select("*")
      .eq("owner_id", user?.id ?? "")
      .order("created_at", { ascending: false });
    setAssets((data ?? []) as Asset[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setForm({
      title: asset.title,
      description: asset.description ?? "",
      tags: asset.tags?.join(", ") ?? "",
      license: asset.license,
      visibility: asset.visibility,
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { error } = await supabase
      .from("assets")
      .update({
        title: form.title,
        description: form.description || null,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        license: form.license,
        visibility: form.visibility,
      })
      .eq("id", editing.id);

    if (error) {
      push({
        title: "Update failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    push({
      title: "Asset updated",
      description: "Metadata saved.",
      variant: "success",
    });
    setEditing(null);
    await loadAssets();
  };

  const updateVisibility = async (assetId: string, value: string) => {
    const { error } = await supabase
      .from("assets")
      .update({ visibility: value })
      .eq("id", assetId);
    if (error) {
      push({
        title: "Update failed",
        description: error.message,
        variant: "error",
      });
      return;
    }
    await loadAssets();
  };

  const removeAsset = async (asset: Asset) => {
    if (!confirm("Delete this asset? This cannot be undone.")) return;
    if (asset.storage_path) {
      await supabase.storage.from(BUCKET_NAME).remove([asset.storage_path]);
    }
    const { error } = await supabase.from("assets").delete().eq("id", asset.id);
    if (error) {
      push({
        title: "Delete failed",
        description: error.message,
        variant: "error",
      });
      return;
    }
    push({
      title: "Asset deleted",
      description: "Your asset has been removed.",
      variant: "success",
    });
    await loadAssets();
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="text-sm text-white/60">Loading your assets...</div>
      ) : assets.length ? (
        assets.map((asset) => (
          <Card key={asset.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{asset.title}</div>
                <div className="text-xs text-white/50">
                  {asset.type} · {formatDate(asset.created_at)} ·{" "}
                  {asset.file_size ? formatBytes(asset.file_size) : "—"}
                </div>
              </div>
              <div className="text-xs text-white/50">
                {asset.download_count.toLocaleString()} downloads
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={asset.visibility}
                onChange={(event) =>
                  updateVisibility(asset.id, event.target.value)
                }
              >
                {VISIBILITY.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Button variant="outline" onClick={() => openEdit(asset)}>
                Edit metadata
              </Button>
              <Button variant="ghost" onClick={() => removeAsset(asset)}>
                Delete
              </Button>
            </div>
            {asset.status !== "ready" && (
              <div className="text-xs text-amber-300">
                Status: {asset.status}
              </div>
            )}
          </Card>
        ))
      ) : (
        <div className="rounded-voxel border border-dashed border-white/10 bg-space-900/50 p-6 text-sm text-white/60">
          Upload your first asset to get started.
        </div>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit asset metadata"
      >
        <div className="space-y-4">
          <Input
            value={form.title}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, title: event.target.value }))
            }
            placeholder="Title"
          />
          <Textarea
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Description"
          />
          <Input
            value={form.tags}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, tags: event.target.value }))
            }
            placeholder="Tags (comma separated)"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={form.license}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, license: event.target.value }))
              }
            >
              {LICENSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Select
              value={form.visibility}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, visibility: event.target.value }))
              }
            >
              {VISIBILITY.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
