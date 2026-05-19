export const REGION_TYPE_VALUES = [
  "STATE",
  "LGA",
  "SENATORIAL",
  "FEDERAL_CONSTITUENCY",
] as const

export type RegionType = (typeof REGION_TYPE_VALUES)[number]

/** Row from `GET /master-data/regions`. */
export interface RegionListItem {
  id: string
  code: string
  name: string
  type: RegionType
  parentId: string | null
}

export type RegionWritePayload = {
  code: string
  name: string
  type: RegionType
  /** Omit when top-level (no parent). */
  parentId?: string
}
