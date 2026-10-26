"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Users,
  Eye,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  LogOut,
  BookOpen,
  FileText,
  CheckCircle,
  Upload,
  Loader2,
  X,
  Mail,
  MailOpen,
  Inbox,
} from "lucide-react"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase, type Job, type Article, type ContactMessage } from "@/lib/supabase"
import { GAEvents } from "@/lib/ga-events"
import dynamic from "next/dynamic"
const RichTextEditor = dynamic(() => import("@/components/rich-text-editor"), { ssr: false })

type Tab = "jobs" | "articles" | "messages"

export default function AdminDashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>("jobs")

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  // Articles state
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(true)
  const [showArticleForm, setShowArticleForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // Messages state
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadJobs()
      loadArticles()
      loadMessages()
    }
  }, [user])

  // --- Jobs CRUD ---
  const loadJobs = async () => {
    try {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error("Error loading jobs:", error)
    } finally {
      setJobsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return
    const job = jobs.find((j) => j.id === jobId)
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId)
      if (error) throw error
      if (job) GAEvents.deleteJobPosting(jobId, job.title)
      setJobs(jobs.filter((j) => j.id !== jobId))
    } catch {
      alert("Failed to delete job. Please try again.")
    }
  }

  const handleToggleJob = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ is_active: !job.is_active, updated_at: new Date().toISOString() })
        .eq("id", jobId)
      if (error) throw error
      if (!job.is_active) GAEvents.publishJobPosting(jobId, job.title, job.department)
      setJobs(jobs.map((j) => (j.id === jobId ? { ...j, is_active: !j.is_active } : j)))
    } catch {
      alert("Failed to update job.")
    }
  }

  const handleSaveJob = async (jobData: Omit<Job, "id" | "created_at" | "updated_at">) => {
    try {
      if (editingJob) {
        const { error } = await supabase
          .from("jobs")
          .update({ ...jobData, updated_at: new Date().toISOString() })
          .eq("id", editingJob.id)
        if (error) throw error
        setJobs(jobs.map((j) => (j.id === editingJob.id ? { ...j, ...jobData } : j)))
      } else {
        const { data, error } = await supabase.from("jobs").insert([jobData]).select()
        if (error) throw error
        if (data) setJobs([data[0], ...jobs])
      }
      setShowJobForm(false)
      setEditingJob(null)
    } catch {
      alert("Failed to save job. Please try again.")
    }
  }

  // --- Articles CRUD ---
  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("[v0] loadArticles error:", error.code, error.message, error.details)
        setArticles([])
        return
      }
      setArticles(data || [])
    } catch (error) {
      console.error("[v0] loadArticles exception:", error)
    } finally {
      setArticlesLoading(false)
    }
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return
    const article = articles.find((a) => a.id === articleId)
    try {
      const { error } = await supabase.from("articles").delete().eq("id", articleId)
      if (error) throw error
      if (article) GAEvents.deleteArticle(articleId, article.title)
      setArticles(articles.filter((a) => a.id !== articleId))
    } catch {
      alert("Failed to delete article. Please try again.")
    }
  }

  const handleToggleArticle = async (articleId: string) => {
    const article = articles.find((a) => a.id === articleId)
    if (!article) return
    const newPublished = !article.is_published
    try {
      const { error } = await supabase
        .from("articles")
        .update({
          is_published: newPublished,
          published_at: newPublished ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", articleId)
      if (error) throw error
      if (newPublished) GAEvents.publishArticle(articleId, article.title)
      setArticles(
        articles.map((a) =>
          a.id === articleId
            ? { ...a, is_published: newPublished, published_at: newPublished ? new Date().toISOString() : null }
            : a,
        ),
      )
    } catch (err: any) {
      console.error("[v0] handleToggleArticle error:", err)
      alert(`Failed to update article: ${err?.message || err}`)
    }
  }

  const handleSaveArticle = async (
    articleData: Omit<Article, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      if (editingArticle) {
        const { error } = await supabase
          .from("articles")
          .update({ ...articleData, updated_at: new Date().toISOString() })
          .eq("id", editingArticle.id)
        if (error) throw error
        setArticles(articles.map((a) => (a.id === editingArticle.id ? { ...a, ...articleData } : a)))
      } else {
        const { data, error } = await supabase.from("articles").insert([articleData]).select()
        if (error) throw error
        if (data) setArticles([data[0], ...articles])
      }
      setShowArticleForm(false)
      setEditingArticle(null)
      await loadArticles()
    } catch (err: any) {
      console.error("[v0] handleSaveArticle error:", err)
      alert(`Failed to save article: ${err?.message || err}`)
    }
  }

  // --- Messages CRUD ---
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) {
        console.error("[v0] loadMessages error:", error.message)
        setMessages([])
        return
      }
      setMessages(data || [])
    } catch (err) {
      console.error("[v0] loadMessages exception:", err)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleToggleMessageRead = async (id: string) => {
    const msg = messages.find((m) => m.id === id)
    if (!msg) return
    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: !msg.is_read })
        .eq("id", id)
      if (error) throw error
      setMessages(messages.map((m) => (m.id === id ? { ...m, is_read: !m.is_read } : m)))
    } catch (err: any) {
      alert(`Failed to update message: ${err?.message || err}`)
    }
  }

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return
    try {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id)
      if (error) throw error
      setMessages(messages.filter((m) => m.id !== id))
    } catch (err: any) {
      alert(`Failed to delete message: ${err?.message || err}`)
    }
  }

  // --- Auth guards ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-white flex items-center justify-center p-8">
        <LoginForm />
      </div>
    )
  }

  // --- Sub-forms ---
  if (showJobForm || editingJob) {
    return (
      <JobForm
        job={editingJob}
        onSave={handleSaveJob}
        onCancel={() => { setShowJobForm(false); setEditingJob(null) }}
      />
    )
  }

  if (showArticleForm || editingArticle) {
    return (
      <ArticleForm
        article={editingArticle}
        onSave={handleSaveArticle}
        onCancel={() => { setShowArticleForm(false); setEditingArticle(null) }}
      />
    )
  }

  const activeJobs = jobs.filter((j) => j.is_active)
  const publishedArticles = articles.filter((a) => a.is_published)
  const unreadMessages = messages.filter((m) => !m.is_read)

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold">Hitopia CMS</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View Website
              </Link>
            </Button>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{activeJobs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">of {jobs.length} total</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{publishedArticles.length}</div>
              <p className="text-xs text-muted-foreground mt-1">of {articles.length} total</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Inbox className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{unreadMessages.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-secondary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Items</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length + articles.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Job Openings
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "articles"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Articles
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "messages"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Inbox className="h-4 w-4" />
            Messages
            {unreadMessages.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {unreadMessages.length}
              </span>
            )}
          </button>
        </div>

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <Card className="bg-secondary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Job Openings</CardTitle>
                <Button onClick={() => setShowJobForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No jobs found. Create your first job opening!</p>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <Badge variant={job.is_active ? "default" : "secondary"}>
                              {job.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                            <span>{job.location}</span>
                            <span>{job.department}</span>
                            <span>{job.type}</span>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">{job.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleToggleJob(job.id)}>
                            {job.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingJob(job)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteJob(job.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <Card className="bg-secondary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Contact Messages</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {unreadMessages.length} unread / {messages.length} total
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="mx-auto h-10 w-10 text-primary/40 mb-3" />
                  <p className="text-muted-foreground">No messages yet.</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Submissions from the website contact form will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isExpanded = expandedMessage === msg.id
                    return (
                      <div
                        key={msg.id}
                        className={`border rounded-lg p-4 transition-colors ${
                          msg.is_read ? "border-white/10 bg-background/30" : "border-primary/40 bg-primary/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => setExpandedMessage(isExpanded ? null : msg.id)}
                            className="flex-1 min-w-0 text-left"
                          >
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {!msg.is_read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0" aria-label="Unread" />
                              )}
                              <h3 className="font-semibold">{msg.name}</h3>
                              <a
                                href={`mailto:${msg.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-primary hover:underline"
                              >
                                {msg.email}
                              </a>
                              {msg.service && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                  {msg.service}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-sm ${
                                isExpanded ? "whitespace-pre-wrap text-white/80" : "line-clamp-2 text-muted-foreground"
                              }`}
                            >
                              {msg.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(msg.created_at).toLocaleString("en-US", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>
                          </button>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleMessageRead(msg.id)}
                              title={msg.is_read ? "Mark as unread" : "Mark as read"}
                            >
                              {msg.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteMessage(msg.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <Card className="bg-secondary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Articles</CardTitle>
                <Button onClick={() => setShowArticleForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-10 w-10 text-primary/40 mb-3" />
                  <p className="text-muted-foreground">No articles yet.</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Make sure you have run the articles SQL migration in your Supabase dashboard.
                  </p>
                  <Button className="mt-4" onClick={() => setShowArticleForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Write First Article
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg line-clamp-1">{article.title}</h3>
                            <Badge variant={article.is_published ? "default" : "secondary"}>
                              {article.is_published ? "Published" : "Draft"}
                            </Badge>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                              {article.category}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                            <span>By {article.author}</span>
                            <span>Slug: /{article.slug}</span>
                            {article.published_at && (
                              <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => handleToggleArticle(article.id)}>
                            {article.is_published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingArticle(article)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteArticle(article.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Job Form ────────────────────────────────────────────────────────────────

function JobForm({
  job,
  onSave,
  onCancel,
}: {
  job: Job | null
  onSave: (job: Omit<Job, "id" | "created_at" | "updated_at">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    department: job?.department || "",
    location: job?.location || "",
    type: job?.type || "Full-time",
    description: job?.description || "",
    requirements: job?.requirements?.length ? job.requirements : [""],
    responsibilities: job?.responsibilities?.length ? job.responsibilities : [""],
    benefits: job?.benefits?.length ? job.benefits : [""],
    is_active: job?.is_active ?? true,
  })

  const handleArrayChange = (field: "requirements" | "responsibilities" | "benefits", index: number, value: string) => {
    const arr = [...formData[field]]
    arr[index] = value
    setFormData({ ...formData, [field]: arr })
  }
  const addItem = (field: "requirements" | "responsibilities" | "benefits") =>
    setFormData({ ...formData, [field]: [...formData[field], ""] })
  const removeItem = (field: "requirements" | "responsibilities" | "benefits", index: number) =>
    setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      requirements: formData.requirements.filter((r) => r.trim()),
      responsibilities: formData.responsibilities.filter((r) => r.trim()),
      benefits: formData.benefits.filter((b) => b.trim()),
    })
  }

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold">{job ? "Edit Job" : "Add New Job"}</h1>
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Job Title", key: "title", placeholder: "e.g. Senior Full-Stack Developer" },
                  { label: "Department", key: "department", placeholder: "e.g. Engineering" },
                  { label: "Location", key: "location", placeholder: "e.g. Remote (Global)" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-2">{label} *</label>
                    <input
                      type="text"
                      required
                      value={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                  >
                    {["Full-time", "Part-time", "Contract", "Internship"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                  placeholder="Describe the role..."
                />
              </div>

              {(["requirements", "responsibilities", "benefits"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-2 capitalize">{field}</label>
                  {formData[field].map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                        className="flex-1 p-3 rounded-md bg-background border border-white/10 text-white"
                        placeholder={`Add ${field.slice(0, -1)}...`}
                      />
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(field, idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addItem(field)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add {field.slice(0, -1)}
                  </Button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_active" className="text-sm font-medium">Active (visible on website)</label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">{job ? "Update Job" : "Create Job"}</Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Article Form ─────────────────────────────────────────────────────────────

function ArticleForm({
  article,
  onSave,
  onCancel,
}: {
  article: Article | null
  onSave: (data: Omit<Article, "id" | "created_at" | "updated_at">) => void
  onCancel: () => void
}) {
  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

  const [formData, setFormData] = useState({
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    category: article?.category || "Industry News",
    author: article?.author || "",
    cover_image_url: article?.cover_image_url || "",
    is_published: article?.is_published ?? false,
    published_at: article?.published_at || null,
  })
  const [coverUploading, setCoverUploading] = useState(false)

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug === generateSlug(prev.title) || !prev.slug ? generateSlug(title) : prev.slug,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    onSave({
      ...formData,
      published_at: formData.is_published ? (formData.published_at || now) : null,
    })
  }

  const categories = [
    "Industry News",
    "Talent Acquisition",
    "Remote Work",
    "Career Tips",
    "Company Update",
    "Tech & Innovation",
  ]

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold">{article ? "Edit Article" : "New Article"}</h1>
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                  placeholder="Article title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-3 rounded-md bg-background border border-white/10 text-white font-mono text-sm"
                  placeholder="article-slug-here"
                />
                <p className="text-xs text-muted-foreground mt-1">URL: /articles/{formData.slug || "your-slug"}</p>
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Author *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                    placeholder="Author name..."
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <div className="space-y-3">
                  {/* Preview */}
                  {formData.cover_image_url && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={formData.cover_image_url}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                        title="Remove cover image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {/* Upload button */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary/20 border border-primary/30 text-primary text-sm font-medium cursor-pointer hover:bg-primary/30 transition-colors">
                      {coverUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {coverUploading ? "Uploading..." : "Upload image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        disabled={coverUploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setCoverUploading(true)
                          try {
                            const ext = file.name.split(".").pop()
                            const fileName = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
                            const { data, error } = await supabase.storage
                              .from("article-images")
                              .upload(fileName, file, { cacheControl: "3600", upsert: false })
                            if (error) throw error
                            const { data: urlData } = supabase.storage
                              .from("article-images")
                              .getPublicUrl(data.path)
                            setFormData((prev) => ({ ...prev, cover_image_url: urlData.publicUrl }))
                          } catch (err: any) {
                            alert(`Cover upload failed: ${err?.message || err}`)
                          } finally {
                            setCoverUploading(false)
                            e.target.value = ""
                          }
                        }}
                      />
                    </label>
                    <span className="text-xs text-muted-foreground">or</span>
                    <input
                      type="url"
                      value={formData.cover_image_url}
                      onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                      className="flex-1 p-2 rounded-md bg-background border border-white/10 text-white text-sm"
                      placeholder="Paste image URL..."
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium mb-2">Excerpt *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full p-3 rounded-md bg-background border border-white/10 text-white"
                  placeholder="Short summary shown on the articles list..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(val) => setFormData({ ...formData, content: val })}
                  placeholder="Start writing your article..."
                />
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-2 p-4 rounded-md bg-background border border-white/10">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded h-4 w-4"
                />
                <div>
                  <label htmlFor="is_published" className="text-sm font-medium cursor-pointer">
                    Publish article
                  </label>
                  <p className="text-xs text-muted-foreground">
                    When checked, this article will be visible on the website.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="submit" className="flex-1">
                  {article ? "Update Article" : "Create Article"}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
