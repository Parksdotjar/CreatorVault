"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { ReportModal } from "@/components/ReportModal";

type AssetDetailActionsProps = {
  assetId: string;
};

export function AssetDetailActions({ assetId }: AssetDetailActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            window.location.href = `/api/assets/${assetId}/download`;
          }}
        >
          Download asset
        </Button>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Report asset
        </Button>
      </div>
      <ReportModal assetId={assetId} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
