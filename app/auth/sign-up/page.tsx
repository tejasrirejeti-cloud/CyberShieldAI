"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import { motion } from "framer-motion"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data, error } = await supabase.auth.signUp({
  email: email.trim(),
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/confirm`,
    data: {
      full_name: fullName.trim(),
    },
  },
})

if (error) {
  console.error("SUPABASE SIGNUP ERROR:", error)
  setError(error.message || "Signup failed. Please try again.")
  setLoading(false)
  return
}

if (data.user && !data.session) {
  setSuccess(true)
  setLoading(false)
  return
}

if (data.session) {
  router.replace("/dashboard")
  return
}

setSuccess(true)
setLoading(false)
      /*
       * When email confirmation is enabled, Supabase normally creates
       * the account but does not create an active session.
       *
       * In that case, the user must verify their email before logging in.
       */
      if (data.user && !data.session) {
        setSuccess(true)
        setLoading(false)
        return
      }

      /*
       * If email confirmation is disabled and Supabase gives us a session,
       * the user can proceed directly to the dashboard.
       */
      if (data.session) {
        router.replace("/dashboard")
        return
      }

      /*
       * Defensive fallback: account creation succeeded but there is no
       * session. Treat it as requiring email verification rather than
       * incorrectly sending the user to the dashboard.
       */
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      console.error("UNEXPECTED SIGNUP ERROR:", err)

      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred. Please try again.")
      }

      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 mb-4"
            >
              <div className="relative">
                <Shield className="h-10 w-10 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              </div>

              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                CyberShield AI
              </span>
            </Link>

            <h1 className="text-2xl font-semibold text-foreground">
              Check your email
            </h1>

            <p className="text-muted-foreground mt-2">
              We&apos;ve sent a verification link to:
            </p>

            <p className="text-primary font-medium mt-1 break-all">
              {email}
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-border/50">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-5">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>

              <h2 className="text-lg font-semibold text-foreground">
                Verify your email address
              </h2>

              <p className="text-sm text-muted-foreground mt-3 leading-6">
                Click the verification link in the email we sent you.
                After verification, return here and sign in to your
                CyberShield AI account.
              </p>

              <Link
                href="/auth/login"
                className="w-full mt-6 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all flex items-center justify-center glow-cyan"
              >
                Go to Sign In
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Shield className="h-4 w-4 text-primary" />
            <span>Protected by 256-bit encryption</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-background to-background" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="relative">
              <Shield className="h-10 w-10 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>

            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              CyberShield AI
            </span>
          </Link>

          <h1 className="text-2xl font-semibold text-foreground">
            Create your account
          </h1>

          <p className="text-muted-foreground mt-1">
            Start protecting your digital assets today
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl border border-border/50">
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />

                <p className="text-sm break-words">
                  {error}
                </p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-cyan"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}

              <Link
                href="/auth/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Shield className="h-4 w-4 text-primary" />
          <span>Protected by 256-bit encryption</span>
        </div>
      </motion.div>
    </div>
  )
}