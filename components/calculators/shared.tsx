"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { formatRupiah } from "@/lib/calculators/format"

const MAX_DIGITS = 13

/** Input nominal Rupiah dengan pemisah ribuan otomatis. `value` dan `onChange` berupa angka. */
export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = "0",
  className,
}: {
  id?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}) {
  const display = value > 0 ? new Intl.NumberFormat("id-ID").format(value) : ""

  return (
    <div className={cn("relative", className)}>
      <span className="calc-prefix pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-semibold text-slate-600">
        Rp
      </span>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        className="pl-11"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS)
          onChange(digits ? Number(digits) : 0)
        }}
      />
    </div>
  )
}

/** Input angka bulat (mis. tahun, bulan, hari, km) dengan satuan di sisi kanan. */
export function IntegerInput({
  id,
  value,
  onChange,
  max = 999,
  suffix,
  placeholder = "0",
  className,
}: {
  id?: string
  value: number
  onChange: (value: number) => void
  max?: number
  suffix?: string
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        className={suffix ? "pr-16" : undefined}
        value={value > 0 ? String(value) : ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, String(max).length)
          onChange(digits ? Math.min(max, Number(digits)) : 0)
        }}
      />
      {suffix ? (
        <span className="calc-prefix pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-sm font-semibold text-slate-600">
          {suffix}
        </span>
      ) : null}
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-white">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function ResultRow({
  label,
  value,
  strong = false,
  muted = false,
  negative = false,
}: {
  label: React.ReactNode
  value: number | string
  strong?: boolean
  muted?: boolean
  negative?: boolean
}) {
  const text = typeof value === "number" ? formatRupiah(value) : value
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-2 text-sm",
        strong ? "border-t border-primary/30 pt-3 text-base font-semibold text-white" : "text-muted-foreground",
        muted && "text-xs",
      )}
    >
      <span>{label}</span>
      <span className={cn("shrink-0 text-right tabular-nums", strong && "text-primary", negative && "text-red-400")}>
        {text}
      </span>
    </div>
  )
}

export function CalculatorDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 rounded-md border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}