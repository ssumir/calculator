import { useState, useRef, useEffect } from 'react';
import { FaArrowLeft, FaGlobe, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useLang } from '../context/LangContext.tsx';

interface Props {
  onBack:  () => void;
  title:   string;
  accent:  string;
  icon?:   React.ComponentType<{ size?: number; color?: string }>;
  info?:   string; // tooltip text — passed from each calculator
}

export default function Header({ onBack, title, accent, icon: Icon, info }: Props) {
  const { toggle, lang } = useLang();
  const [tooltip, setTooltip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!tooltip) return;
    const fn = (e: MouseEvent | TouchEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node))
        setTooltip(false);
    };
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn as any);
    return () => {
      document.removeEventListener('mousedown', fn);
      document.removeEventListener('touchstart', fn as any);
    };
  }, [tooltip]);

  return (
    <div style={{
      background: '#0d0d10',
      borderBottom: `1px solid ${accent}25`,
      padding: '0 14px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      paddingBottom: 10,
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0, position: 'sticky', top: 0, zIndex: 100,
      minHeight: 56,
      boxShadow: `0 2px 16px rgba(0,0,0,0.4)`,
    }}>
      {/* Back button */}
      <button onClick={onBack} style={{
        background: '#1a1a1e', border: `1px solid #2e2e38`,
        color: accent, borderRadius: 11, width: 36, height: 36, minWidth: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
      }}
        onTouchStart={e => (e.currentTarget.style.background = '#2e2e38')}
        onTouchEnd={e => { e.currentTarget.style.background = '#1a1a1e'; }}
      >
        <FaArrowLeft size={13} />
      </button>

      {/* Calculator icon */}
      {Icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={15} color={accent} />
        </div>
      )}

      {/* Title */}
      <span style={{
        flex: 1, fontSize: 15, fontWeight: 800, color: '#e8e8e8',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        minWidth: 0, letterSpacing: 0.2,
      }}>{title}</span>

      {/* Info / tooltip button — only if info text provided */}
      {info && (
        <div ref={tipRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setTooltip(t => !t)}
            aria-label="How to use"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: tooltip ? accent : '#1a1a1e',
              border: `1px solid ${tooltip ? accent : '#2e2e38'}`,
              color: tooltip ? '#fff' : accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.18s', flexShrink: 0,
            }}
          >
            {tooltip ? <FaTimes size={12} /> : <FaInfoCircle size={15} />}
          </button>

          {/* Tooltip card */}
          {tooltip && (
            <div style={{
              position: 'absolute', top: 42, right: 0,
              width: 'min(290px, 80vw)',
              background: '#1a1a1e',
              border: `2px solid ${accent}40`,
              borderRadius: 14,
              padding: '14px 16px',
              boxShadow: `0 8px 32px rgba(0,0,0,0.6)`,
              fontSize: 13, color: '#f1f0f5',
              lineHeight: 1.7, fontWeight: 500,
              zIndex: 500,
              whiteSpace: 'pre-line',
              fontFamily: "'Noto Serif Bengali','Outfit',sans-serif",
            }}>
              {/* Caret arrow */}
              <div style={{
                position: 'absolute', top: -7, right: 12,
                width: 13, height: 13,
                background: '#1a1a1e',
                border: `2px solid ${accent}40`,
                transform: 'rotate(45deg)',
                borderBottom: 'none', borderRight: 'none',
              }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10,
              }}>
                <FaInfoCircle size={13} color={accent} />
                <span style={{ fontWeight: 800, fontSize: 13, color: accent }}>
                  How to use
                </span>
              </div>
              {info}
            </div>
          )}
        </div>
      )}

      {/* Language toggle */}
      <button onClick={toggle} style={{
        background: '#1a1a1e', border: '1px solid #2e2e38',
        borderRadius: 20, padding: '5px 12px',
        fontSize: 11, fontWeight: 700, color: '#a8a4b8',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        gap: 4, flexShrink: 0, fontFamily: 'inherit',
      }}>
        <FaGlobe size={10} />{lang === 'bn' ? 'EN' : 'বাং'}
      </button>
    </div>
  );
}