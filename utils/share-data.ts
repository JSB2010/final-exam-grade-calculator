import { parseSharePayload, STORAGE_VERSION_NUMBER } from "@/utils/storage-schemas"
import type { AppSettings, GradeClass } from "@/types/grade-calculator"

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
    ...payload,
  }
}

export const encodeShareData = (payload: SharePayload): string => {
  const json = JSON.stringify(payload)
  const bytes = new TextEncoder().encode(json)
  return toBase64Url(bytes)
}

export const decodeShareData = (encoded: string): SharePayload | null => {
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
