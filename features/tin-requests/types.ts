export type TinRequestTaxpayerType = "INDIVIDUAL" | "CORPORATE"

export type TinRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"

export interface TinRequestListItem {
  id: string
  taxpayerType: TinRequestTaxpayerType
  requesterRef: string | null
  status: TinRequestStatus
  generatedTin: string | null
  rejectedReason: string | null
  requestedBy: string
  processedBy: string | null
  requestedAt: string
  processedAt: string | null
}

export type TinRequestCreatePayload = {
  taxpayerType: TinRequestTaxpayerType
  requesterRef?: string | null
}
