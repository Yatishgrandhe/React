"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

export default function UsersTable() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [supabase])

  async function fetchUsers() {
    setLoading(true)

    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }

  const handleToggleAdmin = async (user: Profile) => {
    setActionLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_admin: !user.is_admin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Update local state
      setUsers(users.map((u) => (u.id === user.id ? { ...u, is_admin: !u.is_admin } : u)))

      toast({
        title: "User updated",
        description: `${user.full_name || user.email} is ${!user.is_admin ? "now" : "no longer"} an admin.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating the user.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
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
        <CardTitle>Users</CardTitle>
        <CardDescription>Manage user accounts and permissions</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ""} alt={user.full_name || ""} />
                        <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.full_name || "Unnamed User"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>{user.is_admin ? <Badge>Admin</Badge> : <Badge variant="outline">User</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.is_admin}
                          onCheckedChange={() => handleToggleAdmin(user)}
                          disabled={actionLoading}
                        />
                        <span className="text-sm">Admin</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground">User accounts will appear here when created</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
