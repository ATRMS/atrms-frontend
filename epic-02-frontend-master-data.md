# Epic 02 — Frontend: Master Data

> **Goal:** Implement all UI screens for the Master Data sub-section of Administration.
> This is the first frontend epic after scaffolding because every other module (User
> Management, Taxpayer Registry, System) depends on reference data created here.
> Tax Offices must exist before users can be assigned; Professions and Organizations
> must exist before taxpayers can be registered; Tax Types must exist before bank
> accounts can be configured.
>
> **Depends on:** Epic 01 Frontend (scaffolding) fully complete.
> Backend Epic 03 (read endpoints) and Epic 04 (write endpoints) must be reachable.
>
> **Route prefix:** `/admin/`
> **Sidebar section:** Administration → Master Data (introduced in F200)
> **Layout:** All screens use the authenticated dashboard layout.
> **Permissions:** Every write action is gated by `master-data:write`;
> list/detail views by `master-data:read`.

---

## Shared Screen Pattern

Every master data list screen follows this layout:

```
┌─────────────────────────────────────────────────────────┐
│ Page Header                                             │
│ Title + Description                   [Primary Action] │
├─────────────────────────────────────────────────────────┤
│ Filter Bar                                              │
│ [Search Input]  [Status Filter]  [Other Filters]        │
├─────────────────────────────────────────────────────────┤
│ DataTable                                               │
│ Col1  Col2  Col3  ...                       [Actions ▾] │
├─────────────────────────────────────────────────────────┤
│ Pagination                        Rows per page: [20▾]  │
└─────────────────────────────────────────────────────────┘
```

Create/Edit actions open a **Sheet** (side drawer) for forms with > 5 fields or a
**Dialog** for simple forms (≤ 5 fields).

---

## TASK-F200 — Admin Layout, navConfig & Master Data Sidebar Group

**Description:**
Establish the `navConfig` pattern that drives all sidebar navigation across the entire
admin section and add the first group — Master Data. Subsequent epics extend this config
with their own groups.

**`src/lib/constants/navigation.ts`:**
```typescript
export interface NavItem  { label: string; href: string; permission?: string }
export interface NavGroup { label: string; permission: string; items: NavItem[]; multiModeOnly?: boolean }

export const adminNavGroups: NavGroup[] = [
  {
    label: 'Master Data',
    permission: 'master-data:read',
    items: [
      { label: 'Business Lines',  href: '/admin/business-lines' },
      { label: 'Tax Types',       href: '/admin/tax-types' },
      { label: 'Regions',         href: '/admin/regions' },
      { label: 'Tax Offices',     href: '/admin/tax-offices' },
      { label: 'Organizations',   href: '/admin/organizations' },
      { label: 'Professions',     href: '/admin/professions' },
      { label: 'Currencies',      href: '/admin/currencies' },
      { label: 'Bank Accounts',   href: '/admin/bank-accounts' },
      { label: 'Revenue Targets', href: '/admin/revenue-targets' },
    ],
  },
  // Epic 03 will add: User Management
  // Epic 04 will add: Taxpayer Registry
  // Epic 05 will add: System + Tenant Admin
];
```

**Sidebar rendering rules:**
- A group is hidden entirely if the user lacks the group-level `permission`
- Individual items are hidden if the user lacks the item-level permission (when specified)
- Group headers are non-clickable separators with a label and a horizontal rule
- Active route item is highlighted

**Admin layout pre-fetch (`src/app/(dashboard)/admin/layout.tsx`):**
Pre-fetch the reference data used as dropdowns across all master data forms:
```typescript
queryClient.prefetchQuery({ queryKey: ['regions-ref'],       queryFn: () => masterDataApi.listRegions() });
queryClient.prefetchQuery({ queryKey: ['tax-offices-ref'],   queryFn: () => masterDataApi.listTaxOffices() });
queryClient.prefetchQuery({ queryKey: ['tax-types-ref'],     queryFn: () => masterDataApi.listTaxTypes() });
queryClient.prefetchQuery({ queryKey: ['business-lines-ref'],queryFn: () => masterDataApi.listBusinessLines() });
queryClient.prefetchQuery({ queryKey: ['professions-ref'],   queryFn: () => masterDataApi.listProfessions() });
queryClient.prefetchQuery({ queryKey: ['organizations-ref'], queryFn: () => masterDataApi.listOrganizations() });
queryClient.prefetchQuery({ queryKey: ['currencies-ref'],    queryFn: () => masterDataApi.listCurrencies() });
```

**Acceptance criteria:**
- Master Data group renders in the sidebar with all 9 items
- Group is hidden for users without `master-data:read`
- Pre-fetched reference data is in cache before any master data screen mounts

---

## TASK-F201 — Business Lines Screen
*Backend ref: TASK-043*

**Route:** `/admin/business-lines`

**List screen:**
- Columns: Code, Sector (badge), Name, Status (badge), Actions
- Filters: Sector (dropdown), Status (Active / Inactive)
- "Add Business Line" button → opens Dialog
- Permission gate: `master-data:write`

**Create/Edit Dialog:**
```
Fields:
  Code    [Text — auto-uppercased, unique]
  Name    [Text]
  Sector  [Text — optional grouping label]

Footer: [Cancel]  [Save]
```
- Code is immutable after creation; Edit dialog shows it as read-only

**Deactivate / Activate:**
- Deactivate → ConfirmDialog: "Deactivate [Name]? It will no longer appear in new registrations."
- Row badge updates to INACTIVE via cache invalidation

**Permission gates:** Add/Edit/Deactivate/Activate: `master-data:write`

---

## TASK-F202 — Tax Types Screen
*Backend ref: TASK-041*

**Route:** `/admin/tax-types`

**List screen:**
- Columns: Code, Name, Category (badge), Rate Type, Default Rate, Collecting Authority, Status, Actions
- Filters: Category, Rate Type, Status

**Create/Edit Sheet:**
```
Fields:
  Code                [Text — unique, e.g. PAYE]
  Name                [Text]
  Category            [Select — DIRECT | INDIRECT | WITHHOLDING | LEVY | FEE]
  Rate Type           [Select — PERCENTAGE | FIXED | TIERED | CUSTOM]
  Default Rate        [Number — shown only when Rate Type is PERCENTAGE or FIXED]
  Collecting Authority [Select — STATE | FEDERAL | LGA | JOINT]

Footer: [Cancel]  [Save]
```

**Dynamic field rule:**
- Default Rate is conditionally rendered (not just disabled — removed from DOM) based on
  `watch('rateType')`: show for PERCENTAGE/FIXED, hide for TIERED/CUSTOM

**Permission gates:** Add/Edit/Deactivate/Activate: `master-data:write`

---

## TASK-F203 — Regions Screen
*Backend ref: TASK-042*

**Route:** `/admin/regions`

**List screen:**
- Columns: Code, Name, Type (badge), Parent Region, Actions
- Filters: Type (STATE / LGA / SENATORIAL / FEDERAL_CONSTITUENCY)
- "Add Region" button → opens Dialog

**Create/Edit Dialog:**
```
Fields:
  Code      [Text — unique short code]
  Name      [Text]
  Type      [Select — STATE | LGA | SENATORIAL | FEDERAL_CONSTITUENCY]
  Parent    [Select — optional; dropdown of existing regions, filtered by sensible parent types]

Footer: [Cancel]  [Save]
```

**No deactivation** — regions have no `is_active` column; once created they are permanent.

**Permission gates:** Add/Edit: `master-data:write`

---

## TASK-F204 — Tax Offices Screen
*Backend ref: TASK-040*

**Route:** `/admin/tax-offices`

**List screen:**
- Columns: Code, Name, Region, Phone, Email, Status (badge), Actions
- Filters: Region (dropdown), Status

**Create/Edit Sheet:**
```
Fields:
  Code    [Text — unique]
  Name    [Text]
  Region  [Select — dropdown of all regions]
  Address [Textarea]
  Phone   [Text]
  Email   [Email input]

Footer: [Cancel]  [Save]
```

**Deactivate guard:**
- 409 response: "This office has active users or taxpayers assigned. Reassign them first."

**Permission gates:** Add/Edit/Deactivate/Activate: `master-data:write`

---

## TASK-F205 — Revenue Targets Screen
*Backend ref: TASK-048*

**Route:** `/admin/revenue-targets`

**List screen:**
- Columns: Tax Type, Fiscal Year, Target Amount (₦ formatted), Actions
- Filters: Fiscal Year (number input), Tax Type (dropdown)
- "Set Target" button → opens Dialog

**Create/Edit Dialog:**
```
Fields:
  Tax Type      [Select — active tax types]
  Fiscal Year   [Number — current year pre-filled]
  Target (₦)   [Number — formatted with comma separators]

Footer: [Cancel]  [Save]
```

**Upsert behaviour:** If a target already exists for the selected Tax Type + Year, the
Dialog switches to edit mode automatically and pre-fills the existing value.

**Past-year targets:** Rows for past years are shown with a lock icon; Edit action is hidden.

**Permission gates:** Set/Edit: `master-data:write`

---

## TASK-F206 — Currencies Screen
*Backend ref: TASK-045*

**Route:** `/admin/currencies`

**List screen:**
- Columns: Code, Name, Symbol, Default (star icon), Actions
- Actions per row: Edit, Set as Default
- Default currency row: "Set as Default" hidden; star icon filled

**Create/Edit Dialog:**
```
Fields:
  Code    [Text — ISO 4217, e.g. USD]
  Name    [Text — e.g. US Dollar]
  Symbol  [Text — e.g. $]

Footer: [Cancel]  [Save]
```

**Set Default flow:**
- ConfirmDialog: "Set [Name] as the default currency?"
- On confirm → `PATCH /master-data/currencies/{id}/set-default`
- Previous default loses star; new default shows filled star (optimistic update)

**Permission gates:** Add/Edit/Set Default: `master-data:write`

---

## TASK-F207 — Bank Accounts Screen
*Backend ref: TASK-046*

**Route:** `/admin/bank-accounts`

**List screen:**
- Columns: Account Number, Account Name, Bank, Tax Type, Status (badge), Actions
- Filters: Tax Type, Status

**Create/Edit Sheet:**
```
Fields:
  Account Number  [Text — unique]
  Account Name    [Text]
  Bank Name       [Text]
  Bank Code       [Text — CBN code, e.g. 057]
  Tax Type        [Select — active tax types]
  Currency        [Select — all currencies, default pre-selected]

Footer: [Cancel]  [Save]
```

**Permission gates:** Add/Edit/Deactivate/Activate: `master-data:write`

---

## TASK-F208 — Organizations Screen
*Backend ref: TASK-047*

**Route:** `/admin/organizations`

**What Organizations are:** Employer entities linked to individual taxpayers via `employerId`.
Also used as the primary entity for corporate assessments.

**List screen:**
- Columns: Name, CAC Reg. No., Tax Office, Business Line, Phone, Status (badge), Actions
- Filters: Status, Tax Office (dropdown), Business Line (dropdown)
- "Add Organization" button → opens Sheet

**Create/Edit Sheet:**
```
Section 1 — Identity
  Name         [Text, required]
  CAC Reg. No. [Text, optional — unique if provided]

Section 2 — Classification
  Tax Office     [Select — active tax offices]
  Business Line  [Combobox — searchable active business lines]

Section 3 — Contact
  Address  [Textarea]
  Phone    [Text]
  Email    [Email input]
  Website  [Text, optional]

Footer: [Cancel]  [Save]
```

**Inactive in dropdowns:** When editing an individual taxpayer whose employer is now
inactive, the Employer combobox still shows the inactive org as the current selection
with a gray "(Inactive)" suffix, but does not offer it as a new selection.

**Permission gates:** Add/Edit/Deactivate/Activate: `master-data:write`

---

## TASK-F209 — Professions Screen
*Backend ref: TASK-044*

**Route:** `/admin/professions`

**List screen:**
- Columns: Code, Name, Status (badge), Actions
- Filters: Status
- "Add Profession" button → opens Dialog

**Create/Edit Dialog:**
```
Fields:
  Code  [Text — auto-uppercased, unique — e.g. LAWYER]
  Name  [Text — e.g. Legal Practitioner]

Footer: [Cancel]  [Save]
```

- Code is immutable after creation; shown as read-only in Edit mode with a
  "(cannot be changed)" caption

**Deactivate / Activate:**
- Deactivate → ConfirmDialog: "Deactivate [Name]? It will no longer appear in new
  individual registration forms."
- No 409 risk — deactivating a profession does not affect existing records

**Permission gates:** Add/Edit/Deactivate/Activate: `master-data:write`

---

## Build Order Within This Epic

```
1. F200 Admin Layout & navConfig   ← structural foundation; no data dependencies
2. F203 Regions                    ← no dependencies; needed by Tax Offices
3. F201 Business Lines             ← no dependencies; needed by Organizations
4. F202 Tax Types                  ← no dependencies; needed by Bank Accounts + Revenue Targets
5. F206 Currencies                 ← no dependencies; needed by Bank Accounts
6. F204 Tax Offices                ← depends on Regions (F203)
7. F209 Professions                ← no dependencies; needed by Individual Taxpayer form
8. F208 Organizations              ← depends on Tax Offices (F204) + Business Lines (F201)
9. F207 Bank Accounts              ← depends on Tax Types (F202) + Currencies (F206)
10. F205 Revenue Targets           ← depends on Tax Types (F202)
```

---

## Shared Frontend Notes

### Currency Formatting
```typescript
// src/lib/utils.ts
export const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
```

### Inactive Records in Dropdowns
When editing a record that references a now-inactive item, the dropdown must still show
the inactive item as the current selected value with an "(Inactive)" suffix — but not
offer it as a new selection.

### Deactivate Pattern
All deactivate endpoints update a single boolean. On success:
1. Invalidate the list query cache
2. Show a success toast: "[Name] deactivated"
3. Row badge updates to INACTIVE on next render
