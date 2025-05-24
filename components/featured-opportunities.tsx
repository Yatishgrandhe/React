"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import type { Opportunity } from "@/lib/types"
import OpportunityCard from "@/components/opportunity-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function FeaturedOpportunities() {
  const { supabase } = useSupabase()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true)
      setError(null)

      try {
        // Use the service role client to bypass RLS for this public component
        const { data, error } = await supabase
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
          .limit(3)

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
  }, [supabase])

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Opportunities</h2>
            <p className="text-muted-foreground">Discover ways to make an impact in your community</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/opportunities">View All Opportunities</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[350px] rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">Oops! Something went wrong</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No opportunities available</h3>
            <p className="text-muted-foreground mb-6">Check back soon for new volunteer opportunities</p>
            <Button asChild>
              <Link href="/auth/signup">Sign Up for Notifications</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
