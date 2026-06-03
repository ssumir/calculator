import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler,
  FaExchangeAlt, FaGlobe
} from 'react-icons/fa';
import { useLang } from '../context/LangContext';
import { APPS } from '../utils/constants';

const ICON_MAP = {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
};

export default function HomeScreen({ onOpen, history, device = {} }) {
  const { t, lang, toggle } = useLang();
  const w = device.w || 375;
  const pad = w < 380 ? 14 : w < 600 ? 18 : 24;
  const gridCols = w < 380 ? 'repeat(2,minmax(0,1fr))' : w < 600 ? 'repeat(3,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))';
  const totalHistory = Object.values(history).reduce((s, a) => s + (a?.length || 0), 0);

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#f0f4ff', overflowY: 'auto', overflowX: 'hidden',
      // Leave space for bottom nav
      paddingBottom: 'calc(64px + env(safe-area-inset-bottom,0px))',
    }}>
      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        padding: `${w < 380 ? 22 : 28}px ${pad}px ${w < 380 ? 18 : 22}px`,
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        paddingTop: 'calc(env(safe-area-inset-top,0px) + 22px)',
      }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, background:'rgba(255,255,255,0.07)', borderRadius:'50%' }}/>
        <div style={{ position:'absolute', bottom:-20, left:-20, width:80, height:80, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }}/>

        {/* Top row — lang toggle + history count */}
        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button onClick={toggle} style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', backdropFilter:'blur(8px)', borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
            <FaGlobe size={11}/>{lang === 'bn' ? 'EN' : 'বাং'}
          </button>
          {totalHistory > 0 && (
            <div style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:20, padding:'6px 14px', fontSize:11, color:'#fff', display:'flex', alignItems:'center', gap:5 }}>
              💾 {totalHistory}
            </div>
          )}
        </div>

        <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
          <div style={{ fontSize: w < 380 ? 38 : 46, marginBottom:8, animation:'bounce 2s ease-in-out infinite', display:'inline-block' }}>🍄</div>
          <div style={{ fontFamily:'Press Start 2P,monospace', color:'#fff', fontSize: w < 380 ? 12 : 16, textShadow:'0 3px 12px rgba(0,0,0,0.3)', letterSpacing:2, marginBottom:5 }}>MARIO</div>
          <div style={{ fontFamily:'Press Start 2P,monospace', color:'rgba(255,255,255,0.75)', fontSize: w < 380 ? 6 : 8, letterSpacing:3, marginBottom:12 }}>CALCULATOR</div>
          <div style={{ color:'rgba(255,255,255,0.88)', fontSize: w < 380 ? 12 : 14, fontWeight:600, lineHeight:1.4 }}>{t.tagline}</div>
        </div>
      </div>

      {/* ── App grid ── */}
      <div style={{ padding:`16px ${pad}px 8px`, flex:1 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:0.8, textTransform:'uppercase', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
          <FaCalculator size={10}/>{t.selectCalc}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:gridCols, gap: w < 380 ? 10 : 12 }}>
          {APPS.map((app, idx) => {
            const Icon = ICON_MAP[app.icon];
            const count = (history[app.id] || []).length;
            const appT = t.apps[app.id];
            return (
              <button key={app.id} onClick={() => onOpen(app.id)} style={{
                background:'#fff', borderRadius:18,
                padding: w < 380 ? '14px 8px 12px' : '18px 10px 14px',
                border:`1.5px solid ${app.color}18`,
                display:'flex', flexDirection:'column', alignItems:'center',
                boxShadow:`0 2px 12px ${app.shadow}`,
                position:'relative', cursor:'pointer',
                animation:`slideUp 0.3s ease ${idx*0.04}s both`,
                transition:'transform 0.12s, box-shadow 0.12s',
                minWidth:0, overflow:'hidden',
              }}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${app.shadow}`; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 2px 12px ${app.shadow}`; }}
                onTouchStart={e=>e.currentTarget.style.transform='scale(0.94)'}
                onTouchEnd={e=>{ e.currentTarget.style.transform=''; }}
              >
                {count > 0 && (
                  <div style={{ position:'absolute', top:-5, right:-5, background:app.color, color:'#fff', borderRadius:10, fontSize:9, fontWeight:800, padding:'2px 6px', minWidth:18, textAlign:'center', boxShadow:`0 2px 6px ${app.color}60`, zIndex:1 }}>
                    {count}
                  </div>
                )}
                <div style={{ width:w<380?40:48, height:w<380?40:48, borderRadius:14, background:app.light, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:w<380?7:10, boxShadow:`0 3px 10px ${app.shadow}`, flexShrink:0 }}>
                  {Icon && <Icon size={w<380?19:23} color={app.color}/>}
                </div>
                <div style={{ fontSize:w<380?11:12, fontWeight:700, color:'#1e293b', textAlign:'center', lineHeight:1.2, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>
                  {appT?.label || app.id}
                </div>
                <div style={{ fontSize:w<380?9:10, color:'#94a3b8', textAlign:'center', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%' }}>
                  {appT?.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feature chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:16 }}>
          {[['💾', lang==='bn'?'ইতিহাস':'History'],['📤', 'WhatsApp'],['🌐', lang==='bn'?'দ্বিভাষিক':'Bilingual'],['📱', lang==='bn'?'মোবাইল বান্ধব':'Mobile Ready']].map(([icon,label])=>(
            <div key={label} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#fff', borderRadius:20, padding:'5px 11px', fontSize:11, fontWeight:600, color:'#64748b', border:'1px solid #e2e8f0', whiteSpace:'nowrap' }}>
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop:20, textAlign:'center', paddingBottom:8 }}>
          <div style={{ fontSize:12, color:'#94a3b8', marginBottom:10 }}>
            {t.madeBy} <span style={{ color:'#667eea', fontWeight:700 }}>Saiful Islam (Sumir)</span>
          </div>
          {/* WhatsApp deep link — opens app directly */}
          <a
            href={`whatsapp://send?phone=+8801732484884&text=${encodeURIComponent(lang==='bn'?'হ্যালো, Mario Calculator থেকে যোগাযোগ করছি।':'Hello, contacting from Mario Calculator.')}`}
            onClick={e => {
              e.preventDefault();
              const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
              if (isMobile) {
                window.location.href = e.currentTarget.href;
              } else {
                window.open(`https://wa.me/+8801732484884`, '_blank');
              }
            }}
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#25d366,#128c7e)', color:'#fff', borderRadius:24, padding:'10px 22px', fontSize:13, fontWeight:700, textDecoration:'none', boxShadow:'0 4px 14px rgba(37,211,102,0.3)' }}
          >
            📱 {t.support}
          </a>
        </div>
      </div>
    </div>
  );
}