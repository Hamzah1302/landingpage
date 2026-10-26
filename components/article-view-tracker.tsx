"use client"

import { useEffect } from "react"
import { GAEvents } from "@/lib/ga-events"

type Props = {
  articleId: string
  title: string
  category: string
}

/**
 * Small client component that fires a Google Analytics "viewArticle" event
 * once when the server-rendered article page is hydrated.
 */
export function ArticleViewTracker({ articleId, title, category }: Props) {
  useEffect(() => {
    GAEvents.viewArticle(articleId, title, category)
  }, [articleId, title, category])

  return null
}
