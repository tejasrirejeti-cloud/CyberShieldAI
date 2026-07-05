"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Shield, Bug, User, Globe, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Threat {
  id: string
  type: "phishing" | "malware" | "intrusion" | "ddos" | "suspicious"
  message: string
  severity: "low" | "medium" | "high"
  timestamp: Date
  source: string
}

const threatTypes = [
  { type: "phishing" as const, messages: [
    "Phishing attack detected from suspicious domain",
    "Credential harvesting attempt blocked",
    "Fake login page identified and quarantined",
  ]},
  { type: "malware" as const, messages: [
    "Malware signature identified in attachment",
    "Trojan detected in downloaded file",
    "Ransomware attempt neutralized",
  ]},
  { type: "intrusion" as const, messages: [
    "Suspicious login attempt from unknown location",
    "Brute force attack detected on authentication",
    "Unauthorized access attempt blocked",
  ]},
  { type: "ddos" as const, messages: [
    "DDoS attack mitigated - traffic filtered",
    "Abnormal traffic spike detected and blocked",
    "Bot network activity neutralized",
  ]},
  { type: "suspicious" as const, messages: [
    "Unusual network activity detected",
    "Potential data exfiltration attempt",
    "Anomalous API call pattern identified",
  ]},
]

const severities: ("low" | "medium" | "high")[] = ["low", "medium", "high"]
const sources = ["192.168.1.xxx", "10.0.0.xxx", "172.16.xxx.xxx", "external-threat.net", "unknown-source"]

function generateThreat(): Threat {
  const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)]
  const message = threatType.messages[Math.floor(Math.random() * threatType.messages.length)]
  const severity = severities[Math.floor(Math.random() * severities.length)]
  const source = sources[Math.floor(Math.random() * sources.length)].replace(/xxx/g, () => 
    Math.floor(Math.random() * 255).toString()
  )

  return {
    id: Math.random().toString(36).substr(2, 9),
    type: threatType.type,
    message,
    severity,
    timestamp: new Date(),
    source,
  }
}

const severityConfig = {
  low: { color: "text-cyber-yellow", bgColor: "bg-cyber-yellow/10", borderColor: "border-cyber-yellow/30", glow: "glow-yellow" },
  medium: { color: "text-cyber-orange", bgColor: "bg-cyber-orange/10", borderColor: "border-cyber-orange/30", glow: "glow-orange" },
  high: { color: "text-cyber-red", bgColor: "bg-cyber-red/10", borderColor: "border-cyber-red/30", glow: "pulse-red" },
}

const typeIcons = {
  phishing: Globe,
  malware: Bug,
  intrusion: User,
  ddos: AlertTriangle,
  suspicious: Shield,
}

export function ThreatDetectionPanel() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [isSimulating, setIsSimulating] = useState(true)

  const addThreat = useCallback(() => {
    const newThreat = generateThreat()
    setThreats(prev => [newThreat, ...prev].slice(0, 10))
  }, [])

  const dismissThreat = useCallback((id: string) => {
    setThreats(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    if (!isSimulating) return

    // Add initial threats
    const initialThreats = Array.from({ length: 3 }, generateThreat)
    setThreats(initialThreats)

    // Add new threats periodically
    const interval = setInterval(() => {
      addThreat()
    }, 3000 + Math.random() * 2000)

    return () => clearInterval(interval)
  }, [isSimulating, addThreat])

  const threatCounts = {
    total: threats.length,
    high: threats.filter(t => t.severity === "high").length,
    medium: threats.filter(t => t.severity === "medium").length,
    low: threats.filter(t => t.severity === "low").length,
  }

  return (
    <section className="relative py-20 px-4" id="threats">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Live </span>
            <span className="text-cyber-red text-glow-red">Threat Detection</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time monitoring and automatic response to cyber threats
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              variant={isSimulating ? "default" : "outline"}
              className={isSimulating ? "glow-cyan" : ""}
            >
              {isSimulating ? "Simulation Active" : "Start Simulation"}
            </Button>
            {isSimulating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-red opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-red" />
                </span>
                <span className="font-mono">MONITORING</span>
              </div>
            )}
          </div>

          {/* Threat Counters */}
          <div className="flex items-center gap-3">
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-cyber-red font-mono text-sm">{threatCounts.high} HIGH</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-cyber-orange font-mono text-sm">{threatCounts.medium} MED</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-cyber-yellow font-mono text-sm">{threatCounts.low} LOW</span>
            </div>
          </div>
        </motion.div>

        {/* Threat Feed */}
        <div className="glass rounded-2xl p-4 md:p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cyber-red" />
              Threat Feed
            </h3>
            <span className="text-sm text-muted-foreground font-mono">
              {threatCounts.total} active alerts
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {threats.map((threat) => {
                const config = severityConfig[threat.severity]
                const Icon = typeIcons[threat.type]

                return (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`relative glass-card rounded-xl p-4 border ${config.borderColor} ${threat.severity === "high" ? config.glow : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                            {threat.severity}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono uppercase">
                            {threat.type}
                          </span>
                        </div>
                        <p className="text-sm md:text-base text-foreground font-medium mb-2">
                          {threat.message}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {threat.source}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {threat.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissThreat(threat.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {threats.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Shield className="h-12 w-12 mb-4 text-cyber-green" />
                <p className="text-lg font-medium text-cyber-green">All Clear</p>
                <p className="text-sm">No active threats detected</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
