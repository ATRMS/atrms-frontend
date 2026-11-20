export interface Sector {
  id: string
  code: string
  name: string
  active: boolean
}
export type SectorWritePayload = { code: string; name: string }
