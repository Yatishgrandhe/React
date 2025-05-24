"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { EmailTemplate } from "@/lib/types"
import transporter from "@/lib/mail"
import jwt from "jsonwebtoken"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET || ""

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

interface SendEmailProps {
  to: string
  subject: string
  template: EmailTemplate
  data?: Record<string, any>
}

// Instead of reading from the filesystem, we'll use hardcoded templates
const getEmailTemplate = async (templateName: string, data: Record<string, any>) => {
  // Add the website link and current year to the data
  const updatedData = {
    ...data,
    websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://clt-volunteer-central.vercel.app",
    year: new Date().getFullYear(),
  }

  // Basic template rendering function
  const renderTemplate = (template: string, data: Record<string, any>) => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  // Hardcoded email templates
  const templates: Record<string, string> = {
    "signup-verification": `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2A85A0;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #236c82;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eaeaea;
          }
          .note {
            font-size: 13px;
            color: #666;
            margin-top: 30px;
          }
          .social-links {
            text-align: center;
            margin-top: 20px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #2A85A0;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{websiteUrl}}/images/clt-volunteer-central-logo.png" alt="CLT Volunteer Central Logo" class="logo">
          </div>
          <div class="content">
            <h1>Verify Your Email</h1>
            <p>Hello {{name}},</p>
            <p>Thank you for signing up with CLT Volunteer Central! To complete your registration and start making a difference in your community, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="{{verificationLink}}" class="button">Verify Email Address</a>
            </div>
            
            <p>This link will expire in 24 hours. If you did not create an account with CLT Volunteer Central, please ignore this email.</p>
            
            <div class="note">
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <p style="word-break: break-all;">{{verificationLink}}</p>
            </div>
          </div>
          <div class="footer">
            <p>CLT Volunteer Central - Connecting volunteers with opportunities in Charlotte</p>
            <p>© {{year}} CLT Volunteer Central. All rights reserved.</p>
            <div class="social-links">
              <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    "magic-link": `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Magic Link</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2A85A0;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #236c82;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eaeaea;
          }
          .note {
            font-size: 13px;
            color: #666;
            margin-top: 30px;
          }
          .social-links {
            text-align: center;
            margin-top: 20px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #2A85A0;
            text-decoration: none;
          }
          .security-note {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 30px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{websiteUrl}}/images/clt-volunteer-central-logo.png" alt="CLT Volunteer Central Logo" class="logo">
          </div>
          <div class="content">
            <h1>Your Magic Link</h1>
            <p>Hello,</p>
            <p>You requested a magic link to sign in to your CLT Volunteer Central account. Click the button below to securely sign in:</p>
            
            <div style="text-align: center;">
              <a href="{{magicLink}}" class="button">Sign In to Your Account</a>
            </div>
            
            <p>This link will expire in 10 minutes and can only be used once.</p>
            
            <div class="security-note">
              <strong>Security Note:</strong> If you did not request this magic link, please ignore this email. Someone may have entered your email address by mistake.
            </div>
            
            <div class="note">
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <p style="word-break: break-all;">{{magicLink}}</p>
            </div>
          </div>
          <div class="footer">
            <p>CLT Volunteer Central - Connecting volunteers with opportunities in Charlotte</p>
            <p>© {{year}} CLT Volunteer Central. All rights reserved.</p>
            <div class="social-links">
              <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    "password-reset": `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2A85A0;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #236c82;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eaeaea;
          }
          .note {
            font-size: 13px;
            color: #666;
            margin-top: 30px;
          }
          .social-links {
            text-align: center;
            margin-top: 20px;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #2A85A0;
            text-decoration: none;
          }
          .security-note {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 30px;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{websiteUrl}}/images/clt-volunteer-central-logo.png" alt="CLT Volunteer Central Logo" class="logo">
          </div>
          <div class="content">
            <h1>Reset Your Password</h1>
            <p>Hello,</p>
            <p>We received a request to reset your password for your CLT Volunteer Central account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="{{resetLink}}" class="button">Reset Password</a>
            </div>
            
            <p>This link will expire in 1 hour.</p>
            
            <div class="security-note">
              <strong>Security Note:</strong> If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.
            </div>
            
            <div class="note">
              <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
              <p style="word-break: break-all;">{{resetLink}}</p>
            </div>
          </div>
          <div class="footer">
            <p>CLT Volunteer Central - Connecting volunteers with opportunities in Charlotte</p>
            <p>© {{year}} CLT Volunteer Central. All rights reserved.</p>
            <div class="social-links">
              <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">Instagram</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    "volunteer-confirmation": `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Volunteer Registration Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #eaeaea;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .content {
            padding: 30px 20px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2A85A0;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background-color: #236c82;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #eaeaea;
          }
          .details {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .details-item {
            margin-bottom: 10px;
          }
          .details-label {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{websiteUrl}}/images/clt-volunteer-central-logo.png" alt="CLT Volunteer Central Logo" class="logo">
          </div>
          <div class="content">
            <h1>Thank You for Volunteering!</h1>
            <p>Hello {{name}},</p>
            <p>Thank you for registering for the following volunteer opportunity:</p>
            
            <div class="details">
              <div class="details-item">
                <span class="details-label">Opportunity:</span> {{opportunityTitle}}
              </div>
              <div class="details-item">
                <span class="details-label">Date:</span> {{opportunityDate}}
              </div>
              <div class="details-item">
                <span class="details-label">Location:</span> {{opportunityLocation}}
              </div>
            </div>
            
            <p>We're excited to have you join us in making a difference in our community!</p>
            
            <div style="text-align: center;">
              <a href="{{dashboardLink}}" class="button">View in Dashboard</a>
            </div>
            
            <p>If you have any questions or need to make changes to your registration, please visit your dashboard or contact us.</p>
          </div>
          <div class="footer">
            <p>CLT Volunteer Central - Connecting volunteers with opportunities in Charlotte</p>
            <p>© {{year}} CLT Volunteer Central. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  // Get the template or return a simple fallback
  const template = templates[templateName] || `<p>Email content for ${templateName}</p>`

  // Render the template with the data
  return renderTemplate(template, updatedData)
}

export async function sendEmail({ to, subject, template, data = {} }: SendEmailProps) {
  try {
    // Log the email attempt
    await supabaseAdmin.from("email_logs").insert({
      recipient: to,
      template,
      subject,
      data: data,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    let html: string | undefined

    // Get the appropriate template
    html = await getEmailTemplate(template, data)

    if (!html) {
      return { success: false, error: "No email template found" }
    }

    // Send the email using NodeMailer
    const mailOptions = {
      from: `"CLT Volunteer Central" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent:", info.messageId)

    // Update the email log
    await supabaseAdmin
      .from("email_logs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("recipient", to)
      .eq("template", template)

    return { success: true }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error }
  }
}

// Generate a secure token for email verification
export async function generateEmailToken(email: string, type: "signup" | "reset" | "magic-link"): Promise<string> {
  // Set expiration based on token type
  let expiresIn = "24h" // Default for signup
  if (type === "reset") expiresIn = "1h"
  if (type === "magic-link") expiresIn = "10m"

  return jwt.sign({ email, type }, supabaseJwtSecret, { expiresIn })
}

// Verify an email token
export async function verifyEmailToken(token: string): Promise<{ email: string; type: string } | null> {
  try {
    const decoded = jwt.verify(token, supabaseJwtSecret) as { email: string; type: string }
    return decoded
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

// Send custom verification email
export async function sendVerificationEmail(email: string, name = "") {
  try {
    // Generate a verification token
    const token = await generateEmailToken(email, "signup")

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify?token=${token}`

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Verify Your Email - CLT Volunteer Central",
      template: "signup-verification",
      data: {
        name: name || "there", // Default to "there" if no name provided
        verificationLink,
      },
    })

    return result
  } catch (error) {
    console.error("Error sending verification email:", error)
    return { success: false, error }
  }
}

// Send custom magic link email
export async function sendMagicLinkEmail(email: string) {
  try {
    // Generate a magic link token
    const token = await generateEmailToken(email, "magic-link")

    // Create magic link
    const magicLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?token=${token}`

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Your Magic Link - CLT Volunteer Central",
      template: "magic-link",
      data: {
        magicLink,
      },
    })

    return result
  } catch (error) {
    console.error("Error sending magic link email:", error)
    return { success: false, error }
  }
}

// Send custom password reset email
export async function sendPasswordResetEmail(email: string) {
  try {
    // Generate a reset token
    const token = await generateEmailToken(email, "reset")

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "Reset Your Password - CLT Volunteer Central",
      template: "password-reset",
      data: {
        resetLink,
      },
    })

    return result
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { success: false, error }
  }
}

/**
 * Function to manually trigger Supabase auth emails
 * This can be useful for resending verification emails
 * Kept for backward compatibility with existing code
 */
export async function sendAuthEmail(email: string, type: "signup" | "recovery" | "invite" | "magiclink") {
  try {
    let result

    // Map the old types to our new custom email functions
    switch (type) {
      case "signup":
        // Use our new custom verification email
        return await sendVerificationEmail(email)
      case "recovery":
        // Use our new custom password reset email
        return await sendPasswordResetEmail(email)
      case "magiclink":
        // Use our new custom magic link email
        return await sendMagicLinkEmail(email)
      case "invite":
        // For invites, we'll still use the Supabase admin API
        result = await supabaseAdmin.auth.admin.inviteUserByEmail(email)
        if (result.error) throw result.error
        return { success: true }
      default:
        return { success: false, error: "Invalid email type" }
    }
  } catch (error) {
    console.error(`Error sending ${type} email:`, error)
    return { success: false, error }
  }
}
