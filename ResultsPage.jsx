// ============================================================
// src/pages/ResultsPage.jsx
// Full results dashboard with score, costs, issues, recommendation
// ============================================================

import { useEffect, useRef } from 'react';

function getScoreColor(s) {
  if (s >= 75) return '#22d07a';
  if (s >= 50) return '#f5a623';
  return '#ff4f4f';
}

export default function ResultsPage({ result, carInfo, navigate }) {
  const r = result;
  const score = Math.round(r.conditionScore);
  const color = getScoreColor(score);
  const totalCost = r.estimatedMaintenanceCost;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>

      {/* AI timestamp banner */}
      <div style={{
        background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.2)',
        borderRadius: 10, padding: '12px 18px', fontSize: 13, color: 'var(--accent2)',
        marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
      }}>
        🤖 AI analysis complete · {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </div>

      {/* Header: car info + verdict */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            {carInfo.year} {carInfo.make} {carInfo.model}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>
            {carInfo.fuelType} · {Number(carInfo.kmDriven).toLocaleString('en-IN')} km
            {carInfo.owners ? ` · ${carInfo.owners} owner` : ''}
          </p>
        </div>
        <RecommendationBadge rec={r.recommendation} />
      </div>

      {/* Score + Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 20 }}>
        <ScoreRing score={score} grade={r.grade} color={color} />
        <ScoreBreakdown breakdown={r.scoreBreakdown} reason={r.recommendationReason} />
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <MetricCard
          label="Annual Maintenance Cost"
          value={`₹${Number(totalCost).toLocaleString('en-IN')}`}
          sub="Predicted for next 12 months"
          color={totalCost > 50000 ? 'var(--red)' : totalCost > 25000 ? 'var(--amber)' : 'var(--green)'}
          barPct={Math.min(100, totalCost / 800)}
        />
        <MetricCard
          label="Fair Market Value"
          value={`₹${Number(r.fairMarketPrice || 0).toLocaleString('en-IN')}`}
          sub={carInfo.askingPrice
            ? Number(carInfo.askingPrice) > Number(r.fairMarketPrice)
              ? `⚠️ ₹${Number(Number(carInfo.askingPrice) - Number(r.fairMarketPrice)).toLocaleString('en-IN')} above market`
              : '✓ Priced fairly or below market'
            : 'No asking price provided'}
          color="var(--teal)"
        />
        <MetricCard
          label="Negotiation Room"
          value={`₹${Number(r.negotiationRoom || 0).toLocaleString('en-IN')}`}
          sub="Estimated max discount potential"
          color="var(--amber)"
        />
        <MetricCard
          label="Issues Detected"
          value={String((r.detectedIssues || []).length)}
          sub={`${(r.detectedIssues||[]).filter(x=>x.severity==='High').length} high · ${(r.detectedIssues||[]).filter(x=>x.severity==='Medium').length} medium · ${(r.detectedIssues||[]).filter(x=>x.severity==='Low').length} low`}
          color="var(--text)"
        />
      </div>

      {/* AI Narrative */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(32,212,196,0.05))',
        border: '1px solid rgba(108,99,255,0.2)', borderRadius: 20, padding: 28, marginBottom: 20
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent2)', marginBottom: 12 }}>
          🤖 AI Inspector's Summary
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text2)' }}>{r.narrative}</p>
      </div>

      {/* Pros & Cons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <ListCard title="✓ Positives" items={r.positives || []} color="var(--green)" icon="✓" />
        <ListCard title="⚠ Red Flags" items={r.redFlags || []} color="var(--red)" icon="✗" />
      </div>

      {/* Detected Issues */}
      {(r.detectedIssues || []).length > 0 && (
        <Section title="🔍 Detected Issues">
          {r.detectedIssues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
        </Section>
      )}

      {/* Cost Breakdown */}
      <Section title="💰 Maintenance Cost Breakdown">
        <CostBreakdown items={r.costBreakdown || []} total={totalCost} />
      </Section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
        <ActionButton onClick={() => navigate('analyze')} primary>🔍 Analyze Another Car</ActionButton>
        <ActionButton onClick={() => window.print()}>🖨 Save Report</ActionButton>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function RecommendationBadge({ rec }) {
  const colors = {
    BUY:       { bg: 'rgba(34,208,122,0.12)', border: 'rgba(34,208,122,0.3)', text: '#22d07a' },
    NEGOTIATE: { bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.3)',  text: '#f5a623' },
    AVOID:     { bg: 'rgba(255,79,79,0.12)',  border: 'rgba(255,79,79,0.3)',   text: '#ff4f4f' }
  };
  const c = colors[rec] || colors.NEGOTIATE;
  return (
    <div style={{
      padding: '16px 28px', borderRadius: 20, textAlign: 'center',
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      fontWeight: 800, fontSize: 22, minWidth: 160
    }}>
      <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Verdict</div>
      {rec}
    </div>
  );
}

function ScoreRing({ score, grade, color }) {
  const r = 68;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '28px 24px', display: 'flex',
      flexDirection: 'column', alignItems: 'center', textAlign: 'center'
    }}>
      <div style={{ width: 160, height: 160, position: 'relative', marginBottom: 16 }}>
        <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          fontSize: 42, fontWeight: 800, color
        }}>{score}</div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>Condition Score</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 8 }}>{grade}</div>
    </div>
  );
}

function ScoreBreakdown({ breakdown, reason }) {
  const items = [
    { key: 'ageScore',   label: 'Age' },
    { key: 'kmScore',    label: 'KM Driven' },
    { key: 'imageScore', label: 'Photo Scan' },
    { key: 'ownerScore', label: 'Ownership' }
  ];

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text2)', marginBottom: 16 }}>Score Breakdown</div>
      <div style={{ flex: 1 }}>
        {items.map(({ key, label }) => {
          const val = Math.round((breakdown || {})[key] || 0);
          const c = getScoreColor(val);
          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text2)', width: 90, flexShrink: 0 }}>{label}</span>
              <div style={{ flex: 1, height: 6, background: 'var(--bg4)', borderRadius: 100 }}>
                <div style={{ width: `${val}%`, height: '100%', background: c, borderRadius: 100 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: c, width: 36, textAlign: 'right' }}>{val}</span>
            </div>
          );
        })}
      </div>
      {reason && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg3)', borderRadius: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rationale</div>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>{reason}</div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color, barPct }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text2)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{sub}</div>
      {barPct !== undefined && (
        <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 100, marginTop: 12 }}>
          <div style={{ width: `${barPct}%`, height: '100%', background: color, borderRadius: 100 }} />
        </div>
      )}
    </div>
  );
}

function ListCard({ title, items, color, icon }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>
      <div style={{ fontWeight: 600, marginBottom: 16, color }}>{title}</div>
      {items.length === 0
        ? <p style={{ color: 'var(--text2)', fontSize: 13 }}>None identified</p>
        : items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 13 }}>
            <span style={{ color, flexShrink: 0 }}>{icon}</span>
            {item}
          </div>
        ))
      }
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 20 }}>
      <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function IssueRow({ issue }) {
  const colors = { High: '#ff7070', Medium: '#f5a623', Low: '#22d07a' };
  const bgs    = { High: 'rgba(255,79,79,0.15)', Medium: 'rgba(245,166,35,0.15)', Low: 'rgba(34,208,122,0.12)' };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{
        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
        flexShrink: 0, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em',
        background: bgs[issue.severity], color: colors[issue.severity]
      }}>
        {issue.severity}
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{issue.title}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>
          {issue.description}
          {issue.estimatedCost ? ` — Est. ₹${Number(issue.estimatedCost).toLocaleString('en-IN')}` : ''}
        </div>
      </div>
    </div>
  );
}

function CostBreakdown({ items, total }) {
  const maxAmt = Math.max(...items.map(x => x.amount), 1);
  const barColors = { High: '#ff4f4f', Medium: '#f5a623', Low: '#6c63ff' };

  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 14, flex: 1 }}>
            {item.item}
            <span style={{ fontSize: 11, color: 'var(--text3)', marginLeft: 6 }}>{item.urgency} priority</span>
          </span>
          <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 100, margin: '0 16px' }}>
            <div style={{ width: `${(item.amount / maxAmt) * 100}%`, height: '100%', background: barColors[item.urgency], borderRadius: 100 }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: barColors[item.urgency] }}>
            ₹{Number(item.amount).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.14)' }}>
        <span style={{ fontWeight: 700 }}>Total Predicted Annual Cost</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent2)' }}>
          ₹{Number(total).toLocaleString('en-IN')}
        </span>
      </div>
    </>
  );
}

function ActionButton({ onClick, primary, children }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, minWidth: 160, padding: '14px 20px', borderRadius: 10,
      fontWeight: 600, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      border: primary ? 'none' : '1px solid rgba(255,255,255,0.14)',
      background: primary ? 'var(--accent)' : 'var(--bg2)',
      color: primary ? '#fff' : 'var(--text)', transition: 'all 0.2s'
    }}>
      {children}
    </button>
  );
}
