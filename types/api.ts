export interface ApiResponse<T> {
  status: number
  data: T
  meta?: Meta | null
}

export interface Meta {
  page: number
  size: number
  total: number
  totalPages: number
}

export interface ApiError {
  status: number
  error: string
  message: string
  timestamp: string
  path: string
  traceId: string
  fieldErrors?: Record<string, string[]>
}

export interface PageParams {
  page?: number
  size?: number
  sort?: string
  query?: string
}

export interface ApiListParams extends PageParams {
  [key: string]: string | number | boolean | undefined
}
