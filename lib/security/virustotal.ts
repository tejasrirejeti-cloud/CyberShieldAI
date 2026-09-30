import { z } from "zod"

const VIRUSTOTAL_BASE_URL = "https://www.virustotal.com/api/v3"

export type VirusTotalLookupType = "url" | "file"
export type VirusTotalStatus = "dangerous" | "suspicious" | "no_detections" | "not_found"

export interface VirusTotalResult {
  status: VirusTotalStatus
  source: "VirusTotal"
  detectionCount: number
  totalEngines: number
  harmless: number
  suspicious: number
  malicious: number
  undetected: number
  timeout: number
  firstSubmissionDate: string | null
  lastAnalysisDate: string | null
  categories: string[]
  message: string
}

const urlSchema = z.string().trim().url().max(2048)
const hashSchema = z.string().trim().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{40}|[a-f0-9]{64})$/i)

function getApiKey() {
  const key = process.env.VIRUSTOTAL_API_KEY?.trim()
  if (!key) throw new Error("VirusTotal API key is not configured on the server.")
  return key
}

function headers() {
  return {
    accept: "application/json",
    "x-apikey": getApiKey(),
  }
}

function encodeUrlIdentifier(value: string) {
  return Buffer.from(value, "utf8").toString("base64url").replace(/=+$/g, "")
}

function formatDate(timestamp: unknown) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) return null
  return new Date(timestamp * 1000).toISOString()
}

function normalizeReport(data: Record<string, unknown>): VirusTotalResult {
  const attributes = (data.data as { attributes?: Record<string, unknown> } | undefined)?.attributes ?? {}
  const stats = (attributes.last_analysis_stats as Record<string, unknown> | undefined) ?? {}
  const malicious = Number(stats.malicious ?? 0)
  const suspicious = Number(stats.suspicious ?? 0)
  const harmless = Number(stats.harmless ?? 0)
  const undetected = Number(stats.undetected ?? 0)
  const timeout = Number(stats.timeout ?? 0)
  const totalEngines = Object.values(stats).reduce<number>((sum, value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? sum + numeric : sum
}, 0)
  const detectionCount = malicious + suspicious

  const categoryMap = (attributes.categories as Record<string, unknown> | undefined) ?? {}
  const categories = [...new Set(Object.values(categoryMap).filter((value): value is string => typeof value === "string"))].slice(0, 8)

  let status: VirusTotalStatus = "no_detections"
  let message = "VirusTotal returned no malicious or suspicious engine detections for the available report. This is not a guarantee that the target is safe."

  if (malicious > 0) {
    status = "dangerous"
    message = `VirusTotal reports ${malicious} malicious detection${malicious === 1 ? "" : "s"} across ${totalEngines} engine result${totalEngines === 1 ? "" : "s"}.`
  } else if (suspicious > 0) {
    status = "suspicious"
    message = `VirusTotal reports ${suspicious} suspicious detection${suspicious === 1 ? "" : "s"} and no malicious detections in the available report.`
  }

  return {
    status,
    source: "VirusTotal",
    detectionCount,
    totalEngines,
    harmless,
    suspicious,
    malicious,
    undetected,
    timeout,
    firstSubmissionDate: formatDate(attributes.first_submission_date),
    lastAnalysisDate: formatDate(attributes.last_analysis_date),
    categories,
    message,
  }
}

async function getReport(path: string): Promise<VirusTotalResult> {
  const response = await fetch(`${VIRUSTOTAL_BASE_URL}${path}`, {
    method: "GET",
    headers: headers(),
    cache: "no-store",
  })

  if (response.status === 404) {
    return {
      status: "not_found",
      source: "VirusTotal",
      detectionCount: 0,
      totalEngines: 0,
      harmless: 0,
      suspicious: 0,
      malicious: 0,
      undetected: 0,
      timeout: 0,
      firstSubmissionDate: null,
      lastAnalysisDate: null,
      categories: [],
      message: "No existing VirusTotal report was found for this indicator.",
    }
  }

  if (response.status === 401) throw new Error("VirusTotal rejected the API key.")
  if (response.status === 403) throw new Error("VirusTotal denied this API operation for the current account/API tier.")
  if (response.status === 429) throw new Error("VirusTotal rate or daily quota has been reached. Try again later.")
  if (!response.ok) throw new Error(`VirusTotal returned HTTP ${response.status}.`)

  const data = (await response.json()) as Record<string, unknown>
  return normalizeReport(data)
}

export async function lookupVirusTotal(type: VirusTotalLookupType, value: string) {
  if (type === "url") {
    const parsed = urlSchema.parse(value)
    return getReport(`/urls/${encodeUrlIdentifier(parsed)}`)
  }

  const hash = hashSchema.parse(value).toLowerCase()
  return getReport(`/files/${encodeURIComponent(hash)}`)
}
