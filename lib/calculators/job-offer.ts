/**
 * Logika murni perbandingan tawaran kerja: mengubah gaji, tunjangan, BPJS, bonus,
 * biaya transport, dan WFH menjadi "nilai riil per bulan".
 *
 * Memakai ulang perhitungan BPJS dan PPh 21 yang sudah ada agar konsisten dengan
 * kalkulator lain di situs ini.
 */

import { calculateBpjs } from "./bpjs"
import { calculateAnnual, calculateMonthlyTer, type PtkpStatus } from "./pph21"

export type BpjsMode = "both" | "kesehatan" | "ketenagakerjaan" | "none"

export const BPJS_MODES: { value: BpjsMode; label: string }[] = [
  { value: "both", label: "Lengkap (Kesehatan + Ketenagakerjaan)" },
  { value: "kesehatan", label: "Hanya BPJS Kesehatan" },
  { value: "ketenagakerjaan", label: "Hanya BPJS Ketenagakerjaan" },
  { value: "none", label: "Tidak didaftarkan" },
]

/** 52 minggu / 12 bulan */
export const WEEKS_PER_MONTH = 52 / 12

export type OfferInput = {
  name: string
  /** Gaji pokok + tunjangan tetap per bulan */
  fixedWage: number
  /** Tunjangan tidak tetap per bulan (uang makan, transport, dll.) */
  variablePay: number
  /** Bonus/THR setahun dalam kelipatan gaji pokok + tunjangan tetap */
  bonusMonths: number
  bpjsMode: BpjsMode
  /** Nilai benefit lain per bulan (asuransi swasta, tunjangan internet WFH, dll.) */
  otherBenefit: number
  /** Jarak rumah ke kantor sekali jalan (km) */
  distanceKm: number
  /** Waktu tempuh sekali jalan (menit) */
  travelMinutes: number
  /** Hari ke kantor per minggu (0–5). Sisanya WFH. */
  officeDaysPerWeek: number
}

export type SharedInput = {
  status: PtkpStatus
  /** Biaya transport per km (BBM, parkir, perawatan, atau ongkos) */
  costPerKm: number
  /** Nilai 1 jam waktu pengguna. 0 = waktu tempuh tidak dimonetisasi. */
  valuePerHour: number
}

export type OfferResult = {
  name: string
  fixedWage: number
  cashGross: number
  annualBonus: number
  annualGross: number
  bpjsEmployeeMonthly: number
  bpjsEmployerMonthly: number
  /** PPh 21 setahun (tarif Pasal 17 atas penghasilan setahun) */
  annualTax: number
  /** Take-home reguler bulanan menurut TER (tanpa bonus) */
  regularTakeHome: number
  /** Penghasilan tunai bersih setahun setelah PPh 21 & potongan BPJS karyawan */
  annualNetCash: number
  /** annualNetCash / 12 */
  netCashPerMonth: number
  otherBenefit: number
  officeDaysPerMonth: number
  wfhDaysPerMonth: number
  transportCost: number
  travelHoursPerMonth: number
  timeCost: number
  /** Nilai riil per bulan */
  realValue: number
  /** Gaji bruto tunai per bulan rata-rata (termasuk bonus) untuk pembanding */
  grossPerMonth: number
}

export function calculateOffer(offer: OfferInput, shared: SharedInput): OfferResult {
  const fixedWage = Math.max(0, offer.fixedWage)
  const variablePay = Math.max(0, offer.variablePay)
  const cashGross = fixedWage + variablePay
  const annualBonus = Math.round(fixedWage * Math.max(0, offer.bonusMonths))

  const bpjs = calculateBpjs({
    wage: fixedWage,
    includeKesehatan: offer.bpjsMode === "both" || offer.bpjsMode === "kesehatan",
    includeKetenagakerjaan: offer.bpjsMode === "both" || offer.bpjsMode === "ketenagakerjaan",
  })

  // Premi Kesehatan, JKK, dan JKM yang dibayar perusahaan dihitung sebagai penghasilan bruto karyawan.
  const taxableMonthly = cashGross + bpjs.employerTaxablePremium

  const annual = calculateAnnual({
    status: shared.status,
    monthlyGross: taxableMonthly,
    annualExtra: annualBonus,
    monthlyPensionContribution: bpjs.employeeDeductibleForTax,
  })

  const regularTax = calculateMonthlyTer(shared.status, taxableMonthly).tax
  const regularTakeHome = cashGross - bpjs.employeeTotal - regularTax

  const annualCash = cashGross * 12 + annualBonus
  const annualNetCash = annualCash - bpjs.employeeTotal * 12 - annual.annualTax
  const netCashPerMonth = annualNetCash / 12

  const officeDaysPerWeek = Math.min(5, Math.max(0, offer.officeDaysPerWeek))
  const officeDaysPerMonth = officeDaysPerWeek * WEEKS_PER_MONTH
  const wfhDaysPerMonth = (5 - officeDaysPerWeek) * WEEKS_PER_MONTH

  const tripKmPerMonth = officeDaysPerMonth * 2 * Math.max(0, offer.distanceKm)
  const transportCost = tripKmPerMonth * Math.max(0, shared.costPerKm)
  const travelHoursPerMonth = (officeDaysPerMonth * 2 * Math.max(0, offer.travelMinutes)) / 60
  const timeCost = travelHoursPerMonth * Math.max(0, shared.valuePerHour)

  const otherBenefit = Math.max(0, offer.otherBenefit)

  const realValue = netCashPerMonth + bpjs.employerTotal + otherBenefit - transportCost - timeCost

  return {
    name: offer.name,
    fixedWage,
    cashGross,
    annualBonus,
    annualGross: annualCash,
    bpjsEmployeeMonthly: bpjs.employeeTotal,
    bpjsEmployerMonthly: bpjs.employerTotal,
    annualTax: annual.annualTax,
    regularTakeHome,
    annualNetCash,
    netCashPerMonth,
    otherBenefit,
    officeDaysPerMonth,
    wfhDaysPerMonth,
    transportCost,
    travelHoursPerMonth,
    timeCost,
    realValue,
    grossPerMonth: annualCash / 12,
  }
}

export type OfferComparison = {
  a: OfferResult
  b: OfferResult
  /** Positif bila B lebih tinggi dari A */
  diff: number
  diffPercent: number
  winner: "a" | "b" | "tie"
  /** Pemenang berdasarkan gaji bruto per bulan, untuk menunjukkan kasus "gaji besar tapi nilai riil kecil" */
  grossWinner: "a" | "b" | "tie"
}

export function compareOffers(a: OfferInput, b: OfferInput, shared: SharedInput): OfferComparison {
  const ra = calculateOffer(a, shared)
  const rb = calculateOffer(b, shared)
  const diff = rb.realValue - ra.realValue
  const base = Math.min(ra.realValue, rb.realValue)
  const diffPercent = base > 0 ? (Math.abs(diff) / base) * 100 : 0
  const pick = (x: number, y: number): "a" | "b" | "tie" => (Math.abs(x - y) < 1 ? "tie" : x > y ? "a" : "b")
  return {
    a: ra,
    b: rb,
    diff,
    diffPercent,
    winner: pick(ra.realValue, rb.realValue),
    grossWinner: pick(ra.grossPerMonth, rb.grossPerMonth),
  }
}
