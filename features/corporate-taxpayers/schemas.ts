import { differenceInCalendarDays, isValid, parse } from "date-fns"
import { z } from "zod"

import type { CorporateCompanyType } from "@/features/corporate-taxpayers/types"

export const CORPORATE_COMPANY_TYPES = [
  "LIMITED_LIABILITY",
  "PUBLIC_LIMITED_COMPANY",
  "PARTNERSHIP",
  "SOLE_PROPRIETORSHIP",
  "NGO",
  "GOVERNMENT",
] as const satisfies readonly CorporateCompanyType[]

const turnoverString = z
  .string()
  .trim()
  .transform((s) => s.replace(/,/g, ""))
  .refine((s) => s.length > 0, "Annual turnover is required")
  .refine((s) => {
    const n = Number(s)
    return Number.isFinite(n) && n >= 0
  }, "Annual turnover must be zero or positive")

const optionalEmployeeCountString = z
  .string()
  .trim()
  .optional()
  .default("")
  .superRefine((val, ctx) => {
    if (!val) return
    if (!/^\d+$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee count must be a whole number",
      })
    }
  })

export const registerCorporateFormSchema = z
  .object({
    tin: z.string().trim().min(1, "TIN is required"),
    taxOfficeId: z.string().uuid("Select a tax office"),
    companyName: z.string().trim().min(1, "Company name is required"),
    regNumber: z.string().trim().min(1, "CAC registration number is required"),
    dateOfIncorporation: z
      .string()
      .trim()
      .min(1, "Date of incorporation is required")
      .refine((v) => {
        const d = parse(v, "yyyy-MM-dd", new Date())
        return isValid(d)
      }, "Invalid date"),
    companyType: z.enum(CORPORATE_COMPANY_TYPES),
    businessLineId: z.string().uuid("Select a business line"),
    phone: z.string().trim().min(1, "Phone is required"),
    email: z.string().trim().email("Valid email required"),
    registeredAddress: z
      .string()
      .trim()
      .min(1, "Registered address is required"),
    operatingAddress: z.string().trim().min(1, "Operating address is required"),
    annualTurnover: turnoverString,
    employeeCount: optionalEmployeeCountString,
  })
  .superRefine((data, ctx) => {
    const inc = parse(data.dateOfIncorporation, "yyyy-MM-dd", new Date())
    if (!isValid(inc)) return
    if (differenceInCalendarDays(inc, new Date()) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of incorporation cannot be in the future",
        path: ["dateOfIncorporation"],
      })
    }
  })

export type RegisterCorporateFormInput = z.input<
  typeof registerCorporateFormSchema
>

export type RegisterCorporateFormValues = z.infer<
  typeof registerCorporateFormSchema
>

export const corporateProfileEditSchema = z
  .object({
    companyName: z.string().trim().min(1, "Company name is required"),
    regNumber: z.string().trim().min(1, "CAC registration number is required"),
    dateOfIncorporation: z
      .string()
      .trim()
      .min(1, "Date of incorporation is required")
      .refine((v) => {
        const d = parse(v, "yyyy-MM-dd", new Date())
        return isValid(d)
      }, "Invalid date"),
    companyType: z.enum(CORPORATE_COMPANY_TYPES),
    businessLineId: z.uuid("Select a business line"),
    taxOfficeId: z.uuid("Select a tax office"),
    phone: z.string().trim().min(1, "Phone is required"),
    email: z.email("Valid email required").trim(),
    registeredAddress: z
      .string()
      .trim()
      .min(1, "Registered address is required"),
    operatingAddress: z.string().trim().min(1, "Operating address is required"),
    annualTurnover: turnoverString,
    employeeCount: optionalEmployeeCountString,
  })
  .superRefine((data, ctx) => {
    const inc = parse(data.dateOfIncorporation, "yyyy-MM-dd", new Date())
    if (!isValid(inc)) return
    if (differenceInCalendarDays(inc, new Date()) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of incorporation cannot be in the future",
        path: ["dateOfIncorporation"],
      })
    }
  })

export type CorporateProfileEditFormValues = z.input<
  typeof corporateProfileEditSchema
>

export type CorporateProfileEditParsed = z.infer<
  typeof corporateProfileEditSchema
>
