"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Briefcase, Users, Home, Info, Settings, Phone, BookOpen, Calculator } from "lucide-react"
import { cn } from "@/lib/utils"
import Logo from "@/components/logo"

const isHashLink = (href: string) => href.startsWith("#")

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  /** Awalan path halaman lain yang juga membuat menu ini menyala (mis. /kalkulator). */
  activePath?: string
}

const navItems: NavItem[] = [
  { href: "#home", label: "Home", icon: Home },
  { href: "#about", label: "About Us", icon: Info },
  { href: "#services", label: "Services", icon: Settings },
  { href: "#portfolio", label: "Portfolio", icon: Briefcase },
  { href: "#articles", label: "Articles", icon: BookOpen },
  { href: "#tools", label: "Kalkulator", icon: Calculator, activePath: "/kalkulator" },
  { href: "#careers", label: "Careers", icon: Users },
]

/** Section yang dipantau saat scroll di halaman utama, berurutan sesuai posisi di halaman. */
const spySections = navItems.filter((item) => isHashLink(item.href)).map((item) => item.href)

export default function Header() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [activeSection, setActiveSection] = useState("#home")
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    if (!isHome) return

    const handleScroll = () => {
      const sections = spySections.map((id) => document.querySelector(id) as HTMLElement | null)
      const scrollPosition = window.scrollY + 150 // Offset for better accuracy

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(spySections[i])
          break
        }
      }
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHome])

  // Link hash (#careers) hanya valid di halaman utama; di halaman lain arahkan ke "/#careers"
  const resolveHref = (href: string) => (isHashLink(href) && !isHome ? `/${href}` : href)

  // Menu hash menyala saat section-nya terlihat di halaman utama. Menu dengan activePath (Kalkulator)
  // juga menyala di halaman kalkulator itu sendiri.
  const isActive = (href: string, activePath?: string) =>
    (isHashLink(href) && isHome && activeSection === href) ||
    (!!activePath && (pathname === activePath || pathname.startsWith(`${activePath}/`)))

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsSheetOpen(false) // Close mobile menu on click
    if (isHashLink(href) && isHome) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({
        behavior: "smooth",
      })
      setActiveSection(href)
    }
  }

  const NavLink = ({ href, label, activePath }: NavItem) => {
    const active = isActive(href, activePath)
    return (
      <Link
        href={resolveHref(href)}
        onClick={(e) => handleNavClick(e, href)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </Link>
    )
  }

  const MobileNavLink = ({ href, label, icon: Icon, activePath }: NavItem) => (
    <Link
      href={resolveHref(href)}
      onClick={(e) => handleNavClick(e, href)}
      aria-current={isActive(href, activePath) ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary",
        isActive(href, activePath) ? "text-primary bg-secondary" : "",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.label} {...item} />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            <Link href={resolveHref("#contact")} onClick={(e) => handleNavClick(e, "#contact")}>
              Contact Us
            </Link>
          </Button>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden border-white/20 text-white bg-transparent">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l-white/10">
              <div className="grid gap-4 py-6">
                <Logo />
                {navItems.map((item) => (
                  <MobileNavLink key={item.label} {...item} />
                ))}
                <Link
                  href={resolveHref("#contact")}
                  onClick={(e) => handleNavClick(e, "#contact")}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-secondary",
                    isActive("#contact") ? "text-primary bg-secondary" : "",
                  )}
                >
                  <Phone className="h-5 w-5" />
                  Contact Us
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
