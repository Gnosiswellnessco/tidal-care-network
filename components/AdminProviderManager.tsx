'use client'

import { useState, useMemo } from 'react'

const teal = '#3e6a70'
const dark = '#2c4d52'

type ProviderRow = {
  id: string
  full_name: string | null
  credentials: string | null
  practice_name: string | null
  email: string | null
  vetting_status: string | null
  admin_override?: boolean | null
}

export default function AdminProviderManager({
  providers,
  removeAction,
  deleteAction,
  reinstateAction,
}: {
  providers: ProviderRow[]
  removeAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
  reinstateAction: (formData: FormData) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return providers
    return providers.filter((p) => {
      const hay = `${p.full_name || ''} ${p.practice_name || ''} ${p.email || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [providers, search])

  function toggle(id: string) {
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((cur) => {
      const visibleIds = filtered.map((p) => p.id)
      const allSelected = visibleIds.every((id) => cur.has(id)) && visibleIds.length > 0
      const next = new Set(cur)
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const selectedIds = Array.from(selected)
  const count = selectedIds.length
  const visibleIds = filtered.map((p) => p.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  function confirmDelete(e: React.FormEvent) {
    const ok = window.confirm(
      `Permanently delete ${count} provider${count === 1 ? '' : 's'}? This cannot be undone. It removes the provider record and all related data (credentials, categories, endorsements, addresses).`
    )
    if (!ok) e.preventDefault()
  }

  const statusStyle = (s: string | null): React.CSSProperties => ({
    fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 6,
    background: s === 'approved' ? '#eaf3de' : s === 'pending' ? '#faeeda' : '#fcebeb',
    color: s === 'approved' ? '#27500a' : s === 'pending' ? '#633806' : '#791f1f',
  })

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e5e3dc', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, practice, or email…"
          style={{ flex: '1 1 240px', padding: '9px 12px', fontSize: 14, border: '1px solid #d4d2ca', borderRadius: 8, color: '#1a1a1a', background: 'white' }}
        />
        <span style={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>{count} selected</span>
      </div>

      {/* Bulk action bar (shows when something is selected) */}
      {count > 0 && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', background: '#faf9f5', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <form action={reinstateAction} style={{ margin: 0 }}>
            <input type="hidden" name="ids" value={selectedIds.join(',')} />
            <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid #27500a', background: 'white', color: '#27500a', cursor: 'pointer' }}>
              Reinstate to directory
            </button>
          </form>
          <form action={removeAction} style={{ margin: 0 }}>
            <input type="hidden" name="ids" value={selectedIds.join(',')} />
            <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid ' + teal, background: 'white', color: teal, cursor: 'pointer' }}>
              Remove from directory
            </button>
          </form>
          <form action={deleteAction} onSubmit={confirmDelete} style={{ margin: 0 }}>
            <input type="hidden" name="ids" value={selectedIds.join(',')} />
            <button type="submit" style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: '1px solid #b3504f', background: 'white', color: '#b3504f', cursor: 'pointer' }}>
              Permanently delete
            </button>
          </form>
          <span style={{ fontSize: 12, color: '#888' }}>
            &ldquo;Reinstate&rdquo; restores them to the directory. &ldquo;Remove&rdquo; hides them (reversible). &ldquo;Permanently delete&rdquo; erases the record and all their data.
          </span>
        </div>
      )}

      {/* Header row with select-all */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid #f0f0f0', background: '#fcfbf8' }}>
        <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} style={{ cursor: 'pointer' }} aria-label="Select all visible" />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select all {search.trim() ? 'matching' : ''}
        </span>
      </div>

      {/* Rows */}
      {filtered.length > 0 ? filtered.map((p, i) => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f0' : 'none', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} style={{ cursor: 'pointer', flexShrink: 0 }} aria-label={`Select ${p.full_name}`} />
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: 14, color: '#333' }}>
                {p.full_name}{p.credentials ? `, ${p.credentials}` : ''}
                {p.admin_override && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99, background: '#f7ece2', color: '#b3504f', marginLeft: 8 }}>override</span>}
              </span>
              {(p.practice_name || p.email) && (
                <div style={{ fontSize: 12, color: '#999', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[p.practice_name, p.email].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          </div>
          <span style={statusStyle(p.vetting_status)}>{p.vetting_status}</span>
        </div>
      )) : (
        <p style={{ fontSize: 14, color: '#888', padding: 20 }}>
          {search.trim() ? 'No providers match your search.' : 'No providers yet.'}
        </p>
      )}
    </div>
  )
}
