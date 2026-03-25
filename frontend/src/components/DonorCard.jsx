import { useEffect } from 'react'

const BLOOD_TYPE_COLORS = {
  'A+': '#e53e3e', 'A-': '#c53030',
  'B+': '#3182ce', 'B-': '#2b6cb0',
  'AB+': '#805ad5', 'AB-': '#6b46c1',
  'O+': '#38a169', 'O-': '#276749',
}

export default function DonorCard({ donor, user, onClose }) {
  const color  = BLOOD_TYPE_COLORS[donor.blood_type] ?? '#e53e3e'
  const donorId = `BDR-${String(donor.id).padStart(6, '0')}`
  const issued  = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const initial = (donor.name || user?.name || '?').charAt(0).toUpperCase()

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handlePrint() {
    const html = buildPrintHtml({ donor, user, color, donorId, issued, initial })
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{ padding: 0, maxWidth: 480, overflow: 'hidden', borderRadius: 20 }}
      >
        {/* Card preview */}
        <CardFace donor={donor} user={user} color={color} donorId={donorId} issued={issued} initial={initial} />

        {/* Actions */}
        <div style={{
          padding: '16px 24px',
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          background: '#f9fafb', borderTop: '1px solid #e5e7eb',
        }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>🖨 Print / Save PDF</button>
        </div>
      </div>
    </div>
  )
}

// ── React card face (modal preview) ────────────────────
function CardFace({ donor, color, donorId, issued, initial }) {
  return (
    <div style={{
      width: '100%',
      background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
      padding: '32px 28px 24px',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -20, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, position: 'relative' }}>
        <span style={{ fontSize: 22 }}>🩸</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Blood Donor Registry</div>
          <div style={{ fontSize: 11, opacity: 0.75 }}>Donor Identity Card</div>
        </div>
      </div>

      {/* Avatar + Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, position: 'relative' }}>
        <div style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700,
          border: '2px solid rgba(255,255,255,0.5)',
          flexShrink: 0,
        }}>{initial}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{donor.name}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>{donor.email}</div>
          {donor.city && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>📍 {donor.city}</div>}
        </div>
      </div>

      {/* Blood type + meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, position: 'relative' }}>
        <div style={{
          background: 'rgba(255,255,255,0.22)',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: 12, padding: '10px 22px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 10, opacity: 0.8, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>Blood Type</div>
          <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{donor.blood_type}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 12px', fontSize: 12 }}>
            <span style={{ opacity: 0.75 }}>Status: </span>
            <span style={{ fontWeight: 600 }}>{donor.is_available ? '✓ Available' : 'Unavailable'}</span>
          </div>
          {donor.last_donation_date && (
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '5px 12px', fontSize: 12 }}>
              <span style={{ opacity: 0.75 }}>Last Donated: </span>
              <span style={{ fontWeight: 600 }}>
                {new Date(donor.last_donation_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', marginBottom: 14, position: 'relative' }} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
        <div>
          <div style={{ fontSize: 10, opacity: 0.65, letterSpacing: 1, textTransform: 'uppercase' }}>Donor ID</div>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2, fontFamily: 'monospace' }}>{donorId}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, opacity: 0.65 }}>Issued</div>
          <div style={{ fontSize: 11, opacity: 0.85 }}>{issued}</div>
        </div>
      </div>
    </div>
  )
}

// ── HTML string for the print window ───────────────────
function buildPrintHtml({ donor, color, donorId, issued, initial }) {
  const lastDonated = donor.last_donation_date
    ? new Date(donor.last_donation_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Donor Card – ${donor.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f3f4f6;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .card {
      width: 420px;
      background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
      border-radius: 16px;
      padding: 32px 28px 24px;
      color: #fff;
      position: relative;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    }
    .circle1 {
      position: absolute; top: -40px; right: -40px;
      width: 180px; height: 180px; border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }
    .circle2 {
      position: absolute; bottom: -60px; left: -20px;
      width: 220px; height: 220px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; position: relative; }
    .header-icon { font-size: 22px; }
    .header-title { font-weight: 800; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; }
    .header-sub { font-size: 11px; opacity: 0.75; }
    .person { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; position: relative; }
    .avatar {
      width: 58px; height: 58px; border-radius: 50%;
      background: rgba(255,255,255,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 700;
      border: 2px solid rgba(255,255,255,0.5);
      flex-shrink: 0;
    }
    .person-name { font-size: 20px; font-weight: 700; line-height: 1.2; }
    .person-email { font-size: 12px; opacity: 0.8; margin-top: 3px; }
    .person-city { font-size: 12px; opacity: 0.7; margin-top: 2px; }
    .blood-row { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; position: relative; }
    .blood-badge {
      background: rgba(255,255,255,0.22);
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 12px; padding: 10px 22px; text-align: center;
    }
    .blood-label { font-size: 10px; opacity: 0.8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
    .blood-type { font-size: 32px; font-weight: 900; line-height: 1; }
    .meta-pills { display: flex; flex-direction: column; gap: 6px; }
    .pill {
      background: rgba(255,255,255,0.15);
      border-radius: 8px; padding: 5px 12px; font-size: 12px;
    }
    .pill-label { opacity: 0.75; }
    .divider { border-top: 1px solid rgba(255,255,255,0.25); margin-bottom: 14px; position: relative; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; position: relative; }
    .id-label { font-size: 10px; opacity: 0.65; letter-spacing: 1px; text-transform: uppercase; }
    .id-value { font-size: 16px; font-weight: 800; letter-spacing: 2px; font-family: monospace; }
    .issued-label { font-size: 10px; opacity: 0.65; text-align: right; }
    .issued-value { font-size: 11px; opacity: 0.85; text-align: right; }
    @media print {
      body { background: #fff; }
      .card { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="circle1"></div>
    <div class="circle2"></div>

    <div class="header">
      <div class="header-icon">🩸</div>
      <div>
        <div class="header-title">Blood Donor Registry</div>
        <div class="header-sub">Donor Identity Card</div>
      </div>
    </div>

    <div class="person">
      <div class="avatar">${initial}</div>
      <div>
        <div class="person-name">${donor.name}</div>
        <div class="person-email">${donor.email || ''}</div>
        ${donor.city ? `<div class="person-city">📍 ${donor.city}</div>` : ''}
      </div>
    </div>

    <div class="blood-row">
      <div class="blood-badge">
        <div class="blood-label">Blood Type</div>
        <div class="blood-type">${donor.blood_type}</div>
      </div>
      <div class="meta-pills">
        <div class="pill">
          <span class="pill-label">Status: </span>
          <strong>${donor.is_available ? '✓ Available' : 'Unavailable'}</strong>
        </div>
        ${lastDonated ? `<div class="pill"><span class="pill-label">Last Donated: </span><strong>${lastDonated}</strong></div>` : ''}
      </div>
    </div>

    <div class="divider"></div>

    <div class="footer">
      <div>
        <div class="id-label">Donor ID</div>
        <div class="id-value">${donorId}</div>
      </div>
      <div>
        <div class="issued-label">Issued</div>
        <div class="issued-value">${issued}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}
