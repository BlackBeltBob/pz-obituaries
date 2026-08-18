import type { ReactNode } from 'react'

interface SummaryCardProps {
  title: string
  count?: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

// Generic aggregate-summary / drill-down-on-interaction card for the
// desktop and tablet dashboards. Wraps content that doesn't already manage
// its own collapse state (Goals, Skills, Skill Books, Bases, Routines, Key
// Items, Photos). TraitPicker and PointsOfInterestPicker already implement
// this same open/count pattern internally, so they're dropped into the
// dashboard directly via `PlainCard` instead of double-wrapping them here.
//
// `@container` here (Tailwind v4's built-in container queries) lets picker
// components inside respond to *this card's* actual rendered width via
// `@sm:`/`@md:` variants, instead of `sm:`/`md:` which only ever look at
// the viewport -- the latter is what caused the grid-overflow bug: a
// narrow card at desktop width still has a wide viewport, so `sm:` variants
// fired regardless of how little room the card itself had.
export function SummaryCard({ title, count, children, defaultOpen = true, className = '' }: SummaryCardProps) {
  return (
    <details
      open={defaultOpen}
      className={`group @container h-fit rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 text-base font-semibold text-slate-900 dark:text-slate-100">
        <span className="inline-block text-slate-500 transition-transform group-open:rotate-90">›</span>
        {title}
        {count !== undefined && <span className="text-sm font-normal text-slate-500">({count})</span>}
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  )
}

// Plain card chrome for content that manages its own aggregate/drill-down
// state internally (TraitPicker, PointsOfInterestPicker) -- just provides
// the same visual framing and @container context as SummaryCard without a
// second collapse layer.
export function PlainCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`@container h-fit rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  )
}
