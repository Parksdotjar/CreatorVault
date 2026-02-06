export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  socials: Record<string, string> | null;
  role: "user" | "admin";
  created_at: string;
};
