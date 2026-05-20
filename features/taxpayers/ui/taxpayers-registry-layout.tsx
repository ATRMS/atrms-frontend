"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABS = [
  {
    value: "all",
    href: "/admin/taxpayers",
    label: "All Taxpayers",
    isActive: (pathname: string) =>
      pathname === "/admin/taxpayers" || pathname === "/admin/taxpayers/",
  },
  {
    value: "individuals",
    href: "/admin/taxpayers/individuals",
    label: "Individuals",
    isActive: (pathname: string) =>
      pathname === "/admin/taxpayers/individuals" ||
      pathname.startsWith("/admin/taxpayers/individuals/"),
  },
  {
    value: "corporates",
    href: "/admin/taxpayers/corporates",
    label: "Corporates",
    isActive: (pathname: string) =>
      pathname === "/admin/taxpayers/corporates" ||
      pathname.startsWith("/admin/taxpayers/corporates/"),
  },
  {
    value: "tin-requests",
    href: "/admin/taxpayers/tin-requests",
    label: "TIN Requests",
    isActive: (pathname: string) =>
      pathname === "/admin/taxpayers/tin-requests" ||
      pathname.startsWith("/admin/taxpayers/tin-requests/"),
  },
] as const

export function TaxpayersRegistryLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const activeTab =
    TABS.find((tab) => tab.isActive(pathname))?.value ?? TABS[0].value

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={activeTab} aria-label="Taxpayer registry sections">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link href={tab.href}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  )
}
