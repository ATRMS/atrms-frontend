import type { TaxpayerStatus } from "@/features/individual-taxpayers/types"
import { Badge } from "@/components/ui/badge"

export function formatIndividualAnnualIncome(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "—"
  }
  const n =
    typeof value === "number" ? value : Number.parseFloat(String(value))
  if (!Number.isFinite(n)) {
    return String(value)
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatAnnualIncomeInputDisplay(n: number): string {
  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(n)
}

export function parseAnnualIncomeToNumber(
  value: string | number | null | undefined
): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (value === null || value === undefined) return 0
  const n = Number.parseFloat(String(value).replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

const STATUS_VARIANT: Record<
  TaxpayerStatus,
  "success" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  BLACKLISTED: "destructive",
  DECEASED: "outline",
}

const STATUS_LABEL: Record<TaxpayerStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLACKLISTED: "Blacklisted",
  DECEASED: "Deceased",
}

export function taxpayerStatusLabel(status: TaxpayerStatus): string {
  return STATUS_LABEL[status] ?? status
}

export function TaxpayerStatusBadge({ status }: { status: TaxpayerStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANT[status] ?? "secondary"}>
      {taxpayerStatusLabel(status)}
    </Badge>
  )
}

export function genderLabel(code: string): string {
  switch (code) {
    case "MALE":
      return "Male"
    case "FEMALE":
      return "Female"
    case "OTHER":
      return "Other"
    default:
      return code
  }
}

export function maritalStatusLabel(code: string): string {
  switch (code) {
    case "SINGLE":
      return "Single"
    case "MARRIED":
      return "Married"
    case "DIVORCED":
      return "Divorced"
    case "WIDOWED":
      return "Widowed"
    default:
      return code
  }
}
