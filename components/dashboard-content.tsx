"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  LogOut,
  Bell,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Server,
  Wifi,
  Lock,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

interface DashboardContentProps {
  user: SupabaseUser
  profile: Profile | null
}

// Simulated threat data
const generateThreatData = () => {
  const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"]
  return hours.map((time) => ({
    time,
    threats: Math.floor(Math.random() * 50) + 10,
    blocked: Math.floor(Math.random() * 45) + 5,
  }))
}

const attackTypes = [
  { name: "Phishing", value: 35, color: "#ef4444" },
  { name: "Malware", value: 25, color: "#f97316" },
  { name: "DDoS", value: 20, color: "#eab308" },
  { name: "SQL Injection", value: 12, color: "#22d3ee" },
  { name: "XSS", value: 8, color: "#a855f7" },
]

const recentAlerts = [
  { id: 1, type: "critical", message: "Suspicious login attempt blocked", time: "2 min ago", ip: "192.168.1.105" },
  { id: 2, type: "warning", message: "Unusual outbound traffic detected", time: "15 min ago", ip: "10.0.0.45" },
  { id: 3, type: "info", message: "Security scan completed", time: "1 hour ago", ip: "System" },
  { id: 4, type: "critical", message: "Malware signature detected", time: "2 hours ago", ip: "172.16.0.89" },
  { id: 5, type: "warning", message: "Failed authentication attempts", time: "3 hours ago", ip: "192.168.2.201" },
]

export function DashboardContent({ user, profile }: DashboardContentProps) {
  const [threatData, setThreatData] = useState(generateThreatData())
  const [riskScore, setRiskScore] = useState(24)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [stats, setStats] = useState({
    threatsBlocked: 1247,
    activeMonitors: 12,
    systemUptime: 99.9,
    lastScan: "5 min ago",
  })
  const router = useRouter()
  const supabase = createClient()

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatData(generateThreatData())
      setRiskScore(Math.floor(Math.random() * 30) + 15)
      setStats((prev) => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 5),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                CyberShield AI
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-primary font-medium">
                Dashboard
              </Link>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Threats
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Reports
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{displayName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-lg border border-border/50 py-2 shadow-xl"
                    >
                      <div className="px-4 py-2 border-b border-border/50">
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50"
            >
              <div className="px-4 py-4 space-y-2">
                <Link href="/dashboard" className="block py-2 text-primary font-medium">
                  Dashboard
                </Link>
                <button className="block w-full text-left py-2 text-muted-foreground">Threats</button>
                <button className="block w-full text-left py-2 text-muted-foreground">Reports</button>
                <button className="block w-full text-left py-2 text-muted-foreground">Settings</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            Your security dashboard is actively monitoring your systems.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="h-3 w-3" />
                +12%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.threatsBlocked.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Threats Blocked</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.activeMonitors}</p>
            <p className="text-sm text-muted-foreground">Active Monitors</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Server className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-xs text-muted-foreground">24/7</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.systemUptime}%</p>
            <p className="text-sm text-muted-foreground">System Uptime</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <span className="text-xs text-green-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.lastScan}</p>
            <p className="text-sm text-muted-foreground">Last Scan</p>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 glass-card p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Threat Activity</h2>
                <p className="text-sm text-muted-foreground">Real-time threat monitoring</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  Detected
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  Blocked
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={threatData}>
                  <defs>
                    <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    stroke="#22d3ee"
                    fillOpacity={1}
                    fill="url(#threatGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="blocked"
                    stroke="#4ade80"
                    fillOpacity={1}
                    fill="url(#blockedGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card p-6 rounded-xl border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Risk Score</h2>
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={riskScore < 30 ? "#4ade80" : riskScore < 60 ? "#eab308" : "#ef4444"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(riskScore / 100) * 440} 440`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{riskScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <p className="mt-4 text-lg font-medium text-green-400">Low Risk</p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Your systems are well protected
              </p>
            </div>
          </motion.div>

          {/* Attack Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card p-6 rounded-xl border border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Attack Types</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {attackTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {attackTypes.slice(0, 4).map((type) => (
                <div key={type.name} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-xs text-muted-foreground">{type.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="lg:col-span-2 glass-card p-6 rounded-xl border border-border/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Alerts</h2>
                <p className="text-sm text-muted-foreground">Latest security events</p>
              </div>
              <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      alert.type === "critical"
                        ? "bg-destructive/10"
                        : alert.type === "warning"
                        ? "bg-yellow-500/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {alert.type === "critical" ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : alert.type === "warning" ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">IP: {alert.ip}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Protected Systems */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 glass-card p-6 rounded-xl border border-border/50"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Protected Systems</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Web Server", icon: Globe, status: "protected", ip: "192.168.1.1" },
              { name: "Database", icon: Server, status: "protected", ip: "192.168.1.2" },
              { name: "API Gateway", icon: Wifi, status: "protected", ip: "192.168.1.3" },
              { name: "Auth Service", icon: Lock, status: "monitoring", ip: "192.168.1.4" },
            ].map((system) => (
              <div
                key={system.name}
                className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <system.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{system.name}</p>
                    <p className="text-xs text-muted-foreground">{system.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      system.status === "protected" ? "bg-green-400" : "bg-yellow-400"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground capitalize">{system.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
