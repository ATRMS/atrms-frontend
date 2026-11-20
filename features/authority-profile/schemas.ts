import { z } from "zod"

const optional = z
  .string()
  .trim()
  .transform((value) => value || null)
export const authorityProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  shortName: optional,
  authorityCode: z
    .string()
    .trim()
    .min(1, "Authority code is required")
    .transform((value) => value.toUpperCase()),
  stateCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, "Use exactly two letters")
    .transform((value) => value.toUpperCase()),
  address: z.string().trim().min(1, "Address is required"),
  headName: z.string().trim().min(1, "Head name is required"),
  headTitle: z.string().trim().min(1, "Head title is required"),
  phone: optional,
  email: z.string().trim().email("Enter a valid email"),
  website: z
    .union([z.literal(""), z.url("Enter a valid URL")])
    .transform((value) => value || null),
})
export type AuthorityProfileInput = z.input<typeof authorityProfileSchema>
export type AuthorityProfileValues = z.infer<typeof authorityProfileSchema>
