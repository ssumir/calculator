import { useState, useCallback } from 'react';
import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt
} from 'react-icons/fa';

import { LangProvider, useLang } from './context/LangContext';
import { useHistory } from './hooks/useHistory';
import { useDevice } from './hooks/useDevice';
import { APPS } from './utils/constants';

import HomeScreen from './components/HomeScreen';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

import GeneralCalc from './components/calculators/GeneralCalc';
import EmiCalc from './components/calculators/EmiCalc';
import AgeCalc from './components/calculators/AgeCalc';
import { BmiCalc, CalorieCalc, VatCalc, SmvCalc } from './components/calculators/OtherCalcs';
import { GarmentsCalc, GSizeCalc, UnitCalc } from './components/calculators/NewCalcs';

const SCREENS = {
  general: GeneralCalc, emi: EmiCalc, age: AgeCalc,
  bmi: BmiCalc, calorie: CalorieCalc, vat: VatCalc, smv: SmvCalc,
  garments: GarmentsCalc, gsize: GSizeCalc, unit: UnitCalc,
};
const ICONS = {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
};

function AppInner() {
  const [activeId, setActiveId] = useState(null);
  const { history, add, clear } = useHistory();
  const { t } = useLang();
  const device = useDevice();

  const handleBack = useCallback(() => setActiveId(null), []);
  const handleOpen = useCallback(id => setActiveId(id), []);
  const handleHome = useCallback(() => setActiveId(null), []);
  const isWide = device.w >= 600;

  const activeApp = activeId ? APPS.find(a => a.id === activeId) : null;
  const Screen = activeId ? SCREENS[activeId] : null;
  const ActiveIcon = activeApp ? ICONS[activeApp.icon] : null;

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#dde3f0',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div className="app-shell">

        {/* ── Active Calculator ── */}
        {activeId && Screen ? (
          <>
            <Header
              onBack={handleBack}
              title={t.apps[activeId]?.label || activeId}
              accent={activeApp.color}
              icon={ActiveIcon}
            />
            {/* Scrollable content — padding-bottom for bottom nav */}
            <div className="screen-body">
              <div className="screen-inner">
                <Screen
                  history={history[activeId] || []}
                  onAdd={add}
                  onClear={clear}
                />
              </div>
            </div>
          </>
        ) : (
          /* ── Home Screen ── */
          <HomeScreen onOpen={handleOpen} history={history} device={device} />
        )}

        {/* ── Bottom Navigation — always visible ── */}
        <BottomNav
          activeId={activeId}
          onOpen={handleOpen}
          onShowHome={handleHome}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
