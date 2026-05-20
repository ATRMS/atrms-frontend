export type TaxpayerStatus = "ACTIVE" | "INACTIVE" | "BLACKLISTED" | "DECEASED"

export type IndividualGender = "MALE" | "FEMALE" | "OTHER"

export type IndividualMaritalStatus =
  | "SINGLE"
  | "MARRIED"
  | "DIVORCED"
  | "WIDOWED"

export type IndividualTaxpayerListItem = {
  id: string
  tin: string
  taxpayerType: "INDIVIDUAL"
  taxOfficeId: string
  status: TaxpayerStatus
  registeredAt: string
  displayName: string
}

export type IndividualTaxpayerDetail = {
  id: string
  tin: string
  taxOfficeId: string
  status: TaxpayerStatus
  registeredAt: string
  firstName: string
  middleName?: string | null
  lastName: string
  dateOfBirth: string
  gender: IndividualGender
  maritalStatus: IndividualMaritalStatus
  nationality: string
  nin?: string | null
  bvn?: string | null
  phone: string
  email: string
  address: string
  lgaOfOrigin: string
  stateOfOrigin: string
  professionId?: string | null
  employerId?: string | null
  /** API may return decimal string; normalize in UI. */
  annualIncome: string | number
}

export type RegisterIndividualPayload = {
  tin: string
  taxOfficeId: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: string
  gender: IndividualGender
  maritalStatus: IndividualMaritalStatus
  nationality: string
  nin?: string
  bvn?: string
  phone: string
  email: string
  address: string
  lgaOfOrigin: string
  stateOfOrigin: string
  professionId?: string
  employerId?: string
  annualIncome: number
}

export type UpdateIndividualTaxpayerPayload = Partial<{
  firstName: string
  middleName: string | null
  lastName: string
  dateOfBirth: string
  gender: IndividualGender
  maritalStatus: IndividualMaritalStatus
  nationality: string
  nin: string | null
  bvn: string | null
  phone: string
  email: string
  address: string
  lgaOfOrigin: string
  stateOfOrigin: string
  taxOfficeId: string
  professionId: string | null
  employerId: string | null
  annualIncome: number
}>

export type PatchTaxpayerStatusPayload = {
  status: TaxpayerStatus
  /** Required when transitioning to BLACKLISTED or DECEASED. */
  reason?: string
}
