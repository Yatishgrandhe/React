"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Higher-order component for protected routes (requires authentication)
export function withAuth(Component: React.ComponentType) {
  return function AuthProtected(props: any) {
    const { user, loading } = useSupabase()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      if (!loading && !user) {
        router.push("/auth/login")
      }
    }, [user, loading, router])

    // Show loading or nothing while checking authentication
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!user) {
      return null // Will redirect in the useEffect
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )
    }

    return <Component {...props} />
  }
}

// Higher-order component for admin-only routes
export function withAdminAuth(Component: React.ComponentType) {
  return function AdminProtected(props: any) {
    const { user, loading } = useSupabase()
    const router = useRouter()
    const [profile, setProfile] = useState<any>(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { supabase } = useSupabase()

    useEffect(() => {
      if (!loading && !user) {
        router.push("/auth/login")
        return
      }

      async function getProfile() {
        if (!user) return

        setProfileLoading(true)
        try {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          if (error) {
            console.error("Error fetching profile:", error)
            setError("Failed to load your profile. Please try again later.")
            setProfileLoading(false)
            return
          }

          setProfile(data)
          setProfileLoading(false)

          if (data && !data.is_admin) {
            router.push("/dashboard")
          }
        } catch (err) {
          console.error("Exception fetching profile:", err)
          setError("An unexpected error occurred. Please try again later.")
          setProfileLoading(false)
        }
      }

      getProfile()
    }, [user, loading, router, supabase])

    // Show loading or nothing while checking authentication
    if (loading || profileLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (!user) {
      return null // Will redirect in the useEffect
    }

    if (error) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )
    }

    if (!profile?.is_admin) {
      return null // Will redirect in the useEffect
    }

    return <Component {...props} />
  }
}

// Function to ensure a user profile exists
export async function ensureProfile(supabase: any, user: any, userData: any = {}) {
  if (!user) return null

  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if profile doesn't exist
      console.error("Error checking profile:", fetchError)
      return null
    }

    // If profile exists, return it
    if (existingProfile) {
      return existingProfile
    }

    // If profile doesn't exist, create it
    const newProfile = {
      id: user.id,
      email: user.email,
      full_name: userData.full_name || user.user_metadata?.full_name || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_admin: false,
    }

    const { data: createdProfile, error: insertError } = await supabase
      .from("profiles")
      .insert(newProfile)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating profile:", insertError)
      return null
    }

    return createdProfile
  } catch (error) {
    console.error("Error in ensureProfile:", error)
    return null
  }
}
