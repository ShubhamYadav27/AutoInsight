// ============================================================
// src/pages/HomePage.jsx
// Landing page with hero, stats, and how-it-works section
// ============================================================

export default function HomePage({ navigate }) {
  return (
    <div>
      {/* ── Hero Section ──────────────────────────────────── */}
      <div style={{ padding: '80px 24px 60px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 100,
          border: '1px solid rgba(108,99,255,0.4)',
          background: 'rgba(108,99,255,0.08)',
          fontSize: 12, fontWeight: 500, color: 'var(--accent2)',
          marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.08em'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
          AI-Powered Car Analysis
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.1,
          background: 'linear-gradient(135deg, #fff 30%, #a89cff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 20
        }}>
          Buy Your Next Used Car<br />With Confidence
        </h1>

        <p style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 560, margin: '0 auto 40px' }}>
          Upload photos, enter car details, and get an instant AI-powered report on
          condition, history, and expected maintenance costs — before you pay a rupee.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('analyze')} style={{
            padding: '14px 32px', borderRadius: 10, background: 'var(--accent)',
            color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer',
            border: 'none', transition: 'all 0.2s'
          }}>
            Analyze a Car →
          </button>
          <button onClick={() => navigate('analyze')} style={{
            padding: '14px 32px', borderRadius: 10, background: 'transparent',
            color: 'var(--text)', fontWeight: 500, fontSize: 15, cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.14)', transition: 'all 0.2s'
          }}>
            View Sample Report
          </button>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 16, padding: '0 24px 60px', maxWidth: 900, margin: '0 auto'
      }}>
        {[
          { num: '97%',   label: 'Detection accuracy for visible damage' },
          { num: '3 min', label: 'Average time to full analysis' },
          { num: '₹12k',  label: 'Average savings for buyers using our report' }
        ].map(({ num, label }) => (
          <div key={num} style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '28px 24px', textAlign: 'center'
          }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent2)', display: 'block' }}>{num}</span>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── How It Works ──────────────────────────────────── */}
      <div style={{ padding: '0 24px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>How It Works</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 36 }}>Three steps to a full pre-purchase inspection report</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            {
              icon: '🚗', color: 'rgba(108,99,255,0.15)', num: '1',
              title: 'Enter Car Details',
              desc: 'Provide the make, model, year, and kilometers driven. Our AI cross-references reliability databases for your exact variant.'
            },
            {
              icon: '📸', color: 'rgba(32,212,196,0.12)', num: '2',
              title: 'Upload Photos',
              desc: 'Upload photos of the exterior, interior, engine bay, and tyres. The vision AI scans for scratches, dents, rust, and wear.'
            },
            {
              icon: '📊', color: 'rgba(34,208,122,0.12)', num: '3',
              title: 'Get Your Report',
              desc: 'Receive a condition score, maintenance cost prediction, fair market value, and a clear BUY / NEGOTIATE / AVOID verdict.'
            }
          ].map(({ icon, color, num, title, desc }) => (
            <div key={num} style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '28px 24px', position: 'relative', overflow: 'hidden'
            }}>
              {/* Big background number */}
              <span style={{
                position: 'absolute', top: -10, right: 16,
                fontSize: 72, fontWeight: 800, color: 'rgba(255,255,255,0.03)', lineHeight: 1
              }}>{num}</span>

              <div style={{
                width: 44, height: 44, borderRadius: 10, background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 16
              }}>{icon}</div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── What We Detect ────────────────────────────────── */}
      <div style={{
        padding: '48px 24px', background: 'var(--bg2)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>What AutoInsight Detects</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { icon: '🔍', label: 'Scratches & Dents', desc: 'Surface damage from photos' },
              { icon: '🦀', label: 'Rust & Corrosion', desc: 'Frame and panel rust' },
              { icon: '⚙️', label: 'Engine Issues', desc: 'Oil leaks, noise patterns' },
              { icon: '🛞', label: 'Tyre Wear', desc: 'Uneven wear patterns' },
              { icon: '💺', label: 'Interior Damage', desc: 'Upholstery, dashboard cracks' },
              { icon: '💡', label: 'Electrical Faults', desc: 'Warning light patterns' },
              { icon: '🔧', label: 'Brake Condition', desc: 'Pad and rotor wear estimates' },
              { icon: '📉', label: 'Depreciation', desc: 'Fair market value vs ask' }
            ].map(({ icon, label, desc }) => (
              <div key={label} style={{
                padding: '20px 16px', borderRadius: 14,
                border: '1px solid var(--border)', textAlign: 'center'
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          Don't buy blind. Inspect first.
        </h2>
        <p style={{ color: 'var(--text2)', marginBottom: 32 }}>
          A 3-minute AI report could save you lakhs in hidden repair costs.
        </p>
        <button onClick={() => navigate('analyze')} style={{
          padding: '16px 40px', borderRadius: 12, background: 'var(--accent)',
          color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', border: 'none'
        }}>
          Start Free Analysis →
        </button>
      </div>
    </div>
  );
}
