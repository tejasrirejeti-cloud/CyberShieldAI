import { z } from "zod"

export type ScanInputType = "url" | "file" | "message"

const MAX_URL_LENGTH = 2048
const MAX_MESSAGE_LENGTH = 12000
const MAX_HASH_LENGTH = 128

const schemas: Record<ScanInputType, z.ZodString> = {
  url: z.string().trim().min(1).max(MAX_URL_LENGTH),
  file: z.string().trim().min(1).max(MAX_HASH_LENGTH),
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
}

export function validateScanInput(type: ScanInputType, input: string):
  | { ok: true; value: string }
  | { ok: false; message: string } {
  if (!(type in schemas)) {
    return { ok: false, message: "Unsupported analysis type." }
  }

  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(input)) {
    return { ok: false, message: "The input contains unsupported control characters." }
  }

  const parsed = schemas[type].safeParse(input)
  if (!parsed.success) {
    const limit = type === "url" ? MAX_URL_LENGTH : type === "message" ? MAX_MESSAGE_LENGTH : MAX_HASH_LENGTH
    return { ok: false, message: `Input is empty or exceeds the ${limit.toLocaleString()} character limit.` }
  }

  return { ok: true, value: parsed.data }
}
