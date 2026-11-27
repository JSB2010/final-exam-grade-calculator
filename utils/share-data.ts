import { parseSharePayload, STORAGE_VERSION_NUMBER } from "@/utils/storage-schemas"
import type { AppSettings, GradeClass } from "@/types/grade-calculator"

const MAX_SHARE_LENGTH = 16_384

export type SharePayload = {
  version: number
  classes: GradeClass[]
  settings?: AppSettings
}

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = ""
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

const fromBase64Url = (value: string): Uint8Array => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export const buildSharePayload = (payload: Omit<SharePayload, "version">): SharePayload => {
  return {
    version: STORAGE_VERSION_NUMBER,
    classes: payload.classes.map(({ name, current, weight, target, color, credits }, index) => ({
      id: `shared-${index + 1}`, name, current, weight, target, color, credits, assignments: [],
    })),
    settings: payload.settings && {
      roundToWhole: payload.settings.roundToWhole,
      showDecimalPlaces: payload.settings.showDecimalPlaces,
      darkMode: payload.settings.darkMode,
      showCredits: payload.settings.showCredits,
      gradingSystem: payload.settings.gradingSystem,
    },
  }
}

export const encodeShareData = (payload: SharePayload): string => {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  const encoded = toBase64Url(bytes)
  if (encoded.length > MAX_SHARE_LENGTH) throw new Error("This link is too large. Export a file instead.")
  return encoded
}

export const decodeShareData = (encoded: string): SharePayload | null => {
  if (encoded.length > MAX_SHARE_LENGTH || !/^[A-Za-z0-9_-]+$/.test(encoded)) return null
  try {
    const bytes = fromBase64Url(encoded)
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    const validated = parseSharePayload(parsed)
    if (!validated.success) return null
    return validated.data
  } catch {
    return null
  }
}

// Fragments stay in the browser; the query fallback opens older share links.
export const readShareDataFromLocation = ({ hash, search }: { hash: string; search: string }): string | null =>
  new URLSearchParams(hash.slice(1)).get("data") ?? new URLSearchParams(search).get("data")
