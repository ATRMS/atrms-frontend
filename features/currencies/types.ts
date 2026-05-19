export interface CurrencyListItem {
  id: string
  code: string
  name: string
  symbol: string
  isDefault: boolean
}

export type CurrencyWritePayload = {
  code: string
  name: string
  symbol: string
}
