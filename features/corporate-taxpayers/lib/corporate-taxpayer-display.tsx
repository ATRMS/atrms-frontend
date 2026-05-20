import type { CorporateCompanyType } from "@/features/corporate-taxpayers/types"
import {
  formatIndividualAnnualIncome,
  formatAnnualIncomeInputDisplay,
  parseAnnualIncomeToNumber,
  TaxpayerStatusBadge,
} from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import { Badge } from "@/components/ui/badge"

export function formatCorporateAnnualTurnover(
  value: string | number | null | undefined
): string {
  return formatIndividualAnnualIncome(value)
}

export function formatTurnoverInputDisplay(n: number): string {
  return formatAnnualIncomeInputDisplay(n)
}

export { parseAnnualIncomeToNumber }

export function companyTypeLabel(code: CorporateCompanyType | string): string {
  switch (code) {
    case "LIMITED_LIABILITY":
      return "LLC"
    case "PUBLIC_LIMITED_COMPANY":
      return "PLC"
    case "PARTNERSHIP":
      return "Partnership"
    case "SOLE_PROPRIETORSHIP":
      return "Sole proprietorship"
    case "NGO":
      return "NGO"
    case "GOVERNMENT":
      return "Government"
    default:
      return code
  }
}

export function CompanyTypeBadge({
  companyType,
}: {
  companyType: CorporateCompanyType | string | null | undefined
}) {
  if (!companyType) {
    return (
      <span className="text-sm text-muted-foreground">—</span>
    )
  }

  return <Badge variant="secondary">{companyTypeLabel(companyType)}</Badge>
}

export { TaxpayerStatusBadge }
