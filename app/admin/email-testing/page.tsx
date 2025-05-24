"use client"

import { withAdminAuth } from "@/lib/auth-utils"
import { EmailTester } from "@/components/admin/email-tester"

function EmailTestingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Email Testing</h1>
      <p className="text-muted-foreground mb-8">Test and troubleshoot email delivery for authentication flows.</p>

      <div className="max-w-2xl mx-auto">
        <EmailTester />
      </div>
    </div>
  )
}

export default withAdminAuth(EmailTestingPage)
