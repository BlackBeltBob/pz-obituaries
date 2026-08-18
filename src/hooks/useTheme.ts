import { useEffect, useState } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'pz-obituaries-theme'
const media = window.matchMedia('(prefers-color-scheme: dark)')

function readStored(): ThemeChoice {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

function applyTheme(choice: ThemeChoice) {
  const dark = choice === 'dark' || (choice === 'system' && media.matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeChoice>(readStored)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (theme !== 'system') return
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  function setTheme(choice: ThemeChoice) {
    localStorage.setItem(STORAGE_KEY, choice)
    setThemeState(choice)
  }

  return { theme, setTheme }
}

// For components that can't use `dark:` classes (e.g. raw SVG attributes)
// and need to know whether dark is *actually* active right now, accounting
// for 'system'. Reads the <html class="dark"> that useTheme's applyTheme
// keeps in sync, via a MutationObserver, so it stays correct regardless of
// which component instance changed the theme.
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
