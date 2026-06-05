import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler,
  FaExchangeAlt, FaGlobe, FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
} from 'react-icons/fa';
import { useLang } from '../context/LangContext.tsx';
import { APPS } from '../utils/constants.ts';

const T = {
  bgBody:   '#07080d',
  bgHeader: 'rgba(7,8,13,0.92)',
  textPri:  '#eeedf5',
  textSec:  '#8b89a8',
  textMuted:'#3c3c52',
  border:   'rgba(255,255,255,0.07)',
  font:     "'Noto Serif Bengali','Outfit','Noto Sans Bengali',sans-serif",
  fontMono: "'Space Mono',monospace",
};

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Space+Mono:wght@700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{width:100%;height:100%;overflow:hidden;background:#07080d}
@keyframes _floatUp{from{opacity:0;transform:translateY(14px) scale(0.92)}to{opacity:1;transform:none}}
@keyframes _bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
.hsc-card{
  position:relative;cursor:pointer;border:none;
  background:rgba(255,255,255,0.034);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,0.07);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  overflow:hidden;outline:none;
  transition:transform .16s cubic-bezier(.22,1,.36,1),background .16s,box-shadow .16s;
}
.hsc-card::before{
  content:'';position:absolute;inset:0;border-radius:inherit;
  background:radial-gradient(ellipse at 50% -5%,var(--ac)1a 0%,transparent 68%);
  opacity:0;transition:opacity .2s;pointer-events:none;
}
.hsc-card:hover::before,.hsc-card:focus-visible::before{opacity:1}
.hsc-card:hover{
  transform:translateY(-3px) scale(1.03);
  background:rgba(255,255,255,0.07);
  box-shadow:inset 0 0 0 1px var(--ac)55,0 0 18px var(--ac)2a;
}
.hsc-card:active{transform:scale(0.93)!important;transition-duration:.06s}
.hsc-card:focus-visible{box-shadow:0 0 0 2px var(--ac)}
.hsc-badge{
  position:absolute;background:var(--ac);color:#fff;
  border-radius:5px;font-weight:900;
  display:flex;align-items:center;justify-content:center;
  font-family:'Space Mono',monospace;z-index:2;
}
.hsc-pod{
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  background:linear-gradient(135deg,var(--ac)1a 0%,var(--ac)08 100%);
  border:1px solid var(--ac)30;
  transition:transform .16s,box-shadow .16s;
}
.hsc-card:hover .hsc-pod{transform:scale(1.1);box-shadow:0 0 10px var(--ac)3a}
.hsc-lm{font-weight:700;color:#eeedf5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;width:100%;text-align:center}
.hsc-ls{font-weight:400;color:#6b6988;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block;width:100%;text-align:center}
.hsc-empty{background:rgba(255,255,255,0.015);border:1px dashed rgba(255,255,255,0.06);opacity:.5;cursor:default}
.hsc-langbtn{
  background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
  color:#a0a0c0;cursor:pointer;display:flex;align-items:center;gap:6px;
  font-family:'Outfit',sans-serif;font-weight:700;
  transition:background .2s,color .2s;flex-shrink:0;
}
.hsc-langbtn:hover{background:rgba(255,255,255,0.11);color:#fff}
`;

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
  FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
};

// 3 cols on mobile (<768px), 4 on tablet/desktop
function numCols(w: number): number {
  return w >= 768 ? 4 : 3;
}

interface CellLayout {
  cols:     number;
  rows:     number;
  cell:     number;
  gap:      number;
  lastRowCount: number;
  podSz:    number;
  podR:     number;
  iconSz:   number;
  fMain:    number;
  fSub:     number;
  cardR:    number;
  mb:       number;
  padH:     number;
  badgeSz:  number;
  badgeFs:  number;
}

function calcLayout(vw: number, vh: number, hdrH: number, tabH: number): CellLayout {
  const cols   = numCols(vw);
  const total  = APPS.length;
  const rows   = Math.ceil(total / cols);
  const gap    = 8;
  const pad    = Math.max(8, Math.round(vw * 0.02));
  const labelH = 26; // section label + margin

  const availW = vw - pad * 2;
  const availH = vh - hdrH - tabH - labelH - pad * 2;

  const cellW  = Math.floor((availW - gap * (cols - 1)) / cols);
  const cellH  = Math.floor((availH - gap * (rows - 1)) / rows);
  const cell   = Math.max(44, Math.min(cellW, cellH));

  const podSz  = Math.floor(cell * 0.36);
  const podR   = Math.max(6, Math.floor(podSz * 0.28));
  const iconSz = Math.max(13, Math.floor(podSz * 0.52));
  const fMain  = Math.max(9, Math.min(13, Math.floor(cell * 0.115)));
  const fSub   = Math.max(8, Math.min(11, Math.floor(cell * 0.095)));
  const cardR  = Math.max(8, Math.floor(cell * 0.14));
  const mb     = Math.max(4, Math.floor(cell * 0.06));
  const padH   = Math.max(4, Math.floor(cell * 0.07));
  const badgeSz= Math.max(13, Math.floor(cell * 0.13));
  const badgeFs= Math.max(7, Math.floor(badgeSz * 0.6));
  const lastRowCount = total - (rows - 1) * cols;

  return { cols, rows, cell, gap, lastRowCount, podSz, podR, iconSz,
           fMain, fSub, cardR, mb, padH, badgeSz, badgeFs };
}

interface Props {
  onOpen:       (id: string) => void;
  history:      Record<string, string[]>;
  tabBarHeight?: number;
}

export default function HomeScreen({ onOpen, history, tabBarHeight = 60 }: Props) {
  const { t, lang, toggle } = useLang();
  const hdrRef = useRef<HTMLElement>(null);
  const [layout, setLayout] = useState<CellLayout | null>(null);

  useEffect(() => {
    const id = 'hsc-styles';
    if (!document.getElementById(id)) {
      const el = document.createElement('style');
      el.id = id; el.textContent = STYLES;
      document.head.appendChild(el);
    }
  }, []);

  const recompute = useCallback(() => {
    const hdrH = hdrRef.current?.offsetHeight ?? 60;
    setLayout(calcLayout(window.innerWidth, window.innerHeight, hdrH, tabBarHeight));
  }, [tabBarHeight]);

  useEffect(() => {
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [recompute]);

  const pad = layout ? Math.max(8, Math.round(window.innerWidth * 0.02)) : 10;

  return (
    <div style={{
      width: '100dvw', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      background: T.bgBody, color: T.textPri,
      fontFamily: T.font, overflow: 'hidden', position: 'relative',
    }}>
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 55% at 15% 18%,rgba(99,102,241,.07) 0%,transparent 60%),
          radial-gradient(ellipse 55% 45% at 85% 82%,rgba(236,72,153,.05) 0%,transparent 60%)`,
      }} />

      {/* HEADER */}
      <header ref={hdrRef} style={{
        flexShrink: 0, zIndex: 10, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        paddingTop: `max(env(safe-area-inset-top,0px),12px)`,
        paddingBottom: '12px',
        paddingInline: `clamp(12px,3vw,24px)`,
        background: T.bgHeader,
        borderBottom: `1px solid ${T.border}`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 'clamp(20px,4vw,26px)', lineHeight: 1, flexShrink: 0,
            display: 'inline-block', animation: '_bob 3s ease-in-out infinite',
          }}>🍄</span>
          <div>
            <h1 style={{
              fontFamily: T.fontMono, margin: 0,
              fontSize: 'clamp(10px,2.2vw,13px)', fontWeight: 700,
              letterSpacing: 'clamp(1px,.3vw,2.5px)', color: T.textPri, lineHeight: 1.25,
            }}>MARIO CALCULATOR</h1>
            <p style={{
              fontSize: 'clamp(9px,1.5vw,11px)', color: T.textSec,
              marginTop: 3, lineHeight: 1, fontFamily: T.font,
            }}>{t.tagline}</p>
          </div>
        </div>
        <button className="hsc-langbtn" onClick={toggle} style={{
          borderRadius: 'clamp(7px,1.5vw,12px)',
          height: 'clamp(28px,4.5vw,36px)',
          padding: '0 clamp(10px,2vw,14px)',
          fontSize: 'clamp(10px,1.6vw,12px)',
        }}>
          <FaGlobe size={11} color="#6366f1" />
          <span>{lang === 'bn' ? 'EN' : 'বাং'}</span>
        </button>
      </header>

      {/* MAIN */}
      <main style={{
        flex: 1, minHeight: 0, zIndex: 1, position: 'relative',
        display: 'flex', flexDirection: 'column',
        padding: `10px ${pad}px 10px`,
        overflow: 'hidden',
      }}>
        <p style={{
          fontFamily: T.fontMono, fontSize: 9, fontWeight: 700,
          color: T.textMuted, letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: 8, flexShrink: 0,
        }}>{t.selectCalc}</p>

        {layout && (() => {
          const { cols, rows, cell, gap, lastRowCount,
                  podSz, podR, iconSz, fMain, fSub,
                  cardR, mb, padH, badgeSz, badgeFs } = layout;

          // Build rows array: each row is an array of app indices (or null = empty filler)
          const rowsData: (number | null)[][] = [];
          for (let r = 0; r < rows; r++) {
            const isLast = r === rows - 1;
            const count  = isLast ? lastRowCount : cols;
            const row: (number | null)[] = [];
            for (let c = 0; c < count; c++) row.push(r * cols + c);
            // empty fillers for last row — stretch to fill width
            const empties = cols - count;
            for (let e = 0; e < empties; e++) row.push(null);
            rowsData.push(row);
          }

          return (
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap, flex: 1, minHeight: 0,
            }}>
              {rowsData.map((row, ri) => (
                <div key={ri} style={{
                  display: 'flex', gap,
                  height: cell, flexShrink: 0,
                }}>
                  {row.map((appIdx, ci) => {
                    // Empty filler — spans remaining width equally
                    if (appIdx === null) {
                      return (
                        <div key={`e-${ci}`} className="hsc-card hsc-empty"
                          style={{ flex: 1, height: cell, borderRadius: cardR }} />
                      );
                    }

                    const app   = APPS[appIdx];
                    const Icon  = ICON_MAP[app.icon];
                    const count = (history[app.id] || []).length;
                    const appT  = t.apps[app.id as keyof typeof t.apps];
                    const accent= app.color || '#6366f1';
                    const label = appT?.label || app.id;
                    const sub   = lang === 'bn' ? (appT?.desc || '') : '';

                    return (
                      <button
                        key={app.id}
                        className="hsc-card"
                        onClick={() => onOpen(app.id)}
                        aria-label={label}
                        style={{
                          '--ac': accent,
                          flex: 1,          // all cards in a row share width equally
                          height: cell,
                          borderRadius: cardR,
                          padding: `${padH}px`,
                          animationName: '_floatUp',
                          animationDuration: '0.32s',
                          animationTimingFunction: 'cubic-bezier(.16,1,.3,1)',
                          animationDelay: `${appIdx * 0.02}s`,
                          animationFillMode: 'both',
                        } as React.CSSProperties}
                      >
                        {count > 0 && (
                          <span className="hsc-badge" style={{
                            top: 5, right: 5,
                            width: badgeSz, height: badgeSz,
                            fontSize: badgeFs,
                            borderRadius: Math.floor(badgeSz * 0.4),
                          }}>
                            {count}
                          </span>
                        )}
                        <div className="hsc-pod" style={{
                          width: podSz, height: podSz,
                          borderRadius: podR, marginBottom: mb,
                        }}>
                          {Icon && <Icon size={iconSz} color={accent} />}
                        </div>
                        <div style={{ width: '100%', minWidth: 0 }}>
                          <span className="hsc-lm" style={{
                            fontSize: fMain, fontFamily: T.font, lineHeight: 1.2,
                          }}>{label}</span>
                          {sub && (
                            <span className="hsc-ls" style={{
                              fontSize: fSub, fontFamily: T.font,
                              lineHeight: 1.15, display: 'block', marginTop: 2,
                            }}>{sub}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}
      </main>
    </div>
  );
}