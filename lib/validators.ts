import { z } from "zod";
import { ASSET_TYPES, LICENSES, VISIBILITY } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = loginSchema.extend({
  username: z
    .string()
    .min(3)
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, or underscore."),
});

export const assetSchema = z.object({
  title: z.string().min(2).max(80),
  description: z.string().max(280).optional().nullable(),
  type: z.enum(ASSET_TYPES),
  tags: z.array(z.string().min(1).max(24)).max(12).optional(),
  minecraft_version: z.string().max(16).optional().nullable(),
  license: z.enum(LICENSES),
  visibility: z.enum(VISIBILITY).default("public"),
});

export const profileUpdateSchema = z.object({
  display_name: z.string().max(40).optional().nullable(),
  bio: z.string().max(240).optional().nullable(),
  socials: z
    .record(z.string().url().or(z.literal("")))
    .optional()
    .nullable(),
});
