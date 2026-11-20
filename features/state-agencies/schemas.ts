import { z } from "zod"
const optionalText = z
  .string()
  .trim()
  .transform((value) => value || null)
export const stateAgencySchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Name is required"),
  accountingOfficer: optionalText,
  address: optionalText,
  phone: optionalText,
  email: z
    .union([z.literal(""), z.email("Enter a valid email")])
    .transform((value) => value || null),
})
export type StateAgencyInput = z.input<typeof stateAgencySchema>
export type StateAgencyValues = z.infer<typeof stateAgencySchema>
