import { useState } from 'react';
import { FloatInput, ResultCard } from '../ui';
import CalcShell from '../CalcShell';
import { useLang } from '../../context/LangContext.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

interface CalcProps { history: string[]; onAdd: (id: string, entry: string) => void; onClear?: (id: string) => void; }

// ── LAND UNITS ────────────────────────────────────────────────────────────────
interface LandUnit { label: string; labelBn: string; toSqft: number; }
const LAND_UNITS: Record<string, LandUnit> = {
  sqft:   { label: 'Square Feet',       labelBn: 'বর্গফুট',        toSqft: 1 },
  sqm:    { label: 'Square Meter',      labelBn: 'বর্গমিটার',      toSqft: 10.7639 },
  sqyard: { label: 'Square Yard',       labelBn: 'বর্গগজ',         toSqft: 9 },
  decimal:{ label: 'Decimal',           labelBn: 'শতাংশ/ডেসিমেল', toSqft: 435.6 },
  katha:  { label: 'Katha',             labelBn: 'কাঠা',            toSqft: 720 },
  chattak:{ label: 'Chattak',           labelBn: 'ছটাক',            toSqft: 45 },
  aana:   { label: 'Aana',              labelBn: 'আনা',             toSqft: 900 },
  ganda:  { label: 'Ganda',             labelBn: 'গণ্ডা',           toSqft: 3600 },
  bigha:  { label: 'Bigha',             labelBn: 'বিঘা',            toSqft: 14400 },
  kani:   { label: 'Kani',              labelBn: 'কানি',            toSqft: 43560 },
  acre:   { label: 'Acre',              labelBn: 'একর',             toSqft: 43560 },
  hectare:{ label: 'Hectare',           labelBn: 'হেক্টর',          toSqft: 107639.1 },
};
const LAND_ORDER = ['sqft','sqm','sqyard','decimal','katha','chattak','aana','ganda','bigha','kani','acre','hectare'];
const A_LAND = '#16a34a';

export function BdLandCalc({ history, onAdd, onClear }: CalcProps) {
  const { lang } = useLang(); const bn = lang === 'bn';
  const [value, setValue]     = useState('');
  const [fromUnit, setFromUnit] = useState('katha');
  const [result, setResult]   = useState<any>(null);

  const calc = () => {
    const v = parseFloat(value);
    if (!v || v <= 0) { setResult({ error: bn ? 'সঠিক মান দিন।' : 'Enter a valid value.' }); return; }
    const sqft = v * LAND_UNITS[fromUnit].toSqft;
    const conversions: Record<string, number> = {};
    LAND_ORDER.forEach(u => { conversions[u] = parseFloat((sqft / LAND_UNITS[u].toSqft).toFixed(6)); });
    setResult({ from: `${v} ${bn ? LAND_UNITS[fromUnit].labelBn : LAND_UNITS[fromUnit].label}`, conversions });
    onAdd('bdland', `${v} ${fromUnit} = ${conversions['katha']} katha = ${conversions['bigha']} bigha`);
  };

  const res = result && !('error' in result) ? result : null;

  return (
    <CalcShell accent={A_LAND} onCalc={calc} calcLabel={bn ? 'রূপান্তর করুন' : 'Convert'}
      hasResult={!!res}
      onShare={() => { if (res) shareWA(buildShare('Land', [`${res.from}`, `= ${res.conversions['decimal']} ${bn ? 'শতাংশ' : 'Decimal'}`, `= ${res.conversions['katha']} ${bn ? 'কাঠা' : 'Katha'}`, `= ${res.conversions['bigha']} ${bn ? 'বিঘা' : 'Bigha'}`, `= ${res.conversions['sqft']} sqft`])); }}
      history={history} onClear={() => onClear?.('bdland')}
      historyLabel={bn ? 'ইতিহাস' : 'History'} clearLabel={bn ? 'মুছুন' : 'Clear'}>

      {/* Reference table */}
      <div style={{ background: '#0a1a0a', border: '1px solid #14532d', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: A_LAND, marginBottom: 8 }}>{bn ? 'বাংলাদেশ ভূমি মানদণ্ড' : 'BD Land Standard'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, color: '#4ade80' }}>
          {([['1 বিঘা','3 কাঠা'],['1 কাঠা','20 ছটাক'],['1 ছটাক','45 বর্গফুট'],['1 কাঠা','720 বর্গফুট'],['1 বিঘা','14,400 বর্গফুট'],['1 শতাংশ','435.6 বর্গফুট']] as [string,string][]).map(([a, b], i) => (
            <div key={i} style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontWeight: 700, color: A_LAND }}>{a}</span><span>=</span><span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <FloatInput label={bn ? 'পরিমাণ' : 'Value'} accent={A_LAND} type="number" placeholder="1" value={value} onChange={(e: any) => setValue(e.target.value)} />

      {/* Unit selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#6b6780', marginBottom: 8 }}>{bn ? 'কোন একক থেকে?' : 'Convert From:'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {LAND_ORDER.map(u => (
            <button key={u} onClick={() => setFromUnit(u)} style={{ padding: '8px 4px', fontSize: 10, fontWeight: 700, background: fromUnit === u ? A_LAND : '#1a1a1e', color: fromUnit === u ? '#fff' : '#6b6780', border: `1.5px solid ${fromUnit === u ? A_LAND : '#2e2e38'}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
              {bn ? LAND_UNITS[u].labelBn : LAND_UNITS[u].label}
            </button>
          ))}
        </div>
      </div>

      {res && (
        <ResultCard accent={A_LAND}>
          <div style={{ fontSize: 12, fontWeight: 700, color: A_LAND, marginBottom: 10 }}>{res.from} =</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {LAND_ORDER.filter(u => u !== fromUnit).map(u => (
              <div key={u} style={{ background: '#111', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#6b6780', fontWeight: 600, marginBottom: 2 }}>{bn ? LAND_UNITS[u].labelBn : LAND_UNITS[u].label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: A_LAND }}>{res.conversions[u]}</div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
      {result && 'error' in result && <div style={{ color: '#ef4444', fontSize: 14, marginTop: 10, fontWeight: 600 }}>{result.error}</div>}
    </CalcShell>
  );
}

// ── BD WEIGHT PRICE ───────────────────────────────────────────────────────────
interface WeightUnit { label: string; labelBn: string; toKg: number; }
const WEIGHT_UNITS: Record<string, WeightUnit> = {
  kg:     { label: 'Kilogram', labelBn: 'কেজি',   toKg: 1 },
  gram:   { label: 'Gram',     labelBn: 'গ্রাম',   toKg: 0.001 },
  maund:  { label: 'Maund',    labelBn: 'মণ',      toKg: 37.3242 },
  seer:   { label: 'Seer',     labelBn: 'সের',     toKg: 0.9331 },
  powa:   { label: 'Powa',     labelBn: 'পোয়া',   toKg: 0.2333 },
  chattak:{ label: 'Chattak',  labelBn: 'ছটাক',    toKg: 0.05832 },
  pound:  { label: 'Pound',    labelBn: 'পাউন্ড',  toKg: 0.453592 },
};
const WEIGHT_ORDER = ['kg','gram','maund','seer','powa','chattak','pound'];
const A_WEIGHT = '#7c3aed';

export function BdWeightCalc({ history, onAdd, onClear }: CalcProps) {
  const { lang } = useLang(); const bn = lang === 'bn';
  const [weightVal, setWeightVal]   = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [rateVal, setRateVal]       = useState('');
  const [result, setResult]         = useState<any>(null);

  const calc = () => {
    const w = parseFloat(weightVal), r = parseFloat(rateVal);
    if (!w || w <= 0 || !r || r <= 0) { setResult({ error: bn ? 'ওজন ও মূল্য/কেজি সঠিকভাবে দিন।' : 'Enter weight and rate per kg.' }); return; }
    const kg = w * WEIGHT_UNITS[weightUnit].toKg;
    const total = kg * r;
    const unitLabel = bn ? WEIGHT_UNITS[weightUnit].labelBn : WEIGHT_UNITS[weightUnit].label;
    setResult({ totalTaka: total.toFixed(2), weightKg: kg.toFixed(4), ratePerKg: r.toFixed(2), displayWeight: `${w} ${unitLabel}` });
    onAdd('bdweight', `${w} ${weightUnit} x ${r}/kg = ${total.toFixed(2)}`);
  };

  const res = result && !('error' in result) ? result : null;

  return (
    <CalcShell accent={A_WEIGHT} onCalc={calc} calcLabel={bn ? 'হিসাব করুন' : 'Calculate'}
      hasResult={!!res}
      onShare={() => { if (res) shareWA(buildShare('Weight', [`${res.displayWeight} x ${res.ratePerKg}/kg`, `= ${res.totalTaka}`])); }}
      history={history} onClear={() => onClear?.('bdweight')}
      historyLabel={bn ? 'ইতিহাস' : 'History'} clearLabel={bn ? 'মুছুন' : 'Clear'}>

      <FloatInput label={bn ? 'ওজন / পরিমাণ' : 'Weight / Quantity'} accent={A_WEIGHT} type="number" placeholder="1.03" value={weightVal} onChange={(e: any) => setWeightVal(e.target.value)} />

      {/* Unit selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b6780', marginBottom: 8 }}>{bn ? 'ওজনের একক:' : 'Weight Unit:'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {WEIGHT_ORDER.map(u => (
            <button key={u} onClick={() => setWeightUnit(u)} style={{ padding: '9px 4px', fontSize: 10, fontWeight: 700, background: weightUnit === u ? A_WEIGHT : '#1a1a1e', color: weightUnit === u ? '#fff' : '#6b6780', border: `1.5px solid ${weightUnit === u ? A_WEIGHT : '#2e2e38'}`, borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
              {bn ? WEIGHT_UNITS[u].labelBn : WEIGHT_UNITS[u].label}
            </button>
          ))}
        </div>
      </div>

      <FloatInput label={bn ? 'মূল্য / কেজি (BDT)' : 'Rate per kg (BDT)'} accent={A_WEIGHT} type="number" placeholder="120" value={rateVal} onChange={(e: any) => setRateVal(e.target.value)} hint={bn ? 'প্রতি কেজি দাম লিখুন' : 'Price per 1 kg in Taka'} />

      {res && (
        <ResultCard accent={A_WEIGHT}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6b6780', marginBottom: 4 }}>{bn ? 'মোট মূল্য' : 'Total Price'}</div>
            <div style={{ fontSize: 'clamp(32px,8vw,44px)', fontWeight: 900, color: A_WEIGHT, fontFamily: 'monospace' }}>{res.totalTaka}</div>
            <div style={{ fontSize: 11, color: '#6b6780', marginTop: 4 }}>BDT</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[[bn ? 'ওজন' : 'Weight', res.displayWeight], [bn ? 'কেজিতে' : 'In kg', res.weightKg + ' kg'], [bn ? 'মূল্য/কেজি' : 'Rate/kg', res.ratePerKg]].map(([l, v]) => (
              <div key={l} style={{ background: '#111', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#6b6780', fontWeight: 600, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: A_WEIGHT, wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: '#6b6780' }}>
            {res.weightKg} kg x {res.ratePerKg} = <strong style={{ color: A_WEIGHT }}>{res.totalTaka}</strong>
          </div>
        </ResultCard>
      )}
      {result && 'error' in result && <div style={{ color: '#ef4444', fontSize: 14, marginTop: 10, fontWeight: 600 }}>{result.error}</div>}
    </CalcShell>
  );
}