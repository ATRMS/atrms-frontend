import { z } from "zod"

export const professionCreateSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(1, "Name is required").trim(),
})

export type ProfessionCreateFormValues = z.input<
  typeof professionCreateSchema
>

export const professionEditSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
})

export type ProfessionEditFormValues = z.infer<typeof professionEditSchema>
