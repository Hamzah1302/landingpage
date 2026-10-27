"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateBpjs, JKK_RISK_LEVELS, BPJS_CONFIG } from "@/lib/calculators/bpjs"
import { formatPercent, formatRupiah } from "@/lib/calculators/format"
import { CalculatorDisclaimer, CurrencyInput, Field, ResultRow } from "./shared"

export default function BpjsCalculator() {
  const [wage, setWage] = useState(0)
  const [jkk, setJkk] = useState("0.24")
  const [kesehatan, setKesehatan] = useState(true)
  const [ketenagakerjaan, setKetenagakerjaan] = useState(true)

  const result = useMemo(
    () =>
      calculateBpjs({
        wage,
        jkkRate: Number(jkk),
        includeKesehatan: kesehatan,
        includeKetenagakerjaan: ketenagakerjaan,
      }),
    [wage, jkk, kesehatan, ketenagakerjaan],
  )

  const hasResult = wage > 0 && result.lines.length > 0

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Data Karyawan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Field
            label="Upah sebulan"
            htmlFor="bpjs-wage"
            hint="Gaji pokok + tunjangan tetap. Tunjangan tidak tetap (uang makan, transport harian, lembur) tidak dihitung."
          >
            <CurrencyInput id="bpjs-wage" value={wage} onChange={setWage} placeholder="mis. 8.000.000" />
          </Field>

          <div className="flex items-center justify-between gap-4">
            <label htmlFor="bpjs-kes" className="text-sm font-medium text-white">
              BPJS Kesehatan
            </label>
            <Switch id="bpjs-kes" checked={kesehatan} onCheckedChange={setKesehatan} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label htmlFor="bpjs-tk" className="text-sm font-medium text-white">
              BPJS Ketenagakerjaan
            </label>
            <Switch id="bpjs-tk" checked={ketenagakerjaan} onCheckedChange={setKetenagakerjaan} />
          </div>

          {ketenagakerjaan ? (
            <Field
              label="Kelompok risiko JKK"
              htmlFor="bpjs-jkk"
              hint={JKK_RISK_LEVELS.find((l) => l.value === jkk)?.example}
            >
              <Select value={jkk} onValueChange={setJkk}>
                <SelectTrigger id="bpjs-jkk" className="w-full">
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
        </CardContent>
      </Card>

      <Card className="calc-result lg:col-span-3">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Rincian Iuran per Bulan</CardTitle>
        </CardHeader>
        <CardContent>
          {hasResult ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Program</TableHead>
                      <TableHead className="text-right">Perusahaan</TableHead>
                      <TableHead className="text-right">Karyawan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.lines.map((line) => (
                      <TableRow key={line.key}>
                        <TableCell>
                          <div className="font-medium text-white">{line.program}</div>
                          <div className="text-xs text-muted-foreground">
                            Dasar {formatRupiah(line.base)}
                            {line.base < wage ? " (dibatasi batas upah)" : ""}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatRupiah(line.employer)}
                          <div className="text-xs text-muted-foreground">{formatPercent(line.employerRate)}</div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {line.employeeRate > 0 ? formatRupiah(line.employee) : "–"}
                          <div className="text-xs text-muted-foreground">
                            {line.employeeRate > 0 ? formatPercent(line.employeeRate) : ""}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatRupiah(result.employerTotal)}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatRupiah(result.employeeTotal)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              <div className="mt-4">
                <ResultRow label="Potongan dari gaji karyawan" value={result.employeeTotal} />
                <ResultRow label="Biaya perusahaan (di luar gaji)" value={result.employerTotal} />
                <ResultRow label="Total iuran (perusahaan + karyawan)" value={result.grandTotal} strong />
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Masukkan upah sebulan dan pilih program untuk melihat rincian iuran.
            </p>
          )}

          <CalculatorDisclaimer>
            Dasar perhitungan: BPJS Kesehatan 5% (perusahaan 4%, karyawan 1%) dengan batas upah{" "}
            {formatRupiah(BPJS_CONFIG.kesehatan.wageCap)}; JHT 5,7% (perusahaan 3,7%, karyawan 2%) tanpa batas upah; JP
            3% (perusahaan 2%, karyawan 1%) dengan batas upah {formatRupiah(BPJS_CONFIG.jp.wageCap)} (berlaku sejak 1
            Maret 2026); JKK 0,24%–1,74% dan JKM 0,3% ditanggung perusahaan. Iuran JKP tidak dipotong dari karyawan.
            Hasil merupakan estimasi, tarif dan batas upah dapat berubah. Cek ketentuan resmi BPJS sebelum dipakai untuk
            payroll.
          </CalculatorDisclaimer>
        </CardContent>
      </Card>
    </div>
  )
}
