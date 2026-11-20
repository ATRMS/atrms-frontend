import { z } from "zod"
import { uuidSchema } from "@/lib/schemas/common"

export const businessLineSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Name is required"),
  sectorId: uuidSchema,
})
export type BusinessLineInput = z.input<typeof businessLineSchema>
export type BusinessLineValues = z.infer<typeof businessLineSchema>
