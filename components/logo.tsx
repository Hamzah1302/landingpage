import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

const HitopiaIcon = ({ className }: { className?: string }) => (
  <Image
    src="/images/hitopia-logo-new.png"
    alt="Hitopia Logo"
    width={32}
    height={32}
    className={cn("text-primary", className)}
  />
)

export default function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <HitopiaIcon />
      <span className="font-serif text-2xl font-semibold tracking-wider text-white">HITOPIA</span>
    </Link>
  )
}
