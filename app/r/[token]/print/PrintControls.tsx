'use client'

export default function PrintControls() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 1.5cm; }
          body { background: white !important; }
        }
      `}</style>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={() => window.print()}
          style={{ fontSize: 14, fontWeight: 500, padding: '9px 20px', borderRadius: 8, border: 'none', background: '#3e6a70', color: 'white', cursor: 'pointer' }}
        >
          Print this referral
        </button>
      </div>
    </>
  )
}
