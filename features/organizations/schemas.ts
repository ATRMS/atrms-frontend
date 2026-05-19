import { z } from "zod"

import { uuidSchema } from "@/lib/schemas/common"

export const organizationFormSchema = z.object({
  name: z.string().min(1, "Required").trim(),
  regNumber: z.string().trim().optional(),
  taxOfficeId: uuidSchema,
  businessLineId: uuidSchema,
  address: z.string().min(1, "Required").trim(),
  phone: z.string().min(5, "Enter a valid phone").trim(),
  email: z.email(),
  website: z.string().trim().optional(),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export type OrganizationFormInputValues = z.input<typeof organizationFormSchema>
