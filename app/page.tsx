import { AnimatedBackground } from "@/components/animated-background"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ThreatDetectionPanel } from "@/components/threat-detection-panel"
import { AIDashboard } from "@/components/ai-dashboard"
import { AIAnalysisScanner } from "@/components/ai-analysis-scanner"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function CyberShieldPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Live Threat Detection Panel */}
        <ThreatDetectionPanel />
        
        {/* AI Dashboard */}
        <AIDashboard />
        
        {/* AI Analysis Scanner */}
        <AIAnalysisScanner />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* How It Works */}
        <HowItWorks />
        
        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}
