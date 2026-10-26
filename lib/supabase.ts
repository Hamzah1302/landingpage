import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://fbncdbcpmwwopdcvqvwl.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibmNkYmNwbXd3b3BkY3ZxdndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5ODMyNTksImV4cCI6MjA3MDU1OTI1OX0.LFDih52THBhXbx6VTgZyvuLkQeqxawjytbuOQNxUONE"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-my-custom-header": "hitopia-cms",
    },
  },
})

export type Job = {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  author: string
  cover_image_url: string
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  company: string | null
  service: string | null
  message: string
  is_read: boolean
  created_at: string
}
