"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/Providers";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { useToast } from "@/components/ToastProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ProfileBioForm() {
  const supabase = createSupabaseBrowserClient();
  const { profile, refresh } = useAuth();
  const { push } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [website, setWebsite] = useState(
    (profile?.socials as Record<string, string> | null)?.website ?? ""
  );
  const [twitter, setTwitter] = useState(
    (profile?.socials as Record<string, string> | null)?.twitter ?? ""
  );
  const [youtube, setYoutube] = useState(
    (profile?.socials as Record<string, string> | null)?.youtube ?? ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
    setWebsite(
      (profile?.socials as Record<string, string> | null)?.website ?? ""
    );
    setTwitter(
      (profile?.socials as Record<string, string> | null)?.twitter ?? ""
    );
    setYoutube(
      (profile?.socials as Record<string, string> | null)?.youtube ?? ""
    );
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setLoading(true);
    const socials = {
      website: website.trim(),
      twitter: twitter.trim(),
      youtube: youtube.trim(),
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        socials,
      })
      .eq("id", profile.id);
    setLoading(false);
    if (error) {
      push({
        title: "Update failed",
        description: error.message,
        variant: "error",
      });
      return;
    }
    await refresh();
    push({
      title: "Bio updated",
      description: "Your profile is refreshed.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-4 rounded-voxel border border-white/10 bg-space-900/70 p-4">
      <div className="text-xs uppercase tracking-[0.3em] text-white/40">
        Profile settings
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-white/60">Display name</div>
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Blocky Builder"
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-white/60">Website</div>
          <Input
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://"
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold text-white/60">Twitter</div>
          <Input
            value={twitter}
            onChange={(event) => setTwitter(event.target.value)}
            placeholder="https://x.com/"
          />
        </div>
        <div>
          <div className="text-xs font-semibold text-white/60">YouTube</div>
          <Input
            value={youtube}
            onChange={(event) => setYoutube(event.target.value)}
            placeholder="https://youtube.com/"
          />
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold text-white/60">Bio</div>
        <Textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell the vault about your creator vibe."
        />
      </div>
      <Button onClick={save} loading={loading}>
        Save profile
      </Button>
    </div>
  );
}
