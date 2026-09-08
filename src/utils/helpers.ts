/** Convert common YouTube URL formats to an embeddable URL. */
export function toYouTubeEmbed(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const u = new URL(url)
    let id = ''
    if (u.hostname.includes('youtu.be')) {
      id = u.pathname.slice(1)
    } else if (u.searchParams.get('v')) {
      id = u.searchParams.get('v') || ''
    } else if (u.pathname.startsWith('/embed/')) {
      return url
    }
    if (!id) return null
    return `https://www.youtube.com/embed/${id}`
  } catch {
    return null
  }
}

export function truncate(text: string, max = 120): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'arms',
  'shoulders',
  'core',
  'full body',
] as const

export function durationBucket(minutes: number): string {
  if (minutes <= 30) return '≤30 min'
  if (minutes <= 45) return '31–45 min'
  if (minutes <= 60) return '46–60 min'
  return '60+ min'
}

export function matchesDurationFilter(minutes: number, filter: string): boolean {
  if (!filter || filter === 'all') return true
  if (filter === '30') return minutes <= 30
  if (filter === '45') return minutes > 30 && minutes <= 45
  if (filter === '60') return minutes > 45 && minutes <= 60
  if (filter === '90') return minutes > 60
  return true
}
