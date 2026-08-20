import { useEffect, useState } from 'react'

// Matches Tailwind's default `lg` breakpoint, which is where DashboardView
// switches from the tablet to the desktop layout.
const media = window.matchMedia('(min-width: 1024px)')

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(media.matches)

  useEffect(() => {
    const onChange = () => setIsDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}
