"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, AlertTriangle, CheckCircle, XCircle, Loader2, Link2, FileText, MessageSquare, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { validateScanInput } from "@/lib/security/validation"

type ScanType = "url" | "file" | "message"
type ScanResult = "safe" | "suspicious" | "dangerous"
type ExternalStatus = "dangerous" | "suspicious" | "no_detections" | "not_found"

interface VirusTotalResult {
  status: ExternalStatus
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

interface ScanResultData {
  status: ScanResult
  confidence: number
  threats: string[]
  details: string
  scanTime: number
  external: VirusTotalResult | null
}

function analyzeUrl(url: string): Omit<ScanResultData, "scanTime" | "external"> {
  const threats: string[] = []
  let status: ScanResult = "safe"
  let confidence = 95

  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname.toLowerCase()
    const query = parsed.search.toLowerCase()

    if (parsed.protocol !== "https:") {
      status = "suspicious"
      confidence = Math.min(confidence, 70)
      threats.push("The URL does not use HTTPS")
    }

    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      status = "suspicious"
      confidence = Math.min(confidence, 75)
      threats.push("A direct IP address is used instead of a domain name")
    }

    const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".pw"]
    if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
      status = "suspicious"
      confidence = Math.min(confidence, 70)
      threats.push("A high-risk domain extension was detected")
    }

    if (/%[0-9a-f]{2}/i.test(url)) {
      status = "suspicious"
      confidence = Math.min(confidence, 65)
      threats.push("Encoded characters are present in the URL")
    }

    if (parsed.port && !["80", "443"].includes(parsed.port)) {
      status = "suspicious"
      confidence = Math.min(confidence, 68)
      threats.push("A non-standard port is present")
    }

    const pathKeywords = ["login", "verify", "confirm", "update", "validate", "urgent", "act-now", "claim"]
    if (pathKeywords.some((keyword) => pathname.includes(keyword))) {
      status = "suspicious"
      confidence = Math.min(confidence, 70)
      threats.push("The URL path contains a security-sensitive keyword")
    }

    const sensitiveParameters = ["password", "ssn", "api_key", "secret", "token", "card"]
    if (sensitiveParameters.some((keyword) => query.includes(keyword))) {
      status = "dangerous"
      confidence = 85
      threats.push("Sensitive information appears in URL parameters")
    }

    if (["malware", "trojan", "phish", "ransomware", "worm"].some((keyword) => hostname.includes(keyword))) {
      status = "dangerous"
      confidence = 88
      threats.push("The hostname contains a known malicious indicator")
    }
  } catch {
    status = "suspicious"
    confidence = 60
    threats.push("The value is not a valid URL")
  }

  return {
    status,
    confidence,
    threats,
    details:
      status === "safe"
        ? "No matching indicators were found by the local URL checks. This is not a guarantee that the target is safe."
        : status === "suspicious"
          ? "One or more suspicious indicators were found. Treat the target with caution."
          : "High-risk indicators were found. Do not trust the target without further verification.",
  }
}

function analyzeText(input: string, type: Exclude<ScanType, "url">): Omit<ScanResultData, "scanTime" | "external"> {
  const value = input.trim().toLowerCase()
  const threats: string[] = []
  let status: ScanResult = "safe"
  let confidence = 95

  if (type === "file") {
    const isHash = /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i.test(input.trim())
    if (!isHash) {
      return {
        status: "suspicious",
        confidence: 100,
        threats: ["The supplied value is not a valid MD5, SHA-1, or SHA-256 hash"],
        details: "Enter a valid file hash before relying on a file-analysis result.",
      }
    }

    return {
      status: "safe",
      confidence: 100,
      threats: [],
      details: "The hash format is valid. VirusTotal will be queried for an existing public reputation report; no file is uploaded by this scanner.",
    }
  }

  const dangerousPatterns = ["malware", "trojan", "ransomware", "phishing", "credential theft", "password stealer"]
  const suspiciousPatterns = ["urgent", "click here", "verify your account", "claim now", "winner", "gift card", "password reset"]

  if (dangerousPatterns.some((pattern) => value.includes(pattern))) {
    status = "dangerous"
    confidence = 85
    threats.push("Known high-risk security language was detected")
  }

  if (suspiciousPatterns.some((pattern) => value.includes(pattern))) {
    status = status === "dangerous" ? status : "suspicious"
    confidence = Math.min(confidence, 72)
    threats.push("Potential social-engineering language was detected")
  }

  return {
    status,
    confidence,
    threats,
    details:
      status === "safe"
        ? "No matching indicators were found by the local text checks. This is not a guarantee that the content is safe."
        : status === "suspicious"
          ? "Potentially suspicious language was detected. Verify the sender and request independently."
          : "High-risk security language was detected. Treat the content as potentially malicious until verified.",
  }
}

function analyzeInput(input: string, type: ScanType): ScanResultData {
  const started = typeof performance !== "undefined" ? performance.now() : Date.now()
  const analysis = type === "url" ? analyzeUrl(input.trim()) : analyzeText(input, type)
  const ended = typeof performance !== "undefined" ? performance.now() : Date.now()

  return {
    ...analysis,
    scanTime: Math.max(0, (ended - started) / 1000),
    external: null,
  }
}

const resultConfig = {
  safe: { icon: CheckCircle, color: "text-cyber-green", bgColor: "bg-cyber-green/10", borderColor: "border-cyber-green/30", label: "NO MATCHING INDICATORS", glow: "shadow-[0_0_30px_oklch(0.65_0.2_145_/_0.3)]" },
  suspicious: { icon: AlertTriangle, color: "text-cyber-orange", bgColor: "bg-cyber-orange/10", borderColor: "border-cyber-orange/30", label: "SUSPICIOUS", glow: "shadow-[0_0_30px_oklch(0.65_0.2_55_/_0.3)]" },
  dangerous: { icon: XCircle, color: "text-cyber-red", bgColor: "bg-cyber-red/10", borderColor: "border-cyber-red/30", label: "HIGH RISK INDICATORS", glow: "shadow-[0_0_30px_oklch(0.55_0.25_25_/_0.4)]" },
}

function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div className="relative w-24 h-24" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
        <Brain className="absolute inset-0 m-auto h-10 w-10 text-primary" />
      </motion.div>
      <div className="mt-6 flex items-center gap-2 text-primary">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-mono">ANALYZING LOCAL RULES + THREAT INTELLIGENCE...</span>
      </div>
    </div>
  )
}

function ExternalResult({ result }: { result: VirusTotalResult }) {
  const detected = result.detectionCount > 0
  const title = result.status === "dangerous" ? "MALICIOUS DETECTIONS REPORTED" : result.status === "suspicious" ? "SUSPICIOUS DETECTIONS REPORTED" : result.status === "not_found" ? "NO EXISTING REPORT" : "NO MALICIOUS DETECTIONS REPORTED"
  const tone = result.status === "dangerous" ? "text-cyber-red" : result.status === "suspicious" ? "text-cyber-orange" : "text-primary"

  return (
    <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">External Threat Intelligence</p>
          <p className={`text-lg font-bold font-mono ${tone}`}>{title}</p>
        </div>
        <span className="rounded-full border border-primary/20 px-3 py-1 text-xs font-mono text-primary">VirusTotal</span>
      </div>

      <p className="text-sm text-foreground">{result.message}</p>

      {result.totalEngines > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <Metric label="Malicious" value={result.malicious} />
          <Metric label="Suspicious" value={result.suspicious} />
          <Metric label="Harmless" value={result.harmless} />
          <Metric label="Undetected" value={result.undetected} />
        </div>
      )}

      {result.categories.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">Categories: {result.categories.join(", ")}</p>
      )}

      <p className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
        {detected ? "Provider detections are evidence from VirusTotal, not a standalone guarantee of maliciousness." : "A lack of provider detections is not proof that the target is safe."}
      </p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-mono font-semibold">{value}</p>
    </div>
  )
}

function ResultDisplay({ result }: { result: ScanResultData }) {
  const config = resultConfig[result.status]
  const Icon = config.icon

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`rounded-2xl p-6 border ${config.borderColor} ${config.bgColor} ${config.glow}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl ${config.bgColor}`}><Icon className={`h-8 w-8 ${config.color}`} /></div>
        <div>
          <span className={`text-2xl font-bold font-mono ${config.color}`}>{config.label}</span>
          <p className="text-sm text-muted-foreground">Local rule-match confidence: {result.confidence.toFixed(0)}%</p>
        </div>
      </div>

      <p className="text-foreground mb-4">{result.details}</p>

      {result.threats.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Detected Local Indicators:</p>
          <ul className="space-y-1">
            {result.threats.map((threat) => (
              <li key={threat} className="flex items-center gap-2 text-sm"><AlertTriangle className={`h-4 w-4 ${config.color}`} />{threat}</li>
            ))}
          </ul>
        </div>
      )}

      {result.external && <ExternalResult result={result.external} />}

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground gap-4">
        <span>Local analysis completed in {result.scanTime.toFixed(3)}s</span>
        <span>{result.external ? "External provider queried" : "No external provider used"}</span>
      </div>
    </motion.div>
  )
}

async function lookupExternal(type: "url" | "file", value: string): Promise<VirusTotalResult> {
  const response = await fetch("/api/security/virustotal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, value }),
  })
  const payload = await response.json() as { ok?: boolean; result?: VirusTotalResult; message?: string }
  if (!response.ok || !payload.ok || !payload.result) throw new Error(payload.message || "External threat intelligence is unavailable.")
  return payload.result
}

export function AIAnalysisScanner() {
  const [activeTab, setActiveTab] = useState<ScanType>("url")
  const [input, setInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResultData | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const supabase = createClient()

  const handleScan = async () => {
    const validation = validateScanInput(activeTab, input)
    if (!validation.ok) { setResult(null); setSaveError(validation.message); return }

    const normalizedInput = validation.value
    setIsScanning(true)
    setResult(null)
    setSaveError(null)

    try {
      const scanResult = analyzeInput(normalizedInput, activeTab)
      let external: VirusTotalResult | null = null

      if (activeTab === "url" || activeTab === "file") {
        try {
          external = await lookupExternal(activeTab, normalizedInput)
        } catch (error) {
          console.error("VirusTotal lookup unavailable:", error)
          setSaveError(error instanceof Error ? `Local analysis completed. ${error.message}` : "Local analysis completed, but external threat intelligence is unavailable.")
        }
      }

      const finalResult = { ...scanResult, external }
      setResult(finalResult)

      const findings = [
        ...scanResult.threats.map((threat) => ({ title: `Local: ${threat}`, details: scanResult.details })),
        ...(external ? [{ title: `VirusTotal: ${external.status}`, details: external.message }] : []),
      ]

      const inputPreview = activeTab === "message" ? `Message (${normalizedInput.length} characters)` : normalizedInput.slice(0, 240)
      const { error } = await supabase.rpc("record_security_scan", {
        p_scan_type: activeTab,
        p_status: scanResult.status,
        p_confidence: scanResult.confidence,
        p_duration_ms: Math.round(scanResult.scanTime * 1000),
        p_input_preview: inputPreview,
        p_findings: findings,
      })

      if (error) {
        console.error("Could not persist scan:", error)
        setSaveError((current) => current || "The analysis completed, but the result could not be saved. Verify the Phase 2 Supabase migration and environment variables.")
      }
    } catch (error) {
      console.error("Analysis failed:", error)
      setSaveError(error instanceof Error ? error.message : "The analysis could not be completed.")
    } finally {
      setIsScanning(false)
    }
  }

  const handleReset = () => { setInput(""); setResult(null); setSaveError(null) }
  const handleTabChange = (value: string) => { setActiveTab(value as ScanType); handleReset() }

  return (
    <section className="relative py-20 px-4" id="scanner">
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="text-foreground">Security </span><span className="text-primary text-glow-cyan">Analyzer</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Combine deterministic local security checks with real VirusTotal threat-intelligence reports when available. Provider results are shown separately and are never fabricated.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-2xl p-6 md:p-8">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50">
              <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Link2 className="h-4 w-4" /><span className="hidden sm:inline">URL</span></TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><FileText className="h-4 w-4" /><span className="hidden sm:inline">File Hash</span></TabsTrigger>
              <TabsTrigger value="message" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><MessageSquare className="h-4 w-4" /><span className="hidden sm:inline">Message</span></TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ScanningAnimation /></motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ResultDisplay result={result} />
                  {saveError && <p className="mt-3 text-center text-sm text-cyber-orange">{saveError}</p>}
                  <Button onClick={handleReset} variant="outline" className="w-full mt-4">Analyze Another</Button>
                </motion.div>
              ) : (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TabsContent value="url" className="mt-0"><div className="space-y-4"><Input placeholder="Enter a URL to analyze" value={input} onChange={(e) => setInput(e.target.value)} className="bg-secondary/50 border-border/50 h-12 font-mono text-sm" /><p className="text-xs text-muted-foreground">Runs local URL heuristics, then checks the existing VirusTotal URL report through a protected server route.</p></div></TabsContent>
                  <TabsContent value="file" className="mt-0"><div className="space-y-4"><Input placeholder="Enter an MD5, SHA-1, or SHA-256 hash" value={input} onChange={(e) => setInput(e.target.value)} className="bg-secondary/50 border-border/50 h-12 font-mono text-sm" /><p className="text-xs text-muted-foreground">Checks the hash format and queries an existing VirusTotal file report. This scanner does not upload the file.</p></div></TabsContent>
                  <TabsContent value="message" className="mt-0"><div className="space-y-4"><Textarea placeholder="Paste suspicious email or message content" value={input} onChange={(e) => setInput(e.target.value)} className="bg-secondary/50 border-border/50 min-h-[120px] font-mono text-sm" /><p className="text-xs text-muted-foreground">Checks explicit high-risk and social-engineering indicators using deterministic local rules. VirusTotal is not queried for message content.</p></div></TabsContent>
                  <Button onClick={handleScan} disabled={!input.trim()} className="w-full mt-6 h-12 glow-cyan" size="lg"><Search className="mr-2 h-5 w-5" />Analyze Input</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}
