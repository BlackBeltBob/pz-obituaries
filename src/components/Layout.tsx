import { useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { exportData, importData } from '../lib/api'
import { ThemeToggle } from './ThemeToggle'

// All data lives in this browser's IndexedDB -- there's no server-side copy,
// so a cleared cache or a switch to a different browser/device loses
// everything. This is the only backup mechanism: a single JSON file with
// photos embedded as base64 data URIs, downloaded/re-loaded by hand.
function BackupControls() {
  const importInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleExport() {
    setBusy(true)
    try {
      const blob = await exportData()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pz-obituaries-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  async function handleImportChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      await importData(file)
      // Simplest way to get every already-mounted view (list, detail) to
      // see the newly-imported data without threading a refetch callback
      // through the whole tree.
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to import backup')
      setBusy(false)
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
      <button type="button" onClick={handleExport} disabled={busy} className="hover:text-slate-800 disabled:opacity-50 dark:hover:text-slate-200">
        Export
      </button>
      <label className="cursor-pointer hover:text-slate-800 dark:hover:text-slate-200">
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportChange}
          disabled={busy}
          className="hidden"
        />
        Import
      </label>
    </div>
  )
}

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
        <div className="flex items-center gap-4">
          <BackupControls />
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  )
}
