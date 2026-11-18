import type { VersionStatus } from "@/features/workflow/types"
export interface RevenueHead {
  id: string
  code: string
  name: string
  taxTypeId: string
  taxTypeCode: string
  subCategory: string | null
  stateAgencyId: string
  stateAgencyCode: string
  active: boolean
}
export type RevenueHeadWritePayload = {
  code: string
  name: string
  taxTypeId: string
  stateAgencyId: string
  subCategory?: string
}
export type RateKind = "RATE" | "FIXED_AMOUNT" | "RATE_TABLE"
export interface Money {
  amount: string
  currency: string
}
export interface RateVersion {
  version: number
  rateKind: RateKind
  amount: Money | null
  rate: string | null
  rateTable: Record<string, string>[] | null
  effectiveFrom: string
  effectiveTo: string | null
  sourceReference: string | null
  status: VersionStatus
  proposedBy: string | null
  instanceId: string | null
}
