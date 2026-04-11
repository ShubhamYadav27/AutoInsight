// ============================================================
// src/pages/AnalyzePage.jsx
// Car analysis form with all inputs and image upload
// ============================================================

import { useState, useRef } from 'react';
import { analyzeCar } from '../api/carApi';

// Car makes available in Indian market
const CAR_MAKES = [
  'Maruti Suzuki','Hyundai','Honda','Toyota','Tata','Mahindra',
  'Ford','Volkswagen','Kia','Renault','Skoda','BMW','Mercedes-Benz','Audi'
];

const KNOWN_ISSUES = [
  'AC not cooling','Engine noise','Gear slipping','Battery issues',
  'Brake worn','Suspension issue','Oil leak','Rust spots',
  'Windshield crack','Tyre worn'
];

const DOCS_FEATURES = [
  { val: 'service_book', label: 'Service book available' },
  { val: 'insurance',    label: 'Valid insurance' },
  { val: 'full_service', label: 'Full service history' },
  { val: 'warranty',     label: 'Active warranty' },
  { val: 'accident_free',label: 'Accident-free (claimed)' }
];

const LOADING_STEPS = [
  'Reading vehicle details',
  'Analyzing uploaded photos',
  'Predicting maintenance costs',
  'Generating final report'
];

export default function AnalyzePage({ navigate, onComplete }) {
  // Form state
  const [form, setForm] = useState({
    make: '', model: '', year: '', kmDriven: '',
    fuelType: '', askingPrice: '', owners: ''
  });
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Update a form field
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Toggle selection in a set
  const toggle = (arr, setArr, val) =>
    setArr(a => a.includes(val) ? a.filter(x => x !== val) : [...a, val]);

  // Handle image file selection
  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 8);
    setImageFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  // Submit analysis
  const handleSubmit = async () => {
    setError('');

    // Validate
    if (!form.make || !form.model || !form.year || !form.kmDriven) {
      setError('Please fill in Brand, Model, Year, and KM Driven.');
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    try {
      // Animate loading steps
      const stepDelay = (ms) => new Promise(r => setTimeout(r, ms));
      await stepDelay(600);  setLoadingStep(2);
      await stepDelay(800);  setLoadingStep(3);

      const result = await analyzeCar(
        {
          ...form,
          kmDriven: parseInt(form.kmDriven),
          year: parseInt(form.year),
          owners: parseInt(form.owners) || 1,
          askingPrice: form.askingPrice ? parseInt(form.askingPrice) : null,
          knownIssues: selectedIssues,
          hasServiceBook: selectedDocs.includes('service_book'),
          extraDocs: selectedDocs.filter(d => d !== 'service_book')
        },
        imageFiles
      );

      setLoadingStep(4);
      await stepDelay(400);

      if (result.success) {
        onComplete(result.data, { ...form, imageCount: imageFiles.length });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - i);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Car Analysis Form</h2>
        <p style={{ color: 'var(--text2)' }}>Fill in the details to generate your AI inspection report</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255,79,79,0.08)', border: '1px solid rgba(255,79,79,0.2)',
          borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#ff7070', fontSize: 14
        }}>
          {error}
        </div>
      )}

      {/* Vehicle Details */}
      <FormSection title="🚗 Vehicle Details">
        <FormRow>
          <FormGroup label="Make / Brand">
            <select className="field" value={form.make} onChange={e => setField('make', e.target.value)}>
              <option value="">Select brand...</option>
              {CAR_MAKES.map(m => <option key={m}>{m}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Model">
            <input className="field" type="text" placeholder="e.g. Swift, Creta, City"
              value={form.model} onChange={e => setField('model', e.target.value)} />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Year of Manufacture">
            <select className="field" value={form.year} onChange={e => setField('year', e.target.value)}>
              <option value="">Select year...</option>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Kilometers Driven">
            <input className="field" type="number" placeholder="e.g. 45000" min="0"
              value={form.kmDriven} onChange={e => setField('kmDriven', e.target.value)} />
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup label="Fuel Type">
            <select className="field" value={form.fuelType} onChange={e => setField('fuelType', e.target.value)}>
              <option value="">Select fuel...</option>
              {['Petrol','Diesel','CNG','Electric','Hybrid'].map(f => <option key={f}>{f}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Asking Price (₹)">
            <input className="field" type="number" placeholder="e.g. 550000"
              value={form.askingPrice} onChange={e => setField('askingPrice', e.target.value)} />
          </FormGroup>
        </FormRow>
        <FormGroup label="Number of Previous Owners">
          <select className="field" value={form.owners} onChange={e => setField('owners', e.target.value)}>
            <option value="">Select...</option>
            {[['1','1st Owner'],['2','2nd Owner'],['3','3rd Owner'],['4','4+ Owners']].map(([v,l]) =>
              <option key={v} value={v}>{l}</option>
            )}
          </select>
        </FormGroup>
      </FormSection>

      {/* Image Upload */}
      <FormSection title="📸 Photo Upload">
        <div
          onClick={() => fileInputRef.current.click()}
          style={{
            border: `2px dashed ${imagePreviews.length ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`,
            borderRadius: 16, padding: imagePreviews.length ? 16 : 48,
            textAlign: 'center', cursor: 'pointer',
            background: imagePreviews.length ? 'rgba(108,99,255,0.04)' : 'transparent',
            transition: 'all 0.2s'
          }}
        >
          <input type="file" ref={fileInputRef} multiple accept="image/*"
            style={{ display: 'none' }} onChange={handleImages} />

          {imagePreviews.length === 0 ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📷</div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop photos or click to upload</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                Exterior, interior, engine bay, tyres — up to 8 photos
              </div>
            </>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {imagePreviews.map((src, i) => (
                <img key={i} src={src} alt=""
                  style={{ aspectRatio: '1', objectFit: 'cover', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)', width: '100%' }} />
              ))}
            </div>
          )}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
          📌 Best results: front, rear, both sides, dashboard, engine bay, tyre tread
        </p>
      </FormSection>

      {/* Known Issues */}
      <FormSection title="⚠️ Known Issues (Optional)">
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
          Select any issues the seller has disclosed
        </p>
        <ChipGroup
          items={KNOWN_ISSUES}
          selected={selectedIssues}
          toggle={(v) => toggle(selectedIssues, setSelectedIssues, v)}
        />
      </FormSection>

      {/* Docs & Features */}
      <FormSection title="📋 Service & Documentation">
        <ChipGroup
          items={DOCS_FEATURES.map(d => d.label)}
          values={DOCS_FEATURES.map(d => d.val)}
          selected={selectedDocs}
          toggle={(v) => toggle(selectedDocs, setSelectedDocs, v)}
        />
      </FormSection>

      {/* Submit */}
      {!loading ? (
        <button onClick={handleSubmit} style={{
          width: '100%', padding: '18px', borderRadius: 12,
          background: 'var(--accent)', color: '#fff', fontWeight: 700,
          fontSize: 16, cursor: 'pointer', border: 'none', letterSpacing: '0.02em'
        }}>
          🔍 Generate AI Report
        </button>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="spinner" />
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Analyzing your car...</p>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Our AI is inspecting every detail</p>
          <ul style={{ listStyle: 'none', textAlign: 'left', maxWidth: 280, margin: '0 auto' }}>
            {LOADING_STEPS.map((step, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', fontSize: 14,
                color: i + 1 < loadingStep ? 'var(--green)'
                  : i + 1 === loadingStep ? 'var(--text)'
                  : 'var(--text2)'
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, background: 'var(--bg4)',
                  border: `2px solid ${i + 1 < loadingStep ? 'var(--green)'
                    : i + 1 === loadingStep ? 'var(--accent)' : 'rgba(255,255,255,0.08)'}`
                }}>
                  {i + 1 < loadingStep ? '✓' : ''}
                </span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────

function FormSection({ title, children }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 20, padding: 28, marginBottom: 20
    }}>
      <div style={{
        fontSize: 13, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--accent2)', marginBottom: 20
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FormRow({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      {children}
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text2)' }}>{label}</label>
      {children}
    </div>
  );
}

function ChipGroup({ items, values, selected, toggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((label, i) => {
        const val = values ? values[i] : label;
        const active = selected.includes(val);
        return (
          <div key={val} onClick={() => toggle(val)} style={{
            padding: '8px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s', color: active ? 'var(--accent2)' : 'var(--text2)',
            border: `1px solid ${active ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`,
            background: active ? 'rgba(108,99,255,0.15)' : 'transparent'
          }}>
            {label}
          </div>
        );
      })}
    </div>
  );
}
