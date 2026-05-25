import { useState } from 'react';
import { FaBackspace, FaFlask, FaKeyboard } from 'react-icons/fa';
import { ActionRow, HistoryPanel, Toast } from '../ui';
import { useLang } from '../../context/LangContext';
import { shareWA, buildShare } from '../../utils/share';

const A = '#6366f1';
const ROWS = [['C','(',')', '÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],['00','0','.','=']];
const SCI = [['sin','cos','tan','log','ln'],['√(','x²','xʸ','π','e'],['(',')', '!','%','C']];
const SCI_D = { 'x²':'x²','xʸ':'xʸ','√(':'√' };

function fact(n) { if(n<=1)return 1; let r=1; for(let i=2;i<=n;i++)r*=i; return r; }

export default function GeneralCalc({ history, onAdd, onClear }) {
  const { t } = useLang();
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [sci, setSci] = useState(false);
  const [deg, setDeg] = useState(true);
  const [toast, setToast] = useState('');

  const ap = v => setExpr(e => e + v);
  const del = () => setExpr(e => e.slice(0,-1));
  const clr = () => { setExpr(''); setResult(null); setSaved(false); };

  const calc = () => {
    if (!expr.trim()) return;
    try {
      let e = expr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');
      e = e.replace(/(\d+(?:\.\d+)?)%/g,'($1/100)');
      e = e.replace(/(\d+(?:\.\d+)?)!/g,(_,p)=>fact(parseFloat(p)));
      e = e.replace(/x²/g,'**2').replace(/xʸ/g,'**');
      const toR = x => x * Math.PI / 180;
      e = e.replace(/sin\(([^)]+)\)/g,(_,a)=>deg?Math.sin(toR(+a)):Math.sin(+a));
      e = e.replace(/cos\(([^)]+)\)/g,(_,a)=>deg?Math.cos(toR(+a)):Math.cos(+a));
      e = e.replace(/tan\(([^)]+)\)/g,(_,a)=>deg?Math.tan(toR(+a)):Math.tan(+a));
      e = e.replace(/log\(([^)]+)\)/g,(_,a)=>`(Math.log10(${a}))`);
      e = e.replace(/ln\(([^)]+)\)/g,(_,a)=>`(Math.log(${a}))`);
      e = e.replace(/√\(([^)]+)\)/g,(_,a)=>`(Math.sqrt(${a}))`);
      e = e.replace(/π/g,Math.PI).replace(/\be\b/g,Math.E);
      const geval = eval;
      const r = geval(e);
      const d = typeof r==='number'?(Number.isInteger(r)?r:parseFloat(r.toFixed(10))):r;
      setResult(d); setSaved(false);
      onAdd('general', `${expr} = ${d}`);
    } catch { setResult(t.error + ' ❌'); }
  };

  const handleBasic = v => { if(v==='C'){clr();return;} if(v==='='){calc();return;} ap(v); };
  const handleSci = v => { if(v==='C'){clr();return;} if(['sin','cos','tan','log','ln'].includes(v)){ap(v+'(');return;} ap(v); };

  const bS = v => {
    if(v==='=') return {bg:A,fc:'#fff',fw:800};
    if(['÷','×','−','+'].includes(v)) return {bg:'#eef2ff',fc:A,fw:700};
    if(v==='C') return {bg:'#fee2e2',fc:'#ef4444',fw:700};
    if(['(',')','.'].includes(v)) return {bg:'#f0f9ff',fc:'#0ea5e9',fw:600};
    return {bg:'#f8faff',fc:'#1e293b',fw:500};
  };
  const sS = v => {
    if(['sin','cos','tan'].includes(v)) return {bg:'#eef2ff',fc:'#6366f1'};
    if(['log','ln'].includes(v)) return {bg:'#f0f9ff',fc:'#0ea5e9'};
    if(['√(','x²','xʸ'].includes(v)) return {bg:'#fffbeb',fc:'#f59e0b'};
    if(['π','e'].includes(v)) return {bg:'#ecfdf5',fc:'#10b981'};
    if(v==='C') return {bg:'#fee2e2',fc:'#ef4444'};
    return {bg:'#f8faff',fc:'#64748b'};
  };

  const resFontSize = result !== null ? (String(result).length > 14 ? 16 : String(result).length > 10 ? 20 : 28) : 28;

  return (
    <div style={{ width:'100%', overflow:'hidden' }}>
      {/* Display */}
      <div style={{ background:'#1e293b', borderRadius:18, padding:'16px 18px', marginBottom:14, minHeight:88, display:'flex', flexDirection:'column', justifyContent:'flex-end', boxShadow:'0 4px 20px rgba(15,23,42,0.15)', width:'100%', overflow:'hidden' }}>
        <div style={{ color:'#64748b', fontSize:14, wordBreak:'break-all', minHeight:22, fontFamily:'monospace', overflowWrap:'break-word' }}>{expr || '0'}</div>
        {result !== null && (
          <div style={{ color:'#fbbf24', fontSize:resFontSize, fontFamily:'Press Start 2P,monospace', marginTop:10, wordBreak:'break-all', overflowWrap:'break-word', animation:'popIn 0.22s ease', lineHeight:1.2 }}>
            = {result}
          </div>
        )}
      </div>

      {/* Mode toggles */}
      <div style={{ display:'flex', gap:8, marginBottom:12, width:'100%' }}>
        <button onClick={()=>setSci(s=>!s)} style={{ flex:1, padding:'9px', background:sci?'#eef2ff':'#f8faff', border:`2px solid ${sci?A:'#e2e8f0'}`, borderRadius:10, color:sci?A:'#64748b', fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, minWidth:0 }}>
          {sci?<FaKeyboard size={12}/>:<FaFlask size={12}/>}{sci ? t.basicMode : t.sciMode}
        </button>
        {sci && (
          <button onClick={()=>setDeg(d=>!d)} style={{ flexShrink:0, padding:'9px 14px', background:'#f8faff', border:'2px solid #e2e8f0', borderRadius:10, color:'#64748b', fontSize:12, fontWeight:700, fontFamily:'inherit', cursor:'pointer' }}>
            {deg ? t.degree : t.radian}
          </button>
        )}
      </div>

      {/* Scientific keys */}
      {sci && (
        <div style={{ marginBottom:12, background:'#f8faff', borderRadius:14, padding:10, border:'1px solid #e2e8f0', width:'100%', overflow:'hidden' }}>
          {SCI.map((row,ri) => (
            <div key={ri} style={{ display:'grid', gridTemplateColumns:`repeat(${row.length},minmax(0,1fr))`, gap:6, marginBottom:6 }}>
              {row.map(v => { const{bg,fc}=sS(v); return (
                <button key={v} onClick={()=>handleSci(v)} style={{ background:bg, color:fc, border:'none', borderRadius:10, height:38, fontSize:11, fontWeight:700, fontFamily:'monospace', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.06)', overflow:'hidden' }}>{SCI_D[v]||v}</button>
              ); })}
            </div>
          ))}
        </div>
      )}

      {/* Basic keys */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8, marginBottom:8, width:'100%' }}>
        {ROWS.flat().map((v,i) => { const{bg,fc,fw}=bS(v); return (
          <button key={i} onClick={()=>handleBasic(v)} style={{ background:bg, color:fc, border:`1px solid ${v==='='?'transparent':'#f1f5f9'}`, borderRadius:13, height:58, fontSize:v==='00'?14:20, fontWeight:fw, fontFamily:'inherit', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', cursor:'pointer', overflow:'hidden' }}>
            {v}
          </button>
        ); })}
        <button onClick={del} style={{ background:'#fee2e2', color:'#ef4444', border:'1px solid #fecaca', borderRadius:13, height:58, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 6px rgba(0,0,0,0.05)' }}>
          <FaBackspace size={20}/>
        </button>
      </div>

      <ActionRow onCalc={calc} onSave={()=>{ if(result!==null&&!String(result).includes('❌')){setSaved(true);setToast(t.saved);} }} onShare={()=>{ if(result!==null) shareWA(buildShare('🧮',[`${expr} = ${result}`])); }} accent={A} saved={saved} label={t.calculate} />
      <HistoryPanel items={history} accent={A} onClear={()=>onClear&&onClear('general')} labels={{ history:t.history, clear:t.clearHistory }} />
      {toast && <Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
