import { FaArrowLeft, FaGlobe } from 'react-icons/fa';
import { useLang } from '../context/LangContext';

export default function Header({ onBack, title, accent, icon: Icon }) {
  const { toggle, lang } = useLang();
  return (
    <div style={{
      /* Glass morphism — transparent, shows content behind */
      background: 'rgba(255,255,255,0.78)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `2px solid ${accent}`,
      padding: '10px 14px',
      paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 100,
      minHeight: 56,
    }}>
      <button onClick={onBack} style={{
        background: '#f1f5f9', border: 'none', color: '#475569',
        borderRadius: 10, width: 38, height: 38, minWidth: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.15s',
      }}
        onMouseDown={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseUp={e => e.currentTarget.style.background = '#f1f5f9'}
        onTouchStart={e => e.currentTarget.style.background = '#e2e8f0'}
        onTouchEnd={e => e.currentTarget.style.background = '#f1f5f9'}
      >
        <FaArrowLeft size={15} />
      </button>

      {Icon && (
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={17} color={accent} />
        </div>
      )}

      <span style={{
        flex: 1, fontSize: 16, fontWeight: 700, color: '#1e293b',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        minWidth: 0,
      }}>{title}</span>

      <button onClick={toggle} style={{
        background: `${accent}14`, border: `1.5px solid ${accent}30`,
        borderRadius: 20, padding: '5px 12px',
        fontSize: 12, fontWeight: 700, color: accent,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        transition: 'background 0.15s',
      }}>
        <FaGlobe size={11} />{lang === 'bn' ? 'EN' : 'বাং'}
      </button>
    </div>
  );
}
