import type React from "react"
import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import AnnouncementBar from "@/components/announcement-bar"
import Footer from "@/components/footer"
import { AuthProvider } from "@/components/auth/auth-provider"
import { GoogleAnalytics } from "@/components/google-analytics"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
})

const SITE_URL = "https://www.hitopia.id"
const SITE_NAME = "Hitopia"
const DEFAULT_TITLE = "Hitopia - Premium On-Demand Staffing Agency | Remote Hiring"
const DEFAULT_DESCRIPTION =
  "Hitopia is a premium on-demand staffing agency offering remote, contract, and permanent hiring services. Connect with top global talent for your business needs."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "outsourcing",
    "staffing",
    "remote hiring",
    "contract staffing",
    "permanent hiring",
    "software development",
    "customer support",
    "data entry",
    "talent acquisition",
    "Hitopia",
  ],
  applicationName: SITE_NAME,
  generator: "Next.js",
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hitopia - Empowering Your Business With Top Talent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // Replace with your actual Google Search Console verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Hitopia",
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description: DEFAULT_DESCRIPTION,
              sameAs: [
                "https://www.linkedin.com/company/hitopia",
                "https://www.instagram.com/hitopia.id",
              ],
              address: {
                "@type": "PostalAddress",
                streetAddress: "Jl. Magna Timur No.106",
                addressLocality: "Bandung",
                postalCode: "40296",
                addressCountry: "ID",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "Customer Service",
                email: "hello@hitopia.id",
                availableLanguage: ["id", "en"],
              },
            }),
          }}
        />
        {/* JSON-LD LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Hitopia",
              image: `${SITE_URL}/og-image.jpg`,
              description: DEFAULT_DESCRIPTION,
              url: SITE_URL,
              telephone: "+62-XXX-XXXX-XXXX",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Jl. Magna Timur No.106",
                addressLocality: "Bandung",
                postalCode: "40296",
                addressCountry: "ID",
              },
              areaServed: ["ID", "SG", "MY", "TH", "PH", "US", "GB", "AU"],
              serviceType: [
                "Remote Hiring",
                "Contract Staffing",
                "Permanent Hiring",
                "Managed Solutions",
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${cormorantGaramond.variable} font-sans`}>
        <AuthProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
