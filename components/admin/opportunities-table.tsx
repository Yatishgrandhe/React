"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Opportunity } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function OpportunitiesTable() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetchOpportunities()
  }, [supabase])

  async function fetchOpportunities() {
    setLoading(true)

    const { data, error } = await supabase
      .from("opportunities")
      .select(`
        *,
        categories(name)
      `)
      .order("start_date", { ascending: false })

    if (error) {
      console.error("Error fetching opportunities:", error)
    } else {
      setOpportunities(data || [])
    }

    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase.from("opportunities").delete().eq("id", id)

      if (error) throw error

      setOpportunities(opportunities.filter((opp) => opp.id !== id))

      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the opportunity.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (opportunity: Opportunity) => {
    const now = new Date()
    const startDate = new Date(opportunity.start_date)
    const endDate = new Date(opportunity.end_date)

    if (now > endDate) {
      return <Badge variant="outline">Completed</Badge>
    } else if (now >= startDate) {
      return <Badge variant="default">Active</Badge>
    } else {
      return <Badge variant="secondary">Upcoming</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Opportunities</CardTitle>
          <CardDescription>Manage volunteer opportunities</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Opportunities</CardTitle>
        <CardDescription>Manage volunteer opportunities</CardDescription>
      </CardHeader>
      <CardContent>
        {opportunities.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell className="font-medium">{opportunity.title}</TableCell>
                  <TableCell>{opportunity.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell>{formatDate(opportunity.start_date)}</TableCell>
                  <TableCell>{getStatusBadge(opportunity)}</TableCell>
                  <TableCell>
                    {opportunity.slots_filled || 0} / {opportunity.slots_available || "∞"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/opportunities/${opportunity.id}`}>Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => setDeleteId(opportunity.id)}>
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the opportunity and all associated registrations and
                              volunteer logs.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No opportunities found</h3>
            <p className="text-muted-foreground mb-4">Create your first volunteer opportunity to get started</p>
            <Button asChild>
              <Link href="/admin/opportunities/new">Create Opportunity</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
