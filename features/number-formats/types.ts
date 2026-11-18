export interface NumberFormat {
  code: string
  name: string
  pattern: string
  reset: "NEVER" | "YEARLY"
  preview: string
  locked: boolean
}
