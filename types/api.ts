export interface ApiResponse<T> {
  status: number
  data: T
  meta?: Meta | null
}

export type PaginatedListResponse<TData> = {
  status: number
  data: TData[]
  meta: Meta
}

export interface Meta {
  page: number
  size: number
  total: number
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
  /**
   * Server-side search term for list endpoints that support it.
   * Omit from requests when the backend does not expose search for that resource.
   */
  search?: string
}

export interface ApiListParams extends PageParams {
  [key: string]: string | number | boolean | undefined
}
