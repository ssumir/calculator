import { useState, useCallback } from 'react';
import {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
  FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
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
import GarmentsPattern from './components/calculators/GarmentsPattern';
import { BdLandCalc, BdWeightCalc } from './components/calculators/BdSpecialCalcs';

const SCREENS = {
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

const ICONS = {
  FaCalculator, FaUniversity, FaBirthdayCake, FaWeight,
  FaFire, FaReceipt, FaChartLine, FaTshirt, FaRuler, FaExchangeAlt,
  FaRulerCombined, FaMapMarkedAlt, FaBalanceScale,
};

const APP_LABELS = {
  general:  { en: 'General', bn: 'সাধারণ' },
  emi:      { en: 'EMI', bn: 'ইএমআই' },
  age:      { en: 'Age', bn: 'বয়স' },
  bmi:      { en: 'BMI', bn: 'বিএমআই' },
  calorie:  { en: 'Calorie', bn: 'ক্যালরি' },
  vat:      { en: 'VAT', bn: 'ভ্যাট' },
  smv:      { en: 'Stock', bn: 'শেয়ার' },
  garments: { en: 'Measurement', bn: 'মেজারমেন্ট' },
  gpattern: { en: 'Pattern', bn: 'প্যাটার্ন' },
  gsize:    { en: 'Size Chart', bn: 'সাইজ চার্ট' },
  unit:     { en: 'Unit', bn: 'ইউনিট' },
  bdland:   { en: 'BD Land', bn: 'ভূমি মাপ' },
  bdweight: { en: 'BD Weight', bn: 'ওজন মাপ' },
};

function AppInner() {
  const [activeId, setActiveId] = useState(null);
  const { history, add, clear } = useHistory();
  const { t, lang } = useLang();
  const device = useDevice();

  const handleBack = useCallback(() => setActiveId(null), []);
  const handleOpen = useCallback(id => setActiveId(id), []);
  const handleHome = useCallback(() => setActiveId(null), []);

  const activeApp = activeId ? APPS.find(a => a.id === activeId) : null;
  const Screen = activeId ? SCREENS[activeId] : null;
  const ActiveIcon = activeApp ? ICONS[activeApp.icon] : null;
  const activeLabel = activeId ? (APP_LABELS[activeId]?.[lang] || activeId) : '';

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#dde3f0',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div className="app-shell">
        {activeId && Screen ? (
          <>
            <Header
              onBack={handleBack}
              title={activeLabel}
              accent={activeApp.color}
              icon={ActiveIcon}
            />
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