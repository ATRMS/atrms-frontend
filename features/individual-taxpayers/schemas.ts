import { differenceInYears, isValid, parse } from "date-fns"
import { z } from "zod"

import type {
  IndividualGender,
  IndividualMaritalStatus,
} from "@/features/individual-taxpayers/types"

const elevenDigits = /^[0-9]{11}$/

function optionalIdDigits(field: string) {
  return z.string().trim().superRefine((val, ctx) => {
    if (!val) return
    if (!elevenDigits.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${field} must be exactly 11 digits`,
      })
    }
  })
}

export const registerIndividualFormSchema = z
  .object({
    tin: z.string().trim().min(1, "TIN is required"),
    taxOfficeId: z.string().uuid("Select a tax office"),
    firstName: z.string().trim().min(1, "First name is required"),
    middleName: z
      .string()
      .trim()
      .optional()
      .transform((v) => v ?? ""),
    lastName: z.string().trim().min(1, "Last name is required"),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Date of birth is required")
      .refine((v) => {
        const d = parse(v, "yyyy-MM-dd", new Date())
        return isValid(d)
      }, "Invalid date"),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    maritalStatus: z.enum([
      "SINGLE",
      "MARRIED",
      "DIVORCED",
      "WIDOWED",
    ] satisfies IndividualMaritalStatus[]),
    nationality: z.string().trim().min(1, "Nationality is required"),
    nin: optionalIdDigits("NIN"),
    bvn: optionalIdDigits("BVN"),
    phone: z.string().trim().min(1, "Phone is required"),
    email: z.string().trim().email("Valid email required"),
    address: z.string().trim().min(1, "Address is required"),
    lgaOfOrigin: z.string().trim().min(1, "LGA of origin is required"),
    stateOfOrigin: z.string().trim().min(1, "State of origin is required"),
    professionId: z.string().trim().optional().default(""),
    employerId: z.string().trim().optional().default(""),
    annualIncome: z
      .string()
      .trim()
      .transform((s) => s.replace(/,/g, ""))
      .refine((s) => s.length > 0, "Annual income is required")
      .refine((s) => {
        const n = Number(s)
        return Number.isFinite(n) && n >= 0
      }, "Annual income must be zero or positive"),
  })
  .superRefine((data, ctx) => {
    const dob = parse(data.dateOfBirth, "yyyy-MM-dd", new Date())
    if (!isValid(dob)) return
    const age = differenceInYears(new Date(), dob)
    if (age < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Taxpayer must be at least 16 years old",
        path: ["dateOfBirth"],
      })
    }
  })

export type RegisterIndividualFormInput = z.input<
  typeof registerIndividualFormSchema
>

export type RegisterIndividualFormValues = z.infer<
  typeof registerIndividualFormSchema
>

export const individualProfileEditSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim(),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine((v) => {
      const d = parse(v, "yyyy-MM-dd", new Date())
      return isValid(d)
    }, "Invalid date"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"] satisfies IndividualGender[]),
  maritalStatus: z.enum([
    "SINGLE",
    "MARRIED",
    "DIVORCED",
    "WIDOWED",
  ] satisfies IndividualMaritalStatus[]),
  nationality: z.string().trim().min(1, "Nationality is required"),
  nin: optionalIdDigits("NIN"),
  bvn: optionalIdDigits("BVN"),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email("Valid email required"),
  address: z.string().trim().min(1, "Address is required"),
  lgaOfOrigin: z.string().trim().min(1, "LGA of origin is required"),
  stateOfOrigin: z.string().trim().min(1, "State of origin is required"),
  taxOfficeId: z.string().uuid("Select a tax office"),
  professionId: z.string().trim().optional().default(""),
  employerId: z.string().trim().optional().default(""),
  annualIncome: z
    .string()
    .trim()
    .transform((s) => s.replace(/,/g, ""))
    .refine((s) => s.length > 0, "Annual income is required")
    .refine((s) => {
      const n = Number(s)
      return Number.isFinite(n) && n >= 0
    }, "Annual income must be zero or positive"),
})
  .superRefine((data, ctx) => {
    const dob = parse(data.dateOfBirth, "yyyy-MM-dd", new Date())
    if (!isValid(dob)) return
    const age = differenceInYears(new Date(), dob)
    if (age < 16) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Taxpayer must be at least 16 years old",
        path: ["dateOfBirth"],
      })
    }
  })

export type IndividualProfileEditFormValues = z.input<
  typeof individualProfileEditSchema
>

export type IndividualProfileEditParsed = z.infer<
  typeof individualProfileEditSchema
>
