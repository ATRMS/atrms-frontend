import { z } from "zod"

export const createBusinessLineSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(1, "Name is required").trim(),
  sector: z.string().trim().optional(),
})

export type CreateBusinessLineFormValues = z.input<
  typeof createBusinessLineSchema
>

export const updateBusinessLineSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  sector: z.string().trim().optional(),
})

export type UpdateBusinessLineFormValues = z.infer<
  typeof updateBusinessLineSchema
>
