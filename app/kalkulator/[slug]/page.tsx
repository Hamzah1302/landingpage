import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { calculators, getCalculator } from "@/lib/calculators/registry"

type PageProps = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const calculator = getCalculator(slug)
  if (!calculator) return {}
  return {
    title: calculator.title,
    description: calculator.seoDescription,
    alternates: { canonical: `/kalkulator/${calculator.slug}` },
  }
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params
  const calculator = getCalculator(slug)
  if (!calculator) notFound()

  const Calculator = calculator.component

  return (
    <div className="bg-background text-white">
      <section className="bg-secondary py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/kalkulator"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua kalkulator
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{calculator.title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{calculator.description}</p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Calculator />
        </div>
      </section>
    </div>
  )
}
