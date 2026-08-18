import type { RunDuration } from '../../shared/obituary'

interface DurationBadgeProps {
  duration: RunDuration
  compact?: boolean
}

function pluralize(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'}`
}

export function DurationBadge({ duration, compact = false }: DurationBadgeProps) {
  if (compact) {
    const parts: string[] = []
    if (duration.years) parts.push(`${duration.years}y`)
    if (duration.months) parts.push(`${duration.months}m`)
    if (!duration.years && !duration.months) parts.push(`${duration.days}d`)
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        {parts.join(' ') || '0d'}
      </span>
    )
  }

  const units: Array<[number, string]> = [
    [duration.years, 'year'],
    [duration.months, 'month'],
    [duration.days, 'day'],
    [duration.hours, 'hour'],
    [duration.minutes, 'minute'],
  ]
  const text = units
    .filter(([value]) => value > 0)
    .map(([value, unit]) => pluralize(value, unit))
    .join(', ')

  return <span className="text-slate-600 dark:text-slate-300">{text || 'Less than a minute'}</span>
}
