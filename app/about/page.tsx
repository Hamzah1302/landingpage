import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle, Target, Eye } from "lucide-react"
import Link from "next/link"

const teamMembers = [
  { name: "Jane Doe", role: "CEO & Founder", image: "/placeholder.svg?width=300&height=300" },
  { name: "John Smith", role: "Head of Operations", image: "/placeholder.svg?width=300&height=300" },
  { name: "Alice Brown", role: "Lead Recruiter", image: "/placeholder.svg?width=300&height=300" },
]

export default function AboutPage() {
  return (
    <div className="bg-background text-white">
      {/* Hero About */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">About Hitopia</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Our mission, values, and the dedicated team driving our success in connecting businesses with exceptional
            talent.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="relative h-80 w-full md:h-[500px]">
              <Image
                src="/placeholder.svg?width=600&height=500"
                alt="Hitopia Team Collaboration"
                layout="fill"
                objectFit="cover"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Our Story</h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Founded with a vision to bridge the gap between exceptional talent and innovative companies, Hitopia has
                grown into a leading on-demand staffing agency. Our journey began with a simple belief: the right people
                can transform businesses.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Over the years, we&apos;ve honed our expertise, expanded our network, and remained committed to our core
                principles of integrity, excellence, and partnership. We are passionate about helping our clients build
                high-performing teams and empowering professionals to achieve their career aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-background text-primary">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Our Mission</h3>
              <p className="mt-2 text-muted-foreground">
                To empower businesses by connecting them with top-tier global talent, fostering growth and innovation
                through strategic staffing solutions.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-background text-primary">
                <Eye className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Our Vision</h3>
              <p className="mt-2 text-muted-foreground">
                To be the most trusted and innovative partner in on-demand staffing, recognized for our commitment to
                quality, client satisfaction, and ethical practices.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-background text-primary">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold">Our Values</h3>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>Integrity & Transparency</li>
                <li>Client-Centric Approach</li>
                <li>Excellence & Quality</li>
                <li>Collaboration & Partnership</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Meet Our Leadership</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            The passionate professionals dedicated to your success.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="rounded-lg bg-secondary p-6">
                <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} layout="fill" objectFit="cover" />
                </div>
                <h3 className="font-serif text-xl font-semibold">{member.name}</h3>
                <p className="text-primary">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">Partner with Hitopia</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Ready to find the perfect talent for your team? Let&apos;s discuss your needs.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-8">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
