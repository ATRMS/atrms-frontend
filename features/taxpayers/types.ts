import type { TaxpayerStatus } from "@/features/individual-taxpayers/types"

export type RegistryTaxpayerType = "INDIVIDUAL" | "CORPORATE"

/** Row from unified `GET /taxpayers` (no `taxpayerType` filter). */
export type UnifiedTaxpayerListItem = {
  id: string
  tin: string
  taxpayerType: RegistryTaxpayerType
  taxOfficeId: string
  status: TaxpayerStatus
  displayName: string
  registeredAt: string
}
