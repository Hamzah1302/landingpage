/**
 * Logika murni PPh 21 pegawai tetap (PP 58/2023 & PMK 168/2023):
 *  - Masa pajak Januari–November: Tarif Efektif Rata-rata (TER) bulanan kategori A/B/C.
 *  - Masa pajak terakhir (Desember): tarif Pasal 17 (progresif) atas penghasilan setahun,
 *    dikurangi PPh 21 yang sudah dipotong Januari–November.
 */

export type PtkpStatus = "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3"
export type TerCategory = "A" | "B" | "C"

export const PTKP_STATUSES: { value: PtkpStatus; label: string; ptkp: number; category: TerCategory }[] = [
  { value: "TK/0", label: "TK/0 – Tidak kawin, 0 tanggungan", ptkp: 54_000_000, category: "A" },
  { value: "TK/1", label: "TK/1 – Tidak kawin, 1 tanggungan", ptkp: 58_500_000, category: "A" },
  { value: "TK/2", label: "TK/2 – Tidak kawin, 2 tanggungan", ptkp: 63_000_000, category: "B" },
  { value: "TK/3", label: "TK/3 – Tidak kawin, 3 tanggungan", ptkp: 67_500_000, category: "B" },
  { value: "K/0", label: "K/0 – Kawin, 0 tanggungan", ptkp: 58_500_000, category: "A" },
  { value: "K/1", label: "K/1 – Kawin, 1 tanggungan", ptkp: 63_000_000, category: "B" },
  { value: "K/2", label: "K/2 – Kawin, 2 tanggungan", ptkp: 67_500_000, category: "B" },
  { value: "K/3", label: "K/3 – Kawin, 3 tanggungan", ptkp: 72_000_000, category: "C" },
]

export const JOB_COST_RATE = 5 // biaya jabatan 5%
export const JOB_COST_ANNUAL_CAP = 6_000_000 // maks Rp500.000/bulan

/** Tiap baris: [batas atas penghasilan bruto sebulan (inklusif), tarif %] */
type TerRow = readonly [number, number]

const TER_A: readonly TerRow[] = [
  [5_400_000, 0], [5_650_000, 0.25], [5_950_000, 0.5], [6_300_000, 0.75], [6_750_000, 1],
  [7_500_000, 1.25], [8_550_000, 1.5], [9_650_000, 1.75], [10_050_000, 2], [10_350_000, 2.25],
  [10_700_000, 2.5], [11_050_000, 3], [11_600_000, 3.5], [12_500_000, 4], [13_750_000, 5],
  [15_100_000, 6], [16_950_000, 7], [19_750_000, 8], [24_150_000, 9], [26_450_000, 10],
  [28_000_000, 11], [30_050_000, 12], [32_400_000, 13], [35_400_000, 14], [39_100_000, 15],
  [43_850_000, 16], [47_800_000, 17], [51_400_000, 18], [56_300_000, 19], [62_200_000, 20],
  [68_600_000, 21], [77_500_000, 22], [89_000_000, 23], [103_000_000, 24], [125_000_000, 25],
  [157_000_000, 26], [206_000_000, 27], [337_000_000, 28], [454_000_000, 29], [550_000_000, 30],
  [695_000_000, 31], [910_000_000, 32], [1_400_000_000, 33], [Infinity, 34],
]

const TER_B: readonly TerRow[] = [
  [6_200_000, 0], [6_500_000, 0.25], [6_850_000, 0.5], [7_300_000, 0.75], [9_200_000, 1],
  [10_750_000, 1.5], [11_250_000, 2], [11_600_000, 2.5], [12_600_000, 3], [13_600_000, 4],
  [14_950_000, 5], [16_400_000, 6], [18_450_000, 7], [21_850_000, 8], [26_000_000, 9],
  [27_700_000, 10], [29_350_000, 11], [31_450_000, 12], [33_950_000, 13], [37_100_000, 14],
  [41_100_000, 15], [45_800_000, 16], [49_500_000, 17], [53_800_000, 18], [58_500_000, 19],
  [64_000_000, 20], [71_000_000, 21], [80_000_000, 22], [93_000_000, 23], [109_000_000, 24],
  [129_000_000, 25], [163_000_000, 26], [211_000_000, 27], [374_000_000, 28], [459_000_000, 29],
  [555_000_000, 30], [704_000_000, 31], [957_000_000, 32], [1_405_000_000, 33], [Infinity, 34],
]

const TER_C: readonly TerRow[] = [
  [6_600_000, 0], [6_950_000, 0.25], [7_350_000, 0.5], [7_800_000, 0.75], [8_850_000, 1],
  [9_800_000, 1.25], [10_950_000, 1.5], [11_200_000, 1.75], [12_050_000, 2], [12_950_000, 3],
  [14_150_000, 4], [15_550_000, 5], [17_050_000, 6], [19_500_000, 7], [22_700_000, 8],
  [26_600_000, 9], [28_100_000, 10], [30_100_000, 11], [32_600_000, 12], [35_400_000, 13],
  [38_900_000, 14], [43_000_000, 15], [47_400_000, 16], [51_200_000, 17], [55_800_000, 18],
  [60_400_000, 19], [66_700_000, 20], [74_500_000, 21], [83_200_000, 22], [95_600_000, 23],
  [110_000_000, 24], [134_000_000, 25], [169_000_000, 26], [221_000_000, 27], [390_000_000, 28],
  [463_000_000, 29], [561_000_000, 30], [709_000_000, 31], [965_000_000, 32], [1_419_000_000, 33],
  [Infinity, 34],
]

export const TER_TABLES: Record<TerCategory, readonly TerRow[]> = { A: TER_A, B: TER_B, C: TER_C }

/** Tarif Pasal 17 ayat (1) huruf a UU PPh: [batas atas PKP, tarif %] */
export const PROGRESSIVE_BRACKETS: readonly TerRow[] = [
  [60_000_000, 5],
  [250_000_000, 15],
  [500_000_000, 25],
  [5_000_000_000, 30],
  [Infinity, 35],
]

export function getPtkpInfo(status: PtkpStatus) {
  const info = PTKP_STATUSES.find((s) => s.value === status)
  if (!info) throw new Error(`Status PTKP tidak dikenal: ${status}`)
  return info
}

export function getTerRate(category: TerCategory, monthlyGross: number): number {
  const gross = Math.max(0, monthlyGross)
  const row = TER_TABLES[category].find(([upTo]) => gross <= upTo)
  return row ? row[1] : 0
}

export function calculateProgressiveTax(pkp: number): { tax: number; layers: { from: number; to: number; rate: number; amount: number; tax: number }[] } {
  let remaining = Math.max(0, pkp)
  let lower = 0
  let total = 0
  const layers: { from: number; to: number; rate: number; amount: number; tax: number }[] = []

  for (const [upTo, rate] of PROGRESSIVE_BRACKETS) {
    if (remaining <= 0) break
    const span = Math.min(remaining, upTo - lower)
    const layerTax = (span * rate) / 100
    layers.push({ from: lower, to: upTo, rate, amount: span, tax: layerTax })
    total += layerTax
    remaining -= span
    lower = upTo
  }
  return { tax: Math.floor(total), layers }
}

export type MonthlyTerResult = {
  category: TerCategory
  rate: number
  grossForTer: number
  tax: number
}

export function calculateMonthlyTer(status: PtkpStatus, monthlyGross: number): MonthlyTerResult {
  const { category } = getPtkpInfo(status)
  const rate = getTerRate(category, monthlyGross)
  return {
    category,
    rate,
    grossForTer: monthlyGross,
    tax: Math.floor((Math.max(0, monthlyGross) * rate) / 100),
  }
}

export type AnnualInput = {
  status: PtkpStatus
  /** Penghasilan bruto reguler sebulan (dipakai untuk 12 bulan, termasuk premi yang dibayar perusahaan bila ada) */
  monthlyGross: number
  /** Bonus/THR/penghasilan tidak teratur setahun */
  annualExtra: number
  /** Iuran pensiun/JHT/JP yang dibayar karyawan, per bulan */
  monthlyPensionContribution: number
}

export type AnnualResult = {
  annualGross: number
  jobCost: number
  pensionContribution: number
  netIncome: number
  ptkp: number
  pkp: number
  annualTax: number
  paidJanToNov: number
  decemberTax: number
  layers: ReturnType<typeof calculateProgressiveTax>["layers"]
}

export function calculateAnnual({ status, monthlyGross, annualExtra, monthlyPensionContribution }: AnnualInput): AnnualResult {
  const { ptkp } = getPtkpInfo(status)
  const annualGross = monthlyGross * 12 + annualExtra
  const jobCost = Math.min((annualGross * JOB_COST_RATE) / 100, JOB_COST_ANNUAL_CAP)
  const pensionContribution = monthlyPensionContribution * 12
  const netIncome = Math.max(0, annualGross - jobCost - pensionContribution)
  const pkp = Math.max(0, Math.floor((netIncome - ptkp) / 1000) * 1000)
  const { tax: annualTax, layers } = calculateProgressiveTax(pkp)

  const monthly = calculateMonthlyTer(status, monthlyGross)
  const paidJanToNov = monthly.tax * 11

  return {
    annualGross,
    jobCost,
    pensionContribution,
    netIncome,
    ptkp,
    pkp,
    annualTax,
    paidJanToNov,
    decemberTax: annualTax - paidJanToNov,
    layers,
  }
}
