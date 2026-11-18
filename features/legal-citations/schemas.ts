import { z } from "zod"
export const citationSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2)
      .max(40)
      .regex(
        /^[A-Za-z][A-Za-z0-9_-]*$/,
        "Start with a letter and use letters, digits, _ or -"
      )
      .transform((value) => value.toUpperCase()),
    title: z.string().trim().min(1, "Title is required"),
    citationText: z
      .string()
      .trim()
      .min(1, "Citation text is required")
      .max(2000, "Use 2,000 characters or fewer"),
    jurisdiction: z.enum(["NATIONAL", "STATE"]),
    law: z.string().trim().min(1, "Law is required"),
    section: z.string().trim().optional(),
    documentTypes: z.string().trim().min(1, "Add at least one document type"),
    effectiveFrom: z.string().date(),
    sourceReference: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.effectiveFrom < new Date().toISOString().slice(0, 10) &&
      !value.sourceReference
    )
      ctx.addIssue({
        code: "custom",
        path: ["sourceReference"],
        message: "Source is required for a past date",
      })
  })
export type CitationFormValues = z.infer<typeof citationSchema>
