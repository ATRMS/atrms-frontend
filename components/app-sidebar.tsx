"use client"

import * as React from "react"
import {
  BanknoteIcon,
  BellIcon,
  BriefcaseIcon,
  Building2Icon,
  CircleDollarSignIcon,
  FileSlidersIcon,
  KeyRoundIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  Settings2Icon,
  ShieldIcon,
  UsersIcon,
  WalletCardsIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"

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
import type { AuthUser } from "@/features/authentication/types"

type NavItem = {
  title: string
  url: string
  icon?: React.ReactNode
  permission?: PermissionCode
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
      title: "Administration",
      url: "/admin",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Business Lines",
          url: "/admin/business-lines",
          icon: <Building2Icon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Tax Types",
          url: "/admin/tax-types",
          icon: <FileSlidersIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Regions",
          url: "/admin/regions",
          icon: <MapPinIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Tax Offices",
          url: "/admin/tax-offices",
          icon: <Building2Icon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Revenue Targets",
          url: "/admin/revenue-targets",
          icon: <CircleDollarSignIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Currencies",
          url: "/admin/currencies",
          icon: <BanknoteIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Bank Accounts",
          url: "/admin/bank-accounts",
          icon: <WalletCardsIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Organizations",
          url: "/admin/organizations",
          icon: <LandmarkIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Professions",
          url: "/admin/professions",
          icon: <BriefcaseIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Global Settings",
          url: "/admin/settings",
          icon: <Settings2Icon />,
          permission: PermissionCodes.systemConfig,
        },
        {
          title: "Notification Templates",
          url: "/admin/notification-templates",
          icon: <BellIcon />,
          permission: PermissionCodes.masterDataRead,
        },
        {
          title: "Roles",
          url: "/admin/roles",
          icon: <ShieldIcon />,
          permission: PermissionCodes.roleRead,
        },
        {
          title: "Permissions",
          url: "/admin/permissions",
          icon: <KeyRoundIcon />,
          permission: PermissionCodes.roleRead,
        },
        {
          title: "Users",
          url: "/admin/users",
          icon: <UsersIcon />,
          permission: PermissionCodes.userRead,
        },
      ],
    },
  ],
}

function sidebarNavUser(user: AuthUser | null) {
  if (!user) return data.user

  return {
    name:
      [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
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
  const navMain = React.useMemo(() => {
    const permittedItems = filterByPermission(data.navMain, hasPermission)

    return withActiveState(pathname, permittedItems)
  }, [hasPermission, pathname])

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
