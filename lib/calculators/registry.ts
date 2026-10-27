import type { ComponentType } from "react"
import { HandCoins, Receipt, Scale, ShieldCheck, type LucideIcon } from "lucide-react"
import Pph21Calculator from "@/components/calculators/pph21-calculator"
import BpjsCalculator from "@/components/calculators/bpjs-calculator"
import PesangonCalculator from "@/components/calculators/pesangon-calculator"
import JobOfferCalculator from "@/components/calculators/job-offer-calculator"

export type CalculatorDefinition = {
  /** Dipakai sebagai URL: /kalkulator/<slug> */
  slug: string
  title: string
  /** Deskripsi singkat untuk kartu di halaman indeks */
  description: string
  /** Deskripsi untuk SEO (meta description) */
  seoDescription: string
  icon: LucideIcon
  component: ComponentType
}

/**
 * Daftar semua kalkulator. Untuk menambah kalkulator baru:
 *  1. Buat logika di lib/calculators/<nama>.ts
 *  2. Buat komponen di components/calculators/<nama>-calculator.tsx (default export)
 *  3. Tambahkan satu entri di array ini. Halaman indeks, rute, dan metadata terbentuk otomatis.
 */
export const calculators: CalculatorDefinition[] = [
  {
    slug: "pph21",
    title: "Kalkulator PPh 21",
    description: "Hitung PPh 21 karyawan dengan skema TER (Januari–November) dan tarif progresif untuk masa Desember.",
    seoDescription:
      "Kalkulator PPh 21 karyawan tetap sesuai PMK 168/2023: tarif efektif rata-rata (TER) bulanan dan perhitungan masa pajak Desember.",
    icon: Receipt,
    component: Pph21Calculator,
  },
  {
    slug: "bpjs",
    title: "Kalkulator BPJS",
    description: "Hitung iuran BPJS Kesehatan, JHT, JP, JKK, dan JKM yang ditanggung perusahaan dan karyawan.",
    seoDescription:
      "Kalkulator iuran BPJS Kesehatan dan BPJS Ketenagakerjaan (JHT, JP, JKK, JKM) bagian perusahaan dan karyawan.",
    icon: ShieldCheck,
    component: BpjsCalculator,
  },
  {
    slug: "pesangon",
    title: "Kalkulator Pesangon & UPMK",
    description:
      "Hitung uang pesangon, uang penghargaan masa kerja (UPMK), dan uang penggantian hak sesuai PP 35/2021 berdasarkan alasan PHK.",
    seoDescription:
      "Kalkulator pesangon PHK sesuai PP 35/2021: uang pesangon, UPMK, dan UPH berdasarkan alasan PHK (efisiensi, resign, pensiun, PKPU, pailit, dan lainnya) beserta estimasi PPh 21.",
    icon: HandCoins,
    component: PesangonCalculator,
  },
  {
    slug: "bandingkan-tawaran-kerja",
    title: "Bandingkan 2 Tawaran Kerja",
    description:
      "Bandingkan gaji, tunjangan, BPJS, bonus, ongkos transport, dan WFH dari dua tawaran kerja menjadi nilai riil per bulan.",
    seoDescription:
      "Kalkulator perbandingan tawaran kerja: hitung nilai riil per bulan setelah PPh 21, BPJS, bonus/THR, biaya transport, dan pola WFH untuk dua tawaran sekaligus.",
    icon: Scale,
    component: JobOfferCalculator,
  },
]

export function getCalculator(slug: string) {
  return calculators.find((c) => c.slug === slug)
}
