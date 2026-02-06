export const ASSET_TYPES = [
  "png",
  "background",
  "sfx",
  "preset",
  "video",
] as const;

export const LICENSES = ["personal", "commercial", "cc0", "custom"] as const;

export const VISIBILITY = ["public", "private"] as const;

export const MAX_UPLOAD_SIZES: Record<(typeof ASSET_TYPES)[number], number> = {
  png: 25 * 1024 * 1024,
  background: 25 * 1024 * 1024,
  sfx: 50 * 1024 * 1024,
  preset: 100 * 1024 * 1024,
  video: 500 * 1024 * 1024,
};

export const MIME_ACCEPT: Record<(typeof ASSET_TYPES)[number], string[]> = {
  png: ["image/png", "image/jpeg", "image/webp"],
  background: ["image/png", "image/jpeg", "image/webp"],
  sfx: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"],
  preset: [
    "application/zip",
    "application/x-zip-compressed",
    "application/json",
    "text/plain",
  ],
  video: ["video/mp4", "video/webm", "video/quicktime"],
};

export const ACCEPT_STRINGS: Record<(typeof ASSET_TYPES)[number], string> = {
  png: "image/png,image/jpeg,image/webp",
  background: "image/png,image/jpeg,image/webp",
  sfx: "audio/*",
  preset:
    ".zip,.json,.txt,application/zip,application/x-zip-compressed,application/json,text/plain",
  video: "video/mp4,video/webm,video/quicktime",
};

export const BUCKET_NAME = "creatorvault-assets";
