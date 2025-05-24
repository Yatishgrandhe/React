"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import type { Opportunity, VolunteerLog } from "@/lib/types"

export default function LogHoursPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [existingLog, setExistingLog] = useState<VolunteerLog | null>(null)

  // Form state
  const [opportunityId, setOpportunityId] = useState<string>("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [hours, setHours] = useState<string>("1")
  const [description, setDescription] = useState<string>("")
  const [isEdit, setIsEdit] = useState(false)

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
    async function fetchOpportunities() {
      if (!user) return

      const { data, error } = await supabase.from("opportunities").select("*").order("title")

      if (error) {
        console.error("Error fetching opportunities:", error)
      } else {
        setOpportunities(data || [])
      }
    }

    async function fetchExistingLog() {
      const logId = searchParams.get("id")
      const opportunityParam = searchParams.get("opportunity")

      if (logId) {
        setIsEdit(true)

        const { data, error } = await supabase.from("volunteer_logs").select("*").eq("id", logId).single()

        if (error) {
          console.error("Error fetching log:", error)
          toast({
            title: "Error",
            description: "Could not find the requested log.",
            variant: "destructive",
          })
          router.push("/dashboard/hours")
        } else if (data) {
          setExistingLog(data)
          setOpportunityId(data.opportunity_id.toString())
          setDate(new Date(data.date_volunteered))
          setHours(data.hours_logged.toString())
          setDescription(data.description || "")
        }
      } else if (opportunityParam) {
        setOpportunityId(opportunityParam)
      }

      setLoading(false)
    }

    fetchOpportunities()
    fetchExistingLog()
  }, [supabase, user, searchParams, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !date) return

    setSubmitting(true)

    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const parsedHours = Number.parseFloat(hours)

      if (isNaN(parsedHours) || parsedHours <= 0) {
        throw new Error("Please enter a valid number of hours.")
      }

      if (isEdit && existingLog) {
        // Update existing log
        const { error } = await supabase
          .from("volunteer_logs")
          .update({
            opportunity_id: Number.parseInt(opportunityId),
            date_volunteered: formattedDate,
            hours_logged: parsedHours,
            description,
            status: "pending", // Reset to pending if edited
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingLog.id)

        if (error) throw error

        toast({
          title: "Hours updated",
          description: "Your volunteer hours have been updated and are pending approval.",
        })
      } else {
        // Create new log
        const { error } = await supabase.from("volunteer_logs").insert({
          profile_id: user.id,
          opportunity_id: Number.parseInt(opportunityId),
          date_volunteered: formattedDate,
          hours_logged: parsedHours,
          description,
          status: "pending",
        })

        if (error) throw error

        toast({
          title: "Hours logged",
          description: "Your volunteer hours have been logged and are pending approval.",
        })
      }

      router.push("/dashboard/hours")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while logging hours.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{isEdit ? "Edit Volunteer Hours" : "Log Volunteer Hours"}</h1>
      <p className="text-muted-foreground mb-8">
        {isEdit ? "Update your volunteer hour submission" : "Record the time you've spent volunteering"}
      </p>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Hours" : "Log Hours"}</CardTitle>
            <CardDescription>
              {isEdit ? "Update your volunteer hours for approval" : "Submit your volunteer hours for approval"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opportunity">Volunteer Opportunity</Label>
              <Select value={opportunityId} onValueChange={setOpportunityId} required>
                <SelectTrigger id="opportunity">
                  <SelectValue placeholder="Select an opportunity" />
                </SelectTrigger>
                <SelectContent>
                  {opportunities.map((opportunity) => (
                    <SelectItem key={opportunity.id} value={opportunity.id.toString()}>
                      {opportunity.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date Volunteered</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours Volunteered</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you did during your volunteer time..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/hours")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : isEdit ? "Update Hours" : "Log Hours"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
