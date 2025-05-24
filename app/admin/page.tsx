"use client"

import { withAdminAuth } from "@/lib/auth-utils"
import { StatsDashboard } from "@/components/dashboard/stats-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, Settings, Database } from "lucide-react"

function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Manage volunteer opportunities, users, and site settings.</p>

      <div className="mb-8">
        <StatsDashboard />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Opportunities
            </CardTitle>
            <CardDescription>Manage volunteer opportunities</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/opportunities">View All Opportunities</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/opportunities/new">Create New Opportunity</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>Manage users and volunteers</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/users">View All Users</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/volunteer-logs">View Volunteer Logs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>Configure site settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/categories">Manage Categories</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/email-testing">Email Testing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Database Status
          </CardTitle>
          <CardDescription>Current database tables and records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Opportunities</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Categories</p>
              <p className="text-2xl font-bold">8</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Users</p>
              <p className="text-2xl font-bold">-</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Registrations</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>

          <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/database">View Database Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAdminAuth(AdminDashboardPage)
