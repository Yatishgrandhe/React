"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import type { Opportunity, Category } from "@/lib/types"
import OpportunityCard from "@/components/opportunity-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CalendarIcon, Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OpportunitiesPage() {
  const { supabase } = useSupabase()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase.from("categories").select("*").order("name")

        if (error) {
          console.error("Error fetching categories:", error)
          // Don't show an error for categories, just log it
        } else {
          setCategories(data || [])
        }
      } catch (err) {
        console.error("Exception fetching categories:", err)
      }
    }

    fetchCategories()
  }, [supabase])

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from("opportunities")
          .select(`
            id,
            title,
            description,
            location,
            start_date,
            end_date,
            image_url,
            slots_available,
            slots_filled,
            category_id,
            categories(name)
          `)
          .gt("end_date", new Date().toISOString())
          .order("start_date", { ascending: true })

        // Apply filters
        if (searchQuery) {
          query = query.or(
            `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`,
          )
        }

        if (selectedCategory && selectedCategory !== "all") {
          query = query.eq("category_id", selectedCategory)
        }

        if (selectedDate) {
          const dateStr = format(selectedDate, "yyyy-MM-dd")
          query = query.gte("start_date", `${dateStr}T00:00:00Z`).lte("start_date", `${dateStr}T23:59:59Z`)
        }

        const { data, error } = await query

        if (error) {
          console.error("Error fetching opportunities:", error)
          setError("Failed to load opportunities. Please try again later.")
        } else {
          setOpportunities(data || [])
        }
      } catch (err) {
        console.error("Exception fetching opportunities:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [supabase, searchQuery, selectedCategory, selectedDate])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is already handled by the useEffect
  }

  const handleReset = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedDate(undefined)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Volunteer Opportunities</h1>
        <p className="text-muted-foreground">Find and join volunteer opportunities in your community</p>
      </div>

      <div className="bg-card rounded-lg p-4 mb-8 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search opportunities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-2/3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button type="submit">Search</Button>
          </div>
        </form>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[350px] rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      ) : opportunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No opportunities found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your search filters or check back later</p>
          <Button onClick={handleReset}>Clear Filters</Button>
        </div>
      )}
    </div>
  )
}
