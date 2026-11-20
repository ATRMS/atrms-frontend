import { z } from "zod"

export const regionFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Name is required"),
  description: z
    .string()
    .trim()
    .max(500, "Use 500 characters or fewer")
    .optional(),
})

export type RegionFormValues = z.infer<typeof regionFormSchema>
export type RegionFormInputValues = z.input<typeof regionFormSchema>
