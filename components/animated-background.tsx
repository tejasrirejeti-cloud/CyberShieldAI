"use client"

import { useEffect, useRef } from "react"


interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

interface Connection {
  from: number
  to: number
  opacity: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    const particleCount = 80
    const connectionDistance = 150
    const mouseRadius = 200

    const mouse = { x: -1000, y: -1000 }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        })
      }
    }

    const drawParticle = (particle: Particle, highlight: boolean) => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      const color = highlight ? "0, 255, 255" : "0, 200, 255"
      ctx.fillStyle = `rgba(${color}, ${highlight ? 1 : particle.opacity})`
      ctx.fill()

      if (highlight) {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 255, 255, 0.1)`
        ctx.fill()
      }
    }

    const drawConnection = (p1: Particle, p2: Particle, opacity: number, highlight: boolean) => {
      ctx.beginPath()
      ctx.moveTo(p1.x, p1.y)
      ctx.lineTo(p2.x, p2.y)
      const color = highlight ? `rgba(0, 255, 255, ${opacity * 1.5})` : `rgba(0, 150, 200, ${opacity * 0.5})`
      ctx.strokeStyle = color
      ctx.lineWidth = highlight ? 1.5 : 0.5
      ctx.stroke()
    }

    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Mouse interaction
        const mouseDist = getDistance(particle.x, particle.y, mouse.x, mouse.y)
        const isNearMouse = mouseDist < mouseRadius

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          const dist = getDistance(particle.x, particle.y, other.x, other.y)
          if (dist < connectionDistance) {
            const opacity = 1 - dist / connectionDistance
            const otherMouseDist = getDistance(other.x, other.y, mouse.x, mouse.y)
            const connectionHighlight = isNearMouse || otherMouseDist < mouseRadius
            drawConnection(particle, other, opacity, connectionHighlight)
          }
        }

        drawParticle(particle, isNearMouse)
      })

      animationId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <>
      <div className="fixed inset-0 cyber-grid pointer-events-none" />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
    </>
  )
}
