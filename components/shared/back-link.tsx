"use client"

import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type BackLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

/** Ghost link styled as a back control (arrow + label). */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Button asChild variant="ghost" className={cn("w-fit", className)}>
      <Link href={href}>
        <ArrowLeftIcon data-icon="inline-start" />
        {children}
      </Link>
    </Button>
  )
}
