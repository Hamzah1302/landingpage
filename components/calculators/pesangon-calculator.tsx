"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { formatRupiah } from "@/lib/calculators/format"
import {
  calculateSeverance,
  describePesangonBand,
  describeUpmkBand,
  getSeveranceReason,
  SEVERANCE_REASON_GROUPS,
  SEVERANCE_REASONS,
  type SeveranceReasonKey,
} from "@/lib/calculators/pesangon"
import { CalculatorDisclaimer, CurrencyInput, Field, IntegerInput, ResultRow } from "./shared"

const factorText = (factor: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(factor)

export default function PesangonCalculator() {
  const [reason, setReason] = useState<SeveranceReasonKey>("efisiensi-rugi")
  const [wage, setWage] = useState(0)
  const [years, setYears] = useState(0)
  const [months, setMonths] = useState(0)
  const [leaveDays, setLeaveDays] = useState(0)
  const [workDays, setWorkDays] = useState("21")
  const [relocation, setRelocation] = useState(0)
  const [otherRights, setOtherRights] = useState(0)
  const [showTax, setShowTax] = useState(true)

  const selected = getSeveranceReason(reason)

  const result = useMemo(
    () =>
      calculateSeverance({
        reason,
        wage,
        yearsOfService: years,
        monthsOfService: months,
        unusedLeaveDays: leaveDays,
        workDaysPerMonth: Number(workDays),
        relocationCost: relocation,
        otherRights,
      }),
    [reason, wage, years, months, leaveDays, workDays, relocation, otherRights],
  )

  const hasResult = wage > 0
  const entitledToUp = selected.upFactor > 0
  const entitledToUpmk = selected.upmkFactor > 0 && result.upmkMonths > 0

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field
            label="Alasan PHK"
            htmlFor="pesangon-reason"
            hint={
              <>
                <span className="font-medium text-white">
                  {selected.article} PP 35/2021 · pesangon {factorText(selected.upFactor)}× · UPMK{" "}
                  {factorText(selected.upmkFactor)}×.
                </span>{" "}
                {selected.note}
              </>
            }
          >
            <Select value={reason} onValueChange={(v) => setReason(v as SeveranceReasonKey)}>
              <SelectTrigger id="pesangon-reason" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERANCE_REASON_GROUPS.map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {SEVERANCE_REASONS.filter((r) => r.group === group).map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Gaji pokok + tunjangan tetap (per bulan)"
            htmlFor="pesangon-wage"
            hint="Upah terakhir sebagai dasar hitung. Bonus, lembur, dan uang makan berdasarkan kehadiran tidak dihitung."
          >
            <CurrencyInput id="pesangon-wage" value={wage} onChange={setWage} placeholder="mis. 10.000.000" />
          </Field>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-white">Masa kerja</span>
            <div className="grid grid-cols-2 gap-3">
              <IntegerInput id="pesangon-years" value={years} onChange={setYears} max={60} suffix="tahun" />
              <IntegerInput id="pesangon-months" value={months} onChange={setMonths} max={11} suffix="bulan" />
            </div>
            <p className="text-xs text-muted-foreground">
              Hitung dari tanggal mulai bekerja sampai tanggal efektif PHK. Masa kerja tidak dibulatkan ke atas.
            </p>
          </div>

          <div className="space-y-4 rounded-md border border-white/10 p-4">
            <div>
              <p className="text-sm font-medium text-white">Uang Penggantian Hak (UPH)</p>
              <p className="mt-1 text-xs text-muted-foreground">Opsional. Isi bila ada hak yang belum diterima.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Sisa cuti (hari)" htmlFor="pesangon-leave">
                <IntegerInput id="pesangon-leave" value={leaveDays} onChange={setLeaveDays} max={60} suffix="hari" />
              </Field>
              <Field label="Pola kerja" htmlFor="pesangon-workdays">
                <Select value={workDays} onValueChange={setWorkDays}>
                  <SelectTrigger id="pesangon-workdays" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21">5 hari/minggu</SelectItem>
                    <SelectItem value="25">6 hari/minggu</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field
              label="Ongkos pulang pekerja & keluarga"
              htmlFor="pesangon-relocation"
              hint="Ke tempat pekerja diterima bekerja, bila berlaku."
            >
              <CurrencyInput id="pesangon-relocation" value={relocation} onChange={setRelocation} />
            </Field>
          </div>

          <Field
            label="Uang pisah / hak lain sesuai PK, PP, atau PKB"
            htmlFor="pesangon-other"
            hint="Opsional. Mis. uang pisah pada resign atau mangkir bila diatur di perusahaan."
          >
            <CurrencyInput id="pesangon-other" value={otherRights} onChange={setOtherRights} />
          </Field>

          <div className="flex items-start justify-between gap-4">
            <div>
              <label htmlFor="pesangon-tax" className="text-sm font-medium text-white">
                Tampilkan estimasi PPh 21
              </label>
              <p className="mt-1 text-xs text-muted-foreground">Tarif final pesangon yang dibayar sekaligus.</p>
            </div>
            <Switch id="pesangon-tax" checked={showTax} onCheckedChange={setShowTax} />
          </div>
        </CardContent>
      </Card>

      <Card className="calc-result lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Rincian Hak PHK</CardTitle>
        </CardHeader>
        <CardContent>
          {hasResult ? (
            <>
              <div>
                <ResultRow label="Dasar upah sebulan" value={result.wage} />
                <ResultRow
                  muted
                  label={`Masa kerja ${years} tahun ${months} bulan`}
                  value={`Tabel pesangon: ${describePesangonBand(result.totalMonthsOfService)}`}
                />
              </div>

              <div className="mt-4 rounded-md bg-white/5 p-3">
                <p className="text-sm font-semibold text-white">Uang Pesangon (UP)</p>
                {entitledToUp ? (
                  <>
                    <ResultRow
                      muted
                      label={`${result.pesangonMonths} bulan upah × ${factorText(selected.upFactor)} (${selected.article})`}
                      value={result.pesangonBase}
                    />
                    <ResultRow label="Uang pesangon" value={result.pesangon} strong />
                  </>
                ) : (
                  <p className="py-2 text-sm text-muted-foreground">
                    Tidak berhak atas uang pesangon untuk alasan PHK ini.
                  </p>
                )}
              </div>

              <div className="mt-3 rounded-md bg-white/5 p-3">
                <p className="text-sm font-semibold text-white">Uang Penghargaan Masa Kerja (UPMK)</p>
                {selected.upmkFactor === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    Tidak berhak atas UPMK untuk alasan PHK ini.
                  </p>
                ) : result.upmkMonths === 0 ? (
                  <p className="py-2 text-sm text-muted-foreground">
                    UPMK baru diberikan untuk masa kerja minimal 3 tahun.
                  </p>
                ) : (
                  <>
                    <ResultRow
                      muted
                      label={`${result.upmkMonths} bulan upah × ${factorText(selected.upmkFactor)} (masa kerja ${describeUpmkBand(result.totalMonthsOfService)})`}
                      value={result.upmkBase}
                    />
                    <ResultRow label="Uang penghargaan masa kerja" value={result.upmk} strong />
                  </>
                )}
              </div>

              <div className="mt-3 rounded-md bg-white/5 p-3">
                <p className="text-sm font-semibold text-white">Uang Penggantian Hak (UPH)</p>
                <ResultRow
                  muted
                  label={`Cuti belum diambil (${leaveDays} hari ÷ ${workDays} hari kerja × upah)`}
                  value={result.leavePay}
                />
                <ResultRow muted label="Ongkos pulang" value={result.relocationCost} />
                <ResultRow label="Uang penggantian hak" value={result.uph} strong />
              </div>

              <div className="mt-4">
                {result.otherRights > 0 ? <ResultRow label="Uang pisah / hak lain" value={result.otherRights} /> : null}
                <ResultRow label="Total hak sebelum pajak" value={result.total} strong />
                {showTax ? (
                  <>
                    <ResultRow
                      muted
                      label={
                        <>
                          Estimasi PPh 21 final atas pesangon + UPMK ({formatRupiah(result.taxableBase)})
                        </>
                      }
                      value={-result.tax}
                      negative
                    />
                    <ResultRow label="Estimasi diterima setelah pajak" value={result.netAfterTax} strong />
                  </>
                ) : null}
              </div>

              {!entitledToUp && !entitledToUpmk && result.uph + result.otherRights === 0 ? (
                <p className="mt-4 rounded-md border border-white/10 p-3 text-sm text-muted-foreground">
                  Untuk alasan ini, hak yang tersisa hanya UPH (mis. sisa cuti) dan uang pisah bila diatur. Isi kolom UPH
                  di sebelah kiri untuk melihat estimasinya.
                </p>
              ) : null}
            </>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Pilih alasan PHK, lalu masukkan upah dan masa kerja untuk melihat rincian pesangon.
            </p>
          )}

          <CalculatorDisclaimer>
            Estimasi untuk karyawan tetap (PKWTT) berdasarkan PP 35/2021 Pasal 40–57 dan UU 6/2023. Karyawan kontrak
            (PKWT) berhak atas uang kompensasi, bukan pesangon. Putusan MK 168/PUU-XXI/2023 membaca tabel pesangon
            sebagai jumlah paling sedikit, sehingga PK/PP/PKB atau kesepakatan dapat memberi lebih dari hasil di sini.
            Komponen UPH 15% (perumahan dan pengobatan) sudah tidak berlaku sebagai hak otomatis. Alasan PHK tertentu,
            seperti pekerja ditahan, belum tercakup. Pajak dihitung dengan tarif final PP 68/2009 jo. PMK 16/2010
            (0% sampai Rp50 juta, 5% sampai Rp100 juta, 15% sampai Rp500 juta, 25% di atasnya) atas pesangon dan UPMK
            yang dibayar sekaligus; UPH dan hak lain tidak dihitung dalam pajak ini. JHT dan JKP dari BPJS
            Ketenagakerjaan tidak termasuk. Proses PHK yang diperselisihkan mengikuti ketentuan penyelesaian
            perselisihan hubungan industrial.
          </CalculatorDisclaimer>
        </CardContent>
      </Card>
    </div>
  )
}
