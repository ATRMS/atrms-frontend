export const TAX_TYPE_CATEGORY_VALUES = [
  "DIRECT",
  "INDIRECT",
  "WITHHOLDING",
  "LEVY",
  "FEE",
] as const

export type TaxTypeCategory = (typeof TAX_TYPE_CATEGORY_VALUES)[number]

export const TAX_TYPE_RATE_TYPE_VALUES = [
  "PERCENTAGE",
  "FIXED",
  "TIERED",
  "CUSTOM",
] as const

export type TaxTypeRateType = (typeof TAX_TYPE_RATE_TYPE_VALUES)[number]

export const TAX_TYPE_COLLECTING_AUTHORITY_VALUES = [
  "STATE",
  "FEDERAL",
  "LGA",
  "JOINT",
] as const

export type TaxTypeCollectingAuthority =
  (typeof TAX_TYPE_COLLECTING_AUTHORITY_VALUES)[number]

/** Row from `GET /master-data/tax-types`. */
export interface TaxTypeListItem {
  id: string
  code: string
  name: string
  category: TaxTypeCategory
  rateType: TaxTypeRateType
  defaultRate?: number | null
  collectingAuthority: TaxTypeCollectingAuthority
  isActive: boolean
}

/**
 * Body for POST create and PUT update. Omit `defaultRate` when rate type is
 * TIERED or CUSTOM.
 */
export type TaxTypeWritePayload = {
  code: string
  name: string
  category: TaxTypeCategory
  rateType: TaxTypeRateType
  collectingAuthority: TaxTypeCollectingAuthority
  defaultRate?: number
}
