export interface AvailableReport {
  code: string
  title: string
  category: string
}
export interface ReportCategory {
  category: string
  title: string
  reports: AvailableReport[]
}
export interface RegistryReport {
  code: string
  title: string
  titleKey: string
  category: string
  allowedRoles: string[]
  enabled: boolean
}
