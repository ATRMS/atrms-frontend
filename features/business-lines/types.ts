export interface BusinessLine {
  id: string
  code: string
  name: string
  sectorId: string
  sectorCode: string
  active: boolean
}
export type BusinessLineListItem = BusinessLine
export type BusinessLineWritePayload = {
  code: string
  name: string
  sectorId: string
}
export type CreateBusinessLinePayload = BusinessLineWritePayload
export type UpdateBusinessLinePayload = BusinessLineWritePayload
