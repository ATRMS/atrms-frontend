export interface RevenueTargetListItem {
  id: string
  taxTypeId: string
  fiscalYear: number
  targetAmount: number
  currencyId: string
}

export type RevenueTargetWritePayload = {
  taxTypeId: string
  fiscalYear: number
  targetAmount: number
  currencyId: string
}
