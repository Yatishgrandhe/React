"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { VolunteerLog } from "@/lib/types"

export default function VolunteerHoursPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [user, setUser] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalHours, setTotalHours] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  })

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)
    }

    getUser()
  }, [supabase, router])

  useEffect(() => {
    async function fetchLogs() {
      if (!user) return

      setLoading(true)

      const { data, error } = await supabase
        .from("volunteer_logs")
        .select(`
          *,
          opportunities(title, start_date)
        `)
        .eq("profile_id", user.id)
        .order("date_volunteered", { ascending: false })

      if (error) {
        console.error("Error fetching volunteer logs:", error)
      } else {
        setLogs(data || [])

        // Calculate total hours by status
        const hours = {
          approved: 0,
          pending: 0,
          rejected: 0,
        }

        data?.forEach((log: VolunteerLog) => {
          if (log.status === "approved") {
            hours.approved += log.hours_logged
          } else if (log.status === "pending") {
            hours.pending += log.hours_logged
          } else if (log.status === "rejected") {
            hours.rejected += log.hours_logged
          }
        })

        setTotalHours(hours)
      }

      setLoading(false)
    }

    fetchLogs()
  }, [supabase, user])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Approved</Badge>
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Volunteer Hours</h1>
          <p className="text-muted-foreground">Track and manage your volunteer hours</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/dashboard/hours/log">Log New Hours</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.approved}</div>
            <p className="text-xs text-muted-foreground">Total approved volunteer hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.pending}</div>
            <p className="text-xs text-muted-foreground">Hours awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.rejected}</div>
            <p className="text-xs text-muted-foreground">Hours that were not approved</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hour Log History</CardTitle>
          <CardDescription>View all your logged volunteer hours</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.date_volunteered)}</TableCell>
                    <TableCell>{log.opportunities.title}</TableCell>
                    <TableCell>{log.hours_logged}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-right">
                      {log.status === "pending" && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/hours/log?id=${log.id}`}>Edit</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No hours logged yet</h3>
              <p className="text-muted-foreground mb-4">Start logging your volunteer hours to track your impact</p>
              <Button asChild>
                <Link href="/dashboard/hours/log">Log Hours</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
