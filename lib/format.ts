const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 })

export function formatRupiah(value: number): string {
  return rupiahFormatter.format(Math.round(value)).replace(/\s/g, " ")
}

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value))
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value)}%`
}
