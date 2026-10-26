import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { supabase, type Article } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, User, Tag } from "lucide-react"
import { ArticleViewTracker } from "@/components/article-view-tracker"

// Revalidate every 60 seconds — published articles will refresh automatically
export const revalidate = 60

type PageProps = {
  params: Promise<{ slug: string }>
}

async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error || !data) return null
  return data as Article
}

// Strip HTML tags for clean OG description fallback
function stripHtml(html: string, max = 160): string {
  const text = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > max ? text.slice(0, max).trim() + "…" : text
}

// Per-article Open Graph + Twitter metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    return {
      title: "Article Not Found | Hitopia",
      description: "The article you are looking for does not exist or has been removed.",
    }
  }

  const description = article.excerpt || stripHtml(article.content)
  const url = `/articles/${article.slug}`
  const images = article.cover_image_url
    ? [{ url: article.cover_image_url, width: 1200, height: 630, alt: article.title }]
    : undefined

  return {
    title: `${article.title} | Hitopia`,
    description,
    keywords: [article.category, "Hitopia", "outsourcing", "staffing", "remote work"],
    authors: [{ name: article.author }],
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "Hitopia",
      type: "article",
      locale: "en_US",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
      authors: [article.author],
      tags: [article.category],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // JSON-LD structured data for rich Google search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.cover_image_url || undefined,
    datePublished: article.published_at ?? article.created_at,
    dateModified: article.updated_at,
    author: { "@type": "Person", name: article.author },
    publisher: {
      "@type": "Organization",
      name: "Hitopia",
    },
    articleSection: article.category,
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* GA tracking via small client component */}
      <ArticleViewTracker
        articleId={article.id}
        title={article.title}
        category={article.category}
      />

      {/* Hero */}
      <div className="relative w-full h-72 md:h-96">
        {article.cover_image_url ? (
          <>
            <Image
              src={article.cover_image_url || "/placeholder.svg"}
              alt={article.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-secondary" />
        )}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 max-w-4xl mx-auto w-full">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 mb-3">
            <Tag className="h-3 w-3" />
            {article.category}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white text-balance leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-b border-white/10 pb-6 mb-8">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <time dateTime={article.published_at ?? article.created_at}>
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-xl text-muted-foreground leading-relaxed mb-8 font-serif italic border-l-4 border-primary pl-4">
          {article.excerpt}
        </p>

        {/* Body — uses shared .article-content CSS from globals.css, same as editor */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <Button asChild variant="outline">
            <Link href="/#articles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>
          </Button>
        </div>
      </article>
    </div>
  )
}
