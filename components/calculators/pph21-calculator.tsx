"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateBpjs, DEFAULT_JKK_RATE, JKK_RISK_LEVELS } from "@/lib/calculators/bpjs"
import { formatPercent, formatRupiah } from "@/lib/calculators/format"
import {
  calculateAnnual,
  calculateMonthlyTer,
  getPtkpInfo,
  PTKP_STATUSES,
  type PtkpStatus,
} from "@/lib/calculators/pph21"
import { CalculatorDisclaimer, CurrencyInput, Field, ResultRow } from "./shared"

export default function Pph21Calculator() {
  const [status, setStatus] = useState<PtkpStatus>("TK/0")
  const [fixedWage, setFixedWage] = useState(0) // gaji pokok + tunjangan tetap
  const [variablePay, setVariablePay] = useState(0) // tunjangan tidak tetap / bulan
  const [annualExtra, setAnnualExtra] = useState(0) // bonus/THR setahun (mode Desember)
  const [withBpjs, setWithBpjs] = useState(true)
  const [jkk, setJkk] = useState(String(DEFAULT_JKK_RATE))

  const calc = useMemo(() => {
    const bpjs = calculateBpjs({
      wage: fixedWage,
      jkkRate: Number(jkk),
      includeKesehatan: withBpjs,
      includeKetenagakerjaan: withBpjs,
    })

    const cashGross = fixedWage + variablePay
    // Premi Kesehatan, JKK, dan JKM yang dibayar perusahaan termasuk penghasilan bruto karyawan.
    const taxableGross = cashGross + bpjs.employerTaxablePremium

    const monthly = calculateMonthlyTer(status, taxableGross)
    const takeHome = cashGross - bpjs.employeeTotal - monthly.tax

    const annual = calculateAnnual({
      status,
      monthlyGross: taxableGross,
      annualExtra,
      monthlyPensionContribution: bpjs.employeeDeductibleForTax,
    })

    return { bpjs, cashGross, taxableGross, monthly, takeHome, annual }
  }, [status, fixedWage, variablePay, annualExtra, withBpjs, jkk])

  const ptkp = getPtkpInfo(status)
  const hasInput = fixedWage + variablePay > 0

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field label="Status PTKP" htmlFor="pph-status" hint={`PTKP setahun ${formatRupiah(ptkp.ptkp)} · TER kategori ${ptkp.category}`}>
            <Select value={status} onValueChange={(v) => setStatus(v as PtkpStatus)}>
              <SelectTrigger id="pph-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PTKP_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Gaji pokok + tunjangan tetap (per bulan)"
            htmlFor="pph-fixed"
            hint="Menjadi dasar perhitungan iuran BPJS."
          >
            <CurrencyInput id="pph-fixed" value={fixedWage} onChange={setFixedWage} placeholder="mis. 10.000.000" />
          </Field>

          <Field
            label="Tunjangan tidak tetap / lembur (per bulan)"
            htmlFor="pph-variable"
            hint="Opsional. Dihitung sebagai penghasilan bruto, bukan dasar BPJS."
          >
            <CurrencyInput id="pph-variable" value={variablePay} onChange={setVariablePay} />
          </Field>

          <div className="space-y-4 rounded-md border border-white/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <label htmlFor="pph-bpjs" className="text-sm font-medium text-white">
                  Terdaftar BPJS Kesehatan &amp; Ketenagakerjaan
                </label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Premi yang dibayar perusahaan (Kesehatan, JKK, JKM) ditambahkan ke penghasilan bruto. Iuran JHT &amp; JP
                  karyawan mengurangi penghasilan neto setahun.
                </p>
              </div>
              <Switch id="pph-bpjs" checked={withBpjs} onCheckedChange={setWithBpjs} />
            </div>

            {withBpjs ? (
              <Field label="Kelompok risiko JKK" htmlFor="pph-jkk">
                <Select value={jkk} onValueChange={setJkk}>
                  <SelectTrigger id="pph-jkk" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JKK_RISK_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="calc-result lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Hasil Perhitungan</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bulanan">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bulanan">Januari–November (TER)</TabsTrigger>
              <TabsTrigger value="desember">Desember / Tahunan</TabsTrigger>
            </TabsList>

            <TabsContent value="bulanan" className="mt-4">
              {hasInput ? (
                <div>
                  <ResultRow label="Penghasilan bruto tunai" value={calc.cashGross} />
                  {withBpjs ? (
                    <ResultRow
                      label="Premi BPJS ditanggung perusahaan (Kesehatan, JKK, JKM)"
                      value={calc.bpjs.employerTaxablePremium}
                    />
                  ) : null}
                  <ResultRow label="Penghasilan bruto untuk TER" value={calc.taxableGross} />
                  <ResultRow
                    label={`Tarif efektif bulanan (kategori ${calc.monthly.category})`}
                    value={formatPercent(calc.monthly.rate)}
                  />
                  <ResultRow label="PPh 21 per bulan" value={calc.monthly.tax} strong />
                  <div className="mt-4">
                    <ResultRow label="Potongan BPJS karyawan" value={calc.bpjs.employeeTotal} muted />
                    <ResultRow label="Estimasi gaji bersih (take-home)" value={calc.takeHome} strong />
                  </div>
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="desember" className="mt-4">
              <div className="mb-4">
                <Field
                  label="Bonus / THR / penghasilan tidak teratur setahun"
                  htmlFor="pph-extra"
                  hint="Opsional. Dianggap dibayar di bulan Desember untuk estimasi di bawah."
                >
                  <CurrencyInput id="pph-extra" value={annualExtra} onChange={setAnnualExtra} />
                </Field>
              </div>

              {hasInput ? (
                <div>
                  <ResultRow label="Penghasilan bruto setahun" value={calc.annual.annualGross} />
                  <ResultRow label="Biaya jabatan (5%, maks Rp6.000.000)" value={-calc.annual.jobCost} />
                  {withBpjs ? (
                    <ResultRow label="Iuran JHT & JP karyawan setahun" value={-calc.annual.pensionContribution} />
                  ) : null}
                  <ResultRow label="Penghasilan neto setahun" value={calc.annual.netIncome} />
                  <ResultRow label={`PTKP (${status})`} value={-calc.annual.ptkp} />
                  <ResultRow label="Penghasilan Kena Pajak (PKP)" value={calc.annual.pkp} />

                  {calc.annual.layers.length > 0 ? (
                    <div className="my-2 space-y-1 rounded-md bg-white/5 p-3">
                      {calc.annual.layers.map((layer) => (
                        <ResultRow
                          key={layer.rate}
                          muted
                          label={`${formatPercent(layer.rate)} × ${formatRupiah(layer.amount)}`}
                          value={layer.tax}
                        />
                      ))}
                    </div>
                  ) : null}

                  <ResultRow label="PPh 21 terutang setahun" value={calc.annual.annualTax} strong />
                  <ResultRow label="Sudah dipotong Januari–November (11 × TER)" value={-calc.annual.paidJanToNov} />
                  <ResultRow
                    label={calc.annual.decemberTax >= 0 ? "PPh 21 yang dipotong di Desember" : "Lebih potong (dikembalikan/dikompensasi)"}
                    value={Math.abs(calc.annual.decemberTax)}
                    strong
                    negative={calc.annual.decemberTax < 0}
                  />
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </Tabs>

          <CalculatorDisclaimer>
            Estimasi untuk pegawai tetap dengan NPWP, berdasarkan PP 58/2023 dan PMK 168/2023: TER bulanan untuk masa
            Januari–November, tarif Pasal 17 untuk masa pajak terakhir. Menggunakan asumsi bekerja 12 bulan dengan
            penghasilan tetap yang sama tiap bulan, dan belum mencakup status K/I, pegawai tanpa NPWP, insentif PPh 21
            ditanggung pemerintah (DTP), maupun penghasilan dari pemberi kerja lain. Konsultasikan dengan konsultan pajak
            atau bagian payroll untuk keputusan resmi.
          </CalculatorDisclaimer>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState() {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      Masukkan gaji dan pilih status PTKP untuk melihat hasil perhitungan.
    </p>
  )
}
