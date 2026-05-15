# Agent Instructions (AI Procurement)

Agents working in this repo **must actively discover and use every installed project skill that applies to the task**. Do not rely only on skills surfaced by the runtime, model memory, or explicit user mentions.

If a skill is installed in this repository and applies to the current work, read its `SKILL.md` before editing files or running task-specific commands. Apply the skill's instructions even when the user did not name the skill.

## Discover Installed Skills

At the start of any non-trivial task:

1. Read [`skills-lock.json`](skills-lock.json) to see the installed project skills.
2. Check for skill entrypoints under [`.agents/skills/*/SKILL.md`](.agents/skills/).
3. Treat each `.agents/skills/<name>/SKILL.md` file as the primary instructions for that skill.
4. If `skills-lock.json` and the filesystem disagree, prefer the skill directories that actually exist under `.agents/skills/*/SKILL.md`.
5. If you add, remove, rename, or reinstall skills, update [`skills-lock.json`](skills-lock.json) and this file in the same change.

Current installed project skills:

| Skill | Entrypoint | Use when |
| --- | --- | --- |
| **next-best-practices** | [`.agents/skills/next-best-practices/SKILL.md`](.agents/skills/next-best-practices/SKILL.md) | Working with Next.js App Router, `app/**` (or `src/app/**`), routing, layouts, Server Components or Actions, middleware/proxy, `next.config.*`, metadata, fetching/caching, Vercel deployment, or Next CLI behavior. |
| **shadcn** | [`.agents/skills/shadcn/SKILL.md`](.agents/skills/shadcn/SKILL.md) | Working with UI, `components.json`, `components/**`, `components/ui/**`, Tailwind, design tokens, forms, dialogs, component composition, icons, or shadcn CLI/registry usage. |
| **tanstack-query** | [`.agents/skills/tanstack-query/SKILL.md`](.agents/skills/tanstack-query/SKILL.md) | TanStack Query v5 (`@tanstack/react-query`): queries, mutations, query keys, caching/invalidation, prefetch, infinite queries, suspense integration, and related server-state patterns. |
| **react-query** | [`.agents/skills/react-query/SKILL.md`](.agents/skills/react-query/SKILL.md) | Server-state organization, query/mutation hook structure, and React Query ecosystem habits. Prefer **tanstack-query** for v5-specific APIs used in this repo. |
| **typescript-advanced-types** | [`.agents/skills/typescript-advanced-types/SKILL.md`](.agents/skills/typescript-advanced-types/SKILL.md) | Complex type logic: generics, conditional/mapped/template-literal types, utility types, inference-heavy APIs, reusable type helpers, type-safe clients/config/validation/state, or library-grade typing in `.ts`/`.tsx`. |
| **ui-ux-pro-max** | [`.agents/skills/ui-ux-pro-max/SKILL.md`](.agents/skills/ui-ux-pro-max/SKILL.md) | UI structure, visual design, UX review, accessibility, typography/color/spacing decisions, dashboards and admin layouts, motion/responsive behavior, and stack-aware guidance (including Tailwind/shadcn). |

## When To Load Skills

Use every matching skill, not just the most specific one.

- If the task touches App Router code and UI components, use both **next-best-practices** and **shadcn**.
- If the task touches only routing, metadata, server/client boundaries, data fetching, or Next config, use **next-best-practices**.
- If the task touches only component composition, styling, Tailwind, icons, forms, dialogs, or `components.json`, use **shadcn**.
- If the task involves TanStack Query (`useQuery`, `useMutation`, keys, cache lifecycle, devtools), read **tanstack-query**; use **react-query** as supplementary guidance where it does not conflict with v5.
- If the task changes how something looks, feels, moves, or is interacted with—or you need UX/accessibility/visual-quality review—use **ui-ux-pro-max** (often together with **shadcn**).
- If the task involves advanced typing, generics, conditional/mapped types, careful inference, or shared type utilities across modules, use **typescript-advanced-types** (often together with **next-best-practices** and/or **shadcn** when those areas overlap).
- If another installed skill applies to persistence, auth, testing, deployment, or another domain, use that skill as well after reading its `SKILL.md`.

## Required Workflow

1. **Classify** the change by domain before editing: Next.js, UI/shadcn, TanStack Query/server state, UI/UX quality, TypeScript (advanced types / inference), data/auth, testing, build tooling, docs, or another area.
2. **Discover** installed skills from `skills-lock.json` and `.agents/skills/*/SKILL.md`.
3. **Read** every applicable skill entrypoint for this session before making changes.
4. **Follow references** linked by the skill only when relevant to the task. Do not bulk-load unrelated reference files.
5. **Apply** the skill conventions: patterns, deprecations, composition rules, CLI usage, file conventions, and verification steps.
6. **Verify** the change using the repo's existing scripts or the skill's recommended checks when practical.
7. **Keep skill metadata accurate** when skills change by updating `skills-lock.json` and this file.

## MCP And Tooling

If a skill mentions MCP or another specialized tool, use it when it materially reduces API, registry, or framework-version mismatch risk. Still obey the skill's local `SKILL.md` and this file.

---

<!-- BEGIN:nextjs-agent-rules -->
# This Is Not The Next.js You Know

This project may use Next.js APIs, conventions, or file structures that differ from general model training. For work involving Next.js, read the installed **next-best-practices** skill at [`.agents/skills/next-best-practices/SKILL.md`](.agents/skills/next-best-practices/SKILL.md) before editing.

When the skill points to upstream docs or local `node_modules/next/dist/docs/` references, use those docs for version-specific behavior and heed deprecation notices.
<!-- END:nextjs-agent-rules -->
