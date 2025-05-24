"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { withAuth } from "@/lib/auth-utils"
import { Loader2, Camera, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Profile {
  id: string
  full_name?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
  avatar_url?: string | null
  updated_at?: string
}

function ProfilePage() {
  const router = useRouter()
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  // Form field states
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return

      setIsLoading(true)

      try {
        // Fetch profile data from 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          toast({
            title: "Profile Error",
            description: "Could not load your profile data.",
            variant: "destructive",
          })
          return
        }

        if (profileData) {
          setProfile(profileData)
          setFullName(profileData.full_name || "")
          setEmail(profileData.email || user.email || "")
          setPhone(profileData.phone || "")
          setBio(profileData.bio || "")
          setAvatarUrl(profileData.avatar_url || "")
        } else {
          // Profile doesn't exist yet, pre-fill from auth if possible
          setFullName(user.user_metadata?.full_name || "")
          setEmail(user.email || "")
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, user, toast])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)

      // Preview the image locally
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }

  const clearAvatarSelection = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null

    setIsUploadingAvatar(true)
    try {
      const fileExt = avatarFile.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Remove old avatar if it exists and it's not the default
      if (profile?.avatar_url && !profile.avatar_url.includes("placeholder")) {
        try {
          const oldPath = profile.avatar_url.split("/").pop()
          if (oldPath) {
            await supabase.storage.from("avatars").remove([`avatars/${oldPath}`])
          }
        } catch (error) {
          console.error("Error removing old avatar:", error)
          // Continue anyway
        }
      }

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Avatar Upload Failed",
        description: (error as Error).message,
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      let newAvatarPublicUrl = profile?.avatar_url || ""

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar()
        if (uploadedUrl) {
          newAvatarPublicUrl = uploadedUrl
        }
      }

      const profileUpdates = {
        id: user.id,
        full_name: fullName,
        email: email, // Keep email in sync
        phone,
        bio,
        avatar_url: newAvatarPublicUrl,
        updated_at: new Date().toISOString(),
      }

      // Upsert the profile data
      const { data: upsertedData, error: upsertError } = await supabase
        .from("profiles")
        .upsert(profileUpdates)
        .select()
        .single()

      if (upsertError) {
        throw upsertError
      }

      if (upsertedData) {
        setProfile(upsertedData)
        setAvatarUrl(upsertedData.avatar_url || "")
      }
      setAvatarFile(null)
      setAvatarPreview(null)

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Profile</h1>
      <p className="text-muted-foreground mb-8">Manage your personal information and preferences.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details. Email is managed via your authentication provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled className="rounded-md bg-muted/50" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tell us a bit about yourself..."
                  className="rounded-md"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || isUploadingAvatar} className="rounded-md">
                {isSubmitting || isUploadingAvatar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="rounded-lg shadow-md">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Upload or update your avatar.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto rounded-full relative group">
                  <Avatar className="h-32 w-32 cursor-pointer">
                    <AvatarImage
                      src={
                        avatarPreview ||
                        avatarUrl ||
                        `https://placehold.co/128x128/e2e8f0/64748b?text=${getInitials(fullName) || "N/A"}`
                      }
                      alt={fullName || "User Avatar"}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://placehold.co/128x128/e2e8f0/64748b?text=${getInitials(fullName) || "Error"}`
                      }}
                    />
                    <AvatarFallback className="text-3xl">
                      {isUploadingAvatar ? <Loader2 className="h-8 w-8 animate-spin" /> : getInitials(fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                  <DialogDescription>Upload a new profile picture or choose from the options below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-center">
                    <Avatar className="h-40 w-40">
                      <AvatarImage
                        src={
                          avatarPreview ||
                          avatarUrl ||
                          `https://placehold.co/128x128/e2e8f0/64748b?text=${getInitials(fullName) || "N/A"}`
                        }
                        alt={fullName || "User Avatar"}
                      />
                      <AvatarFallback className="text-4xl">{getInitials(fullName)}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload">Upload new image</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="avatar-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="flex-1"
                      />
                      {avatarPreview && (
                        <Button variant="outline" size="icon" onClick={clearAvatarSelection} type="button">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearAvatarSelection()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || isUploadingAvatar}>
                    {isSubmitting || isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="w-full space-y-2">
              <Label htmlFor="avatar" className="block">
                Upload new avatar
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleAvatarChange}
                className="rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground text-center">JPG, PNG, GIF. Max 2MB recommended.</p>
            </div>
            {avatarPreview && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearAvatarSelection} type="button" className="text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Clear selection
                </Button>
              </div>
            )}
            {isUploadingAvatar && <p className="text-sm text-primary">Uploading avatar...</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(ProfilePage)
