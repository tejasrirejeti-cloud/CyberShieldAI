"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Shield, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Generate mock data for charts
function generateTimelineData() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    threats: Math.floor(Math.random() * 50) + 10,
    blocked: Math.floor(Math.random() * 45) + 5,
    traffic: Math.floor(Math.random() * 1000) + 500,
  }))
}

const attackTypeData = [
  { name: "Phishing", value: 35, color: "oklch(0.75 0.18 195)" },
  { name: "Malware", value: 25, color: "oklch(0.55 0.25 25)" },
  { name: "DDoS", value: 20, color: "oklch(0.65 0.2 55)" },
  { name: "Intrusion", value: 15, color: "oklch(0.8 0.15 85)" },
  { name: "Other", value: 5, color: "oklch(0.65 0.15 145)" },
]

const activityData = [
  { time: "Now", event: "Malware blocked", severity: "high" },
  { time: "2m ago", event: "Suspicious login detected", severity: "medium" },
  { time: "5m ago", event: "Firewall rule updated", severity: "low" },
  { time: "8m ago", event: "DDoS attempt mitigated", severity: "high" },
  { time: "12m ago", event: "Certificate renewed", severity: "low" },
  { time: "15m ago", event: "Phishing email blocked", severity: "medium" },
]

function RiskScoreMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score < 30) return "text-cyber-green"
    if (score < 60) return "text-cyber-yellow"
    if (score < 80) return "text-cyber-orange"
    return "text-cyber-red"
  }

  const getLabel = () => {
    if (score < 30) return "LOW RISK"
    if (score < 60) return "MODERATE"
    if (score < 80) return "ELEVATED"
    return "CRITICAL"
  }

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="oklch(0.25 0.03 250)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={getColor()}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-3xl font-bold font-mono ${getColor()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-mono mt-2 ${getColor()}`}>{getLabel()}</span>
    </div>
  )
}

export function AIDashboard() {
  const [riskScore, setRiskScore] = useState(42)
  const [timelineData, setTimelineData] = useState(generateTimelineData)
  const [stats, setStats] = useState({
    threatsDetected: 1247,
    attacksBlocked: 1189,
    activeConnections: 3842,
    avgResponseTime: 8,
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)))
      setStats(prev => ({
        threatsDetected: prev.threatsDetected + Math.floor(Math.random() * 3),
        attacksBlocked: prev.attacksBlocked + Math.floor(Math.random() * 3),
        activeConnections: Math.max(3000, prev.activeConnections + Math.floor((Math.random() - 0.5) * 100)),
        avgResponseTime: Math.max(5, Math.min(15, prev.avgResponseTime + (Math.random() - 0.5) * 2)),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimelineData(generateTimelineData())
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-20 px-4" id="dashboard">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">AI Security </span>
            <span className="text-primary text-glow-cyan">Dashboard</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real-time analytics and threat intelligence at your fingertips
          </p>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Score
            </h3>
            <RiskScoreMeter score={Math.round(riskScore)} />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              System Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Threats Detected", value: stats.threatsDetected.toLocaleString(), icon: AlertTriangle, color: "text-cyber-red" },
                { label: "Attacks Blocked", value: stats.attacksBlocked.toLocaleString(), icon: Shield, color: "text-cyber-green" },
                { label: "Active Connections", value: stats.activeConnections.toLocaleString(), icon: TrendingUp, color: "text-primary" },
                { label: "Avg Response", value: `${stats.avgResponseTime.toFixed(1)}ms`, icon: Clock, color: "text-cyber-yellow" },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary/30">
                  <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
                  <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Threat Frequency Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6 lg:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-4">Threat Frequency (24h)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.25 25)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.55 0.25 25)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.75 0.18 195)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 250)" />
                  <XAxis dataKey="time" stroke="oklch(0.5 0.02 250)" fontSize={10} />
                  <YAxis stroke="oklch(0.5 0.02 250)" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.02 250)",
                      border: "1px solid oklch(0.25 0.03 250)",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="threats"
                    stroke="oklch(0.55 0.25 25)"
                    fillOpacity={1}
                    fill="url(#colorThreats)"
                    name="Detected"
                  />
                  <Area
                    type="monotone"
                    dataKey="blocked"
                    stroke="oklch(0.75 0.18 195)"
                    fillOpacity={1}
                    fill="url(#colorBlocked)"
                    name="Blocked"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Attack Types Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Attack Types</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attackTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {attackTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.12 0.02 250)",
                      border: "1px solid oklch(0.25 0.03 250)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6 lg:col-span-3"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Activity Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activityData.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.severity === "high"
                        ? "bg-cyber-red"
                        : activity.severity === "medium"
                        ? "bg-cyber-orange"
                        : "bg-cyber-green"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.event}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
