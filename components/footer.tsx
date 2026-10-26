"use client"

import type React from "react"
import { Linkedin, Instagram, Phone, Mail, MessageCircle } from "lucide-react"
import Logo from "@/components/logo"

export default function Footer() {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      })
    } else {
      // Bukan di halaman utama (mis. /kalkulator): pindah ke halaman utama pada section tersebut
      window.location.href = `/${href}`
    }
  }

  return (
    <footer className="bg-secondary text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm">
              Summarecon Bandung
              <br />
              Jl. Magna Timur No.106 Bandung 40296
              <br />
              Indonesia
            </p>
            <div className="mt-4 space-y-2">
              <a href="mailto:business@hitopia.id" className="flex items-center gap-2 text-sm hover:text-primary">
                <Mail className="h-4 w-4" /> business@hitopia.id
              </a>
              <a href="tel:+6281235697181" className="flex items-center gap-2 text-sm hover:text-primary">
                <Phone className="h-4 w-4" /> +62 812-3569-7181
              </a>
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-serif text-xl font-semibold text-white">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#services" onClick={(e) => handleScrollTo(e, "#services")} className="hover:text-primary">
                  Remote Hiring
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScrollTo(e, "#services")} className="hover:text-primary">
                  Contract Staffing
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScrollTo(e, "#services")} className="hover:text-primary">
                  Permanent Hiring
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleScrollTo(e, "#services")} className="hover:text-primary">
                  Managed Solution
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-serif text-xl font-semibold text-white">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" onClick={(e) => handleScrollTo(e, "#about")} className="hover:text-primary">
                  About Us
                </a>
              </li>
              <li>
                <a href="#portfolio" onClick={(e) => handleScrollTo(e, "#portfolio")} className="hover:text-primary">
                  Portfolio
                </a>
              </li>
              <li>
                <a href="#blog" onClick={(e) => handleScrollTo(e, "#blog")} className="hover:text-primary">
                  Blog
                </a>
              </li>
              <li>
                <a href="#careers" onClick={(e) => handleScrollTo(e, "#careers")} className="hover:text-primary">
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 font-serif text-xl font-semibold text-white">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.linkedin.com/company/hitopia-id/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a
                href="https://www.instagram.com/hitopia.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} HITOPIA. All Rights Reserved.</p>
        </div>
      </div>
      <a
        href="https://wa.me/6281235697181"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </footer>
  )
}
