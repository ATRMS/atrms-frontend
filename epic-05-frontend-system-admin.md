# Epic 05 — Frontend: System Administration

> **Goal:** Complete the administration module with the four remaining screens — Global
> Settings, Notification Templates, Audit Trail, and Tenant Management. These screens
> are last because they are operational/monitoring concerns that make most sense once
> the data-entry modules (Master Data, Users, Taxpayers) are already working. After
> this epic every backend endpoint from Epics 01–05 has a corresponding UI.
>
> **Depends on:**
> - Epic 01 Frontend (scaffolding) fully complete
> - Epic 02 Frontend (master data) — admin layout + navConfig pattern in place
> - Epic 03 + 04 Frontend fully complete — sidebar structure finalised
> - Backend Epic 05 (TASK-053, TASK-054, TASK-055, TASK-057) reachable
>
> **Routes:**
> - `/admin/settings` — Global Settings
> - `/admin/notification-templates` — Notification Templates
> - `/admin/audit-logs` — Audit Trail
> - `/tenants` — Tenant Management (top-level, SUPER_ADMIN + multi-mode only)
>
> **Layout:** Authenticated dashboard layout for all screens.

---

## TASK-F500 — Sidebar: System Group & Tenant Admin Section

**Description:**
Add the final two navigation items to the admin sidebar and introduce the conditional
top-level Tenant Administration section.

**Extend `adminNavGroups` in `src/lib/constants/navigation.ts`:**
```typescript
// Append System group to adminNavGroups
{
  label: 'System',
  permission: 'system:config',
  items: [
    { label: 'Settings',               href: '/admin/settings' },
    { label: 'Notification Templates', href: '/admin/notification-templates' },
    { label: 'Audit Trail',            href: '/admin/audit-logs', permission: 'audit:read' },
  ],
},

// Separate top-level section (outside adminNavGroups — rendered below Administration)
export const topLevelNavSections: NavSection[] = [
  {
    label: 'Tenant Administration',
    permission: 'system:provision-tenant',
    multiModeOnly: true,
    items: [
      { label: 'Tenants', href: '/tenants' },
    ],
  },
];
```

**In `Sidebar.tsx`:**
```typescript
// Tenant Admin section is rendered only when:
// 1. NEXT_PUBLIC_TENANT_MODE === 'multi'
// 2. User has system:provision-tenant permission
const showTenantAdmin =
  process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' &&
  hasPermission('system:provision-tenant');
```

**Final sidebar structure (all epics complete):**
```
Administration
  ─── Master Data ───────────────────   Epic 02
  Business Lines / Tax Types / Regions / Tax Offices /
  Organizations / Professions / Currencies / Bank Accounts / Revenue Targets

  ─── User Management ───────────────   Epic 03
  Roles / Permissions / Users

  ─── Taxpayer Registry ─────────────   Epic 04
  TIN Requests / Individual Taxpayers / Corporate Taxpayers

  ─── System ────────────────────────   Epic 05
  Settings / Notification Templates / Audit Trail

─────────────────────────────────────
Tenant Administration                  Epic 05 (multi-mode + SUPER_ADMIN only)
  Tenants
```

---

## TASK-F501 — Global Settings Screen
*Backend ref: TASK-053*

**Route:** `/admin/settings`
**Permission gate:** `system:config`

**Layout:** Single page with tabbed sections — no list/table.

```
Tabs: [General]  [Security]  [Mail]  [SMS]
```

**General tab:**
```
Tax Authority ID    [Text]
Tax Authority Name  [Text]
```

**Security tab:**
```
Session Timeout (minutes)  [Number — 5 to 480]
Failed Login Attempts      [Number — 3 to 10]
Password Expiration (days) [Number — 0 = never expires]
```

**Mail tab:**
```
Email Server    [Text]
Email Sender    [Email input]
Email Username  [Text]
Email Password  [Password input — shows placeholder dots if already set;
                 clear field to change; leave as-is to keep existing value]
                [Test Email Configuration →]
```

**SMS tab:**
```
SMS Gateway URL  [Text]
SMS API Key      [Password input — same placeholder behaviour as Email Password]
                 [Test SMS Configuration →]
```

**Behaviour:**
- Page loads via `GET /system/settings`; password fields show placeholder dots if configured
  (backend returns a masked indicator, not the actual value)
- Leaving a password field unchanged on save → backend preserves the existing encrypted value
- All tabs share one form; "Save Changes" button is fixed at the page bottom
- "Save Changes" is enabled only when the form is dirty (`formState.isDirty`)
- Both Test buttons are independent `POST` calls; each shows a success/failure toast

**Permission gates:**
- View (read-only mode): `system:config`
- Save Changes / Test buttons: `system:config`

---

## TASK-F502 — Notification Templates Screen
*Backend ref: TASK-054*

**Route:** `/admin/notification-templates`
**Permission gate (page-level):** `system:config`

**List screen:**
- Columns: Code, Channel (SMS / EMAIL badge), Subject (email only, truncated), System (lock icon), Status (badge), Actions
- Filters: Channel, Status
- "Add Template" button → opens Sheet (custom templates only; system templates cannot be created via UI)

### Edit Sheet (system and custom templates)

```
Tabs: [Edit]  [Preview]

Edit tab:
  Channel        [Text — read-only]
  Code           [Text — read-only]
  Subject        [Text — email only; editable]
  Body           [Textarea — with variable hint panel on the right]

  Variable Hint Panel:
    "Available variables:"
    {{taxpayerName}}, {{tin}}, {{amount}} ...
    Click a variable to insert it at cursor position

Preview tab:
  Renders the template with dummy values substituted for all {{variable}} markers
  EMAIL: formatted HTML preview panel
  SMS:   plain text with character count shown below

Footer: [Cancel]  [Save Changes]
  (system templates: "Save Changes to System Template" with an amber warning banner)
```

**Deactivate:**
- Hidden for system templates (lock icon in the row explains why — tooltip: "System templates cannot be deactivated")
- Custom templates: Deactivate → ConfirmDialog

**Permission gates:**
- Add custom template: `system:config`
- Edit: `system:config`
- Deactivate custom template: `system:config`

---

## TASK-F503 — Audit Trail Screen
*Backend ref: TASK-055*

**Route:** `/admin/audit-logs`
**Permission gate (page-level):** `audit:read` — users without this permission see an
inline 403 message, not a blank screen.

### List Screen

**Date range requirement:**
The backend requires `from` and `to` (max 31-day window). The page must **not**
auto-fetch on mount — show the filter bar prominently and require the user to click
"Search Logs" before any query fires.

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│ Audit Trail                                                  │
│ Select a date range and optional filters, then search.       │
├──────────────────────────────────────────────────────────────┤
│ [From ▾] [To ▾]  [Entity Type ▾] [Action ▾] [Actor] [Result ▾] │
│                                                [Search Logs] │
├──────────────────────────────────────────────────────────────┤
│ (results table appears here after search)                    │
└──────────────────────────────────────────────────────────────┘
```

**Date range defaults:** last 7 days (pre-populated but not auto-submitted).
Inline validation: "Date range cannot exceed 31 days" — disables Search button.

**Filters (all optional):**

| Filter | Input | Values |
|---|---|---|
| Entity Type | Select | ASSESSMENT · PAYMENT · USER · TAXPAYER · ROLE · GLOBAL_SETTINGS · NOTIFICATION_TEMPLATE · SYSTEM |
| Action | Select | CREATE · UPDATE · DELETE · LOGIN · LOGOUT · VIEW |
| Actor | Combobox | Searchable user list |
| Result | Select | SUCCESS · FAILURE · PARTIAL |

**Results table:**
- Columns: Timestamp, Entity Type (badge), Action (badge), Entity ID (truncated + copy icon), Actor, IP Address, Result (badge), Actions
- Pagination: 50 per page
- "View Details →" action per row

**Badge colour coding:**

| | Value | Colour |
|---|---|---|
| Action | CREATE | Blue |
| | UPDATE | Amber |
| | DELETE | Red |
| | LOGIN / LOGOUT | Gray |
| | VIEW | Light gray |
| Result | SUCCESS | Green |
| | FAILURE | Red |
| | PARTIAL | Amber |

### Audit Log Detail Sheet

Opens from "View Details →"; uses a right-side `<Sheet>` to preserve list context.

```
Timestamp / Entity Type / Entity ID [copy] / Action / Actor [link to profile] /
IP Address / Result / Failure Reason (FAILURE only)
──────────────────────────────────────────────────
Before (Old Values)        After (New Values)
[JSON syntax-highlighted]  [JSON syntax-highlighted]
── CREATE: Before = "—"  |  DELETE: After = "—" ──
──────────────────────────────────────────────────
[Close]
```

**API hooks (`src/lib/api/hooks/useAuditLogs.ts`):**
```typescript
useAuditLogs(params: AuditLogParams)  // fires only when params include valid from/to
useAuditLog(id)                       // called lazily on "View Details"
```

**Acceptance criteria:**
- No network request fires until "Search Logs" is clicked
- Range > 31 days shows inline error and disables the search button
- Detail Sheet renders old/new JSON for UPDATE entries
- FAILURE rows show failure reason in the detail Sheet
- Actor name links to `/admin/users/{actorId}`

---

## TASK-F504 — Tenant Management Screen
*Backend ref: TASK-057*

**Route:** `/tenants` (top-level, outside `/admin/`)
**Visibility:** Only rendered when `NEXT_PUBLIC_TENANT_MODE=multi` AND user has `system:provision-tenant`

### Tenant List Screen

**List screen:**
- Columns: Code, Name, State, Schema Name (mono), Status (badge), Provisioned Date, Actions
- "Provision New Tenant" button → opens Sheet

**Status badge colours:**

| Status | Colour |
|---|---|
| ACTIVE | Green |
| PROVISIONING | Blue + spinner animation |
| SUSPENDED | Amber |
| FAILED | Red |

**Auto-polling for PROVISIONING:**
```typescript
useQuery({
  queryKey: ['tenants'],
  queryFn:  tenantsApi.list,
  refetchInterval: (data) => {
    const hasProvisioning = data?.some(t => t.status === 'PROVISIONING');
    return hasProvisioning ? 3000 : false;
  },
});
```

**Row Actions:**
- **View** → Tenant Detail page
- **Re-provision** (FAILED rows only) → ConfirmDialog → `POST /admin/tenants/{id}/provision`

### Provision New Tenant Sheet

```
Fields:
  Code         [Text — lowercase, hyphens allowed, e.g. imo-irs]
  Name         [Text — full IRS name]
  State        [Text — state name]
  Schema Name  [Text — PostgreSQL schema, lowercase + underscores, e.g. imo_irs]

Footer: [Cancel]  [Provision Tenant]
```

**Zod validation:**
```typescript
const schema = z.object({
  code:       z.string().min(3).max(20).regex(/^[a-z0-9-]+$/),
  name:       z.string().min(5).max(255),
  state:      z.string().min(2).max(100),
  schemaName: z.string().regex(/^[a-z][a-z0-9_]{2,49}$/,
                'Must start with a letter; lowercase letters, numbers, underscores only'),
});
```

**Provisioning UX:**
1. Form submits → Sheet closes → new row appears with PROVISIONING status + spinner
2. Auto-poll every 3 s until status changes
3. ACTIVE → success toast: "Tenant [Name] provisioned successfully"
4. FAILED → error toast: "Provisioning failed for [Name]. Use Re-provision to retry."

### Tenant Detail Page (`/tenants/[id]`)

```
Header: Code  Name  Status badge  [Re-provision] ← FAILED only

Section 1 — Details
  Code, Name, State, Schema Name, Status, Provisioned Date
```

**API hooks (`src/lib/api/hooks/useTenants.ts`):**
```typescript
useTenants()
useTenant(id)
useProvisionTenant()
useReprovisionTenant()
```

**Environment variable** — add to `.env.local.template`:
```
# 'multi' for shared cloud deployment; omit or 'single' for on-premise
NEXT_PUBLIC_TENANT_MODE=single
```

---

## API Types to Add

**`src/types/domain/audit.ts`:**
```typescript
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW';
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'PARTIAL';

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  actorId: string | null;
  actorUsername: string | null;
  ipAddress: string | null;
  result: AuditResult;
  failureReason: string | null;
  createdAt: string;
  oldValues?: Record<string, unknown> | null;   // detail view only
  newValues?: Record<string, unknown> | null;   // detail view only
}

export interface AuditLogParams {
  from: string; to: string;
  entityType?: string; action?: AuditAction;
  actorId?: string; result?: AuditResult;
  page?: number; size?: number;
}
```

**`src/types/domain/tenant.ts`:**
```typescript
export type TenantStatus = 'ACTIVE' | 'PROVISIONING' | 'SUSPENDED' | 'FAILED';

export interface Tenant {
  id: string; code: string; name: string;
  state: string; schemaName: string;
  status: TenantStatus; createdAt: string;
}
```

---

## Build Order Within This Epic

```
1. F500 Sidebar System Group + Tenant Admin   ← structural; extends navConfig
2. F501 Global Settings                       ← no data dependencies; singleton form
3. F502 Notification Templates                ← no data dependencies
4. F503 Audit Trail                           ← reads existing audit_logs; no mutations
5. F504 Tenant Management                     ← depends on F500 (sidebar section in place)
```

---

## Administration Module — Complete

After Epic 05, every backend endpoint from Epics 01–05 has a corresponding UI:

| Epic | Frontend module | Status |
|---|---|---|
| Auth (login, refresh, change-password, forgot/reset) | Epic 01 Scaffolding | ✅ |
| Master Data (9 reference data screens) | Epic 02 | ✅ |
| User Management (Roles, Permissions, Users) | Epic 03 | ✅ |
| Taxpayer Registry (TIN Requests, Individuals, Corporates) | Epic 04 | ✅ |
| System Admin (Settings, Templates, Audit Trail, Tenants) | Epic 05 | ✅ |
