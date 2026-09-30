import { NextResponse } from "next/server"
import { z } from "zod"
import { lookupVirusTotal } from "@/lib/security/virustotal"

const requestSchema = z.object({
  type: z.enum(["url", "file"]),
  value: z.string().trim().min(1).max(2048),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ ok: false, message: "Invalid VirusTotal lookup request." }, { status: 400 })
    }

    if (!process.env.VIRUSTOTAL_API_KEY?.trim()) {
      return NextResponse.json({ ok: false, message: "External threat intelligence is not configured." }, { status: 503 })
    }

    const result = await lookupVirusTotal(parsed.data.type, parsed.data.value)
    return NextResponse.json({ ok: true, result }, { status: 200 })
  } catch (error) {
    console.error("VirusTotal lookup failed:", error)
    const message = error instanceof Error ? error.message : "VirusTotal lookup failed."
    return NextResponse.json({ ok: false, message }, { status: 502 })
  }
}
