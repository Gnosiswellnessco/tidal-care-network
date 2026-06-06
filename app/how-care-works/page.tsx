import SiteHeader from '@/components/SiteHeader'
import CareFamiliesExplainer from '@/components/CareFamiliesExplainer'
import { BRAND } from '@/lib/brand'

export const dynamic = 'force-dynamic'

export default function HowCareWorksPage() {
  return (
    <main style={{ background: BRAND.pageBg, minHeight: '100vh' }}>
      <SiteHeader right={null} />
      <CareFamiliesExplainer />
    </main>
  )
}
