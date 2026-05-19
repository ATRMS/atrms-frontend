export interface ProfessionListItem {
  id: string
  code: string
  name: string
  isActive: boolean
}

export type ProfessionWritePayload = {
  code: string
  name: string
}
