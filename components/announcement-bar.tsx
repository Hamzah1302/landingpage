"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, X } from "lucide-react"

/** Ganti versi ini saat ada pengumuman baru agar banner muncul lagi untuk pengunjung yang pernah menutupnya. */
const STORAGE_KEY = "hitopia-banner-kalkulator-baru-"

export default function AnnouncementBar() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== "closed")
    } catch {
      setVisible(true)
    }
  }, [])

  // Tidak ditampilkan di halaman kalkulator (sudah relevan) dan area admin.
  if (!visible || pathname.startsWith("/kalkulator") || pathname.startsWith("/admin")) return null

  const close = () => {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, "closed")
    } catch {
      /* abaikan bila storage tidak tersedia */
    }
  }

  return (
    <div className="relative bg-primary text-primary-foreground" role="region" aria-label="Pengumuman">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-10 py-2.5 text-sm sm:px-12">
        <span className="shrink-0 rounded-full bg-primary-foreground px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          Baru
        </span>
        <p className="min-w-0 text-center font-medium leading-snug">
          <span className="hidden sm:inline">4 kalkulator gratis kini tersedia: PPh 21, BPJS, Pesangon, dan Bandingkan 2 Tawaran Kerja.</span>
          <span className="sm:hidden">4 kalkulator gratis kini tersedia</span>
        </p>
        <Link
          href="/#tools"
          className="group inline-flex shrink-0 items-center gap-1 font-semibold underline-offset-4 hover:underline"
        >
          Coba sekarang
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Tutup pengumuman"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors hover:bg-primary-foreground/15 sm:right-4"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
