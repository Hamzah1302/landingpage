"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, type Article } from "@/lib/supabase"
import { GAEvents } from "@/lib/ga-events"
import {
  Wifi,
  Briefcase,
  Users,
  BarChart,
  ArrowRight,
  CheckCircle,
  Target,
  Eye,
  MapPin,
  Clock,
  Lightbulb,
  TrendingUp,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Home,
  Info,
  Settings,
  BookOpen,
  Calendar,
  User,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { SectionAnimator } from "@/components/section-animator"
import { calculators } from "@/lib/calculators/registry"
import { NewBadge } from "@/components/calculators/new-badge"

// --- Data for Sections ---

const navItems = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#about", label: "About Us", icon: Info },
  { href: "#services", label: "Services", icon: Settings },
  { href: "#portfolio", label: "Portfolio", icon: Briefcase },
  { href: "#articles", label: "Articles", icon: BookOpen },
  { href: "#careers", label: "Careers", icon: Users },
]

const services = [
  {
    icon: Wifi,
    title: "Remote Hiring",
    description: "Access a global talent pool without geographical constraints.",
    longDescription:
      "Our Remote Hiring service connects you with skilled professionals from around the world. We handle the complexities of sourcing, vetting, and onboarding remote talent, allowing you to build a diverse and high-performing team, regardless of location.",
    benefits: ["Access to a wider talent pool", "Reduced operational costs", "Increased flexibility and scalability"],
  },
  {
    icon: Briefcase,
    title: "Contract Staffing",
    description: "Flexible staffing for project-based needs.",
    longDescription:
      "Hitopia's Contract Staffing service provides businesses with qualified professionals for short-term assignments, specific projects, or seasonal peaks. We ensure quick placements of skilled contractors, enabling you to scale your workforce efficiently.",
    benefits: ["Quickly fill skill gaps", "Manage fluctuating workloads", "Cost-effective for short-term needs"],
  },
  {
    icon: Users,
    title: "Permanent Hiring",
    description: "Find long-term talent to grow your core team.",
    longDescription:
      "Our Permanent Hiring service focuses on finding the right long-term fit for your organization. We employ a rigorous search and selection process to identify candidates who not only possess the required skills but also align with your company culture.",
    benefits: ["Build a strong, stable core team", "Reduce employee turnover", "Ensure cultural fit and alignment"],
  },
  {
    icon: BarChart,
    title: "Managed Solution",
    description: "Comprehensive, outsourced solutions.",
    longDescription:
      "Hitopia's Managed Solutions offer end-to-end management of specific business functions or projects. We take full responsibility for delivering outcomes, managing the team, processes, and technology involved, allowing you to focus on your core business.",
    benefits: [
      "Focus on core business activities",
      "Access to specialized expertise",
      "Improved operational efficiency",
    ],
  },
]

const processSteps = [
  { step: "01", title: "Consultation", description: "Discovering talent needs and project rates." },
  { step: "02", title: "Expert Assessment", description: "Careful selection of qualified project experts." },
  { step: "03", title: "Screening & Interview", description: "Finding the best talent for your project." },
  { step: "04", title: "Offering & Placement", description: "Developing a fair contract for all parties." },
  { step: "05", title: "Project Kickoff", description: "Seamless integration and Day-1 start." },
  { step: "06", title: "Continuous Monitoring", description: "Consistent talent monitoring and support." },
]

const clientLogos = [
  { src: "/images/clients/pertamina.png", alt: "Pertamina", name: "Pertamina" },
  { src: "/images/clients/yamaha.png", alt: "Yamaha", name: "Yamaha" },
  { src: "/images/clients/jasa-raharja.png", alt: "Jasa Raharja", name: "Jasa Raharja" },
  { src: "/images/clients/kimia-farma.png", alt: "Kimia Farma", name: "Kimia Farma" },
  { src: "/images/clients/pegadaian.png", alt: "Pegadaian", name: "Pegadaian" },
  { src: "/images/clients/tiket-com.png", alt: "Tiket.com", name: "Tiket.com" },
  { src: "/images/clients/astra-international.png", alt: "Astra International", name: "Astra International" },
  { src: "/images/clients/toyota-indonesia.png", alt: "Toyota Indonesia", name: "Toyota Indonesia" },
  { src: "/images/clients/3m.png", alt: "3M", name: "3M" },
  { src: "/images/clients/prodia.png", alt: "Prodia", name: "Prodia" },
  { src: "/images/clients/hepytech.png", alt: "HepyTech", name: "HepyTech" },
  { src: "/images/clients/ajaib.png", alt: "Ajaib", name: "Ajaib" },
  { src: "/images/clients/rrg-studio.png", alt: "RRG Studio", name: "RRG Studio" },
  { src: "/images/clients/asit.png", alt: "ASIT - Member of ASTRA", name: "ASIT" },
]

const teamMembers = [
  { name: "Jane Doe", role: "CEO & Founder", image: "/placeholder.svg?width=300&height=300" },
  { name: "John Smith", role: "Head of Operations", image: "/placeholder.svg?width=300&height=300" },
  { name: "Alice Brown", role: "Lead Recruiter", image: "/placeholder.svg?width=300&height=300" },
]

const testimonials = [
  {
    quote:
      "Sangat puas dengan layanan dari Hitopia. Ketika menghadapi masalah, tim Hitopia sangat responsif dan cepat tanggap dalam memberikan solusi. Bahkan, mereka menyediakan penggantian talent secara gratis untuk memastikan kelancaran proyek kami. Talent yang diberikan tidak hanya ahli secara teknis, tetapi juga profesional dan selalu siap memenuhi kebutuhan kami. Kerjasama ini benar-benar memberikan dampak positif bagi perkembangan bisnis kami.",
    name: "Hariz",
    title: "Project Manager, Hepytech",
    type: "client",
  },
  {
    quote:
      "Gabung ke Hitopia itu salah satu keputusan terbaik buat perjalanan karir saya. Dari awal proses rekrutmen, saya sudah ngerasain banget profesionalisme dan vibe positif dari tim Hitopia. Mereka tidak hanya bantu cari proyek yang cocok dengan skill saya, tapi juga bener-bener peduli buat memberikan saya di tempat yang sesuai sama minat dan passion.",
    name: "Mufthi BE",
    title: "Backend Engineer",
    type: "talent",
  },
  {
    quote:
      "Bekerja bersama Hitopia adalah pengalaman yang tak terlupakan. Saya merasa didukung penuh, mulai dari proses rekrutmen hingga penempatan di klien. Tim Hitopia sangat responsif dan membantu saya memahami kebutuhan teknis dan non-teknis. Berkat mereka, saya mampu menyelesaikan proyek client sesuai ekspektasi dan saya terus mengembangkan keterampilan saya. Saya bangga menjadi bagian dari tim Hitopia. Sukses terus Hitopia!",
    name: "Arif Fullstack",
    title: "Fullstack Developer",
    type: "talent",
  },
  {
    quote:
      "Hitopia memberikan pengalaman yang sangat berharga bagi saya. Lingkungan kerja yang inovatif dan suportif membuat saya terus berkembang dan sistem kerja yang terstruktur, baik secara profesional maupun pribadi. Selain itu, komunikasi yang baik antara Hitopia dan saya membuat pekerjaan menjadi lebih nyaman dan efisien dan dukungan yang positif membuat setiap tantangan terasa lebih mudah untuk dihadapi. Saya bangga bisa menjadi bagian dari Hitopia dan merekomendasikan Hitopia bagi siapa saja yang ingin berkembang dalam karir mereka!",
    name: "Adi Ardiansyah QA",
    title: "Quality Assurance Engineer",
    type: "talent",
  },
]

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  slug: string
}

const companyBenefits = [
  { icon: TrendingUp, text: "Competitive salary" },
  { icon: Users, text: "Pre-selection talent with AI" },
  { icon: Lightbulb, text: "Generous paid time off" },
  { icon: Briefcase, text: "Remote work flexibility" },
  { icon: CheckCircle, text: "Professional development" },
  { icon: MapPin, text: "Vibrant and inclusive culture" },
]

// Save contact form submission to Supabase
async function submitContactForm(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() || ""
  const email = (formData.get("email") as string | null)?.trim() || ""
  const service = (formData.get("service") as string | null)?.trim() || null
  const message = (formData.get("message") as string | null)?.trim() || ""

  if (!name || !email || !message) {
    return { success: false, message: "Please fill in all required fields." }
  }

  try {
    const { error } = await supabase.from("contact_messages").insert([
      { name, email, service, message },
    ])
    if (error) {
      console.error("[v0] contact_messages insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      // Surface RLS / schema errors so the user can see them
      if (error.code === "42501" || error.message.toLowerCase().includes("row-level security")) {
        return { success: false, message: "Permission denied. Please contact the site administrator." }
      }
      if (error.code === "PGRST204" || error.message.toLowerCase().includes("column")) {
        return { success: false, message: `Database schema issue: ${error.message}` }
      }
      return { success: false, message: `Could not send your message: ${error.message}` }
    }
    GAEvents.submitContactForm(email, service)
    return { success: true, message: "Thank you for your message! We'll get back to you soon." }
  } catch (err: any) {
    console.error("[v0] contact form exception:", err)
    return { success: false, message: `Something went wrong: ${err?.message || "Unknown error"}` }
  }
}

// --- Main Page Component ---

export default function HomePage() {
  const [jobOpenings, setJobOpenings] = useState<Job[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [formState, setFormState] = useState<{ success: boolean; message: string }>({ success: false, message: "" })
  const [isPending, startTransition] = useTransition()

  // Inject JSON-LD schema for services and process steps on mount
  useEffect(() => {
    const servicesSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: services.map((service, index) => ({
        "@type": "Service",
        position: index + 1,
        name: service.title,
        description: service.longDescription,
        areaServed: {
          "@type": "Country",
          name: ["Indonesia", "Singapore", "Malaysia", "Thailand", "Philippines", "United States", "United Kingdom", "Australia"],
        },
      })),
    }

    const processSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [
        { "@type": "HowToStep", position: 1, name: "Consultation", description: "Discovering talent needs and project rates." },
        { "@type": "HowToStep", position: 2, name: "Expert Assessment", description: "Careful selection of qualified project experts." },
        { "@type": "HowToStep", position: 3, name: "Screening & Interview", description: "Finding the best talent for your project." },
        { "@type": "HowToStep", position: 4, name: "Offering & Placement", description: "Developing a fair contract for all parties." },
        { "@type": "HowToStep", position: 5, name: "Project Kickoff", description: "Seamless integration and Day-1 start." },
        { "@type": "HowToStep", position: 6, name: "Continuous Monitoring", description: "Consistent talent monitoring and support." },
      ],
    }

    const script1 = document.createElement("script")
    script1.type = "application/ld+json"
    script1.innerHTML = JSON.stringify(servicesSchema)
    document.head.appendChild(script1)

    const script2 = document.createElement("script")
    script2.type = "application/ld+json"
    script2.innerHTML = JSON.stringify(processSchema)
    document.head.appendChild(script2)

    return () => {
      document.head.removeChild(script1)
      document.head.removeChild(script2)
    }
  }, [])

  // Load articles from Supabase
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("is_published", true)
          .order("published_at", { ascending: false })
          .limit(6)

        if (error) {
          console.warn("[v0] Articles table may not exist yet:", error.message)
          setArticles([])
          return
        }
        setArticles(data || [])
      } catch (error) {
        console.warn("[v0] Could not load articles:", error)
        setArticles([])
      }
    }
    loadArticles()
  }, [])

  // Load jobs from Supabase
  useEffect(() => {
    const loadActiveJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) {
          console.warn("[v0] Supabase query error (jobs table may not exist yet):", error.message)
          // Gracefully handle missing table or network errors
          setJobOpenings([])
          return
        }

        if (!data || data.length === 0) {
          console.log("[v0] No active jobs found in database")
          setJobOpenings([])
          return
        }

        // Convert database format to frontend format
        const formattedJobs = data.map((job) => ({
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          benefits: job.benefits || [],
          isActive: job.is_active,
          createdAt: job.created_at,
          updatedAt: job.updated_at,
          slug: job.title.toLowerCase().replace(/\s+/g, "-"),
        }))

        console.log("[v0] Loaded jobs from database:", formattedJobs.length)
        setJobOpenings(formattedJobs)
      } catch (error) {
        console.error("[v0] Unexpected error loading jobs:", error)
        setJobOpenings([])
      }
    }

    loadActiveJobs()
  }, [])

  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    startTransition(async () => {
      const result = await submitContactForm(formData)
      setFormState(result)
      if (result.success) form.reset()
    })
  }

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({
      behavior: "smooth",
    })
  }

  return (
    <>
      {/* Home Section */}
      <section id="home" className="relative h-svh min-h-[700px] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0 bg-background">
          <picture>
            {/* HP: crop portrait 9:16 (±140 KB) */}
            <source media="(max-width: 767px)" srcSet="/images/hero-seminar-mobile.webp" type="image/webp" />
            {/* Tablet & desktop: 4:3, dipilih sesuai lebar layar */}
            <source
              srcSet="/images/hero-seminar-1280.webp 1280w, /images/hero-seminar-1920.webp 1920w"
              sizes="100vw"
              type="image/webp"
            />
            <img
              src="/images/hero-seminar-1920.webp"
              alt="Professional seminar with attendees, representing Hitopia's commitment to expertise and talent development"
              width={1920}
              height={1440}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/80 to-background/40" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center text-white">
          <h1 className="font-serif text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            Empowering Your Business
            <br />
            <span className="text-primary">With Top Talent</span>
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-gray-300 md:text-xl">
            We are a premium on-demand staffing agency dedicated to connecting you with the best talent in the industry.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <a href="#contact" onClick={(e) => handleScrollTo(e, "#contact")}>
                Find Talent
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-background bg-transparent"
              asChild
            >
              <a href="#careers" onClick={(e) => handleScrollTo(e, "#careers")}>
                Explore Careers
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <SectionAnimator id="about" className="py-16 md:py-24 bg-secondary scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative h-80 w-full md:h-[500px]">
              <Image
                src="/images/about-us-meeting.jpeg"
                alt="Professional business meeting in modern conference room with team members discussing global staffing solutions, showcasing Hitopia's collaborative approach"
                fill
                style={{ objectFit: "cover" }}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">About Us</span>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Premium On-Demand Staffing Agency
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                As committed and proactive partners, we are deeply dedicated to our values and driven by the desire to
                catalyze positive transformation for our clients, employees, and communities.
              </p>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <Target className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Our Mission</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    To empower businesses by connecting them with top-tier global talent.
                  </p>
                </div>
                <div className="text-center">
                  <Eye className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Our Vision</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    To be the most trusted and innovative partner in on-demand staffing.
                  </p>
                </div>
                <div className="text-center">
                  <CheckCircle className="mx-auto h-10 w-10 text-primary" />
                  <h3 className="mt-2 font-serif text-xl font-bold">Our Values</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Integrity, Excellence, Partnership, and Client-Centricity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionAnimator>

      {/* Services Section */}
      <SectionAnimator id="services" className="py-16 md:py-24 bg-background text-white scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Services</span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Solutions We Can Help You With
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We offer customized remote, contract, and permanent hiring services to find exceptional talent, anywhere.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Card
                key={service.title}
                className="bg-secondary border-white/10 text-white hover:border-primary transition-colors text-center"
              >
                <CardHeader className="items-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center justify-self-center rounded-full bg-background text-primary">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="font-serif">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionAnimator>

      {/* Our Clients Section */}
      <SectionAnimator className="py-16 md:py-24 bg-secondary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Clients</span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Trusted by Leading Companies
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We're proud to partner with industry leaders across various sectors, delivering exceptional talent
              solutions.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
            {clientLogos.map((client) => (
              <div
                key={client.name}
                className="flex items-center justify-center rounded-lg bg-white p-6 shadow-sm transition-transform hover:scale-105 hover:shadow-md"
              >
                <Image
                  src={client.src || "/placeholder.svg"}
                  alt={client.alt}
                  width={120}
                  height={60}
                  className="max-h-12 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>
      </SectionAnimator>

      {/* Process Section */}
      <SectionAnimator id="process" className="py-16 md:py-24 bg-secondary scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Our Process</span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A Flawless, Transparent Process
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We take great satisfaction in offering outstanding service and assisting our clients in reaching their
              objectives through a simple and pleasurable process.
            </p>
          </div>
          <div className="relative mt-16">
            <div className="absolute left-1/2 top-0 -ml-px h-full w-0.5 bg-primary/30" aria-hidden="true" />
            {processSteps.map((item, index) => (
              <div key={item.step} className="relative mb-8">
                <div className="flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-serif text-xl font-bold z-10">
                    {item.step}
                  </div>
                </div>
                <div
                  className={`mt-4 text-center ${index % 2 === 0 ? "md:text-right md:mr-[55%]" : "md:text-left md:ml-[55%]"}`}
                >
                  <h3 className="text-2xl font-serif font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionAnimator>

      {/* Portfolio Section */}
      <SectionAnimator id="portfolio" className="py-16 md:py-24 bg-background scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Portfolio</span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Satisfied Clients & Success Stories
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Hear from our clients and talented professionals about their experience working with Hitopia.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-secondary shadow-lg">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        testimonial.type === "client"
                          ? "bg-primary/20 text-primary border border-primary/40"
                          : "bg-primary/20 text-primary border border-primary/40"
                      }`}
                    >
                      {testimonial.type === "client" ? "Client Testimonial" : "Talent Testimonial"}
                    </span>
                  </div>
                  <p className="italic text-muted-foreground mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SectionAnimator>

      {/* Articles Section */}
      <SectionAnimator id="articles" className="py-16 md:py-24 bg-secondary scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Articles</span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Insights & Industry News
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Stay up to date with the latest trends in talent acquisition, remote work, and outsourcing.
            </p>
          </div>

          {articles.length === 0 ? (
            <div className="mt-12 text-center py-16 border border-white/10 rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-primary/50 mb-4" />
              <p className="text-muted-foreground text-lg">No articles published yet.</p>
              <p className="text-muted-foreground text-sm mt-1">Check back soon for industry insights and updates.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block"
                  onClick={() => GAEvents.clickArticle(article.id, article.title, "homepage")}
                >
                  <Card className="bg-background border-white/10 hover:border-primary/50 transition-all duration-300 h-full flex flex-col overflow-hidden">
                    {article.cover_image_url && (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={article.cover_image_url}
                          alt={article.title}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                          <Tag className="h-3 w-3" />
                          {article.category}
                        </span>
                      </div>
                      <CardTitle className="font-serif text-lg text-white group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground line-clamp-3 mt-2">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {article.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Draft"}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </SectionAnimator>

      {/* Calculator Teaser Section (jembatan ke /kalkulator) */}
      <SectionAnimator id="tools" className="border-t border-white/10 py-16 md:py-24 bg-background scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/10 bg-secondary p-8 md:p-12">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">Free Tools</span>
                <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Hitung Sendiri, Sebelum Kami Bantu
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Mengelola tim berarti mengelola payroll dan kepatuhan pajak. Coba kalkulator gratis kami untuk
                  memperkirakan PPh 21, iuran BPJS, pesangon, hingga membandingkan tawaran kerja, lalu hubungi kami jika Anda ingin urusan ini ditangani
                  sepenuhnya.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="/kalkulator">
                      Lihat Semua Kalkulator <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  >
                    <a href="#contact">Konsultasi Payroll</a>
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {calculators.map((calculator) => (
                  <Link
                    key={calculator.slug}
                    href={`/kalkulator/${calculator.slug}`}
                    className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Card className="h-full bg-background border-white/10 text-white transition-colors group-hover:border-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <calculator.icon className="h-8 w-8 text-primary" />
                          {calculator.isNew ? <NewBadge /> : null}
                        </div>
                        <CardTitle className="mt-3 font-serif text-lg">{calculator.title}</CardTitle>
                        <CardDescription className="line-clamp-3 text-muted-foreground">
                          {calculator.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                          Coba sekarang
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionAnimator>

      {/* Careers Section */}
      <SectionAnimator id="careers" className="py-16 md:py-24 bg-background scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Careers</span>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">Join Our Team</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We believe our people are our greatest asset. Explore exciting career opportunities and become part of a
              dynamic, innovative team.
            </p>
          </div>
          <div className="mt-12 grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              {jobOpenings.length === 0 ? (
                <Card className="bg-secondary shadow-md">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No job openings available at the moment. Please check back later!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                jobOpenings.map((job) => (
                  <Card key={job.id} className="bg-secondary shadow-md">
                    <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Briefcase className="mr-1.5 h-3 w-3" /> {job.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1.5 h-3 w-3" /> {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1.5 h-3 w-3" /> {job.type}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="link"
                        className="p-0 text-primary"
                        asChild
                        onClick={() =>
                          GAEvents.clickJobListing(job.id, job.title, job.department)
                        }
                      >
                        <a
                          href={`https://forms.gle/phzShrV7Gwyu7Q7n6#${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn More & Apply <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
            <div>
              <h3 className="mb-4 font-serif text-2xl font-bold">Why Work at Hitopia?</h3>
              <ul className="space-y-3">
                {companyBenefits.map((benefit) => (
                  <li key={benefit.text} className="flex items-start">
                    <benefit.icon className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SectionAnimator>

      {/* Contact Section */}
      <SectionAnimator id="contact" className="py-16 md:py-24 bg-secondary scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card className="shadow-lg bg-background">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="john.doe@example.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">Service Interested In</Label>
                      <Select name="service">
                        <SelectTrigger id="service">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote-hiring">Remote Hiring</SelectItem>
                          <SelectItem value="contract-staffing">Contract Staffing</SelectItem>
                          <SelectItem value="permanent-hiring">Permanent Hiring</SelectItem>
                          <SelectItem value="managed-solution">Managed Solution</SelectItem>
                          <SelectItem value="careers">Careers / Job Application</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" name="message" placeholder="Your message..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                      {isPending ? "Sending..." : "Send Message"}
                    </Button>
                    {formState.message && (
                      <div
                        className={`mt-4 p-3 rounded-md flex items-center gap-2 text-sm ${formState.success ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"}`}
                      >
                        {formState.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        {formState.message}
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8 lg:col-span-2">
              <Card className="shadow-lg bg-background">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">Our Office</h3>
                      <p className="text-muted-foreground">
                        Summarecon Bandung
                        <br />
                        Jl. Magna Timur No.106 Bandung 40296
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">Email Us</h3>
                      <a href="mailto:business@hitopia.id" className="text-muted-foreground hover:text-primary">
                        business@hitopia.id
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">Call Us</h3>
                      <a href="tel:+6281235697181" className="text-muted-foreground hover:text-primary">
                        +62 812-3569-7181
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SectionAnimator>
    </>
  )
}