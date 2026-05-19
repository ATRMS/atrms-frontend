/** Row from `GET /master-data/tax-offices` and mutation responses. */
export interface TaxOfficeListItem {
  id: string
  code: string
  name: string
  regionId: string
  address: string
  phone: string
  email: string
  isActive: boolean
}

export type TaxOfficeWritePayload = {
  code: string
  name: string
  regionId: string
  address: string
  phone: string
  email: string
}
