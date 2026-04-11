// ============================================================
// src/components/Navbar.jsx
// Sticky top navigation bar
// ============================================================

export default function Navbar({ currentPage, navigate, hasResults }) {
  const tabs = [
    { id: 'home',    label: 'Home' },
    { id: 'analyze', label: 'Analyze Car' },
    ...(hasResults ? [{ id: 'results', label: 'Results' }] : [])
  ];

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 40px', borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.95)', position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('home')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontWeight: 800, fontSize: 20, cursor: 'pointer',
          letterSpacing: '-0.02em'
        }}
      >
        <div style={{
          width: 36, height: 36, background: 'var(--accent)',
          borderRadius: 8, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18
        }}>🔍</div>
        AutoInsight
      </div>

      {/* Nav tabs */}
      <div style={{ display: 'flex', gap: 4 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            style={{
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              color: currentPage === tab.id ? 'var(--text)' : 'var(--text2)',
              background: currentPage === tab.id ? 'var(--bg4)' : 'none',
              border: currentPage === tab.id ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
