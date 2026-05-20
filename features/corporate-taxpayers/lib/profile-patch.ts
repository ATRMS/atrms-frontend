import type { CorporateTaxpayerDetail } from "@/features/corporate-taxpayers/types"
import type { UpdateCorporateTaxpayerPayload } from "@/features/corporate-taxpayers/types"
import type { CorporateProfileEditParsed } from "@/features/corporate-taxpayers/schemas"
import { parseAnnualIncomeToNumber } from "@/features/corporate-taxpayers/lib/corporate-taxpayer-display"

function normStr(v: string | null | undefined): string {
  return (v ?? "").trim()
}

function resolveEmployeeCountPatch(
  baseline: CorporateTaxpayerDetail,
  employeeCountStr: string
): Pick<UpdateCorporateTaxpayerPayload, "employeeCount"> | undefined {
  const trimmed = employeeCountStr.trim()
  const base =
    baseline.employeeCount !== undefined && baseline.employeeCount !== null
      ? baseline.employeeCount
      : null

  if (!trimmed) {
    if (base !== null) {
      return { employeeCount: null }
    }
    return undefined
  }

  const n = Number.parseInt(trimmed, 10)
  if (!Number.isFinite(n)) return undefined
  if (base !== n) {
    return { employeeCount: n }
  }
  return undefined
}

export function buildCorporateUpdatePayload(
  baseline: CorporateTaxpayerDetail,
  parsed: CorporateProfileEditParsed
): UpdateCorporateTaxpayerPayload {
  const patch: UpdateCorporateTaxpayerPayload = {}

  if (parsed.companyName.trim() !== baseline.companyName) {
    patch.companyName = parsed.companyName.trim()
  }

  if (parsed.regNumber.trim() !== baseline.regNumber) {
    patch.regNumber = parsed.regNumber.trim()
  }

  if (parsed.dateOfIncorporation.trim() !== baseline.dateOfIncorporation) {
    patch.dateOfIncorporation = parsed.dateOfIncorporation.trim()
  }

  if (parsed.companyType !== baseline.companyType) {
    patch.companyType = parsed.companyType
  }

  if (parsed.businessLineId !== baseline.businessLineId) {
    patch.businessLineId = parsed.businessLineId
  }

  if (parsed.taxOfficeId !== baseline.taxOfficeId) {
    patch.taxOfficeId = parsed.taxOfficeId
  }

  if (parsed.phone.trim() !== baseline.phone) {
    patch.phone = parsed.phone.trim()
  }

  if (parsed.email.trim() !== baseline.email) {
    patch.email = parsed.email.trim()
  }

  if (
    normStr(parsed.registeredAddress) !== normStr(baseline.registeredAddress)
  ) {
    patch.registeredAddress = parsed.registeredAddress.trim()
  }

  if (
    normStr(parsed.operatingAddress) !== normStr(baseline.operatingAddress)
  ) {
    patch.operatingAddress = parsed.operatingAddress.trim()
  }

  const turnoverBase = parseAnnualIncomeToNumber(baseline.annualTurnover)
  const turnoverParsed = parseAnnualIncomeToNumber(parsed.annualTurnover)
  if (turnoverParsed !== turnoverBase) {
    patch.annualTurnover = turnoverParsed
  }

  const ecPatch = resolveEmployeeCountPatch(baseline, parsed.employeeCount)
  if (ecPatch) {
    Object.assign(patch, ecPatch)
  }

  return patch
}
