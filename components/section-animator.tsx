"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView, type HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface SectionAnimatorProps extends HTMLMotionProps<"section"> {
  children: React.ReactNode
}

export function SectionAnimator({ children, className, ...props }: SectionAnimatorProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <motion.section
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 75 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.5, delay: 0.1 }}
      {...props}
    >
      {children}
    </motion.section>
  )
}
