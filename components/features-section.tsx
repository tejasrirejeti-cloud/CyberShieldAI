"use client"

import { motion } from "framer-motion"
import { Shield, Scan, Bug, Bell, Brain, Lock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Threat Detection",
    description: "Advanced machine learning algorithms identify threats in real-time with 99.9% accuracy.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Scan,
    title: "Phishing Detection",
    description: "Intelligent URL and content analysis to protect against sophisticated phishing attacks.",
    color: "text-cyber-cyan",
    bgColor: "bg-cyber-cyan/10",
  },
  {
    icon: Bug,
    title: "Malware Analysis",
    description: "Deep file inspection and behavior analysis to identify known and zero-day malware.",
    color: "text-cyber-red",
    bgColor: "bg-cyber-red/10",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description: "Instant notifications and automated responses when threats are detected.",
    color: "text-cyber-orange",
    bgColor: "bg-cyber-orange/10",
  },
  {
    icon: Shield,
    title: "Behavioral Analysis",
    description: "Monitor user and system behavior patterns to detect anomalies and insider threats.",
    color: "text-cyber-green",
    bgColor: "bg-cyber-green/10",
  },
  {
    icon: Lock,
    title: "Encryption Protection",
    description: "End-to-end encryption and secure data handling for maximum privacy.",
    color: "text-cyber-yellow",
    bgColor: "bg-cyber-yellow/10",
  },
]

export function FeaturesSection() {
  return (
    <section className="relative py-20 px-4" id="features">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Powerful </span>
            <span className="text-primary text-glow-cyan">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Comprehensive cybersecurity powered by cutting-edge AI technology
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              {/* Icon */}
              <motion.div
                className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <feature.icon className={`h-7 w-7 ${feature.color}`} />
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} 
                   style={{ boxShadow: `0 0 40px ${feature.color.replace('text-', 'oklch(0.75 0.18 195 / 0.1)')}` }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
