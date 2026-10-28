"use client"

import { useMemo, useState } from "react"
import { Trophy } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatNumber, formatPercent, formatRupiah } from "@/lib/calculators/format"
import {
  BPJS_MODES,
  compareOffers,
  type BpjsMode,
  type OfferInput,
  type OfferResult,
} from "@/lib/calculators/job-offer"
import { PTKP_STATUSES, type PtkpStatus } from "@/lib/calculators/pph21"
import { CalculatorDisclaimer, CurrencyInput, Field, FieldGroup, IntegerInput } from "./shared"

type OfferForm = {
  name: string
  fixedWage: number
  variablePay: number
  bonusMonths: string
  bpjsMode: BpjsMode
  otherBenefit: number
  distanceKm: number
  travelMinutes: number
  officeDays: string
}

const emptyOffer: OfferForm = {
  name: "",
  fixedWage: 0,
  variablePay: 0,
  bonusMonths: "1",
  bpjsMode: "both",
  otherBenefit: 0,
  distanceKm: 0,
  travelMinutes: 0,
  officeDays: "5",
}

const BONUS_OPTIONS = [
  { value: "0", label: "Tidak ada" },
  { value: "1", label: "1× gaji (hanya THR)" },
  { value: "2", label: "2× gaji" },
  { value: "3", label: "3× gaji" },
  { value: "4", label: "4× gaji" },
  { value: "6", label: "6× gaji" },
]

const OFFICE_DAY_OPTIONS = [
  { value: "5", label: "5 hari (full kantor)" },
  { value: "4", label: "4 hari kantor, 1 hari WFH" },
  { value: "3", label: "3 hari kantor, 2 hari WFH" },
  { value: "2", label: "2 hari kantor, 3 hari WFH" },
  { value: "1", label: "1 hari kantor, 4 hari WFH" },
  { value: "0", label: "Full WFH / remote" },
]

const toInput = (offer: OfferForm): OfferInput => ({
  name: offer.name,
  fixedWage: offer.fixedWage,
  variablePay: offer.variablePay,
  bonusMonths: Number(offer.bonusMonths),
  bpjsMode: offer.bpjsMode,
  otherBenefit: offer.otherBenefit,
  distanceKm: offer.distanceKm,
  travelMinutes: offer.travelMinutes,
  officeDaysPerWeek: Number(offer.officeDays),
})

export default function JobOfferCalculator() {
  const [status, setStatus] = useState<PtkpStatus>("TK/0")
  const [costPerKm, setCostPerKm] = useState(800)
  const [valuePerHour, setValuePerHour] = useState(0)
  const [offerA, setOfferA] = useState<OfferForm>(emptyOffer)
  const [offerB, setOfferB] = useState<OfferForm>(emptyOffer)

  const comparison = useMemo(
    () =>
      compareOffers(
        { ...toInput(offerA), name: offerA.name.trim() || "Tawaran A" },
        { ...toInput(offerB), name: offerB.name.trim() || "Tawaran B" },
        { status, costPerKm, valuePerHour },
      ),
    [offerA, offerB, status, costPerKm, valuePerHour],
  )

  const ready = offerA.fixedWage > 0 && offerB.fixedWage > 0
  const { a, b } = comparison
  const showTime = valuePerHour > 0

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-xl">Pengaturan Bersama</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <Field
            label="Status PTKP Anda"
            htmlFor="offer-status"
            hint="Dipakai menghitung PPh 21 untuk kedua tawaran."
          >
            <Select value={status} onValueChange={(v) => setStatus(v as PtkpStatus)}>
              <SelectTrigger id="offer-status" className="w-full">
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
            label="Biaya transport per km"
            htmlFor="offer-cost-km"
            hint="Perkiraan kasar termasuk BBM, parkir, dan perawatan. Motor ± Rp600–1.000, mobil ± Rp1.500–2.500."
          >
            <CurrencyInput id="offer-cost-km" value={costPerKm} onChange={setCostPerKm} />
          </Field>

          <Field
            label="Nilai 1 jam waktu Anda (opsional)"
            htmlFor="offer-time-value"
            hint="Isi bila ingin waktu di perjalanan ikut dihitung sebagai biaya. Kosongkan untuk mengabaikannya."
          >
            <CurrencyInput id="offer-time-value" value={valuePerHour} onChange={setValuePerHour} />
          </Field>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <OfferCard idPrefix="a" title="Tawaran A" placeholder="mis. PT Maju Jaya" value={offerA} onChange={setOfferA} />
        <OfferCard idPrefix="b" title="Tawaran B" placeholder="mis. Startup Nusantara" value={offerB} onChange={setOfferB} />
      </div>

      <Card className="calc-result">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Nilai Riil per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          {ready ? (
            <>
              <Verdict comparison={comparison} />

              <div className="mt-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Komponen</TableHead>
                      <TableHead className="text-right">{a.name}</TableHead>
                      <TableHead className="text-right">{b.name}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <Row label="Gaji pokok + tunjangan tetap" a={a.fixedWage} b={b.fixedWage} />
                    <Row
                      label="Penghasilan bruto rata-rata per bulan"
                      hint="Termasuk tunjangan tidak tetap dan bonus/THR dibagi 12"
                      a={a.grossPerMonth}
                      b={b.grossPerMonth}
                    />
                    <Row
                      label="Gaji bersih tunai per bulan"
                      hint="Setelah PPh 21 dan potongan BPJS karyawan, bonus/THR ikut dirata-ratakan"
                      a={a.netCashPerMonth}
                      b={b.netCashPerMonth}
                    />
                    <Row
                      label="Iuran BPJS ditanggung perusahaan"
                      hint="Nilai manfaat: Kesehatan, JHT, JP, JKK, JKM"
                      a={a.bpjsEmployerMonthly}
                      b={b.bpjsEmployerMonthly}
                    />
                    <Row label="Benefit lain (asuransi, dll.)" a={a.otherBenefit} b={b.otherBenefit} />
                    <Row
                      label="Biaya transport"
                      hint="Pulang-pergi × hari kerja di kantor"
                      a={-a.transportCost}
                      b={-b.transportCost}
                      negative
                    />
                    {showTime ? (
                      <Row label="Nilai waktu tempuh" a={-a.timeCost} b={-b.timeCost} negative />
                    ) : null}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="text-base font-bold text-white">Nilai riil per bulan</TableCell>
                      <TableCell className={`text-right text-xl font-extrabold tabular-nums ${a.realValue >= b.realValue ? "text-primary" : ""}`}>
                        {formatRupiah(a.realValue)}
                      </TableCell>
                      <TableCell className={`text-right text-xl font-extrabold tabular-nums ${b.realValue >= a.realValue ? "text-primary" : ""}`}>
                        {formatRupiah(b.realValue)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <WorkStyle result={a} />
                <WorkStyle result={b} />
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Isi gaji pokok + tunjangan tetap pada kedua tawaran untuk melihat perbandingan nilai riil.
            </p>
          )}

          <CalculatorDisclaimer>
            Nilai riil = gaji bersih tunai (setelah PPh 21 dan potongan BPJS karyawan, termasuk bonus/THR dirata-ratakan
            per bulan) + iuran BPJS yang ditanggung perusahaan + benefit lain − biaya transport − nilai waktu tempuh
            (bila diisi). PPh 21 dihitung dengan tarif Pasal 17 atas penghasilan setahun, termasuk premi BPJS yang
            dibayar perusahaan sebagai penghasilan bruto, sesuai kalkulator PPh 21 di situs ini. Iuran JHT dan JP
            karyawan dihitung sebagai potongan walau menjadi tabungan Anda sendiri, sehingga hasilnya konservatif.
            Perhitungan memakai 52 minggu per tahun, belum memasukkan biaya makan di kantor, peluang kenaikan gaji,
            kejelasan karier, maupun faktor non-uang lain. Tarif BPJS, batas upah, dan PTKP dapat berubah; gunakan
            sebagai bahan pertimbangan, bukan keputusan akhir.
          </CalculatorDisclaimer>
        </CardContent>
      </Card>
    </div>
  )
}

function OfferCard({
  idPrefix,
  title,
  placeholder,
  value,
  onChange,
}: {
  idPrefix: string
  title: string
  placeholder: string
  value: OfferForm
  onChange: (next: OfferForm) => void
}) {
  const set = <K extends keyof OfferForm>(key: K, v: OfferForm[K]) => onChange({ ...value, [key]: v })
  const id = (name: string) => `offer-${idPrefix}-${name}`
  const wfh = value.officeDays !== "5"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FieldGroup title="Tawaran">
          <Field label="Nama perusahaan (opsional)" htmlFor={id("name")}>
            <Input
              id={id("name")}
              autoComplete="off"
              maxLength={30}
              placeholder={placeholder}
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
        </FieldGroup>

        <FieldGroup title="Penghasilan">
          <Field label="Gaji pokok + tunjangan tetap (per bulan)" htmlFor={id("wage")}>
            <CurrencyInput id={id("wage")} value={value.fixedWage} onChange={(v) => set("fixedWage", v)} placeholder="mis. 10.000.000" />
          </Field>

          <Field
            label="Tunjangan tidak tetap (per bulan)"
            htmlFor={id("variable")}
            hint="Uang makan, transport, tunjangan WFH, dan sejenisnya. Opsional."
          >
            <CurrencyInput id={id("variable")} value={value.variablePay} onChange={(v) => set("variablePay", v)} />
          </Field>

          <Field label="Bonus & THR setahun" htmlFor={id("bonus")} hint="Dalam kelipatan gaji pokok + tunjangan tetap.">
            <Select value={value.bonusMonths} onValueChange={(v) => set("bonusMonths", v)}>
              <SelectTrigger id={id("bonus")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BONUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <FieldGroup title="Benefit">
          <Field label="BPJS dari perusahaan" htmlFor={id("bpjs")}>
            <Select value={value.bpjsMode} onValueChange={(v) => set("bpjsMode", v as BpjsMode)}>
              <SelectTrigger id={id("bpjs")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BPJS_MODES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Benefit lain (per bulan)"
            htmlFor={id("benefit")}
            hint="Nilai asuransi swasta, subsidi kantin, tunjangan keluarga di luar gaji, dll. Opsional."
          >
            <CurrencyInput id={id("benefit")} value={value.otherBenefit} onChange={(v) => set("otherBenefit", v)} />
          </Field>
        </FieldGroup>

        <FieldGroup title="Lokasi & pola kerja">
          <Field label="Hari kerja di kantor" htmlFor={id("office")}>
            <Select value={value.officeDays} onValueChange={(v) => set("officeDays", v)}>
              <SelectTrigger id={id("office")} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFICE_DAY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {value.officeDays !== "0" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Jarak sekali jalan" htmlFor={id("distance")}>
                <IntegerInput id={id("distance")} value={value.distanceKm} onChange={(v) => set("distanceKm", v)} max={300} suffix="km" />
              </Field>
              <Field label="Waktu sekali jalan" htmlFor={id("minutes")}>
                <IntegerInput id={id("minutes")} value={value.travelMinutes} onChange={(v) => set("travelMinutes", v)} max={300} suffix="menit" />
              </Field>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Remote penuh: tidak ada biaya transport dan waktu tempuh.</p>
          )}
          {wfh && value.officeDays !== "0" ? (
            <p className="text-xs text-muted-foreground">Hari WFH otomatis tidak dikenai biaya transport.</p>
          ) : null}
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function Row({
  label,
  hint,
  a,
  b,
  negative = false,
}: {
  label: string
  hint?: string
  a: number
  b: number
  negative?: boolean
}) {
  const cls = negative ? "text-red-400" : ""
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-white">{label}</div>
        {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
      </TableCell>
      <TableCell className={`text-right tabular-nums ${a < 0 ? cls : ""}`}>{formatRupiah(a)}</TableCell>
      <TableCell className={`text-right tabular-nums ${b < 0 ? cls : ""}`}>{formatRupiah(b)}</TableCell>
    </TableRow>
  )
}

function WorkStyle({ result }: { result: OfferResult }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm">
      <p className="font-semibold text-white">{result.name}</p>
      <dl className="mt-2 space-y-1 text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>Hari di kantor per bulan</dt>
          <dd className="tabular-nums">{formatNumber(result.officeDaysPerMonth)} hari</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Hari WFH per bulan</dt>
          <dd className="tabular-nums">{formatNumber(result.wfhDaysPerMonth)} hari</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Waktu di perjalanan per bulan</dt>
          <dd className="tabular-nums">{new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(result.travelHoursPerMonth)} jam</dd>
        </div>
      </dl>
    </div>
  )
}

function Verdict({ comparison }: { comparison: ReturnType<typeof compareOffers> }) {
  const { a, b, winner, grossWinner, diff, diffPercent } = comparison
  const max = Math.max(a.realValue, b.realValue, 1)
  const winnerResult = winner === "a" ? a : b
  const loserResult = winner === "a" ? b : a

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-primary/40 bg-primary/10 p-4">
        <div className="flex items-start gap-3">
          <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          {winner === "tie" ? (
            <p className="text-sm text-white">Kedua tawaran memberi nilai riil yang praktis sama per bulan.</p>
          ) : (
            <div className="text-sm text-white">
              <p>
                <span className="font-semibold">{winnerResult.name}</span> lebih unggul{" "}
                <span className="font-semibold text-primary">{formatRupiah(Math.abs(diff))}</span> per bulan (
                {formatPercent(diffPercent)}) atau sekitar {formatRupiah(Math.abs(diff) * 12)} setahun dibanding{" "}
                {loserResult.name}.
              </p>
              {grossWinner !== "tie" && grossWinner !== winner ? (
                <p className="mt-2 text-muted-foreground">
                  Menariknya, penghasilan bruto {grossWinner === "a" ? a.name : b.name} justru lebih tinggi. Selisih
                  nilai riil berasal dari pajak, potongan BPJS, benefit, dan biaya transport.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3" aria-hidden="true">
        {[a, b].map((r, i) => (
          <div key={i}>
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{r.name}</span>
              <span className="tabular-nums">{formatRupiah(r.realValue)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(2, (Math.max(0, r.realValue) / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
