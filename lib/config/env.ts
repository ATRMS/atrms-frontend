function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "")
}

/** Variables exposed to the browser (`NEXT_PUBLIC_*`). */
export const publicEnv = {
  apiBaseUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? ""
  ),
  appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() ?? "ATRMS",
}

/** Variables used only on the server (Route Handlers, Server Actions, `fetch` from Node). */
export const serverEnv = {
  get apiBaseUrl(): string {
    return trimTrailingSlash(
      process.env.API_BASE_URL?.trim() ??
        process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ??
        ""
    )
  },
}

export function assertPublicApiBaseUrl(): string {
  if (!publicEnv.apiBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Configure the upstream API URL."
    )
  }

  return publicEnv.apiBaseUrl
}

export function assertServerApiBaseUrl(): string {
  if (!serverEnv.apiBaseUrl) {
    throw new Error(
      "API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set for server-side API calls."
    )
  }

  return serverEnv.apiBaseUrl
}
