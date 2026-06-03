import { useState, useRef, useEffect } from 'react';
import { HistoryPanel, Toast } from '../ui/index.tsx';
import { useLang } from '../../context/LangContext.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

// ── Color palette ──────────────────────────────────────────────────────────────
const BG      = '#1c1c1e';
const DARK    = '#2c2c2e';   // number keys
const LIGHT   = '#636366';   // fn keys: AC, +/−, %
const ORANGE  = '#ff9f0a';   // operator keys
const WHITE   = '#ffffff';
const DIM     = '#8e8e93';   // expression preview

// ── Scientific categories → colors ────────────────────────────────────────────
const CAT: Record<string,{bg:string;fc:string}> = {
  trig:   { bg:'#1c2a1c', fc:'#4ade80' },
  inv:    { bg:'#1c2420', fc:'#34d399' },
  hyp:    { bg:'#1c1a2c', fc:'#a78bfa' },
  log:    { bg:'#2a1c10', fc:'#fb923c' },
  pow:    { bg:'#2a1c1c', fc:'#f87171' },
  root:   { bg:'#1c2028', fc:'#60a5fa' },
  const:  { bg:'#28201c', fc:'#fbbf24' },
  calc:   { bg:'#201c28', fc:'#e879f9' },  // Calculus
  alg:    { bg:'#1c2820', fc:'#6ee7b7' },  // Algebra
  misc:   { bg:'#222228', fc:'#94a3b8' },
  clear:  { bg:'#2a1010', fc:'#ff453a' },
  bracket:{ bg:'#1e2030', fc:'#93c5fd' },
};

function cat(v: string) {
  if (['sin','cos','tan','cot','sec','csc'].includes(v))           return CAT.trig;
  if (['sin⁻¹','cos⁻¹','tan⁻¹'].includes(v))                     return CAT.inv;
  if (['sinh','cosh','tanh','coth','sech','csch'].includes(v))    return CAT.hyp;
  if (['log','ln','log₂','log₃'].includes(v))                     return CAT.log;
  if (['x²','x³','xʸ','10ˣ','eˣ','2ˣ'].includes(v))              return CAT.pow;
  if (['√','∛','∜','|x|'].includes(v))                            return CAT.root;
  if (['π','e','φ','∞'].includes(v))                              return CAT.const;
  if (['d/dx','∫','Σ','n!','nPr','nCr'].includes(v))              return CAT.calc;
  if (['x²−','quad','gcd','lcm','%of'].includes(v))               return CAT.alg;
  if (['(',')',','].includes(v))                                   return CAT.bracket;
  if (v === 'C' || v === 'CE')                                    return CAT.clear;
  return CAT.misc;
}

// ── Scientific key layout (5 tabs) ────────────────────────────────────────────
type SciTab = 'TRIG'|'LOG'|'POWER'|'CALC'|'CONST';
const SCI_TABS: SciTab[] = ['TRIG','LOG','POWER','CALC','CONST'];

const SCI_KEYS: Record<SciTab, string[][]> = {
  TRIG:  [
    ['sin',  'cos',  'tan',  'cot',  'sec',  'csc' ],
    ['sin⁻¹','cos⁻¹','tan⁻¹','sinh', 'cosh', 'tanh'],
    ['coth', 'sech', 'csch', '(',    ')',     'C'   ],
  ],
  LOG:   [
    ['log',  'ln',   'log₂', 'log₃', '10ˣ',  'eˣ'  ],
    ['|x|',  'n!',   'nPr',  'nCr',  '⌊⌋',   '⌈⌉'  ],
    ['%',    'mod',  'EE',   '(',    ')',     'C'   ],
  ],
  POWER: [
    ['x²',   'x³',   'xʸ',   '√',    '∛',    '∜'   ],
    ['2ˣ',   '1/x',  'x!',   '(',    ')',     'C'   ],
    ['%of',  'gcd',  'lcm',  '±',    '.',     'C'   ],
  ],
  CALC:  [
    ['d/dx', '∫',    'Σ',    'lim',  'nPr',  'nCr' ],
    ['n!',   'mod',  'gcd',  'lcm',  '(',    ')'   ],
    ['x²',   '√',    'π',    'e',    '%',    'C'   ],
  ],
  CONST: [
    ['π',    'e',    'φ',    '∞',    '(',    ')'   ],
    ['sin',  'cos',  'tan',  'log',  'ln',   '√'   ],
    ['x²',   'xʸ',   'n!',   '%',    'EE',   'C'   ],
  ],
};

// Labels to display on buttons (different from token)
const LABEL: Record<string,string> = {
  'sin⁻¹':'sin⁻¹','cos⁻¹':'cos⁻¹','tan⁻¹':'tan⁻¹',
  '√':'√x','∛':'∛x','∜':'∜x','|x|':'|x|',
  'x²':'x²','x³':'x³','xʸ':'xʸ','10ˣ':'10ˣ','eˣ':'eˣ','2ˣ':'2ˣ',
  '⌊⌋':'⌊x⌋','⌈⌉':'⌈x⌉',
  'n!':'n!','nPr':'nPr','nCr':'nCr',
  'd/dx':'d/dx','∫':'∫dx','Σ':'Σ','lim':'lim',
  'gcd':'GCD','lcm':'LCM','%of':'%of',
  'log₂':'log₂','log₃':'log₃',
  'sinh':'sinh','cosh':'cosh','tanh':'tanh',
  'coth':'coth','sech':'sech','csch':'csch',
  'x!':'x!','±':'+/−',
};

// ── Math engine ────────────────────────────────────────────────────────────────
function fact(n: number): number {
  n = Math.floor(Math.abs(n));
  if (n > 170) return Infinity;
  if (n <= 1) return 1;
  let r = 1; for (let i=2;i<=n;i++) r*=i; return r;
}
function perm(n:number,r:number):number { return fact(n)/fact(n-r); }
function comb(n:number,r:number):number { return fact(n)/(fact(r)*fact(n-r)); }
function gcd(a:number,b:number):number { a=Math.abs(a);b=Math.abs(b); while(b){const t=b;b=a%b;a=t;} return a; }
function lcm(a:number,b:number):number { return Math.abs(a*b)/gcd(a,b); }

function evaluate(expr: string, deg: boolean): number | string {
  try {
    let e = expr
      .replace(/÷/g,'/')
      .replace(/×/g,'*')
      .replace(/−/g,'-')
      .replace(/π/g, String(Math.PI))
      .replace(/φ/g,'1.6180339887498948482')
      .replace(/∞/g,'Infinity')
      .replace(/\be\b(?![+\-\d])/g, String(Math.E));

    // Degree/radian conversion wrapper
    const toR  = (x:number) => deg ? x*Math.PI/180 : x;
    const fromR= (x:number) => deg ? x*180/Math.PI : x;

    // ── Trig ──
    e = e.replace(/sin⁻¹\(([^)]+)\)/g,(_,a)=>String(fromR(Math.asin(+a))));
    e = e.replace(/cos⁻¹\(([^)]+)\)/g,(_,a)=>String(fromR(Math.acos(+a))));
    e = e.replace(/tan⁻¹\(([^)]+)\)/g,(_,a)=>String(fromR(Math.atan(+a))));
    e = e.replace(/sin\(([^)]+)\)/g,   (_,a)=>String(Math.sin(toR(+a))));
    e = e.replace(/cos\(([^)]+)\)/g,   (_,a)=>String(Math.cos(toR(+a))));
    e = e.replace(/tan\(([^)]+)\)/g,   (_,a)=>String(Math.tan(toR(+a))));
    e = e.replace(/cot\(([^)]+)\)/g,   (_,a)=>String(1/Math.tan(toR(+a))));
    e = e.replace(/sec\(([^)]+)\)/g,   (_,a)=>String(1/Math.cos(toR(+a))));
    e = e.replace(/csc\(([^)]+)\)/g,   (_,a)=>String(1/Math.sin(toR(+a))));
    // Hyperbolic
    e = e.replace(/sinh\(([^)]+)\)/g,  (_,a)=>String(Math.sinh(+a)));
    e = e.replace(/cosh\(([^)]+)\)/g,  (_,a)=>String(Math.cosh(+a)));
    e = e.replace(/tanh\(([^)]+)\)/g,  (_,a)=>String(Math.tanh(+a)));
    e = e.replace(/coth\(([^)]+)\)/g,  (_,a)=>String(1/Math.tanh(+a)));
    e = e.replace(/sech\(([^)]+)\)/g,  (_,a)=>String(1/Math.cosh(+a)));
    e = e.replace(/csch\(([^)]+)\)/g,  (_,a)=>String(1/Math.sinh(+a)));
    // Logs
    e = e.replace(/log₂\(([^)]+)\)/g,  (_,a)=>String(Math.log2(+a)));
    e = e.replace(/log₃\(([^)]+)\)/g,  (_,a)=>String(Math.log(+a)/Math.log(3)));
    e = e.replace(/log\(([^)]+)\)/g,   (_,a)=>String(Math.log10(+a)));
    e = e.replace(/ln\(([^)]+)\)/g,    (_,a)=>String(Math.log(+a)));
    // Roots
    e = e.replace(/∜\(([^)]+)\)/g,     (_,a)=>String(Math.pow(+a,0.25)));
    e = e.replace(/∛\(([^)]+)\)/g,     (_,a)=>String(Math.cbrt(+a)));
    e = e.replace(/√\(([^)]+)\)/g,     (_,a)=>String(Math.sqrt(+a)));
    e = e.replace(/\|([^|]+)\|/g,      (_,a)=>String(Math.abs(+a)));
    // Powers
    e = e.replace(/10ˣ\(([^)]+)\)/g,   (_,a)=>String(Math.pow(10,+a)));
    e = e.replace(/eˣ\(([^)]+)\)/g,    (_,a)=>String(Math.exp(+a)));
    e = e.replace(/2ˣ\(([^)]+)\)/g,    (_,a)=>String(Math.pow(2,+a)));
    e = e.replace(/x²/g,'**2');
    e = e.replace(/x³/g,'**3');
    e = e.replace(/xʸ/g,'**');
    e = e.replace(/1\/x/g,'1/');
    // Combinatorics
    e = e.replace(/nCr\(([^,)]+),([^)]+)\)/g, (_,n,r)=>String(comb(+n,+r)));
    e = e.replace(/nPr\(([^,)]+),([^)]+)\)/g, (_,n,r)=>String(perm(+n,+r)));
    e = e.replace(/gcd\(([^,)]+),([^)]+)\)/g, (_,a,b)=>String(gcd(+a,+b)));
    e = e.replace(/lcm\(([^,)]+),([^)]+)\)/g, (_,a,b)=>String(lcm(+a,+b)));
    // Factorial
    e = e.replace(/(\d+(?:\.\d+)?)!/g, (_,p)=>String(fact(+p)));
    e = e.replace(/x!/g, ''); // clear leftover token
    // Percent
    e = e.replace(/(\d+(?:\.\d+)?)%of(\d+(?:\.\d+)?)/g, (_,a,b)=>String(+a/100*+b));
    e = e.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
    e = e.replace(/mod/g,'%');
    // Floor/ceil
    e = e.replace(/⌊([^⌋]+)⌋/g, (_,a)=>String(Math.floor(+a)));
    e = e.replace(/⌈([^⌉]+)⌉/g, (_,a)=>String(Math.ceil(+a)));
    // Scientific notation
    e = e.replace(/EE/g,'e');
    // Powers shorthand
    e = e.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g,'($1**$2)');

    // Calculus — numerical approximations
    // d/dx(expr,x,val) — numerical derivative using central difference
    e = e.replace(/d\/dx\(([^,)]+),([^,)]+),([^)]+)\)/g, (_,fexpr,xvar,xval) => {
      const h = 1e-7;
      const xv = +xval;
      const evalAt = (x:number) => {
        const sub = fexpr.replace(new RegExp(xvar,'g'), String(x));
        try { return (0,eval)(sub); } catch { return NaN; }
      };
      return String((evalAt(xv+h)-evalAt(xv-h))/(2*h));
    });
    // ∫(expr,x,a,b) — numerical integration (Simpson's rule, 1000 steps)
    e = e.replace(/∫\(([^,)]+),([^,)]+),([^,)]+),([^)]+)\)/g, (_,fexpr,xvar,a,b) => {
      const n = 1000; const av=+a, bv=+b; const h=(bv-av)/n;
      const evalAt = (x:number) => {
        const sub = fexpr.replace(new RegExp(xvar,'g'), String(x));
        try { return (0,eval)(sub); } catch { return NaN; }
      };
      let s = evalAt(av)+evalAt(bv);
      for(let i=1;i<n;i++) s += (i%2===0?2:4)*evalAt(av+i*h);
      return String((h/3)*s);
    });
    // Σ(expr,x,from,to) — summation
    e = e.replace(/Σ\(([^,)]+),([^,)]+),([^,)]+),([^)]+)\)/g, (_,fexpr,xvar,from,to) => {
      let sum=0;
      for(let i=+from;i<=+to;i++){
        const sub=fexpr.replace(new RegExp(xvar,'g'),String(i));
        try{ sum+=(0,eval)(sub); }catch{}
      }
      return String(sum);
    });

    const r = (0,eval)(e);
    if (typeof r !== 'number') return r;
    if (!isFinite(r)) return r === Infinity ? '∞' : r === -Infinity ? '-∞' : 'Error';
    if (isNaN(r)) return 'Error';
    return Number.isInteger(r) ? r : parseFloat(r.toFixed(10));
  } catch {
    return 'Error';
  }
}

// ── Display font sizes ─────────────────────────────────────────────────────────
function resFontSize(s: string) {
  const l = s.length;
  if (l > 15) return 32; if (l > 11) return 42;
  if (l > 8)  return 52; return 64;
}
function exprFontSize(s: string) {
  const l = s.length;
  if (l > 30) return 12; if (l > 20) return 14; return 17;
}

interface Props { history:string[]; onAdd:(id:string,entry:string)=>void; onClear?:(id:string)=>void; }

export default function GeneralCalc({ history, onAdd, onClear }: Props) {
  const { t, lang } = useLang();
  const bn = lang === 'bn';
  const [expr,    setExpr]    = useState('');
  const [result,  setResult]  = useState<string|number|null>(null);
  const [sci,     setSci]     = useState(false);
  const [deg,     setDeg]     = useState(true);
  const [sciTab,  setSciTab]  = useState<SciTab>('TRIG');
  const [activeOp,setActiveOp]= useState<string|null>(null);
  const [toast,   setToast]   = useState('');
  const dispRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ if(dispRef.current) dispRef.current.scrollLeft=dispRef.current.scrollWidth; },[expr]);

  const ap = (v:string) => { setExpr(e=>e+v); setActiveOp(null); };
  const del = () => { setExpr(e=>e.slice(0,-1)); setResult(null); };
  const clr = () => { setExpr(''); setResult(null); setActiveOp(null); };

  const calc = () => {
    if (!expr.trim()) return;
    const r = evaluate(expr, deg);
    setResult(r);
    onAdd('general', `${expr} = ${r}`);
  };

  // What token to append when a sci button is tapped
  const sciToken = (v:string): string => {
    if (['sin','cos','tan','cot','sec','csc',
         'sin⁻¹','cos⁻¹','tan⁻¹',
         'sinh','cosh','tanh','coth','sech','csch',
         'log','ln','log₂','log₃',
         'eˣ','10ˣ','2ˣ','√','∛','∜','|x|'].includes(v)) return v+'(';
    if (v==='nPr') return 'nPr(';
    if (v==='nCr') return 'nCr(';
    if (v==='gcd') return 'gcd(';
    if (v==='lcm') return 'lcm(';
    if (v==='%of') return '%of';
    if (v==='d/dx') return 'd/dx(';
    if (v==='∫') return '∫(';
    if (v==='Σ') return 'Σ(';
    if (v==='lim') return 'lim(';
    if (v==='⌊⌋') return '⌊';
    if (v==='⌈⌉') return '⌈';
    if (v==='n!'||v==='x!') return '!';
    if (v==='±') return '';   // handled separately
    if (v==='C'||v==='CE') { clr(); return ''; }
    return v;
  };

  const handleSci = (v:string) => {
    if (v==='C'||v==='CE') { clr(); return; }
    if (v==='±') { setExpr(e=>e.startsWith('-')?e.slice(1):'-'+e); return; }
    const tok = sciToken(v);
    if (tok) ap(tok);
  };

  const handleBasic = (v:string, type:string) => {
    if (v==='AC') { clr(); return; }
    if (v==='=')  { calc(); return; }
    if (v==='+/−') { setExpr(e=>e.startsWith('-')?e.slice(1):'-'+e); return; }
    if (type==='op') setActiveOp(v);
    ap(v);
  };

  const displayVal = result!==null ? String(result) : (expr||'0');
  const showExpr   = result!==null && !!expr;

  const btnPressStyle = (e:React.MouseEvent|React.TouchEvent) => {
    (e.currentTarget as HTMLElement).style.transform='scale(0.9)';
    (e.currentTarget as HTMLElement).style.opacity='0.75';
  };
  const btnReleaseStyle = (e:React.MouseEvent|React.TouchEvent) => {
    (e.currentTarget as HTMLElement).style.transform='';
    (e.currentTarget as HTMLElement).style.opacity='1';
  };

  // Button heights — taller when only basic shown
  const basicBtnH = sci ? 60 : 72;
  const basicFontOp = sci ? 26 : 32;
  const basicFontNum = sci ? 24 : 28;
  const basicFontFn = sci ? 18 : 21;

  return (
    <div style={{ display:'flex', flexDirection:'column', background:BG, minHeight:'100%', overflow:'hidden' }}>

      {/* ── Mode bar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 14px 0' }}>
        <button onClick={()=>setSci(s=>!s)} style={{
          background: sci?'#ff9f0a1a':'#2c2c2e',
          border:`1.5px solid ${sci?ORANGE:'#3a3a3c'}`,
          color: sci?ORANGE:DIM, borderRadius:20, padding:'6px 16px',
          fontSize:13, fontWeight:800, fontFamily:'inherit', cursor:'pointer',
          letterSpacing:0.3,
        }}>
          {sci?(bn?'সাধারণ':'Basic') : (bn?'বিজ্ঞান':'Scientific')}
        </button>
        {sci && (
          <button onClick={()=>setDeg(d=>!d)} style={{
            background: deg?'#0a2020':'#2c2c2e',
            border:`1.5px solid ${deg?'#34d399':'#3a3a3c'}`,
            color: deg?'#34d399':DIM, borderRadius:20, padding:'6px 14px',
            fontSize:12, fontWeight:800, fontFamily:'inherit', cursor:'pointer',
          }}>
            {deg?'DEG':'RAD'}
          </button>
        )}
      </div>

      {/* ── Scientific panel ── */}
      {sci && (
        <div style={{ padding:'10px 10px 4px' }}>
          {/* Tab bar */}
          <div style={{ display:'flex', gap:4, marginBottom:8, background:'#111113', borderRadius:10, padding:3 }}>
            {SCI_TABS.map(tab=>(
              <button key={tab} onClick={()=>setSciTab(tab)} style={{
                flex:1, padding:'6px 2px',
                background: sciTab===tab?'#2c2c2e':'transparent',
                color: sciTab===tab?WHITE:DIM,
                border:'none', borderRadius:8, cursor:'pointer',
                fontSize:9, fontWeight:800, fontFamily:'inherit',
                letterSpacing:0.3,
                boxShadow: sciTab===tab?'0 1px 6px rgba(0,0,0,0.4)':'none',
                transition:'all 0.15s',
              }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Keys grid */}
          {SCI_KEYS[sciTab].map((row,ri)=>(
            <div key={ri} style={{ display:'grid', gridTemplateColumns:`repeat(${row.length},1fr)`, gap:5, marginBottom:5 }}>
              {row.map(v=>{
                const {bg,fc}=cat(v);
                return (
                  <button key={v} onClick={()=>handleSci(v)}
                    onMouseDown={btnPressStyle} onMouseUp={btnReleaseStyle}
                    onTouchStart={btnPressStyle} onTouchEnd={btnReleaseStyle}
                    style={{
                      background:bg, color:fc, border:`1px solid ${fc}18`,
                      borderRadius:10, height:42,
                      fontSize:11, fontWeight:800,
                      fontFamily:"'Inter','Noto Serif Bengali',monospace",
                      cursor:'pointer', transition:'transform 0.08s, opacity 0.08s',
                      letterSpacing: v.length>4?-0.3:0,
                      overflow:'hidden',
                    }}>
                    {LABEL[v]||v}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Quick help */}
          <div style={{ fontSize:9.5, color:'#3a3a48', lineHeight:1.5, padding:'2px 4px', marginBottom:2 }}>
            {sciTab==='CALC' && '💡 d/dx(x²,x,3)  ∫(x²,x,0,1)  Σ(x,x,1,10)'}
            {sciTab==='LOG'  && '💡 nCr(10,3)  nPr(5,2)  gcd(12,8)  lcm(4,6)'}
            {sciTab==='TRIG' && `💡 Mode: ${deg?'Degrees':'Radians'} — sin(30) = ${deg?'0.5':'…'}`}
          </div>
        </div>
      )}

      {/* ── Display ── */}
      <div style={{
        flex:1, minHeight: sci?72:150,
        display:'flex', flexDirection:'column', justifyContent:'flex-end',
        padding:'12px 22px 10px', overflow:'hidden',
      }}>
        {showExpr && (
          <div style={{
            color:DIM, fontSize:exprFontSize(expr), textAlign:'right',
            fontFamily:"'Inter',monospace", lineHeight:1.4,
            wordBreak:'break-all', marginBottom:4,
          }}>
            {expr}
          </div>
        )}
        <div ref={dispRef} style={{
          color: result!==null && String(result)==='Error' ? '#ff453a' : WHITE,
          fontSize: resFontSize(displayVal),
          fontWeight:200,
          textAlign:'right',
          lineHeight:1.05,
          letterSpacing:-1.5,
          overflow:'hidden',
          whiteSpace:'nowrap',
          fontFamily:"'Inter',sans-serif",
          transition:'font-size 0.12s',
        }}>
          {displayVal}
        </div>
      </div>

      {/* ── Basic keypad ── */}
      <div style={{ padding:`0 12px ${sci?4:8}px` }}>
        {([
          [['AC','fn'],['+/−','fn'],['%','fn'],['÷','op']],
          [['7','num'],['8','num'],['9','num'],['×','op']],
          [['4','num'],['5','num'],['6','num'],['−','op']],
          [['1','num'],['2','num'],['3','num'],['+','op']],
          [['0','num0'],['.','num'],['⌫','fn'],['=','eq']],
        ] as [string,string][][]).map((row,ri)=>(
          <div key={ri} style={{ display:'flex', gap:9, marginBottom:9 }}>
            {row.map(([v,type])=>{
              const isZero = type==='num0';
              const isOp   = type==='op';
              const isFn   = type==='fn';
              const isEq   = type==='eq';
              const isAct  = activeOp===v;
              const bg = isEq||isOp ? (isAct?WHITE:ORANGE)
                       : isFn ? LIGHT : DARK;
              const fc = isEq||isOp ? (isAct?ORANGE:WHITE)
                       : isFn ? BG : WHITE;
              const fs = isOp||isEq ? basicFontOp
                       : isFn ? basicFontFn : basicFontNum;

              const display = v==='AC' ? (expr?'⌫':'AC') : v==='⌫' ? (expr?'⌫':'') : v;
              if (v==='⌫'&&!expr&&result===null) return <div key={v} style={{flex:1}}/>;

              return (
                <button key={v}
                  onClick={()=>{
                    if(v==='⌫'){del();return;}
                    handleBasic(v,type);
                  }}
                  onMouseDown={btnPressStyle} onMouseUp={btnReleaseStyle}
                  onTouchStart={btnPressStyle} onTouchEnd={btnReleaseStyle}
                  style={{
                    flex: isZero?2.18:1,
                    height: basicBtnH,
                    background:bg, color:fc,
                    border:'none', borderRadius:basicBtnH/2,
                    fontSize:fs,
                    fontWeight: isFn?500:300,
                    fontFamily:"'Inter',sans-serif",
                    cursor:'pointer',
                    display:'flex', alignItems:'center',
                    justifyContent: isZero?'flex-start':'center',
                    paddingLeft: isZero?Math.floor(basicBtnH*0.38):0,
                    boxShadow: isOp||isEq?`0 3px 16px ${ORANGE}44`:'none',
                    transition:'transform 0.08s, opacity 0.08s, background 0.1s',
                    letterSpacing: isOp||isEq?0:-0.5,
                    minWidth:0,
                  }}>
                  {display}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Action strip ── */}
      <div style={{ padding:'0 12px 8px', display:'flex', gap:8 }}>
        {result!==null && result!=='Error' && (
          <button onClick={()=>shareWA(buildShare('🧮',[`${expr} = ${result}`]))}
            style={{
              flex:1, padding:'12px',
              background:'#0d2e18', color:'#25d366',
              border:'1.5px solid #25d36640', borderRadius:14,
              fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:7,
            }}>
            📤 {bn?'শেয়ার':'Share'}
          </button>
        )}
      </div>

      <div style={{ padding:'0 12px 8px' }}>
        <HistoryPanel items={history} accent={ORANGE}
          onClear={()=>onClear?.('general')}
          labels={{ history:t.history, clear:t.clearHistory }}/>
      </div>
      {toast && <Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
