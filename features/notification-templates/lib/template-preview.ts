const DUMMY_VALUES: Record<string, string> = {
  taxpayerName: "Ada Okafor",
  tin: "1234567890",
  amount: "₦125,000",
  period: "Q1 2026",
  authorityName: "Enugu State IRS",
  firstName: "Chidi",
  username: "c.okafor",
  tempPassword: "TempPass!234",
  token: "A1B2C3D4",
  expiresIn: "30 minutes",
  receiptNumber: "RCP-2026-00421",
}

export function substituteTemplateVariables(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return DUMMY_VALUES[key] ?? match
  })
}

export function smsCharacterCount(text: string): number {
  return [...text].length
}
