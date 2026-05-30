import { createClient } from '@/lib/supabase/server'
import DirectoryClient from './DirectoryClient'

export const dynamic = 'force-dynamic'

export default async function DirectoryPage() {
  const supabase = await createClient()

  const { data: rawProviders } = await supabase
    .from('providers')
    .select('*')
    .eq('vetting_status', 'approved')
    .eq('is_active', true)
    .order('full_name')

  const ids = (rawProviders || []).map((p) => p.id)
  const safeIds = ids.length ? ids : ['00000000-0000-0000-0000-000000000000']

  const { data: cats } = await supabase
    .from('provider_categories')
    .select('provider_id, category, is_primary')
    .in('provider_id', safeIds)

  const { data: tags } = await supabase
    .from('provider_tags')
    .select('provider_id, tag_type, tag_value')
    .in('provider_id', safeIds)

    const { data: endorsed } = await supabase
    .from('endorsements')
    .select('provider_id')
    .eq('status', 'confirmed')
    .in('provider_id', safeIds)

const providers = (rawProviders || []).map((p) => ({
    ...p,
    provider_categories: (cats || []).filter((c) => c.provider_id === p.id),
    provider_tags: (tags || []).filter((t) => t.provider_id === p.id),
    is_endorsed: (endorsed || []).some((e) => e.provider_id === p.id),
  }))

  return <DirectoryClient providers={providers} />
}
