import type { TaxpayerStatus } from "@/features/individual-taxpayers/types"

export type CorporateCompanyType =
  | "LIMITED_LIABILITY"
  | "PUBLIC_LIMITED_COMPANY"
  | "PARTNERSHIP"
  | "SOLE_PROPRIETORSHIP"
  | "NGO"
  | "GOVERNMENT"

export type CorporateTaxpayerListItem = {
  id: string
  tin: string
  taxpayerType: "CORPORATE"
  taxOfficeId: string
  status: TaxpayerStatus
  registeredAt: string
  displayName: string
  companyType?: CorporateCompanyType | null
  annualTurnover?: string | number | null
}

export type CorporateTaxpayerDetail = {
  id: string
  tin: string
  taxOfficeId: string
  status: TaxpayerStatus
  registeredAt: string
  companyName: string
  regNumber: string
  dateOfIncorporation: string
  companyType: CorporateCompanyType
  businessLineId: string
  phone: string
  email: string
  registeredAddress: string
  operatingAddress: string
  annualTurnover: string | number
  employeeCount?: number | null
}

export type RegisterCorporatePayload = {
  tin: string
  taxOfficeId: string
  companyName: string
  regNumber: string
  dateOfIncorporation: string
  companyType: CorporateCompanyType
  businessLineId: string
  phone: string
  email: string
  registeredAddress: string
  operatingAddress: string
  annualTurnover: number
  employeeCount?: number
}

export type UpdateCorporateTaxpayerPayload = Partial<{
  companyName: string
  regNumber: string
  dateOfIncorporation: string
  companyType: CorporateCompanyType
  businessLineId: string
  taxOfficeId: string
  phone: string
  email: string
  registeredAddress: string
  operatingAddress: string
  annualTurnover: number
  employeeCount: number | null
}>
