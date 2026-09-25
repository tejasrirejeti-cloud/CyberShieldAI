"use client"

import { motion } from "framer-motion"
import { Shield, Scan, Bug, Bell, Brain, Lock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Threat Analysis",
    description: "Analyze security inputs using explicit detection rules and verified application data instead of fabricated results.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Scan,
    title: "URL Analysis",
    description: "Inspect URL structure, hostnames, ports, encoding, and suspicious indicators before a target is trusted.",
    color: "text-cyber-cyan",
    bgColor: "bg-cyber-cyan/10",
  },
  {
    icon: Bug,
    title: "Threat Findings",
    description: "Record and display findings only when an actual scan or connected analysis service produces them.",
    color: "text-cyber-red",
    bgColor: "bg-cyber-red/10",
  },
  {
    icon: Bell,
    title: "Security Alerts",
    description: "Provide notifications from real security events and persisted application records.",
    color: "text-cyber-orange",
    bgColor: "bg-cyber-orange/10",
  },
  {
    icon: Shield,
    title: "Threat Monitoring",
    description: "Monitor persisted threat records without generating artificial activity to populate the interface.",
    color: "text-cyber-green",
    bgColor: "bg-cyber-green/10",
  },
  {
    icon: Lock,
    title: "Secure Data Handling",
    description: "Use authenticated access and database-level authorization for user-owned security data.",
    color: "text-cyber-yellow",
    bgColor: "bg-cyber-yellow/10",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-20 px-4" id="features">
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Security </span>
            <span className="text-primary text-glow-cyan">Capabilities</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Production-focused security functionality with no fabricated activity or performance claims.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              <motion.div
                className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
