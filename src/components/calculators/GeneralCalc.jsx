import { useState, useRef, useEffect } from 'react';
import { FaBackspace, FaFlask, FaKeyboard } from 'react-icons/fa';
import { ActionRow, HistoryPanel, Toast } from '../ui/index.jsx';
import { useLang } from '../../context/LangContext';
import { shareWA, buildShare } from '../../utils/share';

const A = '#6366f1';

const ROWS = [
  ['C','(',')', '÷'],
  ['7','8','9','×'],
  ['4','5','6','−'],
  ['1','2','3','+'],
  ['00','0','.','=']
];

// Extended scientific rows
const SCI = [
  ['sin','cos','tan','cot','sec','csc'],
  ['asin','acos','atan','sinh','cosh','tanh'],
  ['log','ln','log₂','√(','∛(','abs('],
  ['x²','x³','xʸ','10ˣ','eˣ','1/x'],
  ['π','e','φ','(',')', '!'],
  ['%','EE','mod','C','⌊⌋','⌈⌉'],
];
const SCI_DISPLAY = {
  'x²':'x²','x³':'x³','xʸ':'xʸ','√(':'√','∛(':'∛','log₂':'log₂',
  '10ˣ':'10ˣ','eˣ':'eˣ','1/x':'1/x','φ':'φ','⌊⌋':'⌊x⌋','⌈⌉':'⌈x⌉',
  'asin':'sin⁻¹','acos':'cos⁻¹','atan':'tan⁻¹',
  'sinh':'sinh','cosh':'cosh','tanh':'tanh',
  'EE':'EE','mod':'mod','abs(':'|x|',
};

function fact(n) {
  n = Math.floor(n);
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// Dynamic font size based on line count of expression
function getExprFontSize(text) {
  if (!text) return 15;
  const lines = Math.ceil(text.length / 22);
  if (lines >= 3) return 11;
  if (lines === 2) return 13;
  return 15;
}

function getResultFontSize(text) {
  if (!text) return 28;
  const len = String(text).length;
  const lines = Math.ceil(len / 18);
  if (lines >= 3) return 16;
  if (lines === 2) return 22;
  if (len > 12) return 24;
  return 32;
}

export default function GeneralCalc({ history, onAdd, onClear }) {
  const { t } = useLang();
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [sci, setSci] = useState(false);
  const [deg, setDeg] = useState(true);
  const [toast, setToast] = useState('');
  const displayRef = useRef(null);

  // Auto-scroll display to end
  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }
  }, [expr]);

  const ap = v => setExpr(e => e + v);
  const del = () => setExpr(e => e.slice(0, -1));
  const clr = () => { setExpr(''); setResult(null); setSaved(false); };

  const calc = () => {
    if (!expr.trim()) return;
    try {
      let e = expr
        .replace(/÷/g, '/')
        .replace(/×/g, '*')
        .replace(/−/g, '-')
        .replace(/φ/g, '1.6180339887498948482')
        .replace(/π/g, String(Math.PI))
        .replace(/\be\b/g, String(Math.E));

      // Modulo
      e = e.replace(/mod/g, '%');

      // Percentage
      e = e.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

      // Factorial
      e = e.replace(/(\d+(?:\.\d+)?)!/g, (_, p) => fact(parseFloat(p)));

      const toR = x => deg ? x * Math.PI / 180 : x;
      const fromR = x => deg ? x * 180 / Math.PI : x;

      // Trig functions
      e = e.replace(/sin\(([^)]+)\)/g, (_, a) => Math.sin(toR(+a)));
      e = e.replace(/cos\(([^)]+)\)/g, (_, a) => Math.cos(toR(+a)));
      e = e.replace(/tan\(([^)]+)\)/g, (_, a) => Math.tan(toR(+a)));
      e = e.replace(/cot\(([^)]+)\)/g, (_, a) => 1 / Math.tan(toR(+a)));
      e = e.replace(/sec\(([^)]+)\)/g, (_, a) => 1 / Math.cos(toR(+a)));
      e = e.replace(/csc\(([^)]+)\)/g, (_, a) => 1 / Math.sin(toR(+a)));

      // Inverse trig
      e = e.replace(/asin\(([^)]+)\)/g, (_, a) => fromR(Math.asin(+a)));
      e = e.replace(/acos\(([^)]+)\)/g, (_, a) => fromR(Math.acos(+a)));
      e = e.replace(/atan\(([^)]+)\)/g, (_, a) => fromR(Math.atan(+a)));

      // Hyperbolic
      e = e.replace(/sinh\(([^)]+)\)/g, (_, a) => Math.sinh(+a));
      e = e.replace(/cosh\(([^)]+)\)/g, (_, a) => Math.cosh(+a));
      e = e.replace(/tanh\(([^)]+)\)/g, (_, a) => Math.tanh(+a));

      // Logarithms
      e = e.replace(/log₂\(([^)]+)\)/g, (_, a) => Math.log2(+a));
      e = e.replace(/log\(([^)]+)\)/g, (_, a) => `(Math.log10(${a}))`);
      e = e.replace(/ln\(([^)]+)\)/g, (_, a) => `(Math.log(${a}))`);

      // Roots & powers
      e = e.replace(/∛\(([^)]+)\)/g, (_, a) => Math.cbrt(+a));
      e = e.replace(/√\(([^)]+)\)/g, (_, a) => `(Math.sqrt(${a}))`);
      e = e.replace(/abs\(([^)]+)\)/g, (_, a) => Math.abs(+a));
      e = e.replace(/10ˣ/g, '10**');
      e = e.replace(/eˣ/g, `${Math.E}**`);
      e = e.replace(/1\/x/g, '1/');
      e = e.replace(/x²/g, '**2');
      e = e.replace(/x³/g, '**3');
      e = e.replace(/xʸ/g, '**');

      // Floor/Ceil
      e = e.replace(/⌊([^⌋]+)⌋/g, (_, a) => Math.floor(+a));
      e = e.replace(/⌈([^⌉]+)⌉/g, (_, a) => Math.ceil(+a));

      // Scientific notation EE
      e = e.replace(/EE/g, 'e');

      const geval = eval;
      const r = geval(e);
      const d = typeof r === 'number'
        ? (Number.isInteger(r) ? r : parseFloat(r.toFixed(10)))
        : r;
      setResult(d);
      setSaved(false);
      onAdd('general', `${expr} = ${d}`);
    } catch {
      setResult(t.error + ' ❌');
    }
  };

  const handleBasic = v => {
    if (v === 'C') { clr(); return; }
    if (v === '=') { calc(); return; }
    ap(v);
  };

  const handleSci = v => {
    if (v === 'C') { clr(); return; }
    if (['sin','cos','tan','cot','sec','csc','asin','acos','atan','sinh','cosh','tanh','log','ln','log₂','√(','∛(','abs('].includes(v)) {
      // functions that need ( appended
      if (v.endsWith('(')) { ap(v); return; }
      ap(v + '(');
      return;
    }
    if (v === '⌊⌋') { ap('⌊'); return; }
    if (v === '⌈⌉') { ap('⌈'); return; }
    ap(v);
  };

  const bS = v => {
    if (v === '=') return { bg: A, fc: '#fff', fw: 800 };
    if (['÷','×','−','+'].includes(v)) return { bg: '#eef2ff', fc: A, fw: 700 };
    if (v === 'C') return { bg: '#fee2e2', fc: '#ef4444', fw: 700 };
    if (['(',')','.'].includes(v)) return { bg: '#f0f9ff', fc: '#0ea5e9', fw: 600 };
    return { bg: '#f8faff', fc: '#1e293b', fw: 500 };
  };

  const sciColor = v => {
    if (['sin','cos','tan','cot','sec','csc'].includes(v)) return { bg: '#eef2ff', fc: '#6366f1' };
    if (['asin','acos','atan'].includes(v)) return { bg: '#f5f3ff', fc: '#7c3aed' };
    if (['sinh','cosh','tanh'].includes(v)) return { bg: '#fdf4ff', fc: '#a21caf' };
    if (['log','ln','log₂'].includes(v)) return { bg: '#f0f9ff', fc: '#0ea5e9' };
    if (['√(','∛(','x²','x³','xʸ'].includes(v)) return { bg: '#fffbeb', fc: '#f59e0b' };
    if (['π','e','φ'].includes(v)) return { bg: '#ecfdf5', fc: '#10b981' };
    if (['10ˣ','eˣ','1/x'].includes(v)) return { bg: '#fff7ed', fc: '#f97316' };
    if (v === 'C') return { bg: '#fee2e2', fc: '#ef4444' };
    if (['abs(','⌊⌋','⌈⌉'].includes(v)) return { bg: '#f0fdfa', fc: '#14b8a6' };
    return { bg: '#f8faff', fc: '#64748b' };
  };

  const exprFontSize = getExprFontSize(expr);
  const resFontSize = result !== null ? getResultFontSize(String(result)) : 28;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* Display */}
      <div style={{
        background: '#1e293b', borderRadius: 18, padding: '16px 18px',
        marginBottom: 14, minHeight: 100, display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', boxShadow: '0 4px 20px rgba(15,23,42,0.15)',
        width: '100%', overflow: 'hidden',
      }}>
        <div
          ref={displayRef}
          style={{
            color: '#94a3b8', fontSize: exprFontSize,
            wordBreak: 'break-all', fontFamily: 'monospace',
            overflowWrap: 'break-word', lineHeight: 1.5,
            maxHeight: 60, overflowY: 'auto',
            transition: 'font-size 0.15s ease',
          }}
        >
          {expr || '0'}
        </div>
        {result !== null && (
          <div style={{
            color: '#fbbf24', fontSize: resFontSize,
            fontFamily: 'Press Start 2P, monospace', marginTop: 8,
            wordBreak: 'break-all', overflowWrap: 'break-word',
            animation: 'popIn 0.22s ease', lineHeight: 1.25,
            transition: 'font-size 0.15s ease',
          }}>
            = {result}
          </div>
        )}
      </div>

      {/* Mode toggles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, width: '100%' }}>
        <button onClick={() => setSci(s => !s)} style={{
          flex: 1, padding: '9px', background: sci ? '#eef2ff' : '#f8faff',
          border: `2px solid ${sci ? A : '#e2e8f0'}`, borderRadius: 10,
          color: sci ? A : '#64748b', fontSize: 13, fontWeight: 700,
          fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minWidth: 0,
        }}>
          {sci ? <FaKeyboard size={12} /> : <FaFlask size={12} />}
          {sci ? t.basicMode : t.sciMode}
        </button>
        {sci && (
          <button onClick={() => setDeg(d => !d)} style={{
            flexShrink: 0, padding: '9px 14px', background: '#f8faff',
            border: '2px solid #e2e8f0', borderRadius: 10, color: '#64748b',
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            {deg ? t.degree : t.radian}
          </button>
        )}
      </div>

      {/* Scientific keys */}
      {sci && (
        <div style={{
          marginBottom: 12, background: '#f8faff', borderRadius: 14,
          padding: 10, border: '1px solid #e2e8f0', width: '100%', overflow: 'hidden',
        }}>
          {/* Category labels */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
            {[['Trig','#6366f1'],['Inv/Hyp','#7c3aed'],['Log','#0ea5e9'],['Power','#f59e0b'],['Const','#10b981'],['Misc','#14b8a6']].map(([lbl, c]) => (
              <span key={lbl} style={{ fontSize: 9, fontWeight: 700, color: c, background: c+'15', borderRadius: 4, padding: '2px 6px' }}>{lbl}</span>
            ))}
          </div>
          {SCI.map((row, ri) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, minmax(0,1fr))`, gap: 5, marginBottom: 5 }}>
              {row.map(v => {
                const { bg, fc } = sciColor(v);
                return (
                  <button key={v} onClick={() => handleSci(v)} style={{
                    background: bg, color: fc, border: 'none', borderRadius: 8,
                    height: 36, fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
                    cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
                  }}>
                    {SCI_DISPLAY[v] || v}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Basic keys */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 8, marginBottom: 8, width: '100%' }}>
        {ROWS.flat().map((v, i) => {
          const { bg, fc, fw } = bS(v);
          return (
            <button key={i} onClick={() => handleBasic(v)} style={{
              background: bg, color: fc,
              border: `1px solid ${v === '=' ? 'transparent' : '#f1f5f9'}`,
              borderRadius: 13, height: 58, fontSize: v === '00' ? 14 : 20,
              fontWeight: fw, fontFamily: 'inherit',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)', cursor: 'pointer', overflow: 'hidden',
            }}>
              {v}
            </button>
          );
        })}
        <button onClick={del} style={{
          background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca',
          borderRadius: 13, height: 58, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        }}>
          <FaBackspace size={20} />
        </button>
      </div>

      <ActionRow
        onCalc={calc}
        onSave={() => {
          if (result !== null && !String(result).includes('❌')) {
            setSaved(true); setToast(t.saved);
          }
        }}
        onShare={() => {
          if (result !== null) shareWA(buildShare('🧮', [`${expr} = ${result}`]));
        }}
        accent={A} saved={saved} label={t.calculate}
      />
      <HistoryPanel
        items={history} accent={A}
        onClear={() => onClear && onClear('general')}
        labels={{ history: t.history, clear: t.clearHistory }}
      />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}