import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculators, getCalculator } from "@/lib/calculators/registry"
import { NewBadge } from "@/components/calculators/new-badge"

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
      <section className="bg-gradient-to-b from-secondary to-background py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/kalkulator"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Semua kalkulator
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {calculator.title}
            {calculator.isNew ? <NewBadge className="ml-3 align-middle" /> : null}
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{calculator.description}</p>
        </div>
      </section>

      <section className="py-10 md:py-16">
        <div className="calculator-ui mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Calculator />
        </div>
      </section>

      <section className="border-t border-white/10 bg-secondary py-12 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight">Butuh bantuan mengelola payroll &amp; tim?</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Hasil kalkulator hanyalah estimasi. Tim Hitopia siap membantu perhitungan, perekrutan, hingga layanan
              terkelola untuk bisnis Anda.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/#contact">
                Hubungi Kami <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <Link href="/#services">Lihat Layanan</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}