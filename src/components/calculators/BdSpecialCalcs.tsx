import { useState } from 'react';
import { useLang } from '../../context/LangContext.tsx';
import { FloatInput, ActionRow, ResultCard, InfoBanner, HistoryPanel, Toast } from '../ui/index.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface CalcProps {
  history: string[];
  onAdd: (id: string, entry: string) => void;
  onClear?: (id: string) => void;
}

// ─── LAND UNITS ───────────────────────────────────────────────────────────────
interface LandUnit { label: string; labelBn: string; toSqft: number; }
const LAND_UNITS: Record<string, LandUnit> = {
  sqft:    { label: 'Square Feet',          labelBn: 'বর্গফুট',         toSqft: 1 },
  sqm:     { label: 'Square Meter',         labelBn: 'বর্গমিটার',       toSqft: 10.7639 },
  sqyard:  { label: 'Square Yard',          labelBn: 'বর্গগজ',          toSqft: 9 },
  decimal: { label: 'Decimal (শতাংশ)',      labelBn: 'শতাংশ / ডেসিমেল', toSqft: 435.6 },
  katha:   { label: 'Katha (কাঠা)',         labelBn: 'কাঠা',             toSqft: 720 },
  chattak: { label: 'Chattak (ছটাক)',       labelBn: 'ছটাক',             toSqft: 45 },
  aana:    { label: 'Aana (আনা)',           labelBn: 'আনা',              toSqft: 900 },
  ganda:   { label: 'Ganda (গণ্ডা)',        labelBn: 'গণ্ডা',            toSqft: 3600 },
  bigha:   { label: 'Bigha (বিঘা)',         labelBn: 'বিঘা',             toSqft: 14400 },
  kani:    { label: 'Kani (কানি)',          labelBn: 'কানি',             toSqft: 43560 },
  acre:    { label: 'Acre (একর)',           labelBn: 'একর',              toSqft: 43560 },
  hectare: { label: 'Hectare (হেক্টর)',     labelBn: 'হেক্টর',           toSqft: 107639.1 },
};
const LAND_ORDER = ['sqft','sqm','sqyard','decimal','katha','chattak','aana','ganda','bigha','kani','acre','hectare'];
const A_LAND = '#16a34a';

export function BdLandCalc({ history, onAdd, onClear }: CalcProps) {
  const { lang } = useLang();
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('katha');
  const [result, setResult] = useState<{ from: string; conversions: Record<string, number> } | { error: string } | null>(null);

  const bn = lang === 'bn';

  const calc = () => {
    const v = parseFloat(value);
    if (!v || v <= 0) { setResult({ error: bn ? 'সঠিক মান দিন।' : 'Please enter a valid value.' }); return; }
    const sqft = v * LAND_UNITS[fromUnit].toSqft;
    const conversions: Record<string, number> = {};
    LAND_ORDER.forEach(u => { conversions[u] = parseFloat((sqft / LAND_UNITS[u].toSqft).toFixed(6)); });
    const label = bn ? LAND_UNITS[fromUnit].labelBn : LAND_UNITS[fromUnit].label;
    setResult({ from: `${v} ${label}`, conversions });
    onAdd('bdland', `${v} ${fromUnit} = ${conversions['katha']} katha = ${conversions['bigha']} bigha`);
  };

  const res = result && !('error' in result) ? result : null;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <InfoBanner
        text={bn
          ? 'বাংলাদেশের সরকারি ভূমি পরিমাপের সব একক — কাঠা, বিঘা, কানি, ছটাক, আনা, গণ্ডা রূপান্তর করুন।'
          : 'Convert all official Bangladesh land units: Katha, Bigha, Kani, Chattak, Aana, Ganda, Decimal.'}
        accent={A_LAND}
      />

      {/* Reference table */}
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: A_LAND, marginBottom: 8 }}>
          {bn ? '📋 বাংলাদেশ ভূমি মানদণ্ড' : '📋 BD Land Standard'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11, color: '#166534' }}>
          {([
            ['1 বিঘা','3 কাঠা'],['1 কাঠা','20 ছটাক'],
            ['1 ছটাক','45 বর্গফুট'],['1 কাঠা','720 বর্গফুট'],
            ['1 বিঘা','14,400 বর্গফুট'],['1 শতাংশ','435.6 বর্গফুট'],
            ['1 বিঘা','33 শতাংশ'],['1 কানি','40 শতাংশ'],
          ] as [string,string][]).map(([a,b],i)=>(
            <div key={i} style={{ display:'flex', gap:4 }}>
              <span style={{ fontWeight:700, color:A_LAND }}>{a}</span><span>=</span><span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <FloatInput
        label={bn ? 'পরিমাণ' : 'Value'}
        accent={A_LAND} type="number" placeholder="1"
        value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
          {bn ? 'কোন একক থেকে রূপান্তর করবেন?' : 'Convert From:'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {LAND_ORDER.map(u => (
            <button key={u} onClick={() => setFromUnit(u)} style={{
              padding: '8px 4px', fontSize: 10, fontWeight: 700,
              background: fromUnit === u ? A_LAND : '#f8faff',
              color: fromUnit === u ? '#fff' : '#475569',
              border: `1.5px solid ${fromUnit === u ? A_LAND : '#e2e8f0'}`,
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
            }}>
              {bn ? LAND_UNITS[u].labelBn : LAND_UNITS[u].label.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {res && (
        <ResultCard accent={A_LAND}>
          <div style={{ fontSize: 12, fontWeight: 700, color: A_LAND, marginBottom: 10 }}>📐 {res.from} =</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {LAND_ORDER.filter(u => u !== fromUnit).map(u => (
              <div key={u} style={{ background: '#fff', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>
                  {bn ? LAND_UNITS[u].labelBn : LAND_UNITS[u].label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: A_LAND }}>{res.conversions[u]}</div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
      {result && 'error' in result && (
        <div style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>⚠️ {result.error}</div>
      )}

      <ActionRow
        onCalc={calc} onSave={() => {}} onShare={() => {
          if (res) shareWA(buildShare('🏞️', [
            `${res.from}`,
            `= ${res.conversions['decimal']} ${bn?'শতাংশ':'Decimal'}`,
            `= ${res.conversions['katha']} ${bn?'কাঠা':'Katha'}`,
            `= ${res.conversions['bigha']} ${bn?'বিঘা':'Bigha'}`,
            `= ${res.conversions['acre']} ${bn?'একর':'Acre'}`,
            `= ${res.conversions['sqft']} ${bn?'বর্গফুট':'sq ft'}`,
          ]));
        }}
        accent={A_LAND} saved={false} label={bn ? 'রূপান্তর করুন' : 'Convert'}
      />
      <HistoryPanel items={history} accent={A_LAND} onClear={() => onClear?.('bdland')} labels={{ history: bn?'ইতিহাস':'History', clear: bn?'মুছুন':'Clear' }} />
    </div>
  );
}

// ─── BD WEIGHT PRICE CALCULATOR ───────────────────────────────────────────────
// Simple: weight (kg/g/maund/seer) × rate per kg → total ৳
interface WeightUnit { label: string; labelBn: string; toKg: number; }
const WEIGHT_UNITS: Record<string, WeightUnit> = {
  kg:      { label: 'Kilogram (kg)',  labelBn: 'কেজি (kg)',   toKg: 1 },
  gram:    { label: 'Gram (g)',       labelBn: 'গ্রাম (g)',   toKg: 0.001 },
  maund:   { label: 'Maund (মণ)',     labelBn: 'মণ',          toKg: 37.3242 },
  seer:    { label: 'Seer (সের)',     labelBn: 'সের',         toKg: 0.9331 },
  powa:    { label: 'Powa (পোয়া)',   labelBn: 'পোয়া',       toKg: 0.2333 },
  chattak: { label: 'Chattak (ছটাক)',labelBn: 'ছটাক',        toKg: 0.05832 },
  pound:   { label: 'Pound (lb)',     labelBn: 'পাউন্ড (lb)', toKg: 0.453592 },
};
const WEIGHT_ORDER = ['kg','gram','maund','seer','powa','chattak','pound'];
const A_WEIGHT = '#7c3aed';

export function BdWeightCalc({ history, onAdd, onClear }: CalcProps) {
  const { lang } = useLang();
  const bn = lang === 'bn';

  const [weightVal, setWeightVal]   = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [rateVal, setRateVal]       = useState('');
  const [result, setResult] = useState<{
    totalTaka: string;
    weightKg: string;
    ratePerKg: string;
    displayWeight: string;
    displayUnit: string;
  } | { error: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');

  const calc = () => {
    const w = parseFloat(weightVal);
    const r = parseFloat(rateVal);
    if (!w || w <= 0 || !r || r <= 0) {
      setResult({ error: bn ? 'ওজন ও মূল্য/কেজি সঠিকভাবে দিন।' : 'Please enter weight and rate per kg.' });
      return;
    }
    const kg = w * WEIGHT_UNITS[weightUnit].toKg;
    const total = kg * r;
    const unitLabel = bn ? WEIGHT_UNITS[weightUnit].labelBn : WEIGHT_UNITS[weightUnit].label;
    setResult({
      totalTaka:    total.toFixed(2),
      weightKg:     kg.toFixed(4),
      ratePerKg:    r.toFixed(2),
      displayWeight: `${w} ${unitLabel}`,
      displayUnit:  unitLabel,
    });
    setSaved(false);
    onAdd('bdweight', `${w} ${weightUnit} × ৳${r}/kg = ৳${total.toFixed(2)}`);
  };

  const res = result && !('error' in result) ? result : null;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <InfoBanner
        text={bn
          ? 'ওজন ও মূল্য/কেজি দিন — মোট টাকা বের করুন। মণ, সের, পোয়া, ছটাক সব একক সাপোর্ট করে।'
          : 'Enter weight & price per kg → get total Taka. Supports Maund, Seer, Powa, Chattak, Gram, Pound.'}
        accent={A_WEIGHT}
      />

      {/* Weight input */}
      <FloatInput
        label={bn ? 'ওজন / পরিমাণ' : 'Weight / Quantity'}
        accent={A_WEIGHT} type="number" placeholder="1.03"
        value={weightVal}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeightVal(e.target.value)}
      />

      {/* Unit selector */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
          {bn ? 'ওজনের একক:' : 'Weight Unit:'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {WEIGHT_ORDER.map(u => (
            <button key={u} onClick={() => setWeightUnit(u)} style={{
              padding: '9px 4px', fontSize: 10, fontWeight: 700,
              background: weightUnit === u ? A_WEIGHT : '#f8faff',
              color: weightUnit === u ? '#fff' : '#475569',
              border: `1.5px solid ${weightUnit === u ? A_WEIGHT : '#e2e8f0'}`,
              borderRadius: 9, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
            }}>
              {bn ? WEIGHT_UNITS[u].labelBn : WEIGHT_UNITS[u].label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Rate input */}
      <FloatInput
        label={bn ? 'মূল্য / কেজি (৳)' : 'Rate per kg (৳)'}
        accent={A_WEIGHT} type="number" placeholder="120"
        value={rateVal}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRateVal(e.target.value)}
        hint={bn ? 'প্রতি কেজি দাম লিখুন' : 'Price per 1 kg in Taka'}
      />

      {res && (
        <div style={{ background: `${A_WEIGHT}10`, border: `2px solid ${A_WEIGHT}30`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
          {/* Big total */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4 }}>
              {bn ? 'মোট মূল্য' : 'Total Price'}
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: A_WEIGHT, fontFamily: 'monospace', letterSpacing: -1 }}>
              ৳ {res.totalTaka}
            </div>
          </div>
          {/* Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              [bn?'ওজন':'Weight',      res.displayWeight],
              [bn?'কেজিতে':'In kg',    res.weightKg + ' kg'],
              [bn?'মূল্য/কেজি':'Rate/kg', '৳' + res.ratePerKg],
            ].map(([l,v])=>(
              <div key={l} style={{ background: '#fff', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: A_WEIGHT, wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Formula line */}
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: '#64748b' }}>
            {res.weightKg} kg × ৳{res.ratePerKg} = <strong style={{ color: A_WEIGHT }}>৳{res.totalTaka}</strong>
          </div>
        </div>
      )}
      {result && 'error' in result && (
        <div style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>⚠️ {result.error}</div>
      )}

      <ActionRow
        onCalc={calc}
        onSave={() => { if (res) { setSaved(true); setToast(bn ? 'সংরক্ষিত হয়েছে! ✅' : 'Saved! ✅'); } }}
        onShare={() => {
          if (res) shareWA(buildShare('⚖️', [
            `${res.displayWeight} × ৳${res.ratePerKg}/kg`,
            `= ৳${res.totalTaka}`,
          ]));
        }}
        accent={A_WEIGHT} saved={saved}
        label={bn ? 'হিসাব করুন' : 'Calculate'}
      />
      <HistoryPanel
        items={history} accent={A_WEIGHT}
        onClear={() => onClear?.('bdweight')}
        labels={{ history: bn?'ইতিহাস':'History', clear: bn?'মুছুন':'Clear' }}
      />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
