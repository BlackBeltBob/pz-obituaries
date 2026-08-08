interface TombstonePlaceholderProps {
  name: string
  className?: string
}

// Same tombstone artwork as public/obituaries/placeholder.svg, but with the
// character's name rendered onto the stone. Font size shrinks for longer
// names so it stays within the arch instead of overflowing it.
export function TombstonePlaceholder({ name, className }: TombstonePlaceholderProps) {
  const fontSize = Math.min(17, Math.max(9, 220 / Math.max(name.length, 4)))

  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={`No screenshot yet for ${name}`} className={className}>
      <rect width="400" height="300" fill="#2e303a" />
      <path d="M140 260 V150 a60 60 0 0 1 120 0 V260 Z" fill="#4b4e5c" stroke="#6b6d7a" strokeWidth="3" />
      <rect x="120" y="255" width="160" height="14" fill="#4b4e5c" stroke="#6b6d7a" strokeWidth="3" />
      <text x="200" y="175" textAnchor="middle" fontFamily="serif" fontSize={fontSize} fill="#e2e4e9">
        {name}
      </text>
      <text x="200" y="205" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#9ca3af">
        R.I.P.
      </text>
      <text x="200" y="290" textAnchor="middle" fontFamily="system-ui, sans-serif" fontSize="13" fill="#6b6d7a">
        No screenshot yet
      </text>
    </svg>
  )
}
