export interface Profile {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  bio: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  created_at: string
}

export interface Opportunity {
  id: number
  title: string
  description: string
  location: string
  category_id: number | null
  start_date: string
  end_date: string
  hours_required: number | null
  slots_available: number | null
  slots_filled: number | null
  image_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Registration {
  id: number
  profile_id: string
  opportunity_id: number
  status: string
  created_at: string
  updated_at: string
}

export interface VolunteerLog {
  id: number
  profile_id: string
  opportunity_id: number
  hours_logged: number
  date_volunteered: string
  description: string | null
  status: string
  approved_by: string | null
  created_at: string
  updated_at: string
}

export type EmailTemplate =
  | "signup-verification"
  | "magic-link"
  | "password-reset"
  | "volunteer-confirmation"
  | "confirmation"
  | "reset"
  | "magic-link"
  | "invitation"
