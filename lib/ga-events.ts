'use client'

/**
 * Google Analytics event tracking utility
 * Use this to send custom events to your GA dashboard
 */

export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>,
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...eventParams,
      timestamp: new Date().toISOString(),
    })
  }
}

// Predefined events
export const GAEvents = {
  // Article events
  viewArticle: (articleId: string, articleTitle: string, category: string) =>
    trackEvent('view_article', {
      article_id: articleId,
      article_title: articleTitle,
      article_category: category,
    }),

  clickArticle: (articleId: string, articleTitle: string, location: string) =>
    trackEvent('click_article', {
      article_id: articleId,
      article_title: articleTitle,
      location, // 'homepage', 'articles_page', etc.
    }),

  publishArticle: (articleId: string, articleTitle: string) =>
    trackEvent('publish_article', {
      article_id: articleId,
      article_title: articleTitle,
    }),

  deleteArticle: (articleId: string, articleTitle: string) =>
    trackEvent('delete_article', {
      article_id: articleId,
      article_title: articleTitle,
    }),

  // Job events
  viewJobListing: (jobId: string, jobTitle: string, department: string) =>
    trackEvent('view_job_listing', {
      job_id: jobId,
      job_title: jobTitle,
      job_department: department,
    }),

  clickJobListing: (jobId: string, jobTitle: string, location: string) =>
    trackEvent('click_job_listing', {
      job_id: jobId,
      job_title: jobTitle,
      location, // 'homepage', 'careers_page', etc.
    }),

  publishJobPosting: (jobId: string, jobTitle: string, department: string) =>
    trackEvent('publish_job_posting', {
      job_id: jobId,
      job_title: jobTitle,
      job_department: department,
    }),

  deleteJobPosting: (jobId: string, jobTitle: string) =>
    trackEvent('delete_job_posting', {
      job_id: jobId,
      job_title: jobTitle,
    }),

  // Form events
  submitContactForm: (email: string, service: string | null) =>
    trackEvent('submit_contact_form', {
      email_provided: !!email,
      service_selected: service || 'not_specified',
    }),

  // Navigation events
  navigateToSection: (sectionName: string) =>
    trackEvent('navigate_section', {
      section: sectionName,
    }),
}
