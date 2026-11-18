"use client"

import { useState, useTransition } from "react"

import { setPreLoginLanguage } from "@/features/authentication/actions/session.actions"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const languages = [
  { code: "en", name: "English" },
  { code: "ha", name: "Hausa" },
  { code: "ig", name: "Igbo" },
  { code: "pcm", name: "Nigerian Pidgin" },
  { code: "yo", name: "Yorùbá" },
] as const

export function PreLoginLanguageSelect() {
  const [value, setValue] = useState("en")
  const [, startTransition] = useTransition()

  return (
    <Select
      value={value}
      onValueChange={(language) => {
        setValue(language)
        startTransition(() => setPreLoginLanguage(language))
      }}
    >
      <SelectTrigger aria-label="Language">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {languages.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
