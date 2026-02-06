"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ASSET_TYPES, LICENSES } from "@/lib/constants";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Tabs } from "@/components/Tabs";
import { AssetGrid } from "@/components/AssetGrid";
import type { Asset } from "@/types/asset";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "downloads", label: "Downloads" },
];

export function BrowseClient() {
  const supabase = createSupabaseBrowserClient();
  const [activeType, setActiveType] = useState<string>("png");
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState("");
  const [license, setLicense] = useState("");
  const [minecraftVersion, setMinecraftVersion] = useState("");
  const [sort, setSort] = useState("newest");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const previewMap = useMemo(
    () =>
      Object.fromEntries(
        assets.map((asset) => [asset.id, `/api/assets/${asset.id}/preview`])
      ),
    [assets]
  );

  useEffect(() => {
    let active = true;
    const fetchAssets = async () => {
      setLoading(true);
      let queryBuilder = supabase
        .from("assets")
        .select("*")
        .eq("status", "ready")
        .eq("visibility", "public")
        .eq("type", activeType);

      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      const tagList = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      if (tagList.length) {
        queryBuilder = queryBuilder.contains("tags", tagList);
      }

      if (license) {
        queryBuilder = queryBuilder.eq("license", license);
      }

      if (minecraftVersion.trim()) {
        queryBuilder = queryBuilder.ilike(
          "minecraft_version",
          `%${minecraftVersion.trim()}%`
        );
      }

      if (sort === "newest") {
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      } else {
        queryBuilder = queryBuilder.order("download_count", { ascending: false });
      }

      const { data } = await queryBuilder.limit(36);
      if (active) {
        setAssets((data ?? []) as Asset[]);
        setLoading(false);
      }
    };

    fetchAssets();
    return () => {
      active = false;
    };
  }, [activeType, license, minecraftVersion, query, sort, supabase, tags]);

  return (
    <div className="space-y-6">
      <Tabs
        tabs={ASSET_TYPES.map((type) => ({
          id: type,
          label: type.toUpperCase(),
        }))}
        active={activeType}
        onChange={setActiveType}
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <Input
          placeholder="Search titles or descriptions"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <Select value={license} onChange={(event) => setLicense(event.target.value)}>
          <option value="">All licenses</option>
          {LICENSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(event) => setSort(event.target.value)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <Input
          placeholder="Minecraft version (optional)"
          value={minecraftVersion}
          onChange={(event) => setMinecraftVersion(event.target.value)}
        />
        {loading && (
          <div className="flex items-center text-xs text-white/50">
            Loading assets...
          </div>
        )}
      </div>

      <AssetGrid assets={assets} previewMap={previewMap} />
    </div>
  );
}
