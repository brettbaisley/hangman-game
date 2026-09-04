export function selectWord(entries: readonly string[], previous?: string, random = Math.random): string {
  const candidates = entries.length > 1 && previous ? entries.filter((entry) => entry !== previous) : entries
  if (!candidates.length) throw new Error('At least one word is required')
  return candidates[Math.floor(random() * candidates.length)]!
}
