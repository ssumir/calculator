import { useState, useRef, useEffect } from 'react';
import { HistoryPanel, Toast } from '../ui/index.tsx';
import { useLang } from '../../context/LangContext.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

// ── Palette — matches reference image exactly ──────────────────────────────────
// Light theme for the calculator panel, dark display area
const CALC_BG    = '#f5f4ff';   // overall light purple-white bg (like image)
const DISP_BG    = '#13131a';   // dark display
const BTN_SCI    = '#ede9ff';   // sci function buttons — light lavender pill
const BTN_NUM    = '#e8e8f0';   // number buttons — light gray pill
const BTN_OP     = '#e8e8f0';   // operator column — same as num
const BTN_EQ     = '#7c3aed';   // = / ▶ button — purple (exactly like image)
const BTN_AC     = '#fde8e8';   // AC button — light red tint
const BTN_DEL    = '#fde8e8';   // backspace — light red tint
const BTN_FN     = '#ede9ff';   // ( ) brackets
const BORDER_SCI = '#d8d0ff';   // border for sci buttons
const BORDER_NUM = '#d8d8e8';
const TEXT_SCI   = '#6d28d9';   // purple text on sci buttons
const TEXT_NUM   = '#1e1b2e';   // dark text on number buttons
const TEXT_OP    = '#f97316';   // orange operators
const TEXT_DIM   = '#5a5a7a';   // dim expression preview
const TEXT_ANS   = '#f0eeff';   // display answer
const TAB_LINE   = '#7c3aed';   // active tab underline
const DIVIDER    = '#d0cce8';   // vertical divider between sci and num cols

// Tab accent colors — matching reference (Algebra=purple, Trigonometry=green, Calculus=gray)
const TAB_COLORS: Record<string, string> = {
  Algebra:      '#7c3aed',
  Trigonometry: '#16a34a',
  Calculus:     '#64748b',
  Hyperbolic:   '#e11d48',
};

// ── Key type definitions ───────────────────────────────────────────────────────
type SciKey = { label: string; token: string; color?: string };
type NumKey = { label: string; type: 'num'|'op'|'fn'|'eq'|'zero'|'del' };
type Row    = { sci: SciKey[]; num: NumKey[] };

// ── Tab key layouts ────────────────────────────────────────────────────────────
// 3 sci cols | divider | 4 num cols  — exactly like the reference image
const TAB_ROWS: Record<string, Row[]> = {
  Algebra: [
    { sci:[{label:'x²',token:'**2'},{label:'√□',token:'√('},{label:'<',token:'<'}],
      num:[{label:'(',type:'fn'},{label:')',type:'fn'},{label:'⌫',type:'del'},{label:'AC',type:'fn'}] },
    { sci:[{label:'□/□',token:'/'},{label:'□|□',token:'|('},{label:'≤',token:'≤'}],
      num:[{label:'7',type:'num'},{label:'8',type:'num'},{label:'9',type:'num'},{label:'÷',type:'op'}] },
    { sci:[{label:'log□',token:'log('},{label:'□!',token:'!'},{label:'>',token:'>'}],
      num:[{label:'4',type:'num'},{label:'5',type:'num'},{label:'6',type:'num'},{label:'×',type:'op'}] },
    { sci:[{label:'i',token:'i',color:'#2563eb'},{label:'%',token:'%'},{label:'≥',token:'≥'}],
      num:[{label:'1',type:'num'},{label:'2',type:'num'},{label:'3',type:'num'},{label:'−',type:'op'}] },
    { sci:[{label:'x',token:'x'},{label:'y',token:'y'},{label:'=',token:'=='}],
      num:[{label:'0',type:'zero'},{label:'.',type:'num'},{label:'▶',type:'eq'},{label:'+',type:'op'}] },
  ],
  Trigonometry: [
    { sci:[{label:'sin',token:'sin('},{label:'cos',token:'cos('},{label:'tan',token:'tan('}],
      num:[{label:'(',type:'fn'},{label:')',type:'fn'},{label:'⌫',type:'del'},{label:'AC',type:'fn'}] },
    { sci:[{label:'sin⁻¹',token:'sin⁻¹('},{label:'cos⁻¹',token:'cos⁻¹('},{label:'tan⁻¹',token:'tan⁻¹('}],
      num:[{label:'7',type:'num'},{label:'8',type:'num'},{label:'9',type:'num'},{label:'÷',type:'op'}] },
    { sci:[{label:'cot',token:'cot('},{label:'sec',token:'sec('},{label:'csc',token:'csc('}],
      num:[{label:'4',type:'num'},{label:'5',type:'num'},{label:'6',type:'num'},{label:'×',type:'op'}] },
    { sci:[{label:'π',token:'π',color:'#b45309'},{label:'e',token:'e',color:'#b45309'},{label:'φ',token:'φ',color:'#b45309'}],
      num:[{label:'1',type:'num'},{label:'2',type:'num'},{label:'3',type:'num'},{label:'−',type:'op'}] },
    { sci:[{label:'DEG',token:'__DEG'},{label:'RAD',token:'__RAD'},{label:'°→r',token:'*(π/180)'}],
      num:[{label:'0',type:'zero'},{label:'.',type:'num'},{label:'▶',type:'eq'},{label:'+',type:'op'}] },
  ],
  Calculus: [
    { sci:[{label:'d/dx',token:'d/dx('},{label:'∫dx',token:'∫('},{label:'Σ',token:'Σ('}],
      num:[{label:'(',type:'fn'},{label:')',type:'fn'},{label:'⌫',type:'del'},{label:'AC',type:'fn'}] },
    { sci:[{label:'nPr',token:'nPr('},{label:'nCr',token:'nCr('},{label:'n!',token:'!'}],
      num:[{label:'7',type:'num'},{label:'8',type:'num'},{label:'9',type:'num'},{label:'÷',type:'op'}] },
    { sci:[{label:'log',token:'log('},{label:'ln',token:'ln('},{label:'log₂',token:'log₂('}],
      num:[{label:'4',type:'num'},{label:'5',type:'num'},{label:'6',type:'num'},{label:'×',type:'op'}] },
    { sci:[{label:'√',token:'√('},{label:'∛',token:'∛('},{label:'xʸ',token:'**'}],
      num:[{label:'1',type:'num'},{label:'2',type:'num'},{label:'3',type:'num'},{label:'−',type:'op'}] },
    { sci:[{label:'GCD',token:'gcd('},{label:'LCM',token:'lcm('},{label:'x²',token:'**2'}],
      num:[{label:'0',type:'zero'},{label:'.',type:'num'},{label:'▶',type:'eq'},{label:'+',type:'op'}] },
  ],
  Hyperbolic: [
    { sci:[{label:'sinh',token:'sinh('},{label:'cosh',token:'cosh('},{label:'tanh',token:'tanh('}],
      num:[{label:'(',type:'fn'},{label:')',type:'fn'},{label:'⌫',type:'del'},{label:'AC',type:'fn'}] },
    { sci:[{label:'coth',token:'coth('},{label:'sech',token:'sech('},{label:'csch',token:'csch('}],
      num:[{label:'7',type:'num'},{label:'8',type:'num'},{label:'9',type:'num'},{label:'÷',type:'op'}] },
    { sci:[{label:'10ˣ',token:'10ˣ('},{label:'eˣ',token:'eˣ('},{label:'2ˣ',token:'2ˣ('}],
      num:[{label:'4',type:'num'},{label:'5',type:'num'},{label:'6',type:'num'},{label:'×',type:'op'}] },
    { sci:[{label:'⌊x⌋',token:'⌊'},{label:'⌈x⌉',token:'⌈'},{label:'|x|',token:'|x|('}],
      num:[{label:'1',type:'num'},{label:'2',type:'num'},{label:'3',type:'num'},{label:'−',type:'op'}] },
    { sci:[{label:'∞',token:'Infinity',color:'#b45309'},{label:'π',token:'π',color:'#b45309'},{label:'e',token:'e',color:'#b45309'}],
      num:[{label:'0',type:'zero'},{label:'.',type:'num'},{label:'▶',type:'eq'},{label:'+',type:'op'}] },
  ],
};

const BASIC_ROWS: NumKey[][] = [
  [{label:'AC',type:'fn'},{label:'+/−',type:'fn'},{label:'%',type:'fn'},{label:'÷',type:'op'}],
  [{label:'7',type:'num'},{label:'8',type:'num'},{label:'9',type:'num'},{label:'×',type:'op'}],
  [{label:'4',type:'num'},{label:'5',type:'num'},{label:'6',type:'num'},{label:'−',type:'op'}],
  [{label:'1',type:'num'},{label:'2',type:'num'},{label:'3',type:'num'},{label:'+',type:'op'}],
  [{label:'0',type:'zero'},{label:'.',type:'num'},{label:'⌫',type:'del'},{label:'▶',type:'eq'}],
];

// ── Math engine ────────────────────────────────────────────────────────────────
function fact(n:number):number{n=Math.floor(Math.abs(n));if(n>170)return Infinity;if(n<=1)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r;}
function perm(n:number,r:number):number{return fact(n)/fact(n-r);}
function comb(n:number,r:number):number{return fact(n)/(fact(r)*fact(n-r));}
function gcdFn(a:number,b:number):number{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t;}return a;}
function lcmFn(a:number,b:number):number{return Math.abs(a*b)/gcdFn(a,b);}

function evaluate(expr:string,deg:boolean):string|number{
  try{
    let e=expr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-')
      .replace(/π/g,String(Math.PI)).replace(/φ/g,'1.6180339887498948482')
      .replace(/∞|Infinity/g,'Infinity')
      .replace(/\be\b(?![+\-\d])/g,String(Math.E));
    const toR=(x:number)=>deg?x*Math.PI/180:x;
    const frR=(x:number)=>deg?x*180/Math.PI:x;
    e=e.replace(/sin⁻¹\(([^)]+)\)/g,(_,a)=>String(frR(Math.asin(+a))));
    e=e.replace(/cos⁻¹\(([^)]+)\)/g,(_,a)=>String(frR(Math.acos(+a))));
    e=e.replace(/tan⁻¹\(([^)]+)\)/g,(_,a)=>String(frR(Math.atan(+a))));
    e=e.replace(/sin\(([^)]+)\)/g,(_,a)=>String(Math.sin(toR(+a))));
    e=e.replace(/cos\(([^)]+)\)/g,(_,a)=>String(Math.cos(toR(+a))));
    e=e.replace(/tan\(([^)]+)\)/g,(_,a)=>String(Math.tan(toR(+a))));
    e=e.replace(/cot\(([^)]+)\)/g,(_,a)=>String(1/Math.tan(toR(+a))));
    e=e.replace(/sec\(([^)]+)\)/g,(_,a)=>String(1/Math.cos(toR(+a))));
    e=e.replace(/csc\(([^)]+)\)/g,(_,a)=>String(1/Math.sin(toR(+a))));
    e=e.replace(/sinh\(([^)]+)\)/g,(_,a)=>String(Math.sinh(+a)));
    e=e.replace(/cosh\(([^)]+)\)/g,(_,a)=>String(Math.cosh(+a)));
    e=e.replace(/tanh\(([^)]+)\)/g,(_,a)=>String(Math.tanh(+a)));
    e=e.replace(/coth\(([^)]+)\)/g,(_,a)=>String(1/Math.tanh(+a)));
    e=e.replace(/sech\(([^)]+)\)/g,(_,a)=>String(1/Math.cosh(+a)));
    e=e.replace(/csch\(([^)]+)\)/g,(_,a)=>String(1/Math.sinh(+a)));
    e=e.replace(/log₂\(([^)]+)\)/g,(_,a)=>String(Math.log2(+a)));
    e=e.replace(/log₃\(([^)]+)\)/g,(_,a)=>String(Math.log(+a)/Math.log(3)));
    e=e.replace(/log\(([^)]+)\)/g,(_,a)=>String(Math.log10(+a)));
    e=e.replace(/ln\(([^)]+)\)/g,(_,a)=>String(Math.log(+a)));
    e=e.replace(/10ˣ\(([^)]+)\)/g,(_,a)=>String(Math.pow(10,+a)));
    e=e.replace(/eˣ\(([^)]+)\)/g,(_,a)=>String(Math.exp(+a)));
    e=e.replace(/2ˣ\(([^)]+)\)/g,(_,a)=>String(Math.pow(2,+a)));
    e=e.replace(/∜\(([^)]+)\)/g,(_,a)=>String(Math.pow(+a,0.25)));
    e=e.replace(/∛\(([^)]+)\)/g,(_,a)=>String(Math.cbrt(+a)));
    e=e.replace(/√\(([^)]+)\)/g,(_,a)=>String(Math.sqrt(+a)));
    e=e.replace(/\|x\|\(([^)]+)\)/g,(_,a)=>String(Math.abs(+a)));
    e=e.replace(/\|([^|]+)\|/g,(_,a)=>String(Math.abs(+a)));
    e=e.replace(/nCr\(([^,)]+),([^)]+)\)/g,(_,n,r)=>String(comb(+n,+r)));
    e=e.replace(/nPr\(([^,)]+),([^)]+)\)/g,(_,n,r)=>String(perm(+n,+r)));
    e=e.replace(/gcd\(([^,)]+),([^)]+)\)/g,(_,a,b)=>String(gcdFn(+a,+b)));
    e=e.replace(/lcm\(([^,)]+),([^)]+)\)/g,(_,a,b)=>String(lcmFn(+a,+b)));
    e=e.replace(/(\d+(?:\.\d+)?)!/g,(_,p)=>String(fact(+p)));
    e=e.replace(/(\d+(?:\.\d+)?)%of(\d+(?:\.\d+)?)/g,(_,a,b)=>String(+a/100*+b));
    e=e.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
    e=e.replace(/mod/g,'%');
    e=e.replace(/⌊([^⌋]+)⌋/g,(_,a)=>String(Math.floor(+a)));
    e=e.replace(/⌈([^⌉]+)⌉/g,(_,a)=>String(Math.ceil(+a)));
    e=e.replace(/EE/g,'e');
    e=e.replace(/(\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g,'($1**$2)');
    e=e.replace(/d\/dx\(([^,)]+),([^,)]+),([^)]+)\)/g,(_,fe,xv,xval)=>{
      const h=1e-7,xn=+xval;
      const ev=(x:number)=>{try{return(0,eval)(fe.replace(new RegExp(xv,'g'),String(x)));}catch{return NaN;}};
      return String((ev(xn+h)-ev(xn-h))/(2*h));
    });
    e=e.replace(/∫\(([^,)]+),([^,)]+),([^,)]+),([^)]+)\)/g,(_,fe,xv,a,b)=>{
      const n=1000,av=+a,bv=+b,h=(bv-av)/n;
      const ev=(x:number)=>{try{return(0,eval)(fe.replace(new RegExp(xv,'g'),String(x)));}catch{return NaN;}};
      let s=ev(av)+ev(bv);
      for(let i=1;i<n;i++)s+=(i%2===0?2:4)*ev(av+i*h);
      return String((h/3)*s);
    });
    e=e.replace(/Σ\(([^,)]+),([^,)]+),([^,)]+),([^)]+)\)/g,(_,fe,xv,from,to)=>{
      let s=0;
      for(let i=+from;i<=+to;i++){try{s+=(0,eval)(fe.replace(new RegExp(xv,'g'),String(i)));}catch{}}
      return String(s);
    });
    const r=(0,eval)(e);
    if(typeof r!=='number')return String(r);
    if(!isFinite(r))return r===Infinity?'∞':r===-Infinity?'-∞':'Error';
    if(isNaN(r))return 'Error';
    return Number.isInteger(r)?r:parseFloat(r.toFixed(10));
  }catch{return 'Error';}
}

function resFontSize(s:string){const l=s.length;if(l>15)return 28;if(l>11)return 36;if(l>8)return 46;return 56;}
function exprFontSize(s:string){const l=s.length;if(l>32)return 11;if(l>22)return 13;return 15;}

interface Props{history:string[];onAdd:(id:string,entry:string)=>void;onClear?:(id:string)=>void;}

export default function GeneralCalc({history,onAdd,onClear}:Props){
  const {t,lang}=useLang();
  const bn=lang==='bn';
  const [expr,setExpr]=useState('');
  const [result,setResult]=useState<string|number|null>(null);
  const [sci,setSci]=useState(false);
  const [deg,setDeg]=useState(true);
  const [tab,setTab]=useState('Algebra');
  const [activeOp,setActiveOp]=useState<string|null>(null);
  const [toast,setToast]=useState('');
  const dispRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{if(dispRef.current)dispRef.current.scrollLeft=dispRef.current.scrollWidth;},[expr]);

  const ap=(v:string)=>{setExpr(e=>e+v);setActiveOp(null);};
  const del=()=>{setExpr(e=>e.slice(0,-1));setResult(null);};
  const clr=()=>{setExpr('');setResult(null);setActiveOp(null);};
  const calc=()=>{
    if(!expr.trim())return;
    const r=evaluate(expr,deg);
    setResult(r);
    onAdd('general',`${expr} = ${r}`);
  };

  const handleSci=(key:SciKey)=>{
    if(key.token==='__DEG'){setDeg(true);return;}
    if(key.token==='__RAD'){setDeg(false);return;}
    ap(key.token);
  };

  const handleNum=(key:NumKey)=>{
    if(key.type==='eq'||key.label==='▶'){calc();return;}
    if(key.label==='AC'){clr();return;}
    if(key.label==='⌫'){del();return;}
    if(key.label==='+/−'){setExpr(e=>e.startsWith('-')?e.slice(1):'-'+e);return;}
    if(key.type==='op')setActiveOp(key.label);
    ap(key.label);
  };

  const bp=(e:React.MouseEvent|React.TouchEvent)=>{(e.currentTarget as HTMLElement).style.transform='scale(0.91)';(e.currentTarget as HTMLElement).style.opacity='0.75';};
  const br=(e:React.MouseEvent|React.TouchEvent)=>{(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.opacity='1';};

  const displayVal=result!==null?String(result):(expr||'0');
  const showExpr=result!==null&&!!expr;
  const tabs=Object.keys(TAB_ROWS);
  const rows=sci?TAB_ROWS[tab]:null;

  // Button heights — enough room for 5 rows
  const btnH=sci?52:68;
  const numFs=sci?20:26;
  const opFs=sci?22:28;
  const fnFs=sci?16:19;

  // Sci button font size based on label length
  const sciFs=(label:string)=>{
    if(label.length>=5)return 11;
    if(label.length===4)return 13;
    return 15;
  };

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:sci?CALC_BG:DISP_BG}}>

      {/* ── Dark display area ── */}
      <div style={{
        background:DISP_BG,flexShrink:0,
        minHeight:sci?88:150,
        display:'flex',flexDirection:'column',justifyContent:'flex-end',
        padding:'12px 22px 12px',overflow:'hidden',
      }}>
        {/* Mode toggle row */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
          <button onClick={()=>setSci(s=>!s)} style={{
            background:sci?'#2d1a4a':'#2c2c3a',
            border:`1.5px solid ${sci?'#7c3aed':'#3a3a4a'}`,
            color:sci?'#c4b5fd':'#8888aa',
            borderRadius:22,padding:'6px 16px',
            fontSize:12,fontWeight:800,fontFamily:'inherit',cursor:'pointer',letterSpacing:0.3,
          }}>
            {sci?(bn?'সাধারণ':'Basic'):(bn?'বৈজ্ঞানিক':'Scientific')}
          </button>
          {sci&&(
            <button onClick={()=>setDeg(d=>!d)} style={{
              background:deg?'#0a2520':'#2c2c3a',
              border:`1.5px solid ${deg?'#16a34a':'#3a3a4a'}`,
              color:deg?'#4ade80':'#8888aa',
              borderRadius:22,padding:'6px 14px',
              fontSize:12,fontWeight:800,fontFamily:'inherit',cursor:'pointer',
            }}>
              {deg?'DEG':'RAD'}
            </button>
          )}
        </div>

        {/* Expression preview */}
        {showExpr&&(
          <div style={{
            color:TEXT_DIM,fontSize:exprFontSize(expr),textAlign:'right',
            fontFamily:"'Inter',monospace",lineHeight:1.4,wordBreak:'break-all',marginBottom:4,
          }}>{expr}</div>
        )}
        {/* Main display number */}
        <div ref={dispRef} style={{
          color:result!==null&&String(result)==='Error'?'#ff453a':TEXT_ANS,
          fontSize:resFontSize(displayVal),fontWeight:200,
          textAlign:'right',lineHeight:1.05,letterSpacing:-1,
          overflow:'hidden',whiteSpace:'nowrap',
          fontFamily:"'Inter',sans-serif",transition:'font-size 0.12s',
        }}>{displayVal}</div>
      </div>

      {/* ── Light calculator body ── */}
      <div style={{flex:1,background:CALC_BG,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Subject tabs — only in sci mode, styled like image */}
        {sci&&(
          <div style={{
            display:'flex',borderBottom:`1.5px solid #d8d0ff`,
            background:CALC_BG,flexShrink:0,
          }}>
            {tabs.map(t2=>{
              const active=tab===t2;
              const col=TAB_COLORS[t2]||'#7c3aed';
              return(
                <button key={t2} onClick={()=>setTab(t2)} style={{
                  flex:1,padding:'11px 4px',
                  background:'transparent',
                  color:active?col:'#9090b0',
                  border:'none',
                  borderBottom:`2.5px solid ${active?col:'transparent'}`,
                  marginBottom:'-1.5px',
                  fontSize:12,fontWeight:active?800:600,
                  fontFamily:'inherit',cursor:'pointer',
                  letterSpacing:0.2,transition:'all 0.15s',
                }}>
                  {t2}
                </button>
              );
            })}
          </div>
        )}

        {/* Keypad area */}
        <div style={{flex:1,padding:'8px 10px 6px',display:'flex',flexDirection:'column',gap:6,overflow:'hidden'}}>
          {sci&&rows?(
            // SCIENTIFIC: 3 sci cols | thin divider | 4 num cols
            rows.map((row,ri)=>(
              <div key={ri} style={{
                display:'grid',
                gridTemplateColumns:'1fr 1fr 1fr 3px 1fr 1fr 1fr 1fr',
                gap:6,flex:1,minHeight:0,
              }}>
                {/* 3 sci buttons */}
                {row.sci.map((key,ki)=>{
                  const col=key.color||TEXT_SCI;
                  const isSpecial=key.label==='AC'||key.label==='⌫';
                  return(
                    <button key={ki} onClick={()=>handleSci(key)}
                      onMouseDown={bp} onMouseUp={br} onTouchStart={bp} onTouchEnd={br}
                      style={{
                        background:isSpecial?BTN_DEL:BTN_SCI,
                        color:isSpecial?'#dc2626':col,
                        border:`1.5px solid ${isSpecial?'#fca5a5':BORDER_SCI}`,
                        borderRadius:14,height:btnH,
                        fontSize:sciFs(key.label),
                        fontWeight:700,
                        fontFamily:"'Inter','Noto Serif Bengali',sans-serif",
                        cursor:'pointer',
                        transition:'transform 0.08s,opacity 0.08s',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        letterSpacing:key.label.length>4?-0.5:0,
                        overflow:'hidden',
                        boxShadow:'0 1px 3px rgba(100,80,180,0.1)',
                      }}>
                      {key.label}
                    </button>
                  );
                })}

                {/* Thin vertical divider */}
                <div style={{background:DIVIDER,borderRadius:2,margin:'6px 0'}}/>

                {/* 4 num / op buttons */}
                {row.num.map((key,ki)=>{
                  const isEq=key.type==='eq';
                  const isOp=key.type==='op';
                  const isFn=key.type==='fn';
                  const isDel=key.type==='del';
                  const isZero=key.type==='zero';
                  const isAct=activeOp===key.label;

                  const bg=isEq?BTN_EQ:isDel?BTN_DEL:isFn?BTN_FN:BTN_NUM;
                  const fc=isEq?'#fff':isDel?'#dc2626':isFn?'#6d28d9':isOp?(isAct?'#fff':TEXT_OP):TEXT_NUM;
                  const brd=isEq?'none':isDel?`1.5px solid #fca5a5`:isFn?`1.5px solid ${BORDER_SCI}`:`1.5px solid ${BORDER_NUM}`;
                  const fs=isEq?22:isOp?opFs:isFn?fnFs:numFs;
                  const fw=isEq?800:isOp?600:isFn?700:400;

                  return(
                    <button key={ki} onClick={()=>handleNum(key)}
                      onMouseDown={bp} onMouseUp={br} onTouchStart={bp} onTouchEnd={br}
                      style={{
                        background:bg,color:fc,border:brd,
                        borderRadius:14,height:btnH,
                        fontSize:fs,fontWeight:fw,
                        fontFamily:"'Inter',sans-serif",
                        cursor:'pointer',
                        transition:'transform 0.08s,opacity 0.08s',
                        display:'flex',alignItems:'center',
                        justifyContent:'center',
                        boxShadow:isEq?'0 4px 18px #7c3aed55':isOp&&isAct?`0 2px 10px ${TEXT_OP}44`:'0 1px 3px rgba(0,0,0,0.08)',
                        overflow:'hidden',
                        minWidth:0,
                      }}>
                      {key.label}
                    </button>
                  );
                })}
              </div>
            ))
          ):(
            // BASIC: full-width 4 cols, iOS-style round buttons
            BASIC_ROWS.map((row,ri)=>(
              <div key={ri} style={{display:'flex',gap:10,flex:1,minHeight:0}}>
                {row.map((key,ki)=>{
                  const isEq=key.type==='eq';
                  const isOp=key.type==='op';
                  const isFn=key.type==='fn';
                  const isDel=key.type==='del';
                  const isZero=key.type==='zero';
                  const isAct=activeOp===key.label;
                  const bg=isEq?BTN_EQ:isOp?(isAct?TEXT_OP:'#e8e8f0'):isFn?'#c8c8d8':BTN_NUM;
                  const fc=isEq?'#fff':isOp?(isAct?'#fff':TEXT_OP):isFn?'#1e1b2e':TEXT_NUM;
                  const fs=isEq?28:isOp?opFs:isFn?fnFs:numFs;
                  const fw=isEq?800:isOp?600:isFn?600:400;
                  return(
                    <button key={ki} onClick={()=>handleNum(key)}
                      onMouseDown={bp} onMouseUp={br} onTouchStart={bp} onTouchEnd={br}
                      style={{
                        flex:isZero?2.18:1,height:btnH,
                        background:bg,color:fc,
                        border:`1.5px solid ${isEq?'transparent':isOp?`${TEXT_OP}30`:'#d0d0e0'}`,
                        borderRadius:btnH/2,
                        fontSize:fs,fontWeight:fw,
                        fontFamily:"'Inter',sans-serif",
                        cursor:'pointer',
                        display:'flex',alignItems:'center',
                        justifyContent:isZero?'flex-start':'center',
                        paddingLeft:isZero?Math.floor(btnH*0.38):0,
                        boxShadow:isEq?'0 4px 20px #7c3aed55':isOp&&isAct?`0 2px 12px ${TEXT_OP}44`:'0 1px 4px rgba(0,0,0,0.08)',
                        transition:'transform 0.08s,opacity 0.08s,background 0.1s',
                        minWidth:0,overflow:'hidden',
                      }}>
                      {key.label}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Help tip */}
        {sci&&(
          <div style={{padding:'2px 14px 6px',fontSize:10.5,color:'#9090b0',lineHeight:1.5,flexShrink:0}}>
            {tab==='Calculus'  &&'💡 d/dx(x*x,x,3) · ∫(x*x,x,0,1) · Σ(x,x,1,10)'}
            {tab==='Trigonometry'&&`💡 ${deg?'Degrees':'Radians'} mode · sin(30)${deg?' = 0.5':''}`}
            {tab==='Algebra'   &&'💡 x,y variables · nCr(10,3) · log(100) = 2'}
            {tab==='Hyperbolic'&&'💡 sinh(1) · cosh(0) = 1 · tanh(∞) = 1'}
          </div>
        )}
      </div>

      {/* Share + history — dark themed */}
      <div style={{background:DISP_BG,padding:'6px 12px 8px',flexShrink:0}}>
        {result!==null&&result!=='Error'&&(
          <button onClick={()=>shareWA(buildShare('🧮',[`${expr} = ${result}`]))}
            style={{
              width:'100%',padding:'11px',marginBottom:6,
              background:'#0d2e18',color:'#25d366',
              border:'1.5px solid #25d36640',borderRadius:13,
              fontSize:14,fontWeight:700,fontFamily:'inherit',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:7,
            }}>
            📤 {bn?'শেয়ার':'Share'}
          </button>
        )}
        <HistoryPanel items={history} accent='#7c3aed'
          onClear={()=>onClear?.('general')}
          labels={{history:t.history,clear:t.clearHistory}}/>
      </div>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
