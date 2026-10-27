/**
 * Logika murni kalkulator BPJS (tanpa React) agar mudah dites dan dipakai ulang
 * oleh kalkulator lain (mis. PPh 21).
 *
 * Konfigurasi di bawah perlu diperbarui bila regulasi berubah.
 * Batas upah JP disesuaikan setiap 1 Maret (PP 45/2015: batas tahun lalu x (1 + pertumbuhan PDB)).
 */

export const BPJS_CONFIG = {
  /** BPJS Kesehatan: 5% (perusahaan 4%, karyawan 1%), batas dasar upah Rp12.000.000 */
  kesehatan: { employer: 4, employee: 1, wageCap: 12_000_000 },
  /** JHT: perusahaan 3,7%, karyawan 2%, tanpa batas atas upah */
  jht: { employer: 3.7, employee: 2 },
  /** JP: perusahaan 2%, karyawan 1%, batas atas upah berlaku sejak 1 Maret 2026 */
  jp: { employer: 2, employee: 1, wageCap: 11_086_300 },
  /** JKM: 0,3% ditanggung perusahaan */
  jkm: { employer: 0.3 },
} as const

export const JKK_RISK_LEVELS = [
  { value: "0.24", rate: 0.24, label: "Sangat rendah (0,24%)", example: "Perkantoran, perangkat lunak, jasa" },
  { value: "0.54", rate: 0.54, label: "Rendah (0,54%)", example: "Perdagangan, kesehatan, pendidikan" },
  { value: "0.89", rate: 0.89, label: "Sedang (0,89%)", example: "Manufaktur ringan, transportasi" },
  { value: "1.27", rate: 1.27, label: "Tinggi (1,27%)", example: "Pabrik, operator mesin berat" },
  { value: "1.74", rate: 1.74, label: "Sangat tinggi (1,74%)", example: "Konstruksi, pertambangan" },
] as const

export const DEFAULT_JKK_RATE = 0.24

export type BpjsLine = {
  key: "kesehatan" | "jht" | "jp" | "jkk" | "jkm"
  program: string
  group: "Kesehatan" | "Ketenagakerjaan"
  /** Dasar upah setelah batas atas (jika ada) */
  base: number
  employerRate: number
  employeeRate: number
  employer: number
  employee: number
}

export type BpjsResult = {
  lines: BpjsLine[]
  employerTotal: number
  employeeTotal: number
  grandTotal: number
  /** Iuran karyawan yang boleh dikurangkan dari penghasilan neto PPh 21 (JHT + JP) */
  employeeDeductibleForTax: number
  /** Premi yang dibayar perusahaan dan menjadi penghasilan bruto karyawan (Kesehatan + JKK + JKM) */
  employerTaxablePremium: number
}

export type BpjsInput = {
  /** Upah sebulan: gaji pokok + tunjangan tetap */
  wage: number
  jkkRate?: number
  includeKesehatan?: boolean
  includeKetenagakerjaan?: boolean
}

const pct = (base: number, rate: number) => Math.round((base * rate) / 100)

export function calculateBpjs({
  wage,
  jkkRate = DEFAULT_JKK_RATE,
  includeKesehatan = true,
  includeKetenagakerjaan = true,
}: BpjsInput): BpjsResult {
  const safeWage = Math.max(0, Math.floor(wage) || 0)
  const lines: BpjsLine[] = []

  if (includeKesehatan) {
    const base = Math.min(safeWage, BPJS_CONFIG.kesehatan.wageCap)
    const { employer: er, employee: ee } = BPJS_CONFIG.kesehatan
    lines.push({
      key: "kesehatan",
      program: "BPJS Kesehatan (JKN)",
      group: "Kesehatan",
      base,
      employerRate: er,
      employeeRate: ee,
      employer: pct(base, er),
      employee: pct(base, ee),
    })
  }

  if (includeKetenagakerjaan) {
    const jhtBase = safeWage
    const jpBase = Math.min(safeWage, BPJS_CONFIG.jp.wageCap)
    lines.push(
      {
        key: "jht",
        program: "Jaminan Hari Tua (JHT)",
        group: "Ketenagakerjaan",
        base: jhtBase,
        employerRate: BPJS_CONFIG.jht.employer,
        employeeRate: BPJS_CONFIG.jht.employee,
        employer: pct(jhtBase, BPJS_CONFIG.jht.employer),
        employee: pct(jhtBase, BPJS_CONFIG.jht.employee),
      },
      {
        key: "jp",
        program: "Jaminan Pensiun (JP)",
        group: "Ketenagakerjaan",
        base: jpBase,
        employerRate: BPJS_CONFIG.jp.employer,
        employeeRate: BPJS_CONFIG.jp.employee,
        employer: pct(jpBase, BPJS_CONFIG.jp.employer),
        employee: pct(jpBase, BPJS_CONFIG.jp.employee),
      },
      {
        key: "jkk",
        program: "Jaminan Kecelakaan Kerja (JKK)",
        group: "Ketenagakerjaan",
        base: safeWage,
        employerRate: jkkRate,
        employeeRate: 0,
        employer: pct(safeWage, jkkRate),
        employee: 0,
      },
      {
        key: "jkm",
        program: "Jaminan Kematian (JKM)",
        group: "Ketenagakerjaan",
        base: safeWage,
        employerRate: BPJS_CONFIG.jkm.employer,
        employeeRate: 0,
        employer: pct(safeWage, BPJS_CONFIG.jkm.employer),
        employee: 0,
      },
    )
  }

  const employerTotal = lines.reduce((sum, l) => sum + l.employer, 0)
  const employeeTotal = lines.reduce((sum, l) => sum + l.employee, 0)

  const employeeDeductibleForTax = lines
    .filter((l) => l.key === "jht" || l.key === "jp")
    .reduce((sum, l) => sum + l.employee, 0)

  const employerTaxablePremium = lines
    .filter((l) => l.key === "kesehatan" || l.key === "jkk" || l.key === "jkm")
    .reduce((sum, l) => sum + l.employer, 0)

  return {
    lines,
    employerTotal,
    employeeTotal,
    grandTotal: employerTotal + employeeTotal,
    employeeDeductibleForTax,
    employerTaxablePremium,
  }
}
