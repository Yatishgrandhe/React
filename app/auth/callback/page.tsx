"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Loader2, XCircle } from "lucide-react"
import { ensureProfile } from "@/lib/auth-utils"
import { verifyEmailToken } from "@/lib/email-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for token from custom magic link
        const token = searchParams.get("token")

        if (token) {
          // Verify the token
          const decoded = await verifyEmailToken(token)

          if (!decoded || decoded.type !== "magic-link") {
            setError("Invalid or expired magic link")
            setLoading(false)
            return
          }

          // Sign in the user
          const { data, error } = await supabase.auth.signInWithPassword({
            email: decoded.email,
            password: "dummy-password", // This won't be used, just to satisfy the API
          })

          if (error) {
            setError(error.message)
            setLoading(false)
            return
          }

          if (data.user) {
            // Ensure profile exists
            await ensureProfile(supabase, data.user)

            // Redirect to dashboard
            router.push("/dashboard")
          }
        } else {
          // Handle standard Supabase auth callback
          const { error } = await supabase.auth.getSession()

          if (error) {
            setError(error.message)
            setLoading(false)
            return
          }

          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            // Ensure profile exists
            await ensureProfile(supabase, user)

            // Redirect to dashboard
            router.push("/dashboard")
          } else {
            router.push("/auth/login")
          }
        }
      } catch (error: any) {
        console.error("Auth callback error:", error)
        setError(error.message || "Authentication failed")
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [supabase, searchParams, router])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Authenticating...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  )
}
