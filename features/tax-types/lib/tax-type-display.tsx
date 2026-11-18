"use client"

import type {
  TaxTypeCategory,
  TaxTypeCollectingAuthority,
  TaxTypeRateType,
} from "@/features/tax-types/types"
import { Badge } from "@/components/ui/badge"

export const TAX_TYPE_CATEGORY_LABELS: Record<TaxTypeCategory, string> = {
  DIRECT: "Direct",
  INDIRECT: "Indirect",
  WITHHOLDING: "Withholding",
  LEVY: "Levy",
  FEE: "Fee",
}

export const TAX_TYPE_RATE_TYPE_LABELS: Record<TaxTypeRateType, string> = {
  PERCENTAGE: "Percentage",
  FIXED: "Fixed",
  TIERED: "Tiered",
  CUSTOM: "Custom",
}

export const TAX_TYPE_AUTHORITY_LABELS: Record<
  TaxTypeCollectingAuthority,
  string
> = {
  STATE: "State",
  FEDERAL: "Federal",
  LGA: "LGA",
  JOINT: "Joint",
}

export function TaxTypeCategoryBadge({
  category,
}: {
  category: TaxTypeCategory
}) {
  return (
    <Badge variant="outline" className="font-normal">
      {TAX_TYPE_CATEGORY_LABELS[category]}
    </Badge>
  )
}

export function TaxTypeRateTypeBadge({
  rateType,
}: {
  rateType: TaxTypeRateType
}) {
  return (
    <Badge variant="secondary" className="font-normal">
      {TAX_TYPE_RATE_TYPE_LABELS[rateType]}
    </Badge>
  )
}

export function TaxTypeAuthorityBadge({
  authority,
}: {
  authority: TaxTypeCollectingAuthority
}) {
  return (
    <Badge variant="outline" className="font-normal">
      {TAX_TYPE_AUTHORITY_LABELS[authority]}
    </Badge>
  )
}

export function TaxTypeStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant={isActive ? "success" : "destructive"}
      className="font-normal"
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

export function formatTaxTypeDefaultRate(
  rateType: TaxTypeRateType,
  value: number | null | undefined
): string {
  if (rateType === "TIERED" || rateType === "CUSTOM") return "—"
  if (value == null || Number.isNaN(value)) return "—"
  if (rateType === "PERCENTAGE") return `${value}%`
  return String(value)
}
