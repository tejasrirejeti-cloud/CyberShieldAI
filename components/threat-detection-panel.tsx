"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Shield, Bug, User, Globe, Clock, CheckCircle2, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface Threat { id: string; severity: "low" | "medium" | "high" | "critical"; title: string; details: string | null; source: string; status: "open" | "resolved" | "dismissed"; created_at: string }

export function ThreatDetectionPanel() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const loadThreats = async () => {
    setLoading(true)
    const { data, error: queryError } = await supabase.from("threats").select("id,severity,title,details,source,status,created_at").eq("status", "open").order("created_at", { ascending: false }).limit(25)
    if (queryError) { setError("Threat data is unavailable. Apply the Phase 2 and Phase 3 migrations."); setThreats([]) }
    else { setError(null); setThreats((data ?? []) as Threat[]) }
    setLoading(false)
  }

  useEffect(() => {
    void loadThreats()
    const channel = supabase.channel("cybershield-threats").on("postgres_changes", { event: "*", schema: "public", table: "threats" }, () => void loadThreats()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: "resolved" | "dismissed") => {
    setActionError(null)
    const { error: rpcError } = await supabase.rpc("update_threat_status", { p_threat_id: id, p_status: status })
    if (rpcError) setActionError("Threat status could not be updated.")
    else await loadThreats()
  }

  const counts = { total: threats.length, high: threats.filter((t) => t.severity === "high" || t.severity === "critical").length, medium: threats.filter((t) => t.severity === "medium").length, low: threats.filter((t) => t.severity === "low").length }

  return (
    <section className="relative py-20 px-4" id="threats"><div className="max-w-6xl mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="text-foreground">Live </span><span className="text-cyber-red text-glow-red">Threat Detection</span></h2><p className="text-muted-foreground text-lg max-w-2xl mx-auto">This feed reads persisted security findings for the signed-in user. No synthetic alerts are generated.</p></motion.div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8"><div className="flex items-center gap-2 text-sm text-muted-foreground"><span className={`relative flex h-2 w-2 rounded-full ${loading ? "bg-cyber-yellow" : "bg-cyber-green"}`} /><span className="font-mono">{loading ? "LOADING REAL EVENTS" : "CONNECTED TO SECURITY DATA"}</span></div><div className="flex items-center gap-3"><div className="glass-card px-3 py-1.5 rounded-lg"><span className="text-cyber-red font-mono text-sm">{counts.high} HIGH</span></div><div className="glass-card px-3 py-1.5 rounded-lg"><span className="text-cyber-orange font-mono text-sm">{counts.medium} MED</span></div><div className="glass-card px-3 py-1.5 rounded-lg"><span className="text-cyber-yellow font-mono text-sm">{counts.low} LOW</span></div></div></div>
      {actionError && <div className="glass-card rounded-xl p-4 mb-4 text-sm text-cyber-orange" role="alert">{actionError}</div>}
      <div className="glass rounded-2xl p-4 md:p-6 min-h-[400px]"><div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-cyber-red" />Threat Feed</h3><span className="text-sm text-muted-foreground font-mono">{counts.total} active alerts</span></div>
        {error ? <div className="flex flex-col items-center justify-center min-h-[320px] text-center text-muted-foreground"><AlertTriangle className="h-12 w-12 mb-4 text-cyber-orange"/><p className="text-lg font-medium text-foreground">Threat feed unavailable</p><p className="text-sm max-w-md mt-2">{error}</p></div> : threats.length === 0 ? <div className="flex flex-col items-center justify-center min-h-[320px] text-center text-muted-foreground"><Shield className="h-12 w-12 mb-4 text-cyber-green"/><p className="text-lg font-medium text-cyber-green">No active threats</p><p className="text-sm max-w-md mt-2">No open threat records are currently stored for this account.</p></div> : <div className="space-y-3">{threats.map((threat)=><div key={threat.id} className="rounded-xl border border-border/50 bg-secondary/20 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium text-foreground">{threat.title}</p><p className="text-sm text-muted-foreground mt-1">{threat.details || "No additional details recorded."}</p></div><span className="font-mono text-xs uppercase">{threat.severity}</span></div><div className="flex flex-wrap items-center justify-between gap-3 mt-3"><div className="flex items-center gap-3 text-xs text-muted-foreground"><span>{threat.source}</span><span>•</span><span>{new Date(threat.created_at).toLocaleString()}</span></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => void updateStatus(threat.id, "resolved")}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5"/>Resolve</Button><Button variant="ghost" size="sm" onClick={() => void updateStatus(threat.id, "dismissed")}><XCircle className="h-3.5 w-3.5 mr-1.5"/>Dismiss</Button></div></div></div>)}</div>}
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground"><div className="glass-card rounded-xl p-4 flex gap-3"><Globe className="h-5 w-5 text-primary shrink-0"/><span>Sources are recorded with each persisted finding.</span></div><div className="glass-card rounded-xl p-4 flex gap-3"><Bug className="h-5 w-5 text-cyber-red shrink-0"/><span>Findings are created only when an analysis produces indicators.</span></div><div className="glass-card rounded-xl p-4 flex gap-3"><User className="h-5 w-5 text-cyber-orange shrink-0"/><span>Row-level security keeps each user’s threat data isolated.</span></div></div><div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3"/>Timestamps come from the database.</div>
    </div></section>
  )
}
