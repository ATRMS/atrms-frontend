export interface Permission {
  code: string
  description?: string
}

export interface Role {
  id: string
  name: string
  permissions: Permission[]
}

export interface BusinessLine {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
}
