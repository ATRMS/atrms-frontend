export interface OrganizationListItem {
  id: string
  name: string
  regNumber: string | null
  taxOfficeId: string
  businessLineId: string
  address: string
  phone: string
  email: string
  website: string | null
  isActive: boolean
}

export type OrganizationCreatePayload = {
  name: string
  regNumber?: string | null
  taxOfficeId: string
  businessLineId: string
  address: string
  phone: string
  email: string
  website?: string | null
}

/** PATCH-style body — callers send whichever fields changed. */
export type OrganizationUpdatePayload = Partial<{
  name: string
  regNumber: string | null
  taxOfficeId: string
  businessLineId: string
  address: string
  phone: string
  email: string
  website: string | null
}>
