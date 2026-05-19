export interface BankAccountListItem {
  id: string
  bankName: string
  bankCode: string
  accountName: string
  accountNumber: string
  currencyId: string
  taxTypeId: string
  isActive: boolean
}

export type BankAccountCreatePayload = {
  bankName: string
  bankCode: string
  accountName: string
  accountNumber: string
  currencyId: string
  taxTypeId: string
}

export type BankAccountUpdatePayload = {
  accountName: string
  accountNumber: string
  bankName: string
  bankCode: string
}
