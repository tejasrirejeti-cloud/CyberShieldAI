"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Save, Settings2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface UserSettings {
  email_notifications: boolean
  threat_notifications: boolean
  reduced_motion: boolean
}

const defaults: UserSettings = {
  email_notifications: true,
  threat_notifications: true,
  reduced_motion: false,
}

export function SecuritySettings() {
  const supabase = useMemo(() => createClient(), [])
  const [settings, setSettings] = useState<UserSettings>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data, error } = await supabase.rpc("ensure_user_settings")
      if (!active) return
      if (error) {
        setMessage("Settings could not be loaded. Apply the Phase 2 and Phase 3 migrations.")
      } else if (data) {
        setSettings({
          email_notifications: data.email_notifications,
          threat_notifications: data.threat_notifications,
          reduced_motion: data.reduced_motion,
        })
      }
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [supabase])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.rpc("update_security_settings", {
      p_email_notifications: settings.email_notifications,
      p_threat_notifications: settings.threat_notifications,
      p_reduced_motion: settings.reduced_motion,
    })
    setSaving(false)
    setMessage(error ? "Settings could not be saved." : "Settings saved.")
  }

  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading security settings…</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /><h3 className="font-semibold">Security controls</h3></div>
      <div className="space-y-3">
        <SettingRow title="Email notifications" description="Allow account security notifications to be sent by configured backend services." checked={settings.email_notifications} onCheckedChange={(checked) => setSettings((current) => ({ ...current, email_notifications: checked }))} />
        <SettingRow title="Threat notifications" description="Create in-app alerts when a scan is recorded as suspicious or dangerous." checked={settings.threat_notifications} onCheckedChange={(checked) => setSettings((current) => ({ ...current, threat_notifications: checked }))} />
        <SettingRow title="Reduced motion" description="Reduce optional interface animations on this account." checked={settings.reduced_motion} onCheckedChange={(checked) => setSettings((current) => ({ ...current, reduced_motion: checked }))} />
      </div>
      <Button onClick={save} disabled={saving} className="w-full sm:w-auto"><Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : "Save settings"}</Button>
      {message && <p className="text-sm text-muted-foreground" role="status">{message}</p>}
    </div>
  )
}

function SettingRow({ title, description, checked, onCheckedChange }: { title: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl bg-secondary/30 p-4"><div><p className="font-medium text-sm">{title}</p><p className="text-xs text-muted-foreground mt-1 max-w-xl">{description}</p></div><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} /></div>
}
