import { NextResponse } from 'next/server'

// Verifies a 10-digit NPI against the free federal NPPES registry.
// No API key required. Returns a status plus the registry's name/taxonomy
// so the applicant gets instant feedback and the admin has it on file.
//
// status values:
//   'match'      - NPI found AND the registry name reasonably matches the applicant
//   'found'      - NPI found but the name doesn't clearly match
//   'not_found'  - NPI is valid format but not in the registry
//   'invalid'    - not a 10-digit number
//   'error'      - registry lookup failed (network etc.)

function normalize(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')   // drop punctuation, credentials suffixes handled below
    .replace(/\s+/g, ' ')
    .trim()
}

// crude token overlap: do the applicant's name tokens substantially appear in the registry name?
function nameMatches(applicant: string, registry: string): boolean {
  const a = normalize(applicant).split(' ').filter((t) => t.length > 1)
  const r = new Set(normalize(registry).split(' ').filter((t) => t.length > 1))
  if (a.length === 0 || r.size === 0) return false
  const hits = a.filter((t) => r.has(t)).length
  // require at least two matching tokens, or all tokens if the name is short
  return hits >= Math.min(2, a.length)
}

export async function POST(req: Request) {
  let npi = ''
  let applicantName = ''
  try {
    const body = await req.json()
    npi = (body.npi || '').toString().trim()
    applicantName = (body.name || '').toString().trim()
  } catch {
    return NextResponse.json({ status: 'invalid', message: 'Bad request.' })
  }

  if (!/^\d{10}$/.test(npi)) {
    return NextResponse.json({ status: 'invalid', message: 'NPI must be a 10-digit number.' })
  }

  try {
    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      return NextResponse.json({ status: 'error', message: 'Registry lookup failed.' })
    }
    const data = await res.json()
    if (!data.results || data.result_count === 0) {
      return NextResponse.json({ status: 'not_found', message: 'No provider found with that NPI.' })
    }

    const rec = data.results[0]
    const basic = rec.basic || {}
    let registryName = ''
    if (basic.organization_name) {
      registryName = basic.organization_name
    } else {
      registryName = [basic.first_name, basic.last_name].filter(Boolean).join(' ')
    }
    const taxonomy =
      (rec.taxonomies && rec.taxonomies.find((t: { primary?: boolean }) => t.primary)?.desc) ||
      (rec.taxonomies && rec.taxonomies[0]?.desc) ||
      ''

    const matched = applicantName ? nameMatches(applicantName, registryName) : false

    return NextResponse.json({
      status: matched ? 'match' : 'found',
      registryName,
      taxonomy,
      message: matched
        ? `Verified: ${registryName}${taxonomy ? ' · ' + taxonomy : ''}`
        : `NPI found (${registryName}), but the name doesn't clearly match your application. The administrator will review.`,
    })
  } catch {
    return NextResponse.json({ status: 'error', message: 'Could not reach the NPI registry. Try again.' })
  }
}
