import { CATEGORIES } from '@/lib/taxonomy'

// The three credential classes shown as neutral pills across the app. Order is
// intentional but implies no ranking — each is a distinct, valued role. A
// provider may hold more than one (e.g. a licensed therapist who is also a
// certified yoga instructor), so providers store an array of these.
export type CredentialClass = 'licensed' | 'certified' | 'peer'

export const CREDENTIAL_CLASS_ORDER: CredentialClass[] = ['licensed', 'certified', 'peer']

export const CREDENTIAL_CLASSES: Record<
  CredentialClass,
  { label: string; short: string; meaning: string; limits: string }
> = {
  licensed: {
    label: 'Licensed',
    short: 'Holds a state license with defined scope and board oversight.',
    meaning:
      'Holds a current state license with a defined scope of practice and oversight by a licensing board.',
    limits: 'Scope of practice and services offered vary by license type and state.',
  },
  certified: {
    label: 'Certified / Registered',
    short: 'Credentialed by a professional body; scope varies by credential.',
    meaning:
      'Holds a certification or registration from a professional body, reflecting training and standards in their field.',
    limits:
      'A certification or registration is not a state license. Scope, oversight, and rigor vary by credential.',
  },
  peer: {
    label: 'Peer / lived experience',
    short: 'A distinct, valued role grounded in lived experience.',
    meaning:
      'Supports others through lived experience and specialized peer training — a distinct and valued role in care.',
    limits:
      'Not a licensed clinician. Does not diagnose, prescribe, or provide medical or psychological treatment.',
  },
}

export function isCredentialClass(v: string): v is CredentialClass {
  return v === 'licensed' || v === 'certified' || v === 'peer'
}

// Normalize/validate an arbitrary array (e.g. from the DB or a form) into a
// clean, de-duplicated, canonically-ordered list of credential classes.
export function normalizeCredentialClasses(input: unknown): CredentialClass[] {
  const arr = Array.isArray(input) ? input : []
  const set = new Set<CredentialClass>()
  for (const v of arr) {
    if (typeof v === 'string' && isCredentialClass(v)) set.add(v)
  }
  return CREDENTIAL_CLASS_ORDER.filter((c) => set.has(c))
}

// All 23 categories rolled into plain-language care families. The credential
// list on each family is a SOFT HINT for the explainer ("types you tend to find
// here") — the authoritative pill always comes from the provider's own declared
// credential_classes. Mental & behavioral bridges into medical because
// psychiatrists and psychiatric NPs are licensed prescribers.
export type CareFamily = {
  key: string
  label: string
  categoryKeys: string[]
  credentials: CredentialClass[]
}

export const CARE_FAMILIES: CareFamily[] = [
  { key: 'mental', label: 'Mental & behavioral health', categoryKeys: ['mental', 'psychiatric', 'testing', 'developmental', 'expressive'], credentials: ['licensed', 'certified'] },
  { key: 'medical', label: 'Medical & specialty care', categoryKeys: ['medical', 'specialist', 'dental', 'vision', 'audiology'], credentials: ['licensed'] },
  { key: 'rehab', label: 'Rehabilitation & therapies', categoryKeys: ['physical', 'occupational', 'speech'], credentials: ['licensed'] },
  { key: 'recovery', label: 'Recovery & peer support', categoryKeys: ['addiction', 'peer', 'casemgmt'], credentials: ['licensed', 'peer'] },
  { key: 'coaching', label: 'Coaching & wellness', categoryKeys: ['coaching'], credentials: ['certified', 'peer'] },
  { key: 'holistic', label: 'Holistic, body & life stages', categoryKeys: ['holistic', 'nutrition', 'bodywork', 'movement', 'reproductive', 'palliative'], credentials: ['licensed', 'certified', 'peer'] },
]

const LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]))
export function categoryLabel(key: string): string {
  return LABEL[key] || key
}

// The six featured categories shown before "Show all" expands, with friendly
// short labels. Each maps to a real category key for directory filtering.
export const FEATURED_CATEGORIES: { key: string; label: string }[] = [
  { key: 'mental', label: 'Therapy' },
  { key: 'psychiatric', label: 'Psychiatry' },
  { key: 'medical', label: 'Primary care' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'addiction', label: 'Recovery' },
  { key: 'bodywork', label: 'Bodywork' },
]
