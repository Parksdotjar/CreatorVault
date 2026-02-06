import { ASSET_TYPES, LICENSES, VISIBILITY } from "@/lib/constants";

export type AssetType = (typeof ASSET_TYPES)[number];
export type LicenseType = (typeof LICENSES)[number];
export type VisibilityType = (typeof VISIBILITY)[number];

export type Asset = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  type: AssetType;
  tags: string[];
  minecraft_version: string | null;
  license: LicenseType;
  visibility: VisibilityType;
  status: "uploading" | "ready" | "failed";
  storage_bucket: string;
  storage_path: string | null;
  mime_type: string | null;
  file_size: number | null;
  download_count: number;
  created_at: string;
  updated_at: string;
};
