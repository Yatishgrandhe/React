"use server"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  sendVerificationEmail,
  sendMagicLinkEmail as sendCustomMagicLinkEmail,
  sendPasswordResetEmail as sendCustomPasswordResetEmail,
  verifyEmailToken,
} from "@/lib/email-service"
import { ensureProfile } from "@/lib/auth-utils"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function signUp(email: string, password: string, fullName: string) {
  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // We'll handle email verification ourselves
      user_metadata: {
        full_name: fullName,
      },
    })

    if (authError) {
      return { success: false, message: authError.message }
    }

    // Create a profile for the user
    if (authData.user) {
      await ensureProfile(supabaseAdmin, authData.user, { full_name: fullName })
    }

    // Send custom verification email
    const { success, error } = await sendVerificationEmail(email, fullName)

    if (!success) {
      return { success: false, message: error || "Failed to send verification email" }
    }

    return { success: true, message: "Verification email sent successfully" }
  } catch (error: any) {
    console.error("Error in signUp:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function verifyEmail(token: string) {
  try {
    // Verify the token
    const decoded = await verifyEmailToken(token)

    if (!decoded || decoded.type !== "signup") {
      return { success: false, message: "Invalid or expired verification link" }
    }

    // Update the user's email_confirmed status
    const { error } = await supabaseAdmin.auth.admin.updateUserById(decoded.email, { email_confirm: true })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: "Email verified successfully" }
  } catch (error: any) {
    console.error("Error verifying email:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function sendMagicLinkEmail(email: string) {
  try {
    // Check if the user exists
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (userError || !user) {
      return { success: false, message: "User not found" }
    }

    // Send the custom magic link email
    const { success, error } = await sendCustomMagicLinkEmail(email)

    if (!success) {
      return { success: false, message: error || "Failed to send magic link email" }
    }

    return { success: true, message: "Magic link email sent successfully" }
  } catch (error: any) {
    console.error("Error sending magic link email:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    // Check if the user exists
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (userError || !user) {
      return { success: false, message: "User not found" }
    }

    // Send the custom password reset email
    const { success, error } = await sendCustomPasswordResetEmail(email)

    if (!success) {
      return { success: false, message: error || "Failed to send password reset email" }
    }

    return { success: true, message: "Password reset email sent successfully" }
  } catch (error: any) {
    console.error("Error sending password reset email:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // Verify the token
    const decoded = await verifyEmailToken(token)

    if (!decoded || decoded.type !== "reset") {
      return { success: false, message: "Invalid or expired reset link" }
    }

    // Update the user's password
    const { error } = await supabaseAdmin.auth.admin.updateUserById(decoded.email, { password: newPassword })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: "Password reset successfully" }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
