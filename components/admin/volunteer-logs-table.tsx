"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function VolunteerLogsTable() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [supabase])

  async function fetchLogs() {
    setLoading(true)

    const { data, error } = await supabase
      .from("volunteer_logs")
      .select(`
        *,
        opportunities(title),
        profiles(full_name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching logs:", error)
    } else {
      setLogs(data || [])
    }

    setLoading(false)
  }

  const handleApprove = async (log: any) => {
    setActionLoading(true)

    try {
      const { error } = await supabase
        .from("volunteer_logs")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", log.id)

      if (error) throw error

      // Update local state
      setLogs(logs.map((l) => (l.id === log.id ? { ...l, status: "approved" } : l)))

      toast({
        title: "Hours approved",
        description: "The volunteer hours have been approved.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while approving the hours.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectDialog = (log: any) => {
    setSelectedLog(log)
    setRejectionReason("")
    setDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedLog) return

    setActionLoading(true)

    try {
      const { error } = await supabase
        .from("volunteer_logs")
        .update({
          status: "rejected",
          description: selectedLog.description + "\n\nRejection reason: " + rejectionReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedLog.id)

      if (error) throw error

      // Update local state
      setLogs(
        logs.map((l) =>
          l.id === selectedLog.id
            ? {
                ...l,
                status: "rejected",
                description: l.description + "\n\nRejection reason: " + rejectionReason,
              }
            : l,
        ),
      )

      toast({
        title: "Hours rejected",
        description: "The volunteer hours have been rejected.",
      })

      setDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while rejecting the hours.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

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
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Hours</CardTitle>
          <CardDescription>Approve or reject volunteer hour submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Hours</CardTitle>
          <CardDescription>Approve or reject volunteer hour submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.profiles?.full_name || "Unknown"}</TableCell>
                    <TableCell>{log.opportunities?.title || "Unknown"}</TableCell>
                    <TableCell>{formatDate(log.date_volunteered)}</TableCell>
                    <TableCell>{log.hours_logged}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-right">
                      {log.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(log)}
                            disabled={actionLoading}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openRejectDialog(log)}
                            disabled={actionLoading}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No volunteer logs found</h3>
              <p className="text-muted-foreground">Volunteer hour logs will appear here when submitted</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Volunteer Hours</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting these volunteer hours.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectionReason.trim()}>
              {actionLoading ? "Rejecting..." : "Reject Hours"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
