/** Row from `GET /master-data/business-lines`. */
export interface BusinessLineListItem {
  id: string
  code: string
  name: string
  sector?: string | null
  isActive: boolean
}

export interface CreateBusinessLinePayload {
  code: string
  name: string
  sector?: string
}

export interface UpdateBusinessLinePayload {
  name: string
  sector?: string
  code: string
}
