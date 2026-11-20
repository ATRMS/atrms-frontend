"use client"

import * as React from "react"
import {
  BanknoteIcon,
  Building2Icon,
  CheckCheckIcon,
  FileChartColumnIcon,
  GavelIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  Settings2Icon,
  ShieldIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/features/authentication/store/auth-store"
import {
  PermissionCodes,
  type PermissionCode,
} from "@/features/authentication/lib/permission-codes"
import type { AuthSessionPayload } from "@/features/authentication/types"
import { fetchWorkflowInbox } from "@/features/workflow/api/workflow-api"
import { queryKeys } from "@/lib/query-keys"

type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  permission?: PermissionCode
  badge?: number
  items?: NavItem[]
}

const data = {
  user: {
    name: "ATRMS Admin",
    email: "admin@atrms.local",
    avatar: "",
  },
  teams: [
    {
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "ATRMS",
      logo: <Building2Icon />,
      plan: "Revenue Management",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Approvals",
      url: "/approvals",
      icon: <CheckCheckIcon />,
      permission: PermissionCodes.workflowInbox,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: <FileChartColumnIcon />,
      permission: PermissionCodes.reportRead,
    },
    {
      title: "Organisation",
      url: "/admin/authority-profile",
      icon: <LandmarkIcon />,
      items: [
        {
          title: "Authority profile",
          url: "/admin/authority-profile",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Regions",
          url: "/admin/regions",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Tax offices",
          url: "/admin/tax-offices",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "State Agencies (MDAs)",
          url: "/admin/state-agencies",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "LGAs",
          url: "/admin/lgas",
          permission: PermissionCodes.masterDataRead,
        },
      ],
    },
    {
      title: "Classification",
      url: "/admin/sectors",
      icon: <NetworkIcon />,
      items: [
        {
          title: "Sectors",
          url: "/admin/sectors",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Business lines",
          url: "/admin/business-lines",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Professions",
          url: "/admin/professions",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Tax types",
          url: "/admin/tax-types",
          permission: PermissionCodes.masterDataRead,
        },
      ],
    },
    {
      title: "Revenue and law",
      url: "/admin/revenue-heads",
      icon: <GavelIcon />,
      items: [
        {
          title: "Revenue heads",
          url: "/admin/revenue-heads",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Statutory parameters",
          url: "/admin/parameters",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Legal citations",
          url: "/admin/legal-citations",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Go-live check",
          url: "/admin/go-live",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Revenue targets",
          url: "/admin/revenue-targets",
          permission: PermissionCodes.masterDataRead,
        },
      ],
    },
    {
      title: "Money",
      url: "/admin/currencies",
      icon: <BanknoteIcon />,
      items: [
        {
          title: "Currencies",
          url: "/admin/currencies",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Bank accounts",
          url: "/admin/bank-accounts",
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Payment channels",
          url: "/admin/payment-channels",
          permission: PermissionCodes.masterDataRead,
        },
      ],
    },
    {
      title: "System",
      url: "/admin/settings",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Global settings",
          url: "/admin/settings",
          permission: PermissionCodes.systemRead,
        },
        {
          title: "Notification templates",
          url: "/admin/notification-templates",
          permission: PermissionCodes.systemRead,
        },
        {
          title: "Number formats",
          url: "/admin/number-formats",
          permission: PermissionCodes.systemRead,
        },
        {
          title: "Events and notifications",
          url: "/admin/events",
          permission: PermissionCodes.systemRead,
        },
        {
          title: "Report registry",
          url: "/admin/report-registry",
          permission: PermissionCodes.systemRead,
        },
      ],
    },
    {
      title: "Access",
      url: "/admin/users",
      icon: <ShieldIcon />,
      items: [
        {
          title: "Users",
          url: "/admin/users",
          permission: PermissionCodes.userRead,
        },
        {
          title: "Roles",
          url: "/admin/roles",
          permission: PermissionCodes.roleRead,
        },
        {
          title: "Permissions",
          url: "/admin/permissions",
          permission: PermissionCodes.roleRead,
        },
        {
          title: "Audit trail",
          url: "/admin/audit-logs",
          permission: PermissionCodes.auditRead,
        },
        {
          title: "Taxpayer registry",
          url: "/admin/taxpayers",
          permission: PermissionCodes.taxpayerRead,
        },
      ],
    },
  ],
}

function sidebarNavUser(user: AuthSessionPayload["user"] | null) {
  if (!user) return data.user

  return {
    name: user.fullName || user.email,
    email: user.email,
    avatar: "",
  }
}

function filterByPermission(
  items: NavItem[],
  hasPermission: (code: string) => boolean
): NavItem[] {
  return items.reduce<NavItem[]>((permittedItems, item) => {
    const children = item.items
      ? filterByPermission(item.items, hasPermission)
      : undefined

    if (item.permission && !hasPermission(item.permission)) {
      return permittedItems
    }

    if (item.items && !children?.length) {
      return permittedItems
    }

    permittedItems.push({ ...item, items: children })

    return permittedItems
  }, [])
}

function withActiveState(pathname: string, items: NavItem[]) {
  return items.map((item) => {
    const items = item.items?.map((subItem) => ({
      ...subItem,
      isActive:
        pathname === subItem.url || pathname.startsWith(`${subItem.url}/`),
    }))

    return {
      ...item,
      isActive:
        pathname === item.url ||
        Boolean(items?.some((subItem) => subItem.isActive)),
      items,
    }
  })
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const authUser = useAuthStore((state) => state.user)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const inbox = useQuery({
    queryKey: [...queryKeys.workflow.inbox(), "badge"],
    queryFn: () => fetchWorkflowInbox({ page: 0, size: 1 }),
    enabled: hasPermission(PermissionCodes.workflowInbox),
    refetchInterval: 60_000,
  })
  const permittedItems = filterByPermission(data.navMain, hasPermission).map(
    (item) =>
      item.url === "/approvals"
        ? { ...item, badge: inbox.data?.meta.total }
        : item
  )
  const navMain = withActiveState(pathname, permittedItems)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarNavUser(authUser)} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
