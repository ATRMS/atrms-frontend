/** API may return `\n` escapes in template bodies. */
export function templateBodyFromApi(body: string): string {
  return body.replace(/\\n/g, "\n")
}

export function extractVariablesFromBody(body: string): string[] {
  const found = new Set<string>()
  for (const match of body.matchAll(/\{\{(\w+)\}\}/g)) {
    found.add(match[1]!)
  }
  return [...found]
}

export function insertVariableAtCursor(
  current: string,
  variable: string,
  textarea: HTMLTextAreaElement | null
): string {
  const token = `{{${variable}}}`
  if (!textarea) {
    return current + token
  }

  const start = textarea.selectionStart ?? current.length
  const end = textarea.selectionEnd ?? current.length
  return current.slice(0, start) + token + current.slice(end)
}
