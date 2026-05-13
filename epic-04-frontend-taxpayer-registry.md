# Epic 04 — Frontend: Taxpayer Registry

> **Goal:** Implement all UI screens for the Taxpayer Registry — TIN issuance, individual
> and corporate taxpayer registration, unified search, and lifecycle status management.
> This epic comes after Master Data and User Management because registration forms depend
> on Tax Offices, Professions, Organizations, and Business Lines (all from Epic 02), and
> TIN approval is performed by users whose accounts exist from Epic 03.
>
> **Depends on:**
> - Epic 01 Frontend (scaffolding) fully complete
> - Epic 02 Frontend (master data) fully complete — Tax Offices, Professions, Organizations,
>   Business Lines must exist for registration form dropdowns
> - Epic 03 Frontend (user management) fully complete — approving officers must be
>   created before approval workflows can be tested end-to-end
> - Backend Epic 03 endpoints reachable
>
> **Route prefix:** `/admin/taxpayers/`
> **Sidebar section:** Administration → Taxpayer Registry (added in F400)
> **Layout:** All screens use the authenticated dashboard layout.
> **Permissions:** Gated by `taxpayer:*` permission codes.

---

## Taxpayer Registry Data Flow

```
Submit TIN Request (F401)
        ↓
Approve TIN Request → TIN Generated (F401)
        ↓
Register Individual (F402)  or  Register Corporate (F403)
using the approved TIN (pre-filled automatically)
        ↓
Search & View Taxpayers (F404)
        ↓
Manage Status — Active / Inactive / Blacklisted / Deceased (F405)
```

A TIN must be approved before a taxpayer profile can be created. The registration
forms pre-populate the TIN field from the approved request — the user should not
need to type it manually.

---

## TASK-F400 — Sidebar: Taxpayer Registry Group & Route Structure

**Description:**
Extend `adminNavGroups` with the Taxpayer Registry group and create the route folders.

```typescript
// Append to adminNavGroups in src/lib/constants/navigation.ts
{
  label: 'Taxpayer Registry',
  permission: 'taxpayer:read',
  items: [
    { label: 'TIN Requests',         href: '/admin/taxpayers/tin-requests' },
    { label: 'Individual Taxpayers', href: '/admin/taxpayers/individuals' },
    { label: 'Corporate Taxpayers',  href: '/admin/taxpayers/corporates' },
  ],
},
```

**New route folders:**
```
src/app/(dashboard)/admin/taxpayers/
├── page.tsx                  ← redirects to /admin/taxpayers/tin-requests
├── tin-requests/
│   └── page.tsx
├── individuals/
│   ├── page.tsx              ← list
│   └── [id]/
│       └── page.tsx          ← profile
└── corporates/
    ├── page.tsx              ← list
    └── [id]/
        └── page.tsx          ← profile
```

**Admin layout pre-fetch update:**
Add taxpayer-related reference data (already in cache from Epic 02, just confirming
query keys are consistent):
```typescript
// These are already pre-fetched in Epic 02 admin layout — no new additions needed
// professions-ref, organizations-ref, tax-offices-ref, business-lines-ref
```

**API hooks to add (`src/lib/api/hooks/useTaxpayers.ts`):**
```typescript
useTinRequests(params)
useCreateTinRequest()
useApproveTinRequest()
useRejectTinRequest()
useTaxpayers(params)
useTaxpayer(id)
useLookupByTin(tin)
useIndividualTaxpayer(id)
useCreateIndividual()
useUpdateIndividual()
useCorporateTaxpayer(id)
useCreateCorporate()
useUpdateCorporate()
useUpdateTaxpayerStatus()
useDeleteTaxpayer()
```

---

## TASK-F401 — TIN Request Management Screen
*Backend ref: TASK-021*

**Route:** `/admin/taxpayers/tin-requests`

**List screen:**
- Columns: Requester Ref, Taxpayer Type (badge), Status (badge), Requested By,
  Requested Date, Processed By, Actions
- Filters: Status (Pending / Approved / Rejected / All), Taxpayer Type
- "Submit TIN Request" button → opens Dialog

**Status badge colours:**

| Status | Colour |
|---|---|
| PENDING | Amber |
| APPROVED | Green |
| REJECTED | Red |
| CANCELLED | Gray |

**Submit TIN Request Dialog:**
```
Fields:
  Taxpayer Type  [Select — Individual | Corporate]
  Requester Ref  [Text, optional — NIN / CAC number / other external ref]

Footer: [Cancel]  [Submit Request]
```

**Row Actions — PENDING only:**
- **Approve** → ConfirmDialog: "Approve this TIN request? A TIN will be generated and
  cannot be reversed."
  - On confirm → `PATCH /tin-requests/{id}/approve`
  - Success toast: "TIN Issued: IM-IND-2026-000001-37"
  - Actions column gains a "Register Taxpayer →" link pre-navigating to the correct
    form with the TIN pre-filled
- **Reject** → Reject Dialog:
  ```
  Reason  [Textarea, required]
  Footer: [Cancel]  [Reject Request]
  ```

**APPROVED rows:**
- Generated TIN shown in the row
- Actions: "Register Individual →" or "Register Corporate →" based on type

**REJECTED rows:**
- Actions: "View Reason" — popover showing the rejection reason

**Permission gates:**
- Submit: `taxpayer:create`
- Approve / Reject: `taxpayer:approve-tin`

---

## TASK-F402 — Individual Taxpayer Registration & Profile
*Backend ref: TASK-022*

### List Screen

**Route:** `/admin/taxpayers/individuals`
- Columns: TIN, Full Name, Tax Office, Profession, Status (badge), Registered Date, Actions
- Filters: Status, Tax Office (dropdown), Profession (dropdown)
- "Register Individual" button → opens Sheet

### Create Individual Sheet

**Section 1 — Identity**
```
TIN           [Text — pre-populated if arriving from approved TIN request; read-only if pre-filled]
Title         [Select — Mr | Mrs | Miss | Dr | Prof | Chief | Alhaji | Alhaja | Engr | Barr]
First Name    [Text, required]
Middle Name   [Text, optional]
Last Name     [Text, required]
Date of Birth [Date picker — age must be ≥ 16]
Gender        [Select — Male | Female | Other]
Marital Status [Select — Single | Married | Divorced | Widowed]
Nationality   [Text, default "Nigerian"]
```

**Section 2 — Identification**
```
NIN  [Text — 11 digits, optional but validated if provided]
BVN  [Text — 11 digits, optional but validated if provided]
```

**Section 3 — Contact & Classification**
```
Phone          [Text]
Email          [Email]
Address        [Textarea]
LGA of Origin  [Text]
State of Origin [Text]
Tax Office     [Select — active tax offices]
Profession     [Combobox — searchable active professions, optional]
Employer       [Combobox — searchable active organizations, optional]
Annual Income  [Number, formatted with commas — stored as NGN]
```

**Footer:** `[Cancel]  [Register Individual]`

### Individual Profile Page

**Route:** `/admin/taxpayers/individuals/[id]`

```
Header:
  TIN [mono badge]    Full Name    Status badge
  [Edit Profile]  [Change Status ▾]  [Delete]

Tab: [Profile Details]
  Two-column layout of all fields
  Edit mode: inline with Save / Cancel
```

**Permission gates:**
- Register: `taxpayer:create` | Edit: `taxpayer:update`
- Change Status: `taxpayer:update` | Delete: `taxpayer:delete`

---

## TASK-F403 — Corporate Taxpayer Registration & Profile
*Backend ref: TASK-023*

### List Screen

**Route:** `/admin/taxpayers/corporates`
- Columns: TIN, Company Name, Type (badge), Tax Office, Annual Turnover (₦), Status (badge), Actions
- Filters: Status, Company Type, Tax Office
- "Register Corporate" button → opens Sheet

### Create Corporate Sheet

**Section 1 — Identity**
```
TIN                   [Text — pre-populated from approved TIN request; read-only if pre-filled]
Company Name          [Text, required]
CAC Reg. Number       [Text — unique]
Date of Incorporation [Date picker — cannot be future]
Company Type          [Select — LLC | PLC | Partnership | Sole Proprietorship | NGO | Government]
```

**Section 2 — Business Classification**
```
Business Line  [Combobox — searchable active business lines]
Tax Office     [Select — active tax offices]
```

**Section 3 — Contact**
```
Phone               [Text]
Email               [Email]
Registered Address  [Textarea]
Operating Address   [Textarea]
Annual Turnover     [Number, formatted with commas — NGN]
Employee Count      [Number, non-negative integer, optional]
```

**Footer:** `[Cancel]  [Register Corporate]`

### Corporate Profile Page

**Route:** `/admin/taxpayers/corporates/[id]`

Same layout as Individual Profile — header with TIN badge + status + action buttons,
single Profile Details tab with two-column inline-edit layout.

**Permission gates:**
- Register: `taxpayer:create` | Edit: `taxpayer:update`
- Change Status: `taxpayer:update` | Delete: `taxpayer:delete`

---

## TASK-F404 — Taxpayer Unified Search & Listing
*Backend ref: TASK-024*

**Global TIN Lookup (top bar enhancement):**
- The `Topbar.tsx` search input gets a "Search by TIN" mode
- Input → `GET /taxpayers/lookup?tin=`
- Result card: TIN, Display Name, Type badge, Status badge, "View Profile →" link
  routing to `/individuals/{id}` or `/corporates/{id}`

**Unified "All Taxpayers" tab:**
- Tab bar at the top of the taxpayers section:
  `[All Taxpayers]  [Individuals]  [Corporates]  [TIN Requests]`
- "All Taxpayers" uses `GET /taxpayers` (paginated, both types)
- Columns: TIN, Name, Type (badge), Tax Office, Status (badge), Registered Date
- Row click navigates to the type-specific profile page

**Acceptance criteria:**
- Type badge clearly distinguishes INDIVIDUAL vs CORPORATE
- "All Taxpayers" tab shows correct `displayName` for both types
- TIN lookup result appears without a full page reload

---

## TASK-F405 — Taxpayer Status Management
*Backend ref: TASK-025*

Status change is surfaced as a dropdown on profile pages (F402, F403) — not a
separate screen. This task documents the shared component and its rules.

**`<TaxpayerStatusDropdown>` component:**

| Current Status | Available transitions |
|---|---|
| ACTIVE | INACTIVE, BLACKLISTED, DECEASED |
| INACTIVE | ACTIVE, BLACKLISTED |
| BLACKLISTED | — (no transitions; super admin only) |
| DECEASED | — (terminal) |

- BLACKLISTED and DECEASED transitions show a ConfirmDialog with a mandatory reason
  field and a warning: "This action cannot be easily reversed."
- Badge updates via cache invalidation after a successful status change

**Delete Taxpayer:**
- ConfirmDialog: "Permanently delete [Name] (TIN: [TIN])? This cannot be undone."
- On confirm → `DELETE /taxpayers/{id}` → navigate back to list

**Permission gates:** `taxpayer:update` for status; `taxpayer:delete` for delete

---

## API Types (`src/types/domain/taxpayer.ts`)

```typescript
export type TinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type TaxpayerType     = 'INDIVIDUAL' | 'CORPORATE';
export type TaxpayerStatus   = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'DECEASED';

export interface TinRequest {
  id: string;
  taxpayerType: TaxpayerType;
  requesterRef: string | null;
  status: TinRequestStatus;
  generatedTin: string | null;
  rejectedReason: string | null;
  requestedBy: string;
  processedBy: string | null;
  requestedAt: string;
  processedAt: string | null;
}

export interface TaxpayerSummary {
  id: string;
  tin: string;
  taxpayerType: TaxpayerType;
  taxOfficeId: string | null;
  status: TaxpayerStatus;
  displayName: string;
  registeredAt: string;
}

export interface IndividualTaxpayer extends TaxpayerSummary {
  firstName: string; middleName: string | null; lastName: string;
  title: string | null; dateOfBirth: string | null;
  gender: string | null; maritalStatus: string | null; nationality: string;
  nin: string | null; bvn: string | null;
  phone: string | null; email: string | null; address: string | null;
  lgaOfOrigin: string | null; stateOfOrigin: string | null;
  professionId: string | null; employerId: string | null;
  annualIncome: string | null;
}

export interface CorporateTaxpayer extends TaxpayerSummary {
  companyName: string; regNumber: string | null;
  dateOfIncorporation: string | null; companyType: string | null;
  businessLineId: string | null;
  phone: string | null; email: string | null;
  registeredAddress: string | null; operatingAddress: string | null;
  annualTurnover: string | null; employeeCount: number | null;
}
```

---

## Build Order Within This Epic

```
1. F400 Sidebar & Routes         ← structural; extends navConfig + creates route folders
2. F401 TIN Requests             ← first step in flow; submit + approve/reject
3. F402 Individual Profile       ← depends on F401 (TIN pre-fill from approved request)
4. F403 Corporate Profile        ← depends on F401 (TIN pre-fill from approved request)
5. F404 Unified Search           ← depends on F402 + F403 (records must exist to test)
6. F405 Status Management        ← inline component in F402 + F403; build last
```

---

## TIN Pre-fill Pattern

When navigating from an approved TIN request to the registration form, pass the TIN
via query param: `/admin/taxpayers/individuals?tin=IM-IND-2026-000001-37`

```typescript
const searchParams = useSearchParams();
const prefillTin = searchParams.get('tin');
// If present, set as default value and mark the field read-only
```
