"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";

const reasons = ["spam", "stolen", "inappropriate", "other"] as const;

type ReportModalProps = {
  assetId: string;
  open: boolean;
  onClose: () => void;
};

export function ReportModal({ assetId, open, onClose }: ReportModalProps) {
  const supabase = createSupabaseBrowserClient();
  const { push } = useToast();
  const [reason, setReason] = useState<(typeof reasons)[number]>("spam");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("asset_reports").insert({
      asset_id: assetId,
      reporter_id: user?.id ?? null,
      reason,
      details: details.trim() ? details.trim() : null,
    });

    setLoading(false);
    if (error) {
      push({
        title: "Report failed",
        description: error.message,
        variant: "error",
      });
      return;
    }

    push({
      title: "Report submitted",
      description: "Thanks for keeping the vault safe.",
      variant: "success",
    });
    setDetails("");
    setReason("spam");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Report asset">
      <div className="space-y-4">
        <Select value={reason} onChange={(event) => setReason(event.target.value as (typeof reasons)[number])}>
          {reasons.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Textarea
          placeholder="Add any extra context (optional)."
          value={details}
          onChange={(event) => setDetails(event.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submitReport} loading={loading}>
            Submit report
          </Button>
        </div>
      </div>
    </Modal>
  );
}
