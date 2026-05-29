import {
  Brain, Pill, RefreshCw, Stethoscope, Microscope, Leaf, Apple,
  MessageCircle, Hand, ClipboardList, Activity, HandHeart, Wind,
  Palette, Compass, Puzzle, Baby, Ear, Eye, Smile, Bird, Users, HeartHandshake,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  mental: Brain,
  psychiatric: Pill,
  addiction: RefreshCw,
  medical: Stethoscope,
  specialist: Microscope,
  holistic: Leaf,
  nutrition: Apple,
  speech: MessageCircle,
  occupational: Hand,
  testing: ClipboardList,
  physical: Activity,
  bodywork: HandHeart,
  movement: Wind,
  expressive: Palette,
  coaching: Compass,
  developmental: Puzzle,
  reproductive: Baby,
  audiology: Ear,
  vision: Eye,
  dental: Smile,
  palliative: Bird,
  casemgmt: HeartHandshake,
  peer: Users,
}

export function CategoryIcon({ name, size = 22, color = '#0F6E56' }: { name: string; size?: number; color?: string }) {
  const Icon = ICONS[name] || Brain
  return <Icon size={size} color={color} strokeWidth={1.75} aria-hidden="true" />
}