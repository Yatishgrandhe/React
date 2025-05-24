"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CalendarCheck, Clock, ListChecks } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { withAuth } from "@/lib/auth-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function DashboardPage() {
  const { supabase, user } = useSupabase()
  const [profile, setProfile] = useState<any>(null)
  const [upcomingOpportunities, setUpcomingOpportunities] = useState<any[]>([])
  const [pastOpportunities, setPastOpportunities] = useState<any[]>([])
  const [volunteerHours, setVolunteerHours] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function getProfile() {
      if (!user) return

      try {
        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          setError("Failed to load your profile. Please try again later.")
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        console.error("Exception fetching profile:", err)
        setError("An unexpected error occurred. Please try again later.")
      }
    }

    getProfile()
  }, [supabase, user])

  useEffect(() => {
    async function fetchData() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        // Get upcoming opportunities
        const now = new Date().toISOString()
        const { data: upcomingData, error: upcomingError } = await supabase
          .from("registrations")
          .select(`
            *,
            opportunities(
              *,
              categories(name)
            )
          `)
          .eq("profile_id", user.id)
          .gt("opportunities.end_date", now)
          .order("opportunities.start_date", { ascending: true })

        if (upcomingError) {
          console.error("Error fetching upcoming opportunities:", upcomingError)
          setError("Failed to load your upcoming opportunities. Please try again later.")
        } else {
          setUpcomingOpportunities(upcomingData || [])
        }

        // Get past opportunities
        const { data: pastData, error: pastError } = await supabase
          .from("registrations")
          .select(`
            *,
            opportunities(
              *,
              categories(name)
            )
          `)
          .eq("profile_id", user.id)
          .lt("opportunities.end_date", now)
          .order("opportunities.start_date", { ascending: false })

        if (pastError) {
          console.error("Error fetching past opportunities:", pastError)
          // Don't set error for past opportunities, just log it
        } else {
          setPastOpportunities(pastData || [])
        }

        // Get total volunteer hours
        const { data: hoursData, error: hoursError } = await supabase
          .from("volunteer_logs")
          .select("hours_logged")
          .eq("profile_id", user.id)
          .eq("status", "approved")

        if (hoursError) {
          console.error("Error fetching volunteer hours:", hoursError)
          // Don't set error for hours, just log it
        } else {
          const totalHours = hoursData?.reduce((sum, log) => sum + log.hours_logged, 0) || 0
          setVolunteerHours(totalHours)
        }
      } catch (err) {
        console.error("Exception fetching dashboard data:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, user])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome back, {profile?.full_name || "Volunteer"}</p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">Registered volunteer events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastOpportunities.length}</div>
            <p className="text-xs text-muted-foreground">Past volunteer events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteer Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerHours}</div>
            <p className="text-xs text-muted-foreground">Approved volunteer hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {upcomingOpportunities.length > 0 ? (
            <div className="space-y-4">
              {upcomingOpportunities.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(registration.opportunities.start_date)}
                          </span>
                        </div>
                        <h3 className="font-bold">{registration.opportunities.title}</h3>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {registration.opportunities.hours_required || "Flexible"} hours
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/opportunities/${registration.opportunities.id}`}>View Details</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/dashboard/hours/log?opportunity=${registration.opportunities.id}`}>
                            Log Hours
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No upcoming opportunities</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't registered for any upcoming volunteer opportunities yet.
                </p>
                <Button asChild>
                  <Link href="/opportunities">Find Opportunities</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="past">
          {pastOpportunities.length > 0 ? (
            <div className="space-y-4">
              {pastOpportunities.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatDate(registration.opportunities.start_date)}
                          </span>
                        </div>
                        <h3 className="font-bold">{registration.opportunities.title}</h3>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {registration.opportunities.hours_required || "Flexible"} hours
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/opportunities/${registration.opportunities.id}`}>View Details</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link href={`/dashboard/hours/log?opportunity=${registration.opportunities.id}`}>
                            Log Hours
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No past opportunities</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't participated in any volunteer opportunities yet.
                </p>
                <Button asChild>
                  <Link href="/opportunities">Find Opportunities</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default withAuth(DashboardPage)
