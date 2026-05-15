import { z } from "zod"

export function normalizeRoleCodeInput(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "")
}

export const createRoleDetailsSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(64, "Code is too long")
    .regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers, and underscores"),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
})

export type CreateRoleDetailsValues = z.infer<typeof createRoleDetailsSchema>

export const updateRoleSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional(),
})

export type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>
