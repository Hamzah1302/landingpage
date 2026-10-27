import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculators } from "@/lib/calculators/registry"
import { NewBadge } from "@/components/calculators/new-badge"

export const metadata: Metadata = {
  title: "Kalkulator",
  description: "Kumpulan kalkulator payroll, perpajakan, dan karier dari Hitopia: PPh 21, BPJS, pesangon, dan perbandingan tawaran kerja.",
  alternates: { canonical: "/kalkulator" },
}

export default function KalkulatorIndexPage() {
  return (
    <div className="bg-background text-white">
      <section className="bg-gradient-to-b from-secondary to-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">Kalkulator</span>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">Kalkulator Payroll &amp; Pajak</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Alat bantu untuk memperkirakan PPh 21, iuran BPJS, pesangon PHK, dan membandingkan tawaran kerja.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calculator) => {
              const Icon = calculator.icon
              return (
                <Link
                  key={calculator.slug}
                  href={`/kalkulator/${calculator.slug}`}
                  className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Card className="h-full transition-colors group-hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Icon className="h-10 w-10 text-primary" />
                        {calculator.isNew ? <NewBadge /> : null}
                      </div>
                      <CardTitle className="mt-4 font-serif text-xl">{calculator.title}</CardTitle>
                      <CardDescription>{calculator.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                        Buka kalkulator
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
