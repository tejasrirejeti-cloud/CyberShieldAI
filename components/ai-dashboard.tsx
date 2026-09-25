"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Activity, Shield, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

function RiskScoreMeter({ score }: { score: number | null }) {
  const hasScore = typeof score === "number"
  const safeScore = hasScore ? Math.max(0, Math.min(100, score)) : 0
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (safeScore / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(0.25 0.03 250)" strokeWidth="8" />
          {hasScore && (
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={safeScore < 30 ? "text-cyber-green" : safeScore < 60 ? "text-cyber-yellow" : safeScore < 80 ? "text-cyber-orange" : "text-cyber-red"}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2 }}
              style={{ strokeDasharray: circumference }}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-mono">{hasScore ? safeScore : "—"}</span>
          <span className="text-xs text-muted-foreground">{hasScore ? "/ 100" : "No data"}</span>
        </div>
      </div>
      <span className="text-sm font-mono mt-2 text-muted-foreground">
        {hasScore ? "CALCULATED" : "AWAITING DATA"}
      </span>
    </div>
  )
}

export function AIDashboard() {
  const [rows, setRows] = useState<Array<{ created_at: string; status: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data, error: queryError } = await supabase
        .from("scans")
        .select("created_at,status")
        .order("created_at", { ascending: true })
        .limit(100)
      if (!active) return
      if (queryError) {
        setError("Analytics are unavailable until the Phase 2 Supabase migration is applied.")
        setRows([])
      } else {
        setError(null)
        setRows(data ?? [])
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [supabase])

  const detected = rows.filter((r) => r.status !== "safe").length
  const blocked = rows.filter((r) => r.status === "dangerous").length
  const timelineData = Object.values(rows.reduce<Record<string, { time: string; threats: number; blocked: number }>>((acc, row) => {
    const date = new Date(row.created_at)
    const key = date.toISOString().slice(0, 13)
    if (!acc[key]) acc[key] = { time: `${date.getHours().toString().padStart(2, "0")}:00`, threats: 0, blocked: 0 }
    if (row.status !== "safe") acc[key].threats += 1
    if (row.status === "dangerous") acc[key].blocked += 1
    return acc
  }, {})).slice(-12)

  const stats = [
    { label: "Threats Detected", value: String(detected), icon: AlertTriangle, color: "text-cyber-red" },
    { label: "Dangerous Results", value: String(blocked), icon: Shield, color: "text-cyber-green" },
    { label: "Recorded Scans", value: String(rows.length), icon: TrendingUp, color: "text-primary" },
    { label: "Data Source", value: loading ? "…" : error ? "—" : "DB", icon: Clock, color: "text-cyber-yellow" },
  ]

  return (
    <section className="relative py-20 px-4" id="dashboard">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4"><span className="text-foreground">Security </span><span className="text-primary text-glow-cyan">Dashboard</span></h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Analytics are calculated from scans recorded for the signed-in account.</p>
        </motion.div>

        {error && <div className="glass-card rounded-xl p-4 mb-6 text-sm text-cyber-orange text-center">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Risk Score</h3>
            <RiskScoreMeter score={null} />
            <p className="text-xs text-muted-foreground text-center mt-4">No composite risk score is shown until a validated scoring model is configured.</p>
          </motion.div>

          <motion.div className="glass-card rounded-2xl p-6 lg:col-span-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Security Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{stats.map((stat) => <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary/30"><stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} /><div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div><div className="text-xs text-muted-foreground mt-1">{stat.label}</div></div>)}</div>
          </motion.div>

          <motion.div className="glass-card rounded-2xl p-6 lg:col-span-2" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-lg font-semibold mb-4">Threat Frequency</h3>
            <div className="h-64">{timelineData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={timelineData}><CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" /><XAxis dataKey="time" stroke="oklch(0.5 0.02 250)" fontSize={10} /><YAxis allowDecimals={false} stroke="oklch(0.5 0.02 250)" fontSize={10} /><Tooltip /><Area type="monotone" dataKey="threats" stroke="oklch(0.55 0.25 25)" fill="none" name="Detected" /><Area type="monotone" dataKey="blocked" stroke="oklch(0.75 0.18 195)" fill="none" name="Dangerous" /></AreaChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-center text-muted-foreground"><div><Activity className="h-10 w-10 mx-auto mb-3 opacity-60" /><p className="font-medium text-foreground">No timeline data</p><p className="text-sm mt-1">Complete a scan to populate this chart.</p></div></div>}</div>
          </motion.div>

          <motion.div className="glass-card rounded-2xl p-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">{rows.slice(-5).reverse().map((row, i) => <div key={`${row.created_at}-${i}`} className="rounded-lg bg-secondary/30 p-3"><div className="flex justify-between gap-2 text-sm"><span className="capitalize">{row.status} scan</span><span className="text-muted-foreground">{new Date(row.created_at).toLocaleTimeString()}</span></div></div>)}{rows.length === 0 && <div className="h-40 flex items-center justify-center text-center text-muted-foreground"><div><Clock className="h-9 w-9 mx-auto mb-3 opacity-60" /><p className="font-medium text-foreground">No recorded activity</p><p className="text-sm mt-1">Real scan events will appear here.</p></div></div>}</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
