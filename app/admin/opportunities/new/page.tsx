"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import type { Category } from "@/lib/types"

export default function NewOpportunityPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date())
  const [hoursRequired, setHoursRequired] = useState("")
  const [slotsAvailable, setSlotsAvailable] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      // Get profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      if (profileData) {
        setProfile(profileData)

        // Redirect if not admin
        if (!profileData.is_admin) {
          router.push("/dashboard")
        }
      }

      setLoading(false)
    }

    getUser()
  }, [supabase, router])

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) {
        console.error("Error fetching categories:", error)
      } else {
        setCategories(data || [])
      }
    }

    fetchCategories()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !startDate || !endDate) return

    setSubmitting(true)

    try {
      // Validate dates
      if (endDate < startDate) {
        throw new Error("End date must be after start date")
      }

      // Create opportunity
      const { data, error } = await supabase
        .from("opportunities")
        .insert({
          title,
          description,
          location,
          category_id: categoryId ? Number.parseInt(categoryId) : null,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          hours_required: hoursRequired ? Number.parseInt(hoursRequired) : null,
          slots_available: slotsAvailable ? Number.parseInt(slotsAvailable) : null,
          slots_filled: 0,
          image_url: imageUrl || null,
          created_by: user.id,
        })
        .select()

      if (error) throw error

      toast({
        title: "Opportunity created",
        description: "The volunteer opportunity has been created successfully.",
      })

      router.push("/admin")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the opportunity.",
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

  if (!profile?.is_admin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <a href="/admin">← Back to Admin Dashboard</a>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-2">Create Opportunity</h1>
      <p className="text-muted-foreground mb-8">Create a new volunteer opportunity</p>

      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Opportunity Details</CardTitle>
            <CardDescription>Enter the details for the new volunteer opportunity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="start-date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP p") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={startDate ? format(startDate, "HH:mm") : ""}
                        onChange={(e) => {
                          if (startDate && e.target.value) {
                            const [hours, minutes] = e.target.value.split(":")
                            const newDate = new Date(startDate)
                            newDate.setHours(Number.parseInt(hours, 10))
                            newDate.setMinutes(Number.parseInt(minutes, 10))
                            setStartDate(newDate)
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal" id="end-date">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP p") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    <div className="p-3 border-t">
                      <Input
                        type="time"
                        value={endDate ? format(endDate, "HH:mm") : ""}
                        onChange={(e) => {
                          if (endDate && e.target.value) {
                            const [hours, minutes] = e.target.value.split(":")
                            const newDate = new Date(endDate)
                            newDate.setHours(Number.parseInt(hours, 10))
                            newDate.setMinutes(Number.parseInt(minutes, 10))
                            setEndDate(newDate)
                          }
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours-required">Hours Required</Label>
                <Input
                  id="hours-required"
                  type="number"
                  min="0"
                  value={hoursRequired}
                  onChange={(e) => setHoursRequired(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slots-available">Slots Available</Label>
                <Input
                  id="slots-available"
                  type="number"
                  min="1"
                  value={slotsAvailable}
                  onChange={(e) => setSlotsAvailable(e.target.value)}
                  placeholder="Optional (unlimited if blank)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Optional"
              />
              <p className="text-xs text-muted-foreground">Enter a URL for an image to display with this opportunity</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Opportunity"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
