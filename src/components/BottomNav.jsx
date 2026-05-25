import { FaCalculator, FaTshirt, FaMoneyBillWave, FaRulerCombined, FaEllipsisH } from 'react-icons/fa';
import { useLang } from '../context/LangContext';

// 5 tab groups → maps to calc IDs
const TABS = [
  {
    id: 'calc',
    icon: FaCalculator,
    bn: 'হিসাব', en: 'Calc',
    apps: ['general'],
    primary: 'general',
    color: '#6366f1',
  },
  {
    id: 'garments',
    icon: FaTshirt,
    bn: 'পোশাক', en: 'Garments',
    apps: ['garments', 'gsize'],
    primary: 'garments',
    color: '#f97316',
  },
  {
    id: 'finance',
    icon: FaMoneyBillWave,
    bn: 'আর্থিক', en: 'Finance',
    apps: ['emi', 'vat', 'smv'],
    primary: 'emi',
    color: '#0ea5e9',
  },
  {
    id: 'unit',
    icon: FaRulerCombined,
    bn: 'ইউনিট', en: 'Unit',
    apps: ['unit'],
    primary: 'unit',
    color: '#3b82f6',
  },
  {
    id: 'health',
    icon: FaEllipsisH,
    bn: 'স্বাস্থ্য', en: 'Health',
    apps: ['bmi', 'calorie', 'age'],
    primary: 'bmi',
    color: '#10b981',
  },
];

export default function BottomNav({ activeId, onOpen, onShowHome }) {
  const { lang } = useLang();

  // Which tab is active?
  const activeTab = TABS.find(t => t.apps.includes(activeId)) || null;

  const handleTap = (tab) => {
    if (activeTab?.id === tab.id) {
      // Already on this tab — if multiple apps, cycle or go home
      if (tab.apps.length > 1) {
        const cur = tab.apps.indexOf(activeId);
        const next = tab.apps[(cur + 1) % tab.apps.length];
        onOpen(next);
      } else {
        // Single app tab — tap again goes home
        onShowHome();
      }
    } else {
      onOpen(tab.primary);
    }
  };

  return (
    <div style={{
      flexShrink: 0,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(226,232,240,0.8)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 200,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', height: 64 }}>
        {TABS.map(tab => {
          const isActive = activeTab?.id === tab.id;
          const Icon = tab.icon;
          // Show sub-app dots if multiple apps in this tab
          const hasSub = tab.apps.length > 1;
          const subIdx = hasSub && isActive ? tab.apps.indexOf(activeId) : -1;

          return (
            <button
              key={tab.id}
              onClick={() => handleTap(tab)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                border: 'none', background: 'none', cursor: 'pointer',
                padding: '8px 4px 4px',
                position: 'relative',
                transition: 'transform 0.12s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e => e.currentTarget.style.transform = ''}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onTouchEnd={e => e.currentTarget.style.transform = ''}
            >
              {/* Active indicator pill above icon */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32, height: 3, borderRadius: 2,
                  background: tab.color,
                  animation: 'fadeIn 0.2s ease',
                }} />
              )}

              {/* Icon with colored bg when active */}
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: isActive ? `${tab.color}18` : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.18s',
              }}>
                <Icon size={20} color={isActive ? tab.color : '#94a3b8'} />
              </div>

              <span style={{
                fontSize: 10, fontWeight: isActive ? 700 : 500,
                color: isActive ? tab.color : '#94a3b8',
                fontFamily: 'inherit',
                transition: 'color 0.18s',
              }}>
                {lang === 'bn' ? tab.bn : tab.en}
              </span>

              {/* Sub-dots for multi-app tabs */}
              {hasSub && isActive && (
                <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
                  {tab.apps.map((_, i) => (
                    <div key={i} style={{
                      width: i === subIdx ? 12 : 4, height: 4,
                      borderRadius: 2,
                      background: i === subIdx ? tab.color : `${tab.color}44`,
                      transition: 'width 0.2s',
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
