import { useState, useCallback } from 'react';
import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
  FaRulerCombined, FaMapMarkedAlt, FaBalanceScale, FaQuestionCircle,
} from 'react-icons/fa';

import { LangProvider, useLang } from './context/LangContext.tsx';
import { useHistory } from './hooks/useHistory.ts';
import { useDevice } from './hooks/useDevice.ts';
import { APPS } from './utils/constants.ts';

import HomeScreen from './components/HomeScreen.tsx';
import Header from './components/Header.tsx';
import BottomNav from './components/BottomNav.tsx';
import SupportScreen from './components/SupportScreen.tsx';

import GeneralCalc from './components/calculators/GeneralCalc.tsx';
import EmiCalc from './components/calculators/EmiCalc.tsx';
import AgeCalc from './components/calculators/AgeCalc.tsx';
import { BmiCalc, CalorieCalc, VatCalc, SmvCalc } from './components/calculators/OtherCalcs.tsx';
import { GarmentsCalc, GSizeCalc, UnitCalc } from './components/calculators/NewCalcs.tsx';
import GarmentsPattern from './components/calculators/GarmentsPattern.tsx';
import { BdLandCalc, BdWeightCalc } from './components/calculators/BdSpecialCalcs.tsx';

const SCREENS: Record<string, React.ComponentType<any>> = {
  general:   GeneralCalc,
  emi:       EmiCalc,
  age:       AgeCalc,
  bmi:       BmiCalc,
  calorie:   CalorieCalc,
  vat:       VatCalc,
  smv:       SmvCalc,
  garments:  GarmentsCalc,
  gpattern:  GarmentsPattern,
  gsize:     GSizeCalc,
  unit:      UnitCalc,
  bdland:    BdLandCalc,
  bdweight:  BdWeightCalc,
};

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
  FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
};

const APP_LABELS: Record<string, { en: string; bn: string }> = {
  general:  { en: 'Calculator',   bn: 'ক্যালকুলেটর' },
  emi:      { en: 'EMI Calc',     bn: 'ইএমআই' },
  age:      { en: 'Age Calc',     bn: 'বয়স' },
  bmi:      { en: 'BMI',          bn: 'বিএমআই' },
  calorie:  { en: 'Calorie',      bn: 'ক্যালরি' },
  vat:      { en: 'VAT',          bn: 'ভ্যাট' },
  smv:      { en: 'Stock Market', bn: 'শেয়ার বাজার' },
  garments: { en: 'Measurement',  bn: 'মেজারমেন্ট' },
  gpattern: { en: 'Pattern',      bn: 'প্যাটার্ন' },
  gsize:    { en: 'Size Chart',   bn: 'সাইজ চার্ট' },
  unit:     { en: 'Unit Convert', bn: 'ইউনিট' },
  bdland:   { en: 'BD Land',      bn: 'ভূমি মাপ' },
  bdweight: { en: 'BD Weight',    bn: 'ওজন দাম' },
  support:  { en: 'Support',      bn: 'সাপোর্ট' },
};

function AppInner() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { history, add, clear } = useHistory();
  const { lang } = useLang();
  const device = useDevice();

  const handleBack = useCallback(() => setActiveId(null), []);
  const handleOpen = useCallback((id: string) => setActiveId(id), []);
  const handleHome = useCallback(() => setActiveId(null), []);

  const activeApp = activeId ? APPS.find(a => a.id === activeId) : null;
  const Screen = activeId && activeId !== 'support' ? SCREENS[activeId] : null;
  const ActiveIcon = activeApp ? ICONS[activeApp.icon] : activeId === 'support' ? FaQuestionCircle : null;
  const activeLabel = activeId ? (APP_LABELS[activeId]?.[lang] || activeId) : '';
  const activeColor = activeApp?.color || (activeId === 'support' ? '#c41e3a' : '#e8e8e8');

  // General calc gets full dark shell, no screen-inner padding
  const isGeneral = activeId === 'general';

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#0a0a0a',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div className="app-shell">
        {activeId ? (
          <>
            <Header
              onBack={handleBack}
              title={activeLabel}
              accent={activeColor}
              icon={ActiveIcon ?? undefined}
            />
            {activeId === 'support' ? (
              <div className="screen-body">
                <SupportScreen />
              </div>
            ) : Screen ? (
              isGeneral ? (
                <div className="screen-body" style={{ background: '#1c1c1e' }}>
                  <Screen
                    history={history[activeId] || []}
                    onAdd={add}
                    onClear={clear}
                  />
                </div>
              ) : (
                <div className="screen-body">
                  <div className="screen-inner">
                    <Screen
                      history={history[activeId] || []}
                      onAdd={add}
                      onClear={clear}
                    />
                  </div>
                </div>
              )
            ) : null}
          </>
        ) : (
          <HomeScreen onOpen={handleOpen} history={history} device={device} />
        )}
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
