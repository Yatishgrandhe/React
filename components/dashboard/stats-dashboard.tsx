"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase-provider"
import { Users, Calendar, Clock } from "lucide-react"

export function StatsDashboard() {
  const { supabase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    totalVolunteers: 0,
    totalHours: 0,
    upcomingOpportunities: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      try {
        // Get total opportunities
        const { count: totalOpportunities } = await supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })

        // Get active opportunities (current date is between start_date and end_date)
        const { count: activeOpportunities } = await supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .lt("start_date", new Date().toISOString())
          .gt("end_date", new Date().toISOString())

        // Get upcoming opportunities (start_date is in the future)
        const { count: upcomingOpportunities } = await supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .gt("start_date", new Date().toISOString())

        // Get total volunteers (unique users with registrations)
        const { count: totalVolunteers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

        // Get total volunteer hours (sum of hours_required for completed registrations)
        const { data: hoursData } = await supabase.from("volunteer_logs").select("hours")

        const totalHours = hoursData?.reduce((sum, log) => sum + (log.hours || 0), 0) || 0

        setStats({
          totalOpportunities: totalOpportunities || 0,
          activeOpportunities: activeOpportunities || 0,
          totalVolunteers: totalVolunteers || 0,
          totalHours: totalHours,
          upcomingOpportunities: upcomingOpportunities || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
            <CardDescription>All volunteer opportunities</CardDescription>
          </div>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
          <p className="text-xs text-muted-foreground mt-1">{stats.activeOpportunities} currently active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Upcoming Opportunities</CardTitle>
            <CardDescription>Starting in the future</CardDescription>
          </div>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingOpportunities}</div>
          <p className="text-xs text-muted-foreground mt-1">Future volunteer events</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <CardDescription>Registered users</CardDescription>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
          <p className="text-xs text-muted-foreground mt-1">Community members</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
            <CardDescription>Total hours logged</CardDescription>
          </div>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalHours}</div>
          <p className="text-xs text-muted-foreground mt-1">Hours of community service</p>
        </CardContent>
      </Card>
    </div>
  )
}
