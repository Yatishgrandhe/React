"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { verifyEmail } from "@/app/actions/auth-actions"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        // Get token from URL
        const token = searchParams.get("token")

        if (!token) {
          setError("Invalid verification link. Missing token.")
          setVerifying(false)
          return
        }

        // Verify the email
        const result = await verifyEmail(token)

        if (!result.success) {
          setError(result.message)
          setVerifying(false)
          return
        }

        setSuccess(true)
        toast({
          title: "Verification successful",
          description: "Your email has been verified. You can now log in.",
        })
      } catch (error: any) {
        setError(error.message || "An error occurred during verification.")
        toast({
          title: "Verification failed",
          description: error.message || "An error occurred during verification.",
          variant: "destructive",
        })
      } finally {
        setVerifying(false)
      }
    }

    verifyUserEmail()
  }, [searchParams, toast, router])

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img
              src="/images/clt-volunteer-central-logo.png"
              alt="CLT Volunteer Central Logo"
              className="h-16 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
          <CardDescription className="text-center">
            {verifying ? "Verifying your email..." : success ? "Your email has been verified" : "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {verifying ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          ) : success ? (
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Verification Successful</p>
              <p className="text-muted-foreground">Your email has been verified. You can now log in to your account.</p>
            </div>
          ) : (
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Verification Failed</p>
              <p className="text-muted-foreground mb-4">{error || "An error occurred during verification."}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild className="w-full">
            <Link href="/auth/login">{success ? "Continue to Login" : "Back to Login"}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
