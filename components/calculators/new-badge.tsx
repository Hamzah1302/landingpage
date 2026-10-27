import { cn } from "@/lib/utils"

/** Lencana "Baru" untuk kalkulator yang baru dirilis. */
export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground",
        className,
      )}
    >
      Baru
    </span>
  )
}
