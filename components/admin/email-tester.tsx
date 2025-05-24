"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import {
  resendVerificationEmail,
  sendPasswordResetEmailAction,
  sendMagicLinkEmailAction,
} from "@/app/actions/email-actions"

export function EmailTester() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendVerificationEmail = async () => {
    if (!email) return

    setLoading(true)
    setResult(null)

    try {
      const result = await resendVerificationEmail(email)
      setResult(result)
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handleSendPasswordResetEmail = async () => {
    if (!email) return

    setLoading(true)
    setResult(null)

    try {
      const result = await sendPasswordResetEmailAction(email)
      setResult(result)
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  const handleSendMagicLinkEmail = async () => {
    if (!email) return

    setLoading(true)
    setResult(null)

    try {
      const result = await sendMagicLinkEmailAction(email)
      setResult(result)
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Testing Tool</CardTitle>
        <CardDescription>Use this tool to manually send authentication emails for testing purposes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verification">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="reset">Password Reset</TabsTrigger>
            <TabsTrigger value="magic">Magic Link</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <TabsContent value="verification" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Send a verification email to confirm a user's email address.
            </p>
            <Button onClick={handleSendVerificationEmail} disabled={loading || !email} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Email"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="reset" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Send a password reset email to allow a user to reset their password.
            </p>
            <Button onClick={handleSendPasswordResetEmail} disabled={loading || !email} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Password Reset Email"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="magic" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">Send a magic link email to allow passwordless login.</p>
            <Button onClick={handleSendMagicLinkEmail} disabled={loading || !email} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Magic Link Email"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Note: This tool is for testing purposes only. Emails will be sent to real email addresses.
      </CardFooter>
    </Card>
  )
}
