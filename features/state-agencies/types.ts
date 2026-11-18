export interface StateAgency {
  id: string
  code: string
  name: string
  accountingOfficer: string | null
  address: string | null
  phone: string | null
  email: string | null
  active: boolean
}
export type StateAgencyWritePayload = Omit<StateAgency, "id" | "active"> & {
  code: string
  name: string
}
