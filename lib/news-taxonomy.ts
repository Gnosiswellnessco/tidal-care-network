// News/updates taxonomy for the /news page and the provider post composer.
// Categories and populations are reused from the main taxonomy so post filtering
// lines up exactly with provider data. Topics are a curated cross-cutting list
// (your TAGS are category-specific and number in the hundreds) — EDIT FREELY.

import { CATEGORIES, POPULATIONS } from '@/lib/taxonomy'

export type PostType = 'news' | 'event' | 'announcement' | 'resource'

export const POST_TYPES: { key: PostType; label: string }[] = [
  { key: 'news', label: 'News' },
  { key: 'event', label: 'Event' },
  { key: 'announcement', label: 'Announcement' },
  { key: 'resource', label: 'Resource' },
]

export function postTypeLabel(key: string): string {
  return POST_TYPES.find((t) => t.key === key)?.label || key
}

// All 23 categories, grouped under headings for the filter dropdown.
// Keys reference lib/taxonomy.ts CATEGORIES — every key below must exist there.
export const CATEGORY_GROUPS: { label: string; keys: string[] }[] = [
  { label: 'Mental & behavioral health', keys: ['mental', 'psychiatric', 'addiction', 'testing', 'developmental'] },
  { label: 'Medical & specialty care', keys: ['medical', 'specialist', 'reproductive', 'audiology', 'vision', 'dental'] },
  { label: 'Therapy & rehabilitation', keys: ['speech', 'occupational', 'physical', 'expressive'] },
  { label: 'Holistic, movement & wellness', keys: ['holistic', 'nutrition', 'bodywork', 'movement', 'coaching'] },
  { label: 'Support & community', keys: ['palliative', 'casemgmt', 'peer'] },
]

export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label || key
}

// All populations (reused from the main taxonomy — all 39).
export const POST_POPULATIONS: readonly string[] = POPULATIONS

// Curated cross-cutting topics for the Topic facet. EDIT THIS LIST FREELY —
// it is not derived from provider data, so changing it has no migration impact.
export const POST_TOPICS: string[] = [
  'Anxiety & stress',
  'Depression & mood',
  'Trauma & PTSD',
  'Grief & loss',
  'Addiction & recovery',
  'Relationships & family',
  'Parenting',
  'Chronic illness & pain',
  'Sleep',
  'Eating & body image',
  'Life transitions',
  'Medication & treatment',
  'Neurodivergence & autism',
  'Caregiving',
  'Identity & belonging',
]

// Default shelf life (days) for non-event posts. Events expire the day after the event.
export const DEFAULT_SHELF_LIFE_DAYS = 30

// Computes expires_at given a post. Event posts expire the day after event_date;
// everything else expires DEFAULT_SHELF_LIFE_DAYS after the publish time.
export function computeExpiresAt(opts: { postType: PostType; eventDate?: string | null; publishedAt?: Date }): string {
  const base = opts.publishedAt ?? new Date()
  if (opts.postType === 'event' && opts.eventDate) {
    const d = new Date(opts.eventDate + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    return d.toISOString()
  }
  const d = new Date(base)
  d.setDate(d.getDate() + DEFAULT_SHELF_LIFE_DAYS)
  return d.toISOString()
}

// Slugify a title into a URL-safe slug; a short suffix is appended by the caller
// to guarantee uniqueness.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}
