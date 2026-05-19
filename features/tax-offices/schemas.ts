import { z } from "zod"

import { uuidSchema } from "@/lib/schemas/common"

export const taxOfficeFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(1, "Name is required").trim(),
  regionId: uuidSchema,
  address: z.string().min(1, "Address is required").trim(),
  phone: z.string().min(1, "Phone is required").trim(),
  email: z.string().trim().email("Enter a valid email"),
})

export type TaxOfficeFormValues = z.infer<typeof taxOfficeFormSchema>
export type TaxOfficeFormInputValues = z.input<typeof taxOfficeFormSchema>
