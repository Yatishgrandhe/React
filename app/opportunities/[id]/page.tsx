"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, Clock, MapPin, Users, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const [opportunity, setOpportunity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrationError, setRegistrationError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOpportunity() {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("opportunities")
          .select(`
            *,
            categories(name)
          `)
          .eq("id", params.id)
          .single()

        if (error) {
          console.error("Error fetching opportunity:", error)
          setError("Failed to load opportunity details. Please try again later.")
        } else {
          setOpportunity(data)
        }
      } catch (err) {
        console.error("Exception fetching opportunity:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunity()
  }, [supabase, params.id])

  useEffect(() => {
    async function checkRegistration() {
      if (!user || !opportunity) return

      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("*")
          .eq("profile_id", user.id)
          .eq("opportunity_id", opportunity.id)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 means no rows returned, which is expected if not registered
          console.error("Error checking registration:", error)
        } else {
          setIsRegistered(!!data)
        }
      } catch (err) {
        console.error("Exception checking registration:", err)
      }
    }

    checkRegistration()
  }, [supabase, user, opportunity])

  const handleRegister = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/opportunities/${params.id}`)
      return
    }

    setRegistering(true)
    setRegistrationError(null)

    try {
      // Check if slots are available
      if (opportunity.slots_available !== null && opportunity.slots_filled >= opportunity.slots_available) {
        setRegistrationError("Sorry, all slots for this opportunity have been filled.")
        setRegistering(false)
        return
      }

      // Register for the opportunity
      const { error } = await supabase.from("registrations").insert({
        profile_id: user.id,
        opportunity_id: opportunity.id,
        status: "registered",
      })

      if (error) {
        console.error("Error registering for opportunity:", error)
        setRegistrationError("Failed to register for this opportunity. Please try again later.")
      } else {
        // Update slots_filled
        await supabase
          .from("opportunities")
          .update({ slots_filled: opportunity.slots_filled + 1 })
          .eq("id", opportunity.id)

        setIsRegistered(true)
      }
    } catch (err) {
      console.error("Exception registering for opportunity:", err)
      setRegistrationError("An unexpected error occurred. Please try again later.")
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="aspect-video bg-muted rounded-lg mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button asChild>
            <Link href="/opportunities">Back to Opportunities</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Opportunity Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The opportunity you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/opportunities">Browse Opportunities</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
        <p className="text-muted-foreground">
          {opportunity.categories?.name || "General"} • Posted on {formatDate(opportunity.created_at)}
        </p>
      </div>

      {opportunity.image_url && (
        <div className="mb-8 relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={opportunity.image_url || "/placeholder.svg"}
            alt={opportunity.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(opportunity.start_date)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Hours Required</p>
              <p className="font-medium">{opportunity.hours_required || "Flexible"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{opportunity.location}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <div className="prose max-w-none">
            <p>{opportunity.description}</p>
          </div>
        </div>
        <div>
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="font-medium">
                  {opportunity.slots_available === null
                    ? "Unlimited spots"
                    : `${opportunity.slots_filled || 0} / ${opportunity.slots_available} spots filled`}
                </p>
              </div>

              {registrationError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{registrationError}</AlertDescription>
                </Alert>
              )}

              {isRegistered ? (
                <div className="text-center">
                  <p className="text-green-600 font-medium mb-4">You're registered for this opportunity!</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/dashboard">View in Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleRegister}
                  disabled={
                    registering ||
                    (opportunity.slots_available !== null && opportunity.slots_filled >= opportunity.slots_available)
                  }
                  className="w-full"
                >
                  {registering
                    ? "Registering..."
                    : opportunity.slots_available !== null && opportunity.slots_filled >= opportunity.slots_available
                      ? "No Spots Available"
                      : "Register Now"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/opportunities">Back to Opportunities</Link>
        </Button>
      </div>
    </div>
  )
}
