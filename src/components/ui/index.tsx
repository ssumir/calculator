import { useState, useEffect } from 'react';
import {
  FaInfoCircle, FaCalculator, FaSave, FaWhatsapp,
  FaHistory, FaTrash, FaChevronDown, FaChevronUp, FaCheckCircle,
} from 'react-icons/fa';

// ─── FloatInput ───────────────────────────────────────────────────────────────
export function FloatInput({ label, hint, accent='#d4a017', value, onChange, type='text', placeholder, ...props }:any) {
  const [focused, setFocused] = useState(false);
  const hasValue = value!==''&&value!==undefined&&value!==null;
  const active = focused||hasValue;
  return (
    <div style={{ position:'relative', marginBottom:18, width:'100%' }}>
      <div style={{
        position:'relative',
        border:`2px solid ${focused?accent:'#2e2e38'}`,
        borderRadius:13, background:'#1a1a1e',
        transition:'border-color 0.2s, box-shadow 0.2s',
        boxShadow:focused?`0 0 0 3px ${accent}18`:'none',
      }}>
        <label style={{
          position:'absolute',
          top: active?-10:'50%',
          left:13,
          transform: active?'none':'translateY(-50%)',
          fontSize: active?11:15,
          fontWeight: active?700:500,
          color: focused?accent:active?'#6b6780':'#3a3a48',
          background: active?'#1a1a1e':'transparent',
          padding: active?'0 5px':'0',
          transition:'all 0.18s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents:'none', zIndex:2, lineHeight:1,
          whiteSpace:'nowrap', maxWidth:'calc(100% - 26px)',
          overflow:'hidden', textOverflow:'ellipsis',
        }}>
          {label}
        </label>
        <input
          type={type} value={value} onChange={onChange}
          placeholder={focused?(placeholder||''):''}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
          {...props}
          style={{
            width:'100%', display:'block', padding:'15px 15px 13px',
            border:'none', borderRadius:13,
            fontSize:17, fontWeight:600, color:'#f1f0f5',
            background:'transparent', outline:'none', fontFamily:'inherit', minWidth:0,
          }}
        />
      </div>
      {hint&&<div style={{ fontSize:12, color:'#3a3a48', marginTop:4, paddingLeft:5 }}>{hint}</div>}
    </div>
  );
}

// ─── FloatSelect ──────────────────────────────────────────────────────────────
export function FloatSelect({ label, accent='#d4a017', value, onChange, children, ...props }:any) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position:'relative', marginBottom:18, width:'100%' }}>
      <div style={{
        position:'relative', border:`2px solid ${focused?accent:'#2e2e38'}`,
        borderRadius:13, background:'#1a1a1e',
        transition:'border-color 0.2s', boxShadow:focused?`0 0 0 3px ${accent}18`:'none',
      }}>
        <label style={{
          position:'absolute', top:-10, left:13,
          fontSize:11, fontWeight:700, color:focused?accent:'#6b6780',
          background:'#1a1a1e', padding:'0 5px', pointerEvents:'none', zIndex:2, lineHeight:1,
        }}>{label}</label>
        <select value={value} onChange={onChange}
          onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} {...props}
          style={{
            width:'100%', display:'block', padding:'15px 40px 13px 15px',
            border:'none', borderRadius:13, fontSize:16, fontWeight:600,
            color:'#f1f0f5', background:'transparent', outline:'none',
            fontFamily:'inherit', cursor:'pointer', minWidth:0,
            appearance:'none', WebkitAppearance:'none',
          }}>
          {children}
        </select>
        <div style={{ position:'absolute', right:15, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#6b6780', fontSize:14 }}>▾</div>
      </div>
    </div>
  );
}

// ─── DateThreeInput ───────────────────────────────────────────────────────────
export function DateThreeInput({ labels=['Day','Month','Year'], values=['','',''], onChanges=[], accent='#c41e3a', hint }:any) {
  return (
    <div style={{ width:'100%', marginBottom:4 }}>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', width:'100%' }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ flex:i===2?1.6:1, minWidth:0 }}>
            <FloatInput label={labels[i]} type="number" value={values[i]}
              onChange={onChanges[i]} accent={accent}
              placeholder={i===0?'15':i===1?'06':'1990'}/>
          </div>
        ))}
      </div>
      {hint&&<div style={{ fontSize:12, color:'#3a3a48', marginTop:-12, marginBottom:14, paddingLeft:5 }}>{hint}</div>}
    </div>
  );
}

// ─── ToggleGroup ──────────────────────────────────────────────────────────────
export function ToggleGroup({ options, value, onChange, accent='#d4a017' }:any) {
  return (
    <div style={{ display:'flex', gap:6, marginBottom:18, background:'#111113', borderRadius:13, padding:4, width:'100%' }}>
      {options.map(([val,label]:[string,string])=>{
        const active=value===val;
        return (
          <button key={val} onClick={()=>onChange(val)} style={{
            flex:1, padding:'11px 6px',
            background:active?'#1a1a1e':'transparent',
            color:active?accent:'#3a3a48',
            border:'none', borderRadius:10,
            fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
            boxShadow:active?'0 1px 6px rgba(0,0,0,0.3)':'none',
            transition:'all 0.18s',
            display:'flex', alignItems:'center', justifyContent:'center', gap:5, minWidth:0,
          }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────
export function ResultCard({ children, accent='#d4a017' }:any) {
  return (
    <div style={{
      background:`${accent}0a`, border:`2px solid ${accent}25`,
      borderRadius:16, padding:'18px',
      marginTop:18, animation:'popIn 0.28s ease',
      boxShadow:`0 4px 24px ${accent}10`,
      width:'100%', overflow:'hidden',
    }}>
      {children}
    </div>
  );
}

// ─── StatGrid ─────────────────────────────────────────────────────────────────
export function StatGrid({ items, cols=2 }:any) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},minmax(0,1fr))`, gap:10, width:'100%' }}>
      {items.map(([label,value,accent,span]:any,i:number)=>(
        <div key={i} style={{
          background:'#1a1a1e', border:'1.5px solid #2e2e38', borderRadius:13,
          padding:'13px 11px', textAlign:'center',
          boxShadow:'0 1px 6px rgba(0,0,0,0.2)',
          gridColumn:span==='full'?'1 / -1':undefined, overflow:'hidden',
        }}>
          <div style={{ fontSize:12, color:'#6b6780', fontWeight:600, marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
          <div style={{ fontSize:17, fontWeight:800, color:accent||'#f1f0f5', wordBreak:'break-word' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ─── InfoBanner ───────────────────────────────────────────────────────────────
export function InfoBanner({ text, accent='#d4a017' }:any) {
  return (
    <div style={{
      background:`${accent}0e`, border:`1.5px solid ${accent}28`,
      borderRadius:13, padding:'12px 16px', marginBottom:18,
      display:'flex', gap:11, alignItems:'flex-start', width:'100%',
    }}>
      <FaInfoCircle size={16} color={accent} style={{ flexShrink:0, marginTop:2 }}/>
      <p style={{ fontSize:13, color:accent, fontWeight:500, lineHeight:1.6, margin:0 }}>{text}</p>
    </div>
  );
}

// ─── ActionRow ────────────────────────────────────────────────────────────────
export function ActionRow({ onCalc, onSave, onShare, accent, saved, label='Calculate' }:any) {
  return (
    <div style={{ display:'flex', gap:9, marginTop:20, width:'100%' }}>
      <button onClick={onCalc} style={{
        flex:2, padding:'15px 0',
        background:`linear-gradient(135deg, ${accent}, ${accent}cc)`,
        color:'#fff', border:'none', borderRadius:14,
        fontSize:16, fontWeight:800, fontFamily:'inherit',
        boxShadow:`0 4px 20px ${accent}44`, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        transition:'transform 0.1s, box-shadow 0.1s', minWidth:0,
        letterSpacing:0.3,
      }}
        onMouseDown={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(0.97)'}
        onMouseUp={e=>{(e.currentTarget as HTMLButtonElement).style.transform=''}}
        onTouchStart={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(0.97)'}
        onTouchEnd={e=>{(e.currentTarget as HTMLButtonElement).style.transform=''}}
      >
        <FaCalculator size={15}/>{label}
      </button>
      <button onClick={onSave} title="Save" style={{
        width:52, flexShrink:0, padding:'15px 0',
        background:saved?'#0a2a10':'#1a1a1e',
        color:saved?'#27ae60':'#3a3a48',
        border:`2px solid ${saved?'#27ae60':'#2e2e38'}`,
        borderRadius:14, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        transition:'all 0.2s',
      }}>
        <FaSave size={18}/>
      </button>
      <button onClick={onShare} title="WhatsApp" style={{
        width:52, flexShrink:0, padding:'15px 0',
        background:'#0d2e18', color:'#25d366',
        border:'2px solid #25d36630', borderRadius:14, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:'0 4px 14px rgba(37,211,102,0.15)',
        transition:'transform 0.1s',
      }}
        onMouseDown={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(0.94)'}
        onMouseUp={e=>{(e.currentTarget as HTMLButtonElement).style.transform=''}}
        onTouchStart={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(0.94)'}
        onTouchEnd={e=>{(e.currentTarget as HTMLButtonElement).style.transform=''}}
      >
        <FaWhatsapp size={22}/>
      </button>
    </div>
  );
}

// ─── HistoryPanel ─────────────────────────────────────────────────────────────
export function HistoryPanel({ items=[], accent, onClear, labels={history:'History',clear:'Clear'} }:any) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <div style={{ marginTop:18, width:'100%' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        background:'none', border:`2px solid ${accent}28`,
        borderRadius:11, padding:'9px 16px', fontSize:13, fontWeight:700,
        color:accent, fontFamily:'inherit', cursor:'pointer',
        display:'flex', alignItems:'center', gap:7,
      }}>
        <FaHistory size={13}/>{labels.history} ({items.length})
        {open?<FaChevronUp size={11}/>:<FaChevronDown size={11}/>}
      </button>
      {open&&(
        <div style={{
          marginTop:9, background:'#1a1a1e', borderRadius:13,
          padding:'14px', maxHeight:200, overflowY:'auto', overflowX:'hidden',
          border:'1.5px solid #2e2e38', animation:'slideUp 0.2s ease', width:'100%',
        }}>
          {[...items].reverse().map((item:string,i:number)=>(
            <div key={i} style={{
              fontSize:13, padding:'7px 0',
              borderBottom:i<items.length-1?'1px solid #1e1e26':'none',
              color:'#6b6780', lineHeight:1.55, wordBreak:'break-word',
            }}>{item}</div>
          ))}
          <button onClick={onClear} style={{
            marginTop:10, background:'#2a0a0a', color:'#e74c3c',
            border:'none', borderRadius:9, padding:'8px 16px',
            fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
            display:'flex', alignItems:'center', gap:6,
          }}>
            <FaTrash size={12}/>{labels.clear}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ msg, onDone }:any) {
  useEffect(()=>{ const t=setTimeout(onDone,2400); return ()=>clearTimeout(t); },[onDone]);
  return (
    <div style={{
      position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)',
      background:'#1a1a1e', color:'#f1f0f5',
      padding:'13px 24px', borderRadius:32,
      fontSize:15, fontFamily:'inherit', fontWeight:600,
      boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
      zIndex:9999, whiteSpace:'nowrap',
      animation:'toastUp 0.25s ease',
      display:'flex', alignItems:'center', gap:9,
      border:'1.5px solid #2e2e38',
    }}>
      <FaCheckCircle color="#27ae60" size={17}/>{msg}
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }:any) {
  return (
    <div style={{ fontSize:12, fontWeight:700, color:'#6b6780', textTransform:'uppercase', letterSpacing:0.8, marginBottom:12, marginTop:6 }}>
      {children}
    </div>
  );
}

// ─── PresetPills ──────────────────────────────────────────────────────────────
export function PresetPills({ options, active, onSelect, accent }:any) {
  return (
    <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:16, width:'100%' }}>
      {options.map(([val,label]:[string,string])=>(
        <button key={val} onClick={()=>onSelect(val)} style={{
          padding:'8px 14px', borderRadius:22,
          background:active===val?accent:'#1a1a1e',
          color:active===val?'#fff':'#6b6780',
          border:`2px solid ${active===val?accent:'#2e2e38'}`,
          fontSize:13, fontWeight:700, fontFamily:'inherit', cursor:'pointer',
          transition:'all 0.15s', flexShrink:0,
        }}>{label}</button>
      ))}
    </div>
  );
}
