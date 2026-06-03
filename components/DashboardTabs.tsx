'use client'

import { useState, type ReactNode } from 'react'

type Tab = { id: string; label: string; content: ReactNode }

export default function DashboardTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id)

  return (
    <div>
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          borderBottom: '1px solid #e5e3dc',
          marginBottom: 24,
        }}
      >
        {tabs.map((t) => {
          const isActive = t.id === active
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setActive(t.id)}
              style={{
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#2c4d52' : '#7a8588',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #3e6a70' : '2px solid transparent',
                padding: '10px 14px',
                marginBottom: -1,
                cursor: 'pointer',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={t.id !== active}>
          {t.content}
        </div>
      ))}
    </div>
  )
}
