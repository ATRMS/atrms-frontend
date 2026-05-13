# Epic 01 — Frontend Scaffolding & Infrastructure Setup

> **Goal:** Stand up a fully configured Next.js application with all shared infrastructure
> in place — routing, auth, API client, component library, and form handling — so that
> every subsequent epic only needs to build feature screens, not boilerplate.
>
> **Stack Decision:** Next.js 16+ (App Router) with TypeScript. Chosen over plain React
> because it gives file-based routing, server components for data-heavy report pages,
> and a production-grade build pipeline out of the box.
>
> **Outcome:** `npm run dev` starts the app; login screen renders; authenticated routes
> redirect unauthenticated users; API client sends JWT on every request and auto-refreshes
> expired tokens; the shared layout (sidebar + topbar) renders correctly.
>
> **Depends on:** Epic 01 Backend (auth endpoints must be reachable for integration testing)

---

## Tech Stack

| Concern           | Choice                          | Reason                                                              |
| ----------------- | ------------------------------- | ------------------------------------------------------------------- |
| Framework         | Next.js 16+ (App Router)        | File-based routing, server components, production-ready             |
| Language          | TypeScript (strict mode)        | Catches API contract mismatches at compile time                     |
| Styling           | Tailwind CSS                    | Utility-first; consistent with government UI density requirements   |
| Component Library | shadcn/ui (Radix UI primitives) | Accessible, unstyled base + Tailwind; not a black-box library       |
| Data Fetching     | TanStack Query (React Query)    | Cache, background refetch, loading/error states out of the box      |
| HTTP Client       | Axios                           | Interceptors for JWT injection and token refresh                    |
| Client State      | Zustand                         | Auth state, UI state (sidebar, modals); lightweight, no boilerplate |
| Forms             | React Hook Form + Zod           | Performant forms; Zod schema shared with API type definitions       |
| Notifications     | Sonner (toast)                  | Minimal, accessible toast library                                   |
| Icons             | Lucide React                    | Consistent icon set used by shadcn/ui                               |
| Linting           | ESLint + Prettier               | Enforced via pre-commit hook                                        |
| Testing           | Vitest + React Testing Library  | Unit/component tests; Playwright for e2e                            |

---

## TASK-F001 — Project Initialisation

**Description:**
Bootstrap the Next.js project with TypeScript, Tailwind, and shadcn/ui.

**Steps:**

```bash
# npx create-next-app@latest atrms-frontend \
#   --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init --preset b1s91W3nc --template next
# cd atrms-frontend
# npx shadcn-ui@latest init
```

**Deliverables:**

- `atrms-frontend/` project directory committed to repo (sibling to `atrms-backend/`)
<!-- - `tailwind.config.ts` — extend theme with ATRMS brand colours (primary, accent, danger, muted) -->
- `components.json` — shadcn/ui config (style: base-nova, base colour: neutral)
- `.env.local.template` — documented environment variables:
  ```
  NEXT_PUBLIC_API_BASE_URL=http://localhost/api/v1
  NEXT_PUBLIC_APP_NAME=ATRMS
  ```
- `.env.local` in `.gitignore`

**Core shadcn/ui components to install at this stage:**

```bash
npx shadcn-ui@latest add button input label form select checkbox
npx shadcn-ui@latest add table dialog sheet dropdown-menu
npx shadcn-ui@latest add card badge separator skeleton toast
npx shadcn-ui@latest add alert tabs breadcrumb pagination
```

**Acceptance criteria:**

- `npm run dev` starts without errors
- `npm run build` produces a clean production build
- Tailwind brand colours render correctly on a placeholder home page

---

## TASK-F002 — Project Folder Structure

**Description:**
Establish the folder conventions all subsequent tasks will follow.

**Structure:**

```
src/
├── app/                          ← Next.js App Router pages
│   ├── (auth)/                   ← unauthenticated routes (login, forgot-password)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── (dashboard)/              ← authenticated routes (all wrapped in auth check)
│   │   ├── layout.tsx            ← shared sidebar + topbar layout
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── admin/                ← Administration section
│   │       ├── layout.tsx
│   │       ├── business-lines/
│   │       ├── tax-types/
│   │       ├── regions/
│   │       ├── tax-offices/
│   │       ├── revenue-targets/
│   │       ├── currencies/
│   │       ├── bank-accounts/
│   │       ├── settings/
│   │       ├── notification-templates/
│   │       ├── roles/
│   │       └── users/
│   ├── layout.tsx                ← root layout (fonts, providers)
│   └── page.tsx                  ← redirect to /dashboard or /login
│
├── components/
│   ├── ui/                       ← shadcn/ui generated components (do not edit)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── PageHeader.tsx
│   └── shared/
│       ├── DataTable.tsx         ← reusable paginated table
│       ├── ConfirmDialog.tsx     ← reusable confirmation modal
│       ├── StatusBadge.tsx       ← ACTIVE/INACTIVE/LOCKED badge
│       ├── FormField.tsx         ← label + input + error wrapper
│       └── EmptyState.tsx        ← empty list placeholder
│
├── lib/
│   ├── api/
│   │   ├── client.ts             ← Axios instance
│   │   └── endpoints/            ← one file per resource
│   ├── schemas/                  ← Zod schemas (one file per domain)
│   ├── utils.ts                  ← cn(), formatDate(), formatCurrency()
│   └── constants.ts              ← enums, dropdown options
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePagination.ts
│   └── useDebounce.ts
│
├── store/
│   ├── authStore.ts              ← Zustand: user, token, permissions
│   └── uiStore.ts                ← Zustand: sidebar state, active modal
│
└── types/
    ├── api.ts                    ← ApiResponse<T>, ApiError, Meta
    └── domain/                   ← one file per domain entity
```

**Acceptance criteria:**

- All folders exist with index or placeholder files
- TypeScript path alias `@/*` resolves correctly for all folders

---

## TASK-F003 — API Client & Type Definitions

**Description:**
Configure Axios with JWT injection, automatic token refresh, and standardised error handling.
Define TypeScript types that match the backend API response contracts.

**`src/lib/api/client.ts`:**

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject Bearer token from authStore
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: on 401, attempt token refresh once, then redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await refreshAccessToken(); // calls POST /auth/refresh
        return apiClient(error.config); // retry original request
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(normaliseError(error)); // maps to ApiError type
  },
);
```

**`src/types/api.ts`:**

```typescript
export interface ApiResponse<T> {
  status: number;
  data: T;
  meta?: Meta;
}

export interface Meta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  traceId: string;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
}
```

**Acceptance criteria:**

- Unit test: request interceptor injects `Authorization` header when token is present
- Unit test: 401 response triggers refresh; if refresh fails, logout is called
- Unit test: `normaliseError` converts Axios error to `ApiError` shape

---

## TASK-F004 — Authentication State & Protected Routes

**Description:**
Implement login/logout flow, persist auth state, and protect all dashboard routes.

**`src/store/authStore.ts` (Zustand):**

```typescript
interface AuthState {
  accessToken: string | null;
  user: AuthUser | null; // { id, email, fullName, tenantId, roles, permissions }
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (code: string) => boolean;
}
```

**Token persistence:**

- `accessToken` stored in memory only (not localStorage — XSS protection)
- `refreshToken` stored in an `httpOnly` cookie set by the backend
- On page reload: call `POST /auth/refresh` silently to restore session

**`src/app/(auth)/login/page.tsx`:**

- Email + Password form with React Hook Form + Zod validation
- "Failed login" error message from API shown inline (not toast)
- "Forgot password?" link → `/forgot-password`
- Redirect to `/dashboard` on success
- State IRS logo and name (from `NEXT_PUBLIC_APP_NAME`) in the header

**Route protection (`src/app/(dashboard)/layout.tsx`):**

```typescript
// Server component: check session on server side
// Client fallback: if no token in store, redirect to /login
```

**Permission gate component:**

```typescript
// Wraps any UI element; renders null if user lacks the permission
<PermissionGate permission="USER_CREATE">
  <Button>Add User</Button>
</PermissionGate>
```

**Acceptance criteria:**

- Unauthenticated visit to `/admin/users` redirects to `/login`
- Successful login stores token and redirects to `/dashboard`
- Token refresh on page reload restores session without flicker
- `hasPermission('NON_EXISTENT')` returns false safely

---

## TASK-F005 — Shared Layout (Sidebar + Topbar)

**Description:**
The authenticated shell layout used by all dashboard pages.

**Sidebar (`src/components/layout/Sidebar.tsx`):**

- Collapsible (desktop: icon-only mode; mobile: drawer overlay)
- Navigation items grouped by section:
  ```
  Dashboard
  ─────────────────
  Administration
    Business Lines
    Tax Types
    Regions
    Tax Offices
    Revenue Targets
    Currencies
    Bank Accounts
    Global Settings
    Notification Templates
    Roles
    Users
  ─────────────────
  [further sections added per epic]
  ```
- Active route highlighted
- Navigation items hidden if user lacks read permission for that section
- State persisted in `uiStore` (collapsed/expanded)

**Topbar (`src/components/layout/Topbar.tsx`):**

- Left: breadcrumb trail (auto-generated from route)
- Right: user avatar dropdown → Profile, Change Password, Logout

**Page Header (`src/components/layout/PageHeader.tsx`):**

```typescript
// Reusable component used at the top of every page
<PageHeader
  title="Users"
  description="Manage IRS officer accounts"
  action={<Button onClick={...}>Add User</Button>}
/>
```

**Acceptance criteria:**

- Sidebar collapses and expands correctly on desktop
- Sidebar renders as drawer on mobile (< 768px)
- Navigation items respect user permissions (hidden, not just disabled)
- Active route is visually highlighted

---

## TASK-F006 — Shared Data Table Component

**Description:**
A reusable, paginated, sortable table used by every list screen in the system.

**`src/components/shared/DataTable.tsx`:**

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[]; // TanStack Table column definitions
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  filters?: ReactNode; // slot for custom filter controls
  emptyMessage?: string;
}
```

**Features:**

- Server-side pagination (page controls at bottom)
- Column sorting (sends `sort=field,direction` to API)
- Search input with 300ms debounce
- Loading skeleton (row placeholders while fetching)
- Empty state with icon and message
- Row actions slot (Edit / Deactivate / View dropdown per row)

**Acceptance criteria:**

- Component renders with mock data and paginator works
- Loading state shows skeleton rows, not spinner
- Empty state shows correct message
- Search debounces correctly (tested with `vi.useFakeTimers`)

---

## TASK-F007 — Shared Form Infrastructure

**Description:**
Establish the patterns all feature forms will follow for consistency.

**`src/components/shared/FormField.tsx`:**

```typescript
// Wraps React Hook Form Controller with label, input, and error message
<FormField
  control={form.control}
  name="email"
  label="Email Address"
  required
  render={({ field }) => <Input {...field} type="email" />}
/>
```

**Standard form patterns:**

- All forms use `useForm<Schema>({ resolver: zodResolver(schema) })`
- Submit button shows spinner while `isPending` (TanStack Mutation)
- API validation errors (field-level 400 responses) mapped back to form fields
- Dirty check on close: "You have unsaved changes. Discard?" confirm dialog

**Shared Zod validators:**

```typescript
// src/lib/schemas/common.ts
export const uuidSchema = z.string().uuid();
export const phoneSchema = z.string().regex(/^\+?[0-9]{10,14}$/);
export const emailSchema = z.string().email();
export const yearSchema = z.number().int().min(2020).max(2099);
export const amountSchema = z.number().positive();
```

**Acceptance criteria:**

- Unit test: Zod schema rejects invalid phone format
- Unit test: API 400 with field errors maps correctly to form field errors

---

## TASK-F008 — Global Error Handling & Notifications

**Description:**
Centralised error display and user notification system.

**Toast notifications (Sonner):**

```typescript
// src/lib/utils/notify.ts — thin wrapper used everywhere
export const notify = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  info: (msg: string) => toast.info(msg),
};

// Usage in mutations:
onSuccess: () => notify.success('User created successfully'),
onError: (err) => notify.error(err.message),
```

**Error Boundary (`src/components/shared/ErrorBoundary.tsx`):**

- Catches unexpected render errors
- Shows friendly "Something went wrong" UI with a retry button
- Logs error to console (Sentry integration point for production)

**HTTP error display rules:**
| Status | Where shown |
|---|---|
| 400 (validation) | Inline on form fields |
| 401 | Redirect to login |
| 403 | Inline "You do not have permission" message |
| 404 | Inline "Record not found" message |
| 409 (conflict) | Toast error with the API message |
| 500 | Toast "An unexpected error occurred" |

**Acceptance criteria:**

- 403 response does not crash the page
- 409 shows the conflict message from the API (e.g. "Region has active tax offices")
- Toast auto-dismisses after 4 seconds

---

## TASK-F009 — TanStack Query Setup & API Hooks Pattern

**Description:**
Configure TanStack Query and establish the hook pattern all feature modules will use.

**Provider setup (`src/app/layout.tsx`):**

```typescript
<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Query client config:**

- `staleTime`: 2 minutes (master data doesn't change often)
- `retry`: 1 (retry once on network error, not on 4xx)
- `refetchOnWindowFocus`: false (admin app — no surprise refetches)

**Hook pattern (example — all feature hooks follow this):**

```typescript
// src/lib/api/hooks/useBusinessLines.ts
export const useBusinessLines = (params: BusinessLineParams) =>
  useQuery({
    queryKey: ["business-lines", params],
    queryFn: () => businessLineApi.list(params),
  });

export const useCreateBusinessLine = () =>
  useMutation({
    mutationFn: businessLineApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-lines"] });
      notify.success("Business line created");
    },
    onError: (err: ApiError) => notify.error(err.message),
  });
```

**Acceptance criteria:**

- Dev tools panel visible in development
- List query re-fetches after a create/update/deactivate mutation invalidates cache
- Failed query shows error state in the DataTable

---

## TASK-F010 — CI Pipeline (Frontend)

**Description:**
GitHub Actions workflow for the frontend.

**File:** `.github/workflows/frontend-ci.yml`

**Jobs:**

1. **lint** — `npm run lint` (ESLint + Prettier check)
2. **typecheck** — `npx tsc --noEmit`
3. **test** — `npm run test` (Vitest unit + component tests)
4. **build** — `npm run build` (Next.js production build)

**Acceptance criteria:**

- All jobs pass on clean push
- TypeScript errors fail the pipeline
- Test coverage report published as artifact
