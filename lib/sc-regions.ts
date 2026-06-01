// SC region + metro derivation from a zip code.
// Regions: Lowcountry, Midlands, Upstate, Pee Dee.
// Derived from the leading digits of the 5-digit SC zip (all start with 29).

export type Region = 'Lowcountry' | 'Midlands' | 'Upstate' | 'Pee Dee'

export const REGIONS: Region[] = ['Lowcountry', 'Midlands', 'Upstate', 'Pee Dee']

// Metro options shown under each region (the "Area" dropdown).
export const METROS_BY_REGION: Record<Region, string[]> = {
  Lowcountry: ['Charleston', 'Summerville', 'Beaufort / Hilton Head', 'Myrtle Beach / Grand Strand', 'Other Lowcountry'],
  Midlands: ['Columbia', 'Aiken', 'Orangeburg', 'Sumter', 'Other Midlands'],
  Upstate: ['Greenville', 'Spartanburg', 'Anderson', 'Rock Hill', 'Other Upstate'],
  'Pee Dee': ['Florence', 'Darlington / Hartsville', 'Other Pee Dee'],
}

type ZipRule = { test: (zip: number) => boolean; region: Region; metro: string }

// Order matters: more specific metro ranges first, broader region fallbacks last.
const RULES: ZipRule[] = [
  // ---- Lowcountry ----
  // Charleston metro: 294xx core (Charleston, Mt Pleasant, North Charleston, James/Johns Island)
  { test: (z) => z >= 29401 && z <= 29499 && ![29483, 29484, 29485, 29486].includes(z), region: 'Lowcountry', metro: 'Charleston' },
  // Summerville / Dorchester: 294 83-86
  { test: (z) => [29483, 29484, 29485, 29486].includes(z), region: 'Lowcountry', metro: 'Summerville' },
  // Beaufort / Hilton Head: 299 0x-2x
  { test: (z) => z >= 29900 && z <= 29945, region: 'Lowcountry', metro: 'Beaufort / Hilton Head' },
  { test: (z) => z >= 29902 && z <= 29941, region: 'Lowcountry', metro: 'Beaufort / Hilton Head' },
  // Myrtle Beach / Grand Strand / Georgetown: 295 75-99, 294 40-42 area is Conway/MB (295xx)
  { test: (z) => z >= 29570 && z <= 29599, region: 'Lowcountry', metro: 'Myrtle Beach / Grand Strand' },
  // ---- Pee Dee ---- (northeast inland: Florence, Darlington, Hartsville, Marion)
  { test: (z) => z >= 29501 && z <= 29569, region: 'Pee Dee', metro: 'Florence' },
  { test: (z) => z >= 29530 && z <= 29550, region: 'Pee Dee', metro: 'Darlington / Hartsville' },
  // ---- Midlands ---- (central: Columbia 290-292, Orangeburg, Sumter, Aiken)
  { test: (z) => z >= 29201 && z <= 29229, region: 'Midlands', metro: 'Columbia' },
  { test: (z) => z >= 29001 && z <= 29199, region: 'Midlands', metro: 'Sumter' },
  { test: (z) => z >= 29800 && z <= 29899, region: 'Midlands', metro: 'Aiken' },
  { test: (z) => z >= 29100 && z <= 29199, region: 'Midlands', metro: 'Orangeburg' },
  { test: (z) => z >= 29030 && z <= 29080, region: 'Midlands', metro: 'Orangeburg' },
  // ---- Upstate ---- (northwest: Greenville, Spartanburg, Anderson, Rock Hill)
  { test: (z) => z >= 29601 && z <= 29699, region: 'Upstate', metro: 'Greenville' },
  { test: (z) => z >= 29301 && z <= 29399, region: 'Upstate', metro: 'Spartanburg' },
  { test: (z) => z >= 29621 && z <= 29699, region: 'Upstate', metro: 'Anderson' },
  { test: (z) => z >= 29700 && z <= 29799, region: 'Upstate', metro: 'Rock Hill' },
]

// Broad fallback by 3-digit prefix when no specific rule matched.
function regionByPrefix(zip: number): Region | null {
  const p = Math.floor(zip / 100) // e.g. 29412 -> 294
  if (p === 290 || p === 291 || p === 292 || p === 298) return 'Midlands'
  if (p === 293 || p === 296 || p === 297) return 'Upstate'
  if (p === 295) return 'Pee Dee'
  if (p === 294 || p === 299) return 'Lowcountry'
  return null
}

export function regionForZip(zip: string | null | undefined): { region: Region | null; metro: string | null } {
  if (!zip) return { region: null, metro: null }
  const z = parseInt(zip.trim().slice(0, 5), 10)
  if (isNaN(z)) return { region: null, metro: null }
  for (const r of RULES) {
    if (r.test(z)) return { region: r.region, metro: r.metro }
  }
  const region = regionByPrefix(z)
  if (region) return { region, metro: `Other ${region}` }
  return { region: null, metro: null }
}
