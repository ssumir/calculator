import { FaArrowLeft, FaGlobe } from 'react-icons/fa';
import { useLang } from '../context/LangContext.tsx';

interface Props {
  onBack: () => void;
  title: string;
  accent: string;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export default function Header({ onBack, title, accent, icon: Icon }: Props) {
  const { toggle, lang } = useLang();
  return (
    <div style={{
      background: '#0d0d10',
      borderBottom: `1px solid ${accent}25`,
      padding: '0 14px',
      paddingTop: 'calc(env(safe-area-inset-top, 0px) + 10px)',
      paddingBottom: 10,
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0, position: 'sticky', top: 0, zIndex: 100,
      minHeight: 56,
      boxShadow: `0 2px 16px rgba(0,0,0,0.4)`,
    }}>
      <button onClick={onBack} style={{
        background: '#1a1a1e', border: `1px solid #2e2e38`,
        color: accent, borderRadius: 11, width: 36, height: 36, minWidth: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s',
      }}
        onTouchStart={e => (e.currentTarget as HTMLButtonElement).style.background = '#2e2e38'}
        onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1e'; }}
      >
        <FaArrowLeft size={13} />
      </button>

      {Icon && (
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: `${accent}18`, border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={15} color={accent} />
        </div>
      )}

      <span style={{
        flex: 1, fontSize: 15, fontWeight: 800, color: '#e8e8e8',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        minWidth: 0, letterSpacing: 0.2,
      }}>{title}</span>

      <button onClick={toggle} style={{
        background: '#1a1a1e', border: '1px solid #2e2e38',
        borderRadius: 20, padding: '5px 12px',
        fontSize: 11, fontWeight: 700, color: '#a8a4b8',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
        fontFamily: 'inherit',
      }}>
        <FaGlobe size={10}/>{lang === 'bn' ? 'EN' : 'বাং'}
      </button>
    </div>
  );
}
