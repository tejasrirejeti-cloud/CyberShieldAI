"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { Bell, FileText, LogOut, ScanLine, Settings, Shield, User, Check, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SecuritySettings } from "@/components/security-settings"

interface Profile { id: string; full_name: string | null; avatar_url: string | null; created_at: string }
interface ScanRow { id: string; scan_type: string; status: string; confidence: number; duration_ms: number; input_preview: string | null; created_at: string }
interface ReportRow { id: string; title: string; summary: string; status: string; created_at: string }
interface NotificationRow { id: string; title: string; message: string; severity: string; read_at: string | null; created_at: string }

export function DashboardContent({ user, profile }: { user: SupabaseUser; profile: Profile | null }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [scans, setScans] = useState<ScanRow[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = async () => {
    const [scanResult, reportResult, notificationResult] = await Promise.all([
      supabase.from("scans").select("id,scan_type,status,confidence,duration_ms,input_preview,created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("reports").select("id,title,summary,status,created_at").eq("status", "generated").order("created_at", { ascending: false }).limit(10),
      supabase.from("notifications").select("id,title,message,severity,read_at,created_at").order("created_at", { ascending: false }).limit(10),
    ])
    const firstError = scanResult.error || reportResult.error || notificationResult.error
    if (firstError) setError("Dashboard data is unavailable. Verify the Phase 2 and Phase 3 Supabase migrations.")
    else {
      setError(null)
      setScans(scanResult.data ?? [])
      setReports(reportResult.data ?? [])
      setNotifications(notificationResult.data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/"); router.refresh() }
  const markRead = async (id: string) => {
    setActionError(null)
    const { error: rpcError } = await supabase.rpc("mark_notification_read", { p_notification_id: id })
    if (rpcError) setActionError("Notification could not be updated.")
    else await load()
  }
  const archiveReport = async (id: string) => {
    setActionError(null)
    const { error: rpcError } = await supabase.rpc("archive_security_report", { p_report_id: id })
    if (rpcError) setActionError("Report could not be archived.")
    else await load()
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const findings = scans.filter((scan) => scan.status !== "safe").length
  const dangerous = scans.filter((scan) => scan.status === "dangerous").length
  const unread = notifications.filter((item) => !item.read_at).length

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 glass-card border-b border-border/50"><div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"><Link href="/" className="flex items-center gap-2"><Shield className="h-8 w-8 text-primary" /><span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">CyberShield AI</span></Link><div className="flex items-center gap-4"><Link href="/dashboard#scanner" className="text-sm text-muted-foreground hover:text-foreground">Scanner</Link><Link href="/dashboard#threats" className="text-sm text-muted-foreground hover:text-foreground">Threats</Link><button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Sign out"><LogOut className="h-5 w-5" /></button></div></div></nav>
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"><div><p className="text-sm text-primary font-mono">SECURE ACCOUNT DASHBOARD</p><h1 className="text-3xl md:text-4xl font-bold mt-1">Welcome, {displayName}</h1><p className="text-muted-foreground mt-2">Security activity is persisted in Supabase and isolated with row-level security.</p></div><div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="h-4 w-4" />{user.email}</div></div>
        {error && <div className="glass-card rounded-xl p-4 mb-6 text-sm text-cyber-orange">{error}</div>}
        {actionError && <div className="glass-card rounded-xl p-4 mb-6 text-sm text-cyber-orange" role="alert">{actionError}</div>}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[{label:"Recorded scans",value:scans.length,icon:ScanLine},{label:"Findings",value:findings,icon:Shield},{label:"Dangerous",value:dangerous,icon:Shield},{label:"Unread alerts",value:unread,icon:Bell}].map((item) => <div key={item.label} className="glass-card rounded-xl p-5"><item.icon className="h-5 w-5 text-primary mb-3"/><div className="text-2xl font-bold font-mono">{loading ? "…" : item.value}</div><div className="text-xs text-muted-foreground mt-1">{item.label}</div></div>)}</div>
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="glass-card rounded-2xl p-6 lg:col-span-2"><div className="flex items-center justify-between mb-5"><h2 className="text-lg font-semibold flex items-center gap-2"><ScanLine className="h-5 w-5 text-primary"/>Recent scans</h2><Link href="/dashboard#scanner" className="text-sm text-primary">Run a scan</Link></div>{scans.length === 0 ? <Empty title="No scans recorded" text="Run the Security Analyzer to create your first persisted scan."/> : <div className="space-y-3">{scans.slice(0,8).map((scan)=><div key={scan.id} className="rounded-xl bg-secondary/30 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium capitalize">{scan.scan_type} · {scan.status}</p><p className="text-xs text-muted-foreground mt-1">{scan.input_preview || "Input not retained"}</p></div><div className="text-right text-xs text-muted-foreground"><p>{scan.confidence}% confidence</p><p>{scan.duration_ms} ms · {new Date(scan.created_at).toLocaleString()}</p></div></div></div>)}</div>}</section>
          <section className="glass-card rounded-2xl p-6"><h2 className="text-lg font-semibold flex items-center gap-2 mb-5"><Bell className="h-5 w-5 text-primary"/>Notifications</h2>{notifications.length===0?<Empty title="No notifications" text="Security alerts appear here when generated by real events."/>:<div className="space-y-3">{notifications.slice(0,6).map((n)=><div key={n.id} className="rounded-lg bg-secondary/30 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground mt-1">{n.message}</p></div>{!n.read_at && <Button variant="ghost" size="icon" onClick={() => void markRead(n.id)} aria-label={`Mark ${n.title} as read`}><Check className="h-4 w-4"/></Button>}</div><p className="text-[11px] text-muted-foreground mt-2">{new Date(n.created_at).toLocaleString()}</p></div>)}</div>}</section>
          <section className="glass-card rounded-2xl p-6 lg:col-span-2"><h2 className="text-lg font-semibold flex items-center gap-2 mb-5"><FileText className="h-5 w-5 text-primary"/>Reports</h2>{reports.length===0?<Empty title="No active reports" text="Reports are generated automatically when a scan is persisted."/>:<div className="space-y-3">{reports.slice(0,6).map((r)=><div key={r.id} className="rounded-lg bg-secondary/30 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-medium">{r.title}</p><p className="text-sm text-muted-foreground mt-1">{r.summary}</p><p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleString()}</p></div><Button variant="ghost" size="icon" onClick={() => void archiveReport(r.id)} aria-label={`Archive ${r.title}`}><Archive className="h-4 w-4"/></Button></div></div>)}</div>}</section>
          <section className="glass-card rounded-2xl p-6"><h2 className="text-lg font-semibold flex items-center gap-2 mb-5"><Settings className="h-5 w-5 text-primary"/>Account</h2><SecuritySettings /></section>
        </div>
      </main>
    </div>
  )
}

function Empty({ title, text }: { title: string; text: string }) { return <div className="min-h-28 flex items-center justify-center text-center text-muted-foreground"><div><p className="font-medium text-foreground">{title}</p><p className="text-sm mt-1">{text}</p></div></div> }
