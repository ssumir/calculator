import React, { useMemo } from 'react';
import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler,
  FaExchangeAlt, FaGlobe, FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
} from 'react-icons/fa';
import { useLang } from '../context/LangContext.tsx';
import { APPS } from '../utils/constants.ts';

// ── Ultra-Eye-Catching Premium Dark Design Tokens ───────────────────────────
const T = {
  // Deep space rich background mesh
  bgMain:       'linear-gradient(160deg, #060609 0%, #0c0c14 100%)', 
  bgCard:       '#111118', 
  bgCardHover:  '#161624', 
  bgHeader:     'rgba(10, 10, 16, 0.85)',
  textPrimary:  '#ffffff', 
  textSecondary:'#a2a0b6', // High-contrast crisp lavender-slate
  textMuted:    '#5a5875', 
  border:       '#1f1f30',
  borderCard:   '#181824',
  font:         "'Noto Serif Bengali','Inter','Noto Sans Bengali',sans-serif",
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
  FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
};

interface Props {
  onOpen: (id: string) => void;
  history: Record<string, string[]>;
  device?: { w?: number };
}

export default function HomeScreen({ onOpen, history, device = {} }: Props) {
  const { t, lang, toggle } = useLang();
  const w = device.w || 375;

  const { cols, rows, placeholders } = useMemo(() => {
    const total      = APPS.length;
    const columns    = 4; 
    const totalRows  = Math.ceil(total / columns);
    const extraCells = columns * totalRows - total;
    return { cols: columns, rows: totalRows, placeholders: extraCells };
  }, [w]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: T.bgMain,
      color: T.textPrimary,
      fontFamily: T.font,
      overflow: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>

      {/* ── HEADER ── */}
      <header style={{
        flexShrink: 0,
        padding: `calc(env(safe-area-inset-top,0px) + 14px) 16px 12px`,
        background: T.bgHeader,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24, animation: 'bounce 2.5s ease-in-out infinite', lineHeight: 1 }}>🍄</span>
          <div>
            <h1 style={{
              color: T.textPrimary,
              fontSize: 12,
              fontWeight: 800,
              margin: 0,
              letterSpacing: 1.5,
              fontFamily: "'Press Start 2P', monospace",
              lineHeight: 1.2,
              // Cyberpunk title text glow
              textShadow: '0 0 10px rgba(255,255,255,0.15)', 
            }}>
              MARIO CALCULATOR
            </h1>
            <p style={{
              color: T.textSecondary,
              fontSize: 10,
              fontWeight: 500,
              margin: '4px 0 0',
              fontFamily: T.font,
            }}>
              {t.tagline}
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          style={{
            background: 'rgba(32, 32, 48, 0.5)',
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            height: 34,
            padding: '0 13px',
            fontSize: 11,
            fontWeight: 700,
            color: '#c2bfe0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: T.font,
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#28283d';
            e.currentTarget.style.borderColor = '#444466';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(32, 32, 48, 0.5)';
            e.currentTarget.style.borderColor = T.border;
            e.currentTarget.style.color = '#c2bfe0';
          }}
        >
          <FaGlobe size={11} color="#6366f1" />
          <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
        </button>
      </header>

      {/* ── EYE-CATCHING MATRIX GRID ── */}
      <main style={{
        flex: 1,
        minHeight: 0,
        padding: `12px 10px calc(env(safe-area-inset-bottom,0px) + 64px) 10px`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        <h2 style={{
          fontSize: 9,
          fontWeight: 700,
          color: T.textMuted,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: '0 0 10px 2px',
          flexShrink: 0,
          fontFamily: T.font,
        }}>
          {t.selectCalc}
        </h2>

        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 9,
        }}>
          {APPS.map((app, idx) => {
            const Icon    = ICON_MAP[app.icon];
            const count   = (history[app.id] || []).length;
            const appT    = t.apps[app.id as keyof typeof t.apps];
            
            // Core energetic app color
            const accent  = app.color || '#6366f1'; 

            const labelPrimary   = appT?.label || app.id;
            const labelSecondary = lang === 'bn' ? (appT?.desc || '') : '';

            return (
              <button
                key={app.id}
                onClick={() => onOpen(app.id)}
                style={{
                  '--local-accent': accent,
                  background: T.bgCard,
                  // Structural color top edge
                  borderTop:    `4px solid var(--local-accent)`,
                  borderLeft:   `1px solid ${T.borderCard}`,
                  borderRight:  `1px solid ${T.borderCard}`,
                  borderBottom: `1px solid ${T.borderCard}`,
                  borderRadius: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px 8px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.15s ease, background-color 0.15s, border-color 0.15s',
                  minWidth: 0,
                  minHeight: 0,
                  overflow: 'hidden',
                  outline: 'none',
                  // Soft dark ambient drop shadow
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                  animation: `slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.018}s both`,
                } as React.CSSProperties}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = T.bgCardHover;
                  e.currentTarget.style.borderColor = 'var(--local-accent)';
                  // High attractiveness factor: Colorful custom radiant neon bloom glow
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.6), 0 0 16px var(--local-accent)40';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = T.bgCard;
                  e.currentTarget.style.borderColor = T.borderCard;
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                }}
                onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.96) translateY(0px)')}
                onTouchEnd={e   => (e.currentTarget.style.transform = 'translateY(0px) scale(1)')}
              >
                {/* Neon Activity Count Notification Badge */}
                {count > 0 && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    background: 'var(--local-accent)', color: '#fff',
                    borderRadius: 8, fontSize: 8, fontWeight: 900,
                    padding: '1px 5px', minWidth: 15, height: 15,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2,
                    boxShadow: '0 0 10px var(--local-accent)',
                  }}>
                    {count}
                  </div>
                )}

                {/* High-vibrancy Gradient-Tint Icon Pod */}
                <div style={{
                  width:  'clamp(34px, 38%, 44px)',
                  height: 'clamp(34px, 38%, 44px)',
                  borderRadius: 12,
                  // Beautiful deep lighting effect underneath the icon
                  background: 'linear-gradient(135deg, var(--local-accent)25 0%, var(--local-accent)05 100%)',
                  border: '1px solid var(--local-accent)40',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginBottom: 9,
                  boxShadow: 'inset 0 1px 4px rgba(255,255,255,0.1)',
                }}>
                  {Icon && <Icon size={18} color="var(--local-accent)" />}
                </div>

                {/* Dual-Language Typography Array */}
                <div style={{
                  width: '100%', 
                  textAlign: 'center',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  minWidth: 0,
                }}>
                  {/* Primary Eng Heading */}
                  <span style={{
                    fontSize: 'clamp(10px, 2.5vw, 12.5px)',
                    fontWeight: 700,
                    color: T.textPrimary,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    paddingInline: 4,
                    display: 'block',
                    fontFamily: T.font,
                  }}>
                    {labelPrimary}
                  </span>

                  {/* Secondary Bengali Translation sub-label */}
                  {labelSecondary && (
                    <span style={{
                      fontSize: 'clamp(8.5px, 2vw, 10.5px)',
                      fontWeight: 500,
                      color: T.textSecondary,
                      lineHeight: 1.15,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      paddingInline: 4,
                      display: 'block',
                      fontFamily: T.font,
                      opacity: 0.85,
                    }}>
                      {labelSecondary}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {/* Aesthetic framework skeletons filling the matrix layout symmetry */}
          {Array.from({ length: placeholders }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                borderRadius: 14,
                background: 'rgba(255,255,255,0.01)',
                border: `1px dashed ${T.border}`,
                opacity: 0.15,
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}