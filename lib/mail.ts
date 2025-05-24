"use server"

import nodemailer from "nodemailer"

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "465"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "cltvolunteercentral@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "tooj vgav ejuo gqwg",
  },
  // If in development or testing, use a test account
  ...(process.env.NODE_ENV !== "production" && {
    // This will log the email to the console instead of sending it
    // when in development mode
    debug: true,
    logger: true,
  }),
})

// Export the transporter
export default transporter
