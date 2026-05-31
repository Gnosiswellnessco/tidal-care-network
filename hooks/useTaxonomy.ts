'use client'

import { useState, useEffect } from 'react'
import { TAGS } from '@/lib/taxonomy'
import { createClient } from '@/lib/supabase/client'

// Returns the TAGS structure with any approved database tags merged in.
// Approved tags from taxonomy_tags get added under their category + section.
export function useMergedTags() {
  const [merged, setMerged] = useState(TAGS)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('taxonomy_tags')
      .select('category, section, tag_value')
      .eq('is_approved', true)
      .then(({ data }) => {
        if (!data || data.length === 0) return
        // Deep clone the base TAGS so we don't mutate the import
        const next: typeof TAGS = JSON.parse(JSON.stringify(TAGS))
        for (const row of data) {
          const cat = next[row.category]
          if (!cat) continue
          // Find the matching section, or create one if it doesn't exist
          let section = cat.find((s) => s.title === row.section)
          if (!section) {
            section = { title: row.section || 'Additional', options: [] }
            cat.push(section)
          }
          if (!section.options.includes(row.tag_value)) {
            section.options.push(row.tag_value)
          }
        }
        setMerged(next)
      })
  }, [])

  return merged
}
