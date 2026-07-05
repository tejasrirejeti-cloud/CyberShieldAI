"use client"

import { motion } from "framer-motion"
import { Upload, Cpu, Shield, CheckCircle } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: Upload,
    title: "Input Data",
    description: "Submit URLs, files, or messages through our secure interface for analysis.",
    color: "text-cyber-cyan",
    bgColor: "bg-cyber-cyan/10",
    borderColor: "border-cyber-cyan/30",
  },
  {
    step: 2,
    icon: Cpu,
    title: "AI Processing",
    description: "Our advanced AI engine analyzes the data using multiple detection algorithms.",
    color: "text-cyber-yellow",
    bgColor: "bg-cyber-yellow/10",
    borderColor: "border-cyber-yellow/30",
  },
  {
    step: 3,
    icon: Shield,
    title: "Threat Detection",
    description: "Potential threats are identified, classified, and prioritized by severity level.",
    color: "text-cyber-orange",
    bgColor: "bg-cyber-orange/10",
    borderColor: "border-cyber-orange/30",
  },
  {
    step: 4,
    icon: CheckCircle,
    title: "Protection Activated",
    description: "Automatic responses neutralize threats while you receive real-time alerts.",
    color: "text-cyber-green",
    bgColor: "bg-cyber-green/10",
    borderColor: "border-cyber-green/30",
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-20 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">How It </span>
            <span className="text-primary text-glow-cyan">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Four simple steps to complete protection
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-cyber-cyan via-cyber-yellow via-cyber-orange to-cyber-green transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className={`glass-card rounded-2xl p-6 border ${step.borderColor} relative z-10`}>
                  {/* Step Number */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                    className={`absolute -top-4 -right-4 w-10 h-10 rounded-full ${step.bgColor} border-2 ${step.borderColor} flex items-center justify-center font-bold font-mono ${step.color}`}
                  >
                    {step.step}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 rounded-xl ${step.bgColor} flex items-center justify-center mb-4`}
                    whileInView={{
                      scale: [1, 1.1, 1],
                    }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                  >
                    <step.icon className={`h-8 w-8 ${step.color}`} />
                  </motion.div>

                  {/* Content */}
                  <h3 className={`text-xl font-semibold mb-2 ${step.color}`}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile/tablet */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.4 }}
                    className="lg:hidden flex justify-center my-4"
                  >
                    <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Ready to protect your digital assets?
          </p>
          <motion.a
            href="#scanner"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold glow-cyan hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-5 w-5" />
            Try Free Scan
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}
