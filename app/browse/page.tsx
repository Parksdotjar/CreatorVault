import { BrowseClient } from "@/components/BrowseClient";

export default function BrowsePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display">Browse the vault</h1>
        <p className="text-sm text-white/60">
          Filter by type, tags, license, and Minecraft version.
        </p>
      </div>
      <BrowseClient />
    </div>
  );
}
