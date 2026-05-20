import type { IndividualTaxpayerDetail } from "@/features/individual-taxpayers/types"
import type { IndividualProfileEditParsed } from "@/features/individual-taxpayers/schemas"
import { parseAnnualIncomeToNumber } from "@/features/individual-taxpayers/lib/individual-taxpayer-display"
import type { UpdateIndividualTaxpayerPayload } from "@/features/individual-taxpayers/types"

function normStr(v: string | null | undefined): string {
  return (v ?? "").trim()
}

export function buildIndividualUpdatePayload(
  baseline: IndividualTaxpayerDetail,
  parsed: IndividualProfileEditParsed
): UpdateIndividualTaxpayerPayload {
  const patch: UpdateIndividualTaxpayerPayload = {}

  if (parsed.firstName.trim() !== baseline.firstName) {
    patch.firstName = parsed.firstName.trim()
  }

  const midNext = parsed.middleName.trim()
  const midBase = normStr(baseline.middleName)
  if (midNext !== midBase) {
    patch.middleName = midNext.length ? midNext : null
  }

  if (parsed.lastName.trim() !== baseline.lastName) {
    patch.lastName = parsed.lastName.trim()
  }

  if (parsed.dateOfBirth.trim() !== baseline.dateOfBirth) {
    patch.dateOfBirth = parsed.dateOfBirth.trim()
  }

  if (parsed.gender !== baseline.gender) {
    patch.gender = parsed.gender
  }

  if (parsed.maritalStatus !== baseline.maritalStatus) {
    patch.maritalStatus = parsed.maritalStatus
  }

  if (parsed.nationality.trim() !== baseline.nationality) {
    patch.nationality = parsed.nationality.trim()
  }

  const ninNext = parsed.nin.trim()
  const ninBase = normStr(baseline.nin)
  if (ninNext !== ninBase) {
    patch.nin = ninNext.length ? ninNext : null
  }

  const bvnNext = parsed.bvn.trim()
  const bvnBase = normStr(baseline.bvn)
  if (bvnNext !== bvnBase) {
    patch.bvn = bvnNext.length ? bvnNext : null
  }

  if (parsed.phone.trim() !== baseline.phone) {
    patch.phone = parsed.phone.trim()
  }

  if (parsed.email.trim() !== baseline.email) {
    patch.email = parsed.email.trim()
  }

  if (parsed.address.trim() !== baseline.address) {
    patch.address = parsed.address.trim()
  }

  if (parsed.lgaOfOrigin.trim() !== baseline.lgaOfOrigin) {
    patch.lgaOfOrigin = parsed.lgaOfOrigin.trim()
  }

  if (parsed.stateOfOrigin.trim() !== baseline.stateOfOrigin) {
    patch.stateOfOrigin = parsed.stateOfOrigin.trim()
  }

  if (parsed.taxOfficeId !== baseline.taxOfficeId) {
    patch.taxOfficeId = parsed.taxOfficeId
  }

  const prNext = parsed.professionId.trim()
  const prBase = normStr(baseline.professionId)
  if (prNext !== prBase) {
    patch.professionId = prNext.length ? prNext : null
  }

  const emNext = parsed.employerId.trim()
  const emBase = normStr(baseline.employerId)
  if (emNext !== emBase) {
    patch.employerId = emNext.length ? emNext : null
  }

  const incomeBase = parseAnnualIncomeToNumber(baseline.annualIncome)
  const incomeParsed = parseAnnualIncomeToNumber(parsed.annualIncome)
  if (incomeParsed !== incomeBase) {
    patch.annualIncome = incomeParsed
  }

  return patch
}
