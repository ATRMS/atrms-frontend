export interface BankAccountListItem {
  id: string
  bankName: string
  bankCode: string | null
  accountName: string
  accountNumber: string
  currencyId: string
  taxTypeId: string | null
  revenueHeadId: string | null
  isActive: boolean
}

export type BankAccountCreatePayload = {
  bankName: string
  bankCode: string
  accountName: string
  accountNumber: string
  currencyId: string
  taxTypeId: string
  revenueHeadId?: string
}

export type BankAccountUpdatePayload = {
  accountName: string
  accountNumber: string
  bankName: string
  bankCode: string
  currencyId: string
  taxTypeId: string
  revenueHeadId?: string
}
