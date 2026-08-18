import { useIsDarkMode } from '../hooks/useTheme'

interface TombstonePlaceholderProps {
  name: string
  className?: string
}

const PALETTE = {
  dark: { slab: '#2e303a', stone: '#4b4e5c', stroke: '#6b6d7a', name: '#e2e4e9', rip: '#9ca3af', caption: '#6b6d7a' },
  light: { slab: '#e2e8f0', stone: '#cbd5e1', stroke: '#94a3b8', name: '#1e293b', rip: '#64748b', caption: '#94a3b8' },
}

// Same tombstone artwork as public/obituaries/placeholder.svg, but with the
// character's name rendered onto the stone. Font size shrinks for longer
// names so it stays within the arch instead of overflowing it. Colors are
// resolved in JS rather than Tailwind dark: classes because these are raw
// SVG fill/stroke attributes, not classes.
export function TombstonePlaceholder({ name, className }: TombstonePlaceholderProps) {
  const isDark = useIsDarkMode()
  const colors = isDark ? PALETTE.dark : PALETTE.light
  const fontSize = Math.min(17, Math.max(9, 220 / Math.max(name.length, 4)))

  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={`No screenshot yet for ${name}`} className={className}>
      <rect width="400" height="300" fill={colors.slab} />
      <path
        d="M140 260 V150 a60 60 0 0 1 120 0 V260 Z"
        fill={colors.stone}
        stroke={colors.stroke}
        strokeWidth="3"
      />
      <rect x="120" y="255" width="160" height="14" fill={colors.stone} stroke={colors.stroke} strokeWidth="3" />
      <text x="200" y="175" textAnchor="middle" fontFamily="serif" fontSize={fontSize} fill={colors.name}>
        {name}
      </text>
      <text x="200" y="205" textAnchor="middle" fontFamily="serif" fontSize="16" fill={colors.rip}>
        R.I.P.
      </text>
      <text x="200" y="290" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="13" fill={colors.caption}>
        No screenshot yet
      </text>
    </svg>
  )
}
