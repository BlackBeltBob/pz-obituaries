import { useTheme, type ThemeChoice } from '../hooks/useTheme'

const OPTIONS: Array<{ value: ThemeChoice; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'Browser-default', icon: '💻' },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex divide-x divide-slate-300 overflow-hidden rounded border border-slate-300 dark:divide-slate-700 dark:border-slate-700"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={theme === option.value}
          title={option.label}
          onClick={() => setTheme(option.value)}
          className={`px-2 py-1 text-xs transition ${
            theme === option.value
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <span aria-hidden="true">{option.icon}</span>
          <span className="ml-1 hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
