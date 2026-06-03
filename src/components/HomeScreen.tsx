import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler,
  FaExchangeAlt, FaGlobe, FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
} from 'react-icons/fa';
import { useLang } from '../context/LangContext.tsx';
import { APPS } from '../utils/constants.ts';

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
  const cols = w >= 500 ? 5 : 4;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#0d0d10',
      overflow: 'hidden',
    }}>
      {/* ── Compact Hero ── */}
      <div style={{
        padding: `calc(env(safe-area-inset-top,0px) + 14px) 16px 12px`,
        flexShrink: 0,
        background: 'linear-gradient(160deg,#1a0a0f 0%,#0d0d10 70%)',
        borderBottom: '1px solid #1e1e26',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', top:-30, right:-20, width:120, height:120, background:'#c41e3a08', borderRadius:'50%', pointerEvents:'none' }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:28, animation:'bounce 2.5s ease-in-out infinite' }}>🍄</div>
            <div>
              <div style={{ fontFamily:"'Press Start 2P', monospace", color:'#e8e8e8', fontSize:8, letterSpacing:2 }}>MARIO CALCULATOR</div>
              <div style={{ color:'#6b6780', fontSize:10, fontWeight:600, marginTop:2 }}>{t.tagline}</div>
            </div>
          </div>
          <button onClick={toggle} style={{
            background:'#1a1a1e', border:'1px solid #2e2e38',
            borderRadius:20, padding:'6px 12px',
            fontSize:11, fontWeight:700, color:'#a8a4b8',
            cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontFamily:'inherit',
          }}>
            <FaGlobe size={10}/>{lang === 'bn' ? 'EN' : 'বাং'}
          </button>
        </div>
      </div>

      {/* ── App Grid ── */}
      <div style={{ flex:1, padding:'12px 12px 0', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ fontSize:9, fontWeight:700, color:'#3a3a4a', letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>
          {t.selectCalc}
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:`repeat(${cols}, 1fr)`,
          gap:7,
          flex:1, alignContent:'start',
        }}>
          {APPS.map((app, idx) => {
            const Icon = ICON_MAP[app.icon];
            const count = (history[app.id] || []).length;
            const appT = t.apps[app.id as keyof typeof t.apps];
            return (
              <button key={app.id} onClick={() => onOpen(app.id)} style={{
                background: '#1a1a1e',
                border: `1px solid ${app.color}20`,
                borderRadius: 14,
                padding: '10px 4px 9px',
                display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                position:'relative', cursor:'pointer',
                animation:`slideUp 0.22s ease ${idx*0.025}s both`,
                transition:'transform 0.1s, background 0.12s, border-color 0.12s',
                minWidth:0, overflow:'hidden',
                boxShadow:`0 2px 12px ${app.color}10`,
              }}
                onTouchStart={e => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.92)'}
                onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#222228';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${app.color}50`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1e';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = `${app.color}20`;
                }}
              >
                {count > 0 && (
                  <div style={{
                    position:'absolute', top:4, right:4,
                    background:app.color, color:'#fff',
                    borderRadius:7, fontSize:8, fontWeight:800,
                    padding:'1px 4px', minWidth:13, textAlign:'center', zIndex:1,
                  }}>{count}</div>
                )}
                {/* Icon */}
                <div style={{
                  width:34, height:34, borderRadius:10,
                  background:`linear-gradient(135deg, ${app.color}22, ${app.color}11)`,
                  border:`1px solid ${app.color}30`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0,
                }}>
                  {Icon && <Icon size={17} color={app.color}/>}
                </div>
                <div style={{
                  fontSize:9, fontWeight:700, color:'#a8a4b8',
                  textAlign:'center', lineHeight:1.2,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  width:'100%', paddingInline:2,
                }}>
                  {appT?.label || app.id}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom padding for nav */}
        <div style={{ height:'calc(env(safe-area-inset-bottom,0px) + 68px)', flexShrink:0 }}/>
      </div>
    </div>
  );
}
