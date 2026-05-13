# Epic 03 — Frontend: User Management

> **Goal:** Implement the Roles, Permissions, and User Management screens. These screens
> come after Master Data because the Create User form requires Tax Offices (from Epic 02)
> for office assignment, and Role assignment requires Roles to already exist.
>
> **Depends on:**
> - Epic 01 Frontend (scaffolding) fully complete
> - Epic 02 Frontend (master data) fully complete — Tax Offices must exist so the
>   Create User form can populate the Tax Office dropdown
> - Backend Epic 05 (TASK-050, TASK-051, TASK-052) endpoints reachable
>
> **Route prefix:** `/admin/`
> **Sidebar section:** Administration → User Management (added in F300)
> **Layout:** All screens use the authenticated dashboard layout.
> **Permissions:** Gated by `role:*` and `user:*` permission codes.

---

## TASK-F300 — Sidebar: User Management Group

**Description:**
Extend the `adminNavGroups` config from Epic 02 (F200) to add the User Management group
below Master Data.

```typescript
// Append to adminNavGroups in src/lib/constants/navigation.ts
{
  label: 'User Management',
  permission: 'role:read',
  items: [
    { label: 'Roles',       href: '/admin/roles',       permission: 'role:read' },
    { label: 'Permissions', href: '/admin/permissions',  permission: 'role:read' },
    { label: 'Users',       href: '/admin/users',        permission: 'user:read' },
  ],
},
```

The group is hidden entirely if the user has neither `role:read` nor `user:read`.

**Admin layout pre-fetch update:**
Add roles to the reference data pre-fetched at the admin layout level (needed for the
Create User form's Role dropdown):
```typescript
queryClient.prefetchQuery({ queryKey: ['roles-ref'], queryFn: () => rolesApi.list() });
```

---

## TASK-F301 — Permissions Screen
*Backend ref: TASK-050 (list endpoint)*

**Route:** `/admin/permissions`

**Purpose:** Reference screen — administrators consult it when configuring roles.
Read-only for all users; there are no create/edit/delete actions for permissions
(they are seeded by the system).

**List screen:**
- Grouped by module, not a flat table — each module is an expandable section
- Columns within each section: Permission Code (mono), Description, System badge
- Filter: Module (dropdown — collapses to show only matching module sections)
- No primary action button

**Grouped layout:**
```
▸ Assessment (4)
▸ Audit (2)
▸ Master Data (2)
▸ Payment (3)
▸ Role (5)
▸ System (2)
▸ Taxpayer (7)
▸ User (6)
```

Each group header shows the permission count. Clicking expands/collapses the section.
Default: all groups expanded.

**Permission gates:** View: `role:read`

---

## TASK-F302 — Role Management Screen
*Backend ref: TASK-050*

**Route:** `/admin/roles` and `/admin/roles/[id]`

### List Screen

- Columns: Code, Name, Permission Count, System (lock badge for system roles), Actions
- Filters: none (typically < 20 roles)
- "Add Role" button → 2-step flow (Dialog then Sheet)
- System roles show a lock icon; Edit/Delete actions hidden for them

### Create Role — 2-Step Flow

**Step 1 — Role Details (Dialog):**
```
Fields:
  Code         [Text — auto-uppercased, underscores only, unique]
  Name         [Text]
  Description  [Textarea, optional]

Footer: [Cancel]  [Next: Configure Permissions →]
```

**Step 2 — Permission Configuration (Sheet, wide):**
```
Layout: Two-panel
  Left:  Module list (click to filter right panel)
  Right: Permission checkbox list for selected module

  [Select All] / [Clear All] per module

  Bottom bar: "X permissions selected across Y modules"
  Footer: [← Back]  [Create Role]
```

### Role Detail Page (`/admin/roles/[id]`)

```
Header: Role Name   Status badge   [Edit Name]  [Delete] ← hidden for system roles

Section 1 — Info
  Code, Description, Created by, Created date

Section 2 — Permissions
  Same two-panel layout as Step 2 above
  "Save Permissions" button (explicit save, not auto-save)
  System roles: permission checkboxes are read-only
```

**Delete guard:**
- 409 response: "This role is assigned to [N] active users. Reassign them before deleting."
- List the affected usernames in the dialog

**Permission gates:**
- Add Role: `role:create`
- Edit name/description: `role:update`
- Configure permissions: `role:update`
- Delete: `role:delete`

---

## TASK-F303 — User Management Screen
*Backend ref: TASK-051, TASK-052*

**Route:** `/admin/users` and `/admin/users/[id]`

### List Screen

- Columns: Staff ID, Full Name, Role, Tax Office, Email, Status (badge), Last Login, Actions
- Filters: Role (dropdown), Tax Office (dropdown), Status (Active / Inactive / Locked)
- "Add User" button → opens Sheet

**Status badge colours:**

| Status | Colour |
|---|---|
| ACTIVE | Green |
| INACTIVE | Gray |
| LOCKED | Red |
| PENDING | Amber |

### Create User Sheet

```
Fields:
  Title        [Select — Mr | Mrs | Miss | Dr | Prof | Chief | Alhaji | Alhaja | Engr | Barr]
  First Name   [Text, required]
  Middle Name  [Text, optional]
  Last Name    [Text, required]
  Staff ID     [Text — unique within tenant]
  Email        [Email, unique]
  Phone        [Text]
  Role         [Select — active roles]
  Tax Office   [Select — active tax offices]

Footer: [Cancel]  [Create User]
Note:  "A welcome email with login instructions will be sent to the user."
```

System generates a temporary password on creation. It is returned in the 201 response
body and shown once in a success dialog — the admin must copy it to deliver out-of-band
if email is not configured.

### User Detail Page (`/admin/users/[id]`)

```
Header:
  Full Name   Role badge   Status badge
  [Edit]  [Reset Password]  [Transfer]  [Deactivate | Activate | Unlock]

Tabs: [Profile]  [Transfer History]
```

**Profile tab:** Two-column read-mode layout. "Edit" button enters inline edit mode
with Save / Cancel buttons.

**Transfer History tab:**
- Columns: From Office, To Office, Reason, Effective Date, Transferred By, Date
- "[+ Transfer User]" button → opens Transfer Dialog

**Transfer Dialog:**
```
Fields:
  From Tax Office  [Text — read-only, current office]
  To Tax Office    [Select — active offices, excludes current]
  Reason           [Textarea, required]
  Effective Date   [Date picker]

Footer: [Cancel]  [Transfer User]
```

**Reset Password flow:**
- ConfirmDialog: "Reset [Name]'s password? A new temporary password will be generated."
- On confirm → `POST /users/{id}/reset-password`
- Response contains the new temp password; show it once in a modal with a "Copy" button

**Deactivate / Activate / Unlock:**
- Each triggers a ConfirmDialog before calling `PATCH /users/{id}/status`
- Status badge on the header updates via cache invalidation

**Permission gates:**
- Add: `user:create`
- Edit profile: `user:update`
- Deactivate/Activate/Unlock: `user:update`
- Transfer: `user:update`
- Reset Password: `user:reset-password`
- Delete: `user:delete`

---

## Build Order Within This Epic

```
1. F300 Sidebar User Management Group  ← structural; extends navConfig from F200
2. F301 Permissions                    ← read-only, no mutations; simplest screen
3. F302 Roles                          ← depends on Permissions list for the config panel
4. F303 Users                          ← depends on Roles (role dropdown) + Tax Offices (from Epic 02)
```
