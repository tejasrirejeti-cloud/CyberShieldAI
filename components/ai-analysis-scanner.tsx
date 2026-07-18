"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Link2, FileText, MessageSquare, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ScanType = "url" | "file" | "message"
type ScanResult = "safe" | "suspicious" | "dangerous" | null

interface ScanResultData {
  status: ScanResult
  confidence: number
  threats: string[]
  details: string
  scanTime: number
}

const analyzeURL = (
  url: string
): { status: ScanResult; threats: string[]; confidence: number } => {
  let status: ScanResult = "safe";
  let threats: string[] = [];
  let confidence = 95;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();

    // Check for IP address instead of domain
    if (/^\d+\.\d+\.\d+\.\d+/.test(hostname)) {
      status = "suspicious";
      threats.push("Direct IP address used instead of domain name");
      confidence = 75;
    }

    // Check suspicious TLDs
    const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".pw", ".xyz"];
    if (suspiciousTLDs.some((tld) => hostname.endsWith(tld))) {
      status = "suspicious";
      threats.push("Known high-risk domain extension detected");
      confidence = Math.min(confidence, 70);
    }

    // Check encoded URLs
    if (/%[0-9a-f]{2}/i.test(url)) {
      status = "suspicious";
      threats.push("URL encoding detected - potential obfuscation attempt");
      confidence = Math.min(confidence, 65);
    }

    // Check typosquatting
    const commonBrands = [
      "apple",
      "google",
      "microsoft",
      "amazon",
      "facebook",
      "paypal",
      "bank",
    ];

    const subdomainMatch = hostname.split(".")[0];

    const matchedBrand = commonBrands.find((brand) =>
      subdomainMatch.includes(brand)
    );

    if (
      matchedBrand &&
      !hostname.includes(`${matchedBrand}.com`)
    ) {
      status = "suspicious";
      threats.push("Potential typosquatting domain detected");
      confidence = Math.min(confidence, 72);
    }

    // Check unusual ports
    if (urlObj.port && !["80", "443", "8080"].includes(urlObj.port)) {
      status = "suspicious";
      threats.push("Non-standard port number detected");
      confidence = Math.min(confidence, 68);
    }

    // Suspicious path keywords
    const pathKeywords = [
      "login",
      "verify",
      "confirm",
      "update",
      "validate",
      "urgent",
      "act-now",
      "claim",
    ];

    if (pathKeywords.some((kw) => pathname.includes(kw))) {
      status = "suspicious";
      threats.push("Suspicious path keywords detected");
      confidence = Math.min(confidence, 70);
    }

    // Sensitive query parameters
    const queryParams = urlObj.search.toLowerCase();
    const dangerousParams = [
      "login",
      "password",
      "card",
      "ssn",
      "api_key",
      "token",
      "secret",
    ];

    if (dangerousParams.some((param) => queryParams.includes(param))) {
      status = "dangerous";
      threats = ["Sensitive data exposed in URL parameters"];
      confidence = 85;
    }

    // Malware keywords
    if (
      ["malware", "trojan", "phish", "ransomware", "worm"].some((kw) =>
        hostname.includes(kw)
      )
    ) {
      status = "dangerous";
      threats.push("Known malicious domain pattern");
      confidence = 88;
    }
  } catch {
    status = "suspicious";
    threats.push("Invalid URL format or malformed URL structure");
    confidence = 60;
  }

  return {
    status,
    threats,
    confidence,
  };
};

const mockScan = async (input: string, type: ScanType): Promise<ScanResultData> => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500))

  let status: ScanResult = "safe"
  let threats: string[] = []
  let confidence = 95 + Math.random() * 5

  if (type === "url") {
    // Use intelligent URL analysis
    const urlAnalysis = analyzeURL(input)
    status = urlAnalysis.status
    threats = urlAnalysis.threats
    confidence = urlAnalysis.confidence + (Math.random() * 3 - 1.5) // Small variance
  } else {
    // For files and messages, use pattern matching
    const suspiciousPatterns = ["login", "password", "verify", "urgent", "click here", "free", "winner", "claim now"]
    const dangerousPatterns = ["malware", "trojan", "phish", "hack", ".exe", "bitcoin", "ransomware", "worm"]

    const lowerInput = input.toLowerCase()
    const hasDangerous = dangerousPatterns.some(p => lowerInput.includes(p))
    const hasSuspicious = suspiciousPatterns.some(p => lowerInput.includes(p))

    if (hasDangerous) {
      status = "dangerous"
      confidence = 85 + Math.random() * 10
      threats = ["Potential malware signature detected", "Known threat pattern identified"]
    } else if (hasSuspicious) {
      status = "suspicious"
      confidence = 70 + Math.random() * 20
      threats = ["Suspicious keywords detected", "Potential social engineering attempt"]
    }
  }

  return {
    status,
    confidence: Math.min(99, Math.max(55, confidence)),
    threats,
    details: status === "safe" 
      ? "No threats detected. The content appears to be safe."
      : status === "suspicious"
      ? "Some suspicious patterns were identified. Exercise caution."
      : "Critical threats detected. Do not proceed with this content.",
    scanTime: 2 + Math.random() * 2,
  }
}

const resultConfig = {
  safe: {
    icon: CheckCircle,
    color: "text-cyber-green",
    bgColor: "bg-cyber-green/10",
    borderColor: "border-cyber-green/30",
    label: "SAFE",
    glow: "shadow-[0_0_30px_oklch(0.65_0.2_145_/_0.3)]",
  },
  suspicious: {
    icon: AlertTriangle,
    color: "text-cyber-orange",
    bgColor: "bg-cyber-orange/10",
    borderColor: "border-cyber-orange/30",
    label: "SUSPICIOUS",
    glow: "shadow-[0_0_30px_oklch(0.65_0.2_55_/_0.3)]",
  },
  dangerous: {
    icon: XCircle,
    color: "text-cyber-red",
    bgColor: "bg-cyber-red/10",
    borderColor: "border-cyber-red/30",
    label: "DANGEROUS",
    glow: "shadow-[0_0_30px_oklch(0.55_0.25_25_/_0.4)]",
  },
}

function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
        <Brain className="absolute inset-0 m-auto h-10 w-10 text-primary" />
      </motion.div>
      <motion.div
        className="mt-6 flex items-center gap-2 text-primary"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="font-mono">AI ANALYZING...</span>
      </motion.div>
      <div className="mt-4 flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-8 bg-primary rounded-full"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ResultDisplay({ result }: { result: ScanResultData }) {
  const config = resultConfig[result.status!]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl p-6 border ${config.borderColor} ${config.bgColor} ${config.glow}`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl ${config.bgColor}`}>
          <Icon className={`h-8 w-8 ${config.color}`} />
        </div>
        <div>
          <span className={`text-2xl font-bold font-mono ${config.color}`}>
            {config.label}
          </span>
          <p className="text-sm text-muted-foreground">
            {result.confidence.toFixed(1)}% confidence
          </p>
        </div>
      </div>

      <p className="text-foreground mb-4">{result.details}</p>

      {result.threats.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-muted-foreground">Detected Issues:</p>
          <ul className="space-y-1">
            {result.threats.map((threat, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <AlertTriangle className={`h-4 w-4 ${config.color}`} />
                {threat}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Scan completed in {result.scanTime.toFixed(2)}s</span>
        <span>Powered by CyberShield AI</span>
      </div>
    </motion.div>
  )
}

export function AIAnalysisScanner() {
  const [activeTab, setActiveTab] = useState<ScanType>("url")
  const [input, setInput] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<ScanResultData | null>(null)

  const handleScan = async () => {
    if (!input.trim()) return

    setIsScanning(true)
    setResult(null)

    try {
      const scanResult = await mockScan(input, activeTab)
      setResult(scanResult)
    } catch (error) {
      console.error("Scan failed:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleReset = () => {
    setInput("")
    setResult(null)
  }

  return (
    <section className="relative py-20 px-4" id="scanner">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">AI Threat </span>
            <span className="text-primary text-glow-cyan">Scanner</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Analyze URLs, files, and messages for potential threats using advanced AI
          </p>
        </motion.div>

        {/* Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ScanType); handleReset(); }}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50">
              <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">URL</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">File Hash</span>
              </TabsTrigger>
              <TabsTrigger value="message" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Message</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {isScanning ? (
                <motion.div
                  key="scanning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ScanningAnimation />
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ResultDisplay result={result} />
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    Scan Another
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TabsContent value="url" className="mt-0">
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter URL to scan (e.g., https://suspicious-site.com)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-secondary/50 border-border/50 h-12 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Our AI will analyze the URL for phishing attempts, malware, and other threats.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="file" className="mt-0">
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter file hash (MD5, SHA-1, or SHA-256)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-secondary/50 border-border/50 h-12 font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Check file hashes against our database of known malware signatures.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="message" className="mt-0">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste suspicious email or message content..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-secondary/50 border-border/50 min-h-[120px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        AI will analyze the text for phishing patterns, social engineering, and scam indicators.
                      </p>
                    </div>
                  </TabsContent>

                  <Button
                    onClick={handleScan}
                    disabled={!input.trim()}
                    className="w-full mt-6 h-12 glow-cyan"
                    size="lg"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Analyze Threat
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Sample Threats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "https://legitimate-site.com",
              "password reset urgent click here",
              "download free malware.exe",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setInput(example)}
                className="px-3 py-1 text-xs font-mono bg-secondary/50 rounded-full hover:bg-secondary transition-colors"
              >
                {example.length > 30 ? example.slice(0, 30) + "..." : example}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
