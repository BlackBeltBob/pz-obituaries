import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <Link
          to="/"
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
        >
          pz-obituaries
        </Link>
        <ThemeToggle />
      </header>
      {children}
    </div>
  )
}
