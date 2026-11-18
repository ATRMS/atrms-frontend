export interface Region {
  id: string
  code: string
  name: string
  description: string | null
  active: boolean
}

export type RegionListItem = Region
export type RegionWritePayload = {
  code: string
  name: string
  description?: string
}
