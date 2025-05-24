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
import { useToast } from "@/components/ui/use-toast"

export default function NewCategoryPage() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setSubmitting(true)

    try {
      // Create category
      const { error } = await supabase.from("categories").insert({
        name,
        description,
      })

      if (error) throw error

      toast({
        title: "Category created",
        description: "The category has been created successfully.",
      })

      router.push("/admin")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating the category.",
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

      <h1 className="text-3xl font-bold mb-2">Create Category</h1>
      <p className="text-muted-foreground mb-8">Create a new category for organizing volunteer opportunities</p>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Enter the details for the new category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Optional"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/admin")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Category"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
