import { useState, useEffect, useRef } from 'react';
import { FaInfoCircle, FaCalculator, FaSave, FaWhatsapp, FaHistory, FaTrash, FaChevronDown, FaChevronUp, FaCheckCircle } from 'react-icons/fa';

// ─── FloatInput — label sits ON the border like the reference image ───────────
export function FloatInput({ label, hint, accent = '#6366f1', value, onChange, type = 'text', placeholder, ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value !== '' && value !== undefined && value !== null;
  const active = focused || hasValue;

  return (
    <div style={{ position: 'relative', marginBottom: 18, width: '100%' }}>
      <div style={{
        position: 'relative',
        border: `1.8px solid ${focused ? accent : '#c8d3e0'}`,
        borderRadius: 12,
        background: '#fff',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? `0 0 0 3px ${accent}18` : 'none',
      }}>
        {/* Floating label — sits on the top border line */}
        <label style={{
          position: 'absolute',
          top: active ? -10 : '50%',
          left: 14,
          transform: active ? 'none' : 'translateY(-50%)',
          fontSize: active ? 11 : 15,
          fontWeight: active ? 700 : 500,
          color: focused ? accent : active ? '#64748b' : '#94a3b8',
          background: active ? '#fff' : 'transparent',
          padding: active ? '0 5px' : '0',
          transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: 'none',
          zIndex: 2,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100% - 28px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {label}
        </label>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={focused ? (placeholder || '') : ''}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
          style={{
            width: '100%',
            display: 'block',
            padding: '14px 16px 13px',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 600,
            color: '#1e293b',
            background: 'transparent',
            outline: 'none',
            fontFamily: 'inherit',
            minWidth: 0,
          }}
        />
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, paddingLeft: 4 }}>{hint}</div>
      )}
    </div>
  );
}

// ─── FloatSelect — same style as FloatInput ───────────────────────────────────
export function FloatSelect({ label, accent = '#6366f1', value, onChange, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 18, width: '100%' }}>
      <div style={{
        position: 'relative',
        border: `1.8px solid ${focused ? accent : '#c8d3e0'}`,
        borderRadius: 12,
        background: '#fff',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? `0 0 0 3px ${accent}18` : 'none',
      }}>
        <label style={{
          position: 'absolute',
          top: -10, left: 14,
          fontSize: 11, fontWeight: 700,
          color: focused ? accent : '#64748b',
          background: '#fff',
          padding: '0 5px',
          pointerEvents: 'none',
          zIndex: 2,
          lineHeight: 1,
        }}>{label}</label>
        <select
          value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
          style={{
            width: '100%', display: 'block',
            padding: '14px 16px 13px',
            border: 'none', borderRadius: 12,
            fontSize: 15, fontWeight: 600,
            color: '#1e293b', background: 'transparent',
            outline: 'none', fontFamily: 'inherit',
            cursor: 'pointer', minWidth: 0,
            appearance: 'none', WebkitAppearance: 'none',
          }}
        >
          {children}
        </select>
        <div style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#94a3b8' }}>▾</div>
      </div>
    </div>
  );
}

// ─── DateThreeInput — DD | MM | YYYY each with floating label ─────────────────
export function DateThreeInput({ labels = ['Day','Month','Year'], values = ['','',''], onChanges = [], accent = '#10b981', hint }) {
  return (
    <div style={{ width: '100%', marginBottom: 4 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ flex: i === 2 ? 1.6 : 1, minWidth: 0 }}>
            <FloatInput
              label={labels[i]}
              type="number"
              value={values[i]}
              onChange={onChanges[i]}
              accent={accent}
              placeholder={i === 0 ? '15' : i === 1 ? '06' : '1990'}
            />
          </div>
        ))}
      </div>
      {hint && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: -10, marginBottom: 14, paddingLeft: 4 }}>{hint}</div>}
    </div>
  );
}

// ─── ToggleGroup ──────────────────────────────────────────────────────────────
export function ToggleGroup({ options, value, onChange, accent = '#6366f1' }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: '#f1f5f9', borderRadius: 12, padding: 4, width: '100%' }}>
      {options.map(([val, label]) => {
        const active = value === val;
        return (
          <button key={val} onClick={() => onChange(val)} style={{
            flex: 1, padding: '10px 6px',
            background: active ? '#fff' : 'transparent',
            color: active ? accent : '#64748b',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: active ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.18s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            minWidth: 0, overflow: 'hidden',
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────
export function ResultCard({ children, accent = '#6366f1' }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}0a, ${accent}04)`,
      border: `1.5px solid ${accent}28`,
      borderRadius: 18, padding: '16px',
      marginTop: 18, animation: 'popIn 0.28s ease',
      boxShadow: `0 4px 20px ${accent}14`,
      width: '100%', overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

// ─── StatGrid ─────────────────────────────────────────────────────────────────
export function StatGrid({ items, cols = 2 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 8, width: '100%' }}>
      {items.map(([label, value, accent, span], i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: 12,
          padding: '11px 10px', textAlign: 'center',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          gridColumn: span === 'full' ? '1 / -1' : undefined,
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: accent || '#1e293b', wordBreak: 'break-word' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── InfoBanner ───────────────────────────────────────────────────────────────
export function InfoBanner({ text, accent = '#6366f1' }) {
  return (
    <div style={{
      background: `${accent}0e`, border: `1px solid ${accent}28`,
      borderRadius: 12, padding: '10px 14px', marginBottom: 18,
      display: 'flex', gap: 10, alignItems: 'flex-start', width: '100%',
    }}>
      <FaInfoCircle size={14} color={accent} style={{ flexShrink: 0, marginTop: 2 }} />
      <p style={{ fontSize: 13, color: accent, fontWeight: 500, lineHeight: 1.55, margin: 0 }}>{text}</p>
    </div>
  );
}

// ─── ActionRow ────────────────────────────────────────────────────────────────
export function ActionRow({ onCalc, onSave, onShare, accent, saved, label = 'Calculate' }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 20, width: '100%' }}>
      <button onClick={onCalc} style={{
        flex: 2, padding: '15px 0',
        background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
        color: '#fff', border: 'none', borderRadius: 14,
        fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
        boxShadow: `0 4px 18px ${accent}44`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'transform 0.1s, box-shadow 0.1s',
        minWidth: 0,
      }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = ''; }}
        onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onTouchEnd={e => { e.currentTarget.style.transform = ''; }}
      >
        <FaCalculator size={15} />{label}
      </button>

      <button onClick={onSave} title="Save" style={{
        width: 52, flexShrink: 0, padding: '15px 0',
        background: saved ? '#dcfce7' : '#f8faff',
        color: saved ? '#16a34a' : '#94a3b8',
        border: `2px solid ${saved ? '#86efac' : '#e2e8f0'}`,
        borderRadius: 14, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        <FaSave size={17} />
      </button>

      {/* WhatsApp — deep link opens app directly on mobile */}
      <button onClick={onShare} title="Share on WhatsApp" style={{
        width: 52, flexShrink: 0, padding: '15px 0',
        background: '#25d366',
        color: '#fff', border: 'none', borderRadius: 14,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37,211,102,0.35)',
        transition: 'transform 0.1s',
      }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
        onMouseUp={e => e.currentTarget.style.transform = ''}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
        onTouchEnd={e => e.currentTarget.style.transform = ''}
      >
        <FaWhatsapp size={22} />
      </button>
    </div>
  );
}

// ─── HistoryPanel ─────────────────────────────────────────────────────────────
export function HistoryPanel({ items = [], accent, onClear, labels = { history: 'History', clear: 'Clear' } }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <div style={{ marginTop: 18, width: '100%' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'none', border: `1.5px solid ${accent}33`,
        borderRadius: 10, padding: '7px 14px', fontSize: 12, fontWeight: 700,
        color: accent, fontFamily: 'inherit', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <FaHistory size={11} /> {labels.history} ({items.length})
        {open ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </button>
      {open && (
        <div style={{
          marginTop: 8, background: '#f8faff', borderRadius: 12,
          padding: '12px', maxHeight: 180, overflowY: 'auto', overflowX: 'hidden',
          border: '1px solid #e2e8f0', animation: 'slideUp 0.2s ease', width: '100%',
        }}>
          {[...items].reverse().map((item, i) => (
            <div key={i} style={{
              fontSize: 12, padding: '6px 0',
              borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none',
              color: '#64748b', lineHeight: 1.5, wordBreak: 'break-word',
            }}>{item}</div>
          ))}
          <button onClick={onClear} style={{
            marginTop: 8, background: '#fee2e2', color: '#ef4444',
            border: 'none', borderRadius: 8, padding: '6px 14px',
            fontSize: 11, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <FaTrash size={10} />{labels.clear}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e293b', color: '#fff',
      padding: '12px 22px', borderRadius: 30,
      fontSize: 14, fontFamily: 'inherit', fontWeight: 600,
      boxShadow: '0 8px 32px rgba(15,23,42,0.25)',
      zIndex: 9999, whiteSpace: 'nowrap',
      animation: 'toastUp 0.25s ease',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <FaCheckCircle color="#4ade80" size={16} />{msg}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 }}>
      {children}
    </div>
  );
}

// ─── PresetPills ─────────────────────────────────────────────────────────────
export function PresetPills({ options, active, onSelect, accent }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, width: '100%' }}>
      {options.map(([val, label]) => (
        <button key={val} onClick={() => onSelect(val)} style={{
          padding: '6px 14px', borderRadius: 20,
          background: active === val ? accent : '#f1f5f9',
          color: active === val ? '#fff' : '#64748b',
          border: `1.5px solid ${active === val ? accent : '#e2e8f0'}`,
          fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          transition: 'all 0.15s', flexShrink: 0,
        }}>{label}</button>
      ))}
    </div>
  );
}
