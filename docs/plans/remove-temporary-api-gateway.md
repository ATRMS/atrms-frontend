# Remove the temporary Next.js API gateway

## Objective

Remove the temporary `/api/backend` gateway after the upstream API supports
the frontend's development and production origins through CORS. Browser API
requests should once again go directly to `NEXT_PUBLIC_API_BASE_URL`.

## Why this exists

The gateway was introduced as a temporary workaround for missing API CORS
headers. A transparent rewrite also forwarded browser cookies and caused Nginx
to return `400 Request Header Or Cookie Too Large`, so the workaround currently
uses a controlled Route Handler that strips cookies.

Do not execute this plan until the prerequisite checks below pass.

## Prerequisites

- [ ] The API team confirms CORS is enabled for `http://localhost:3000`.
- [ ] The API team confirms CORS is enabled for every deployed frontend origin.
- [ ] `OPTIONS` preflight requests are accepted without authentication.
- [ ] Allowed methods include `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and
      `OPTIONS`.
- [ ] Allowed request headers include `Authorization`, `Content-Type`,
      `Accept-Language`, `If-Match`, `If-None-Match`, and
      `X-Idempotency-Key`.
- [ ] CORS is applied to success and error responses, including `401`, `403`,
      `409`, and `422` responses.

Verify the API before changing the frontend:

```bash
curl -i -X OPTIONS \
  'https://api.atlasrevhq.com/api/v1/master-data/regions?page=0&size=20' \
  -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: authorization,content-type'
```

The response should be successful and include an
`Access-Control-Allow-Origin: http://localhost:3000` header plus the requested
method and headers.

## Implementation steps

1. Delete the temporary gateway:

   ```text
   app/api/backend/[...path]/route.ts
   ```

2. Update `lib/config/env.ts`:
   - Remove `publicEnv.browserApiBaseUrl`.
   - Keep `publicEnv.apiBaseUrl` as the browser-facing upstream URL.

3. Update `lib/api/client.ts` so the browser branch in
   `resolveApiBaseUrl()` returns `publicEnv.apiBaseUrl`:

   ```ts
   function resolveApiBaseUrl(): string {
     if (typeof window === "undefined") {
       return serverEnv.apiBaseUrl || publicEnv.apiBaseUrl
     }

     return publicEnv.apiBaseUrl
   }
   ```

4. Update `.env.local.template`:
   - Remove `NEXT_PUBLIC_API_BROWSER_BASE_URL=/api/backend`.
   - Document that `NEXT_PUBLIC_API_BASE_URL` is used directly by the browser
     and therefore requires backend CORS.
   - Keep `API_BASE_URL` for server-only requests.

5. Update `__tests__/api-client.test.ts`:
   - Replace the test named `uses the same-origin API proxy in the browser`.
   - Assert that the browser Axios client uses `publicEnv.apiBaseUrl`, or remove
     the proxy-specific assertion if environment loading makes it brittle.

6. Confirm that no gateway references remain:

   ```bash
   rg -n 'api/backend|browserApiBaseUrl|API_BROWSER_BASE_URL' \
     app lib features components __tests__ .env.local.template
   ```

   The command should return no matches.

## Manual verification

Restart the development server after changing environment or routing code:

```bash
npm run dev
```

In browser developer tools, verify:

- [ ] Region requests go directly to
      `https://api.atlasrevhq.com/api/v1/master-data/regions`.
- [ ] The preflight request succeeds without a CORS console error.
- [ ] The actual request contains the Bearer `Authorization` header.
- [ ] Login, token refresh, logout, and forced password change still work.
- [ ] At least one authenticated list request succeeds.
- [ ] At least one create or update request succeeds.
- [ ] File upload for authority branding succeeds.
- [ ] API validation and conflict errors remain readable by the frontend.

Run the repository checks:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment cleanup

- [ ] Remove `NEXT_PUBLIC_API_BROWSER_BASE_URL` from deployment environments if
      it was configured there.
- [ ] Confirm `NEXT_PUBLIC_API_BASE_URL` points to the correct API for each
      environment.
- [ ] Deploy to a non-production environment first and repeat the browser
      verification using that environment's real frontend origin.
- [ ] Monitor API `OPTIONS`, `401`, `403`, and `5xx` responses after release.

## Rollback

If direct browser calls fail after deployment, restore the gateway Route
Handler and `publicEnv.browserApiBaseUrl`, set the Axios browser base URL back to
`/api/backend`, restart or redeploy Next.js, and send the failed Origin,
preflight request headers, and response headers to the API team.

## Completion criteria

This plan is complete when browser traffic goes directly to the upstream API,
all supported origins pass preflight, the gateway route and its configuration
are gone, and all automated and manual checks pass.
