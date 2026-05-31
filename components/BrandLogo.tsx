import Link from 'next/link'

export default function BrandLogo({ height = 60 }: { height?: number }) {
  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
      <img
        src="/tidal-care-network.svg"
        alt="Tidal Care Network"
        style={{ height, width: 'auto', display: 'block' }}
      />
    </Link>
  )
}
