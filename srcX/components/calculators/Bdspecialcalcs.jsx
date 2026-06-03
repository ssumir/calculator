import { useState } from 'react';
import { useLang } from '../../context/LangContext';
import { FloatInput, ActionRow, ResultCard, StatGrid, InfoBanner, HistoryPanel, Toast, ToggleGroup } from '../ui/index.jsx';
import { shareWA, buildShare } from '../../utils/share';

// ─── BANGLADESH LAND MEASUREMENT ─────────────────────────────────────────────
// Official BD Land units (based on official government standards)
// 1 Kani = 120 Shotangsho = 20 Katha = 1.65 Acres = 14400 sq ft
// 1 Bigha = 33 Shotangsho = 3 Katha = 0.33 Acres = 14400 sq yards = ...
// Actually: 1 Bigha (Dhaka) = 1600 sq yards = 14400 sq ft
// 1 Katha = 720 sq ft (standard BD)
// 1 Chattak = 45 sq ft
// 1 Shotangsho (decimal) = 435.6 sq ft
// 1 Aana = 1/16 Bigha

const LAND_UNITS = {
  sqft:       { label: 'Square Feet (sq ft)',       toSqft: 1 },
  sqm:        { label: 'Square Meter (sq m)',        toSqft: 10.7639 },
  sqyard:     { label: 'Square Yard (sq yd)',        toSqft: 9 },
  sqin:       { label: 'Square Inch (sq in)',        toSqft: 1/144 },
  decimal:    { label: 'Decimal / Shotangsho (শতাংশ)', toSqft: 435.6 },
  katha:      { label: 'Katha (কাঠা)',               toSqft: 720 },
  bigha:      { label: 'Bigha (বিঘা)',               toSqft: 14400 },
  kani:       { label: 'Kani (কানি)',                toSqft: 43560 },
  chattak:    { label: 'Chattak (ছটাক)',             toSqft: 45 },
  aana:       { label: 'Aana (আনা)',                 toSqft: 900 },
  ganda:      { label: 'Ganda (গণ্ডা)',              toSqft: 3600 },
  acre:       { label: 'Acre (একর)',                 toSqft: 43560 },
  hectare:    { label: 'Hectare (হেক্টর)',           toSqft: 107639.1 },
};

const LAND_ORDER = ['sqft','sqm','sqyard','decimal','katha','chattak','aana','ganda','bigha','kani','acre','hectare','sqin'];

const A_LAND = '#16a34a';

export function BdLandCalc({ history, onAdd, onClear }) {
  const { lang } = useLang();
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('katha');
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState('');

  const calc = () => {
    const v = parseFloat(value);
    if (!v || v <= 0) { setResult({ error: 'Please enter a valid value.' }); return; }
    const sqft = v * LAND_UNITS[fromUnit].toSqft;
    const conversions = {};
    LAND_ORDER.forEach(u => {
      conversions[u] = parseFloat((sqft / LAND_UNITS[u].toSqft).toFixed(6));
    });
    setResult({ sqft, conversions, from: `${v} ${LAND_UNITS[fromUnit].label}` });
    onAdd('bdland', `${v} ${fromUnit} = ${conversions.katha} katha = ${conversions.bigha} bigha`);
  };

  const mainResults = result && !result.error
    ? ['decimal', 'katha', 'bigha', 'kani', 'acre', 'sqft', 'sqm', 'sqyard', 'chattak', 'aana', 'ganda', 'hectare']
    : [];

  const share = result && !result.error
    ? buildShare('🏞️', [
        `From: ${result.from}`,
        `= ${result.conversions.decimal} Decimal`,
        `= ${result.conversions.katha} Katha`,
        `= ${result.conversions.bigha} Bigha`,
        `= ${result.conversions.acre} Acre`,
        `= ${result.conversions.sqft} sq ft`,
      ])
    : null;

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <InfoBanner
        text={lang === 'bn'
          ? 'বাংলাদেশের সরকারি ভূমি পরিমাপের এককে রূপান্তর করুন। কাঠা, বিঘা, কানি, ছটাক, আনা, গণ্ডা।'
          : 'Convert between all official Bangladesh land measurement units: Katha, Bigha, Kani, Chattak, Aana, Ganda, Decimal.'}
        accent={A_LAND}
      />

      {/* Quick reference table */}
      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: A_LAND, marginBottom: 8 }}>
          {lang === 'bn' ? '📋 বাংলাদেশ ভূমি পরিমাপ — মানদণ্ড' : '📋 BD Land Measurement Standard'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontSize: 11, color: '#166534' }}>
          {[
            ['1 Bigha', '3 Katha'],
            ['1 Katha', '20 Chattak'],
            ['1 Chattak', '45 sq ft'],
            ['1 Katha', '720 sq ft'],
            ['1 Bigha', '14,400 sq ft'],
            ['1 Decimal', '435.6 sq ft'],
            ['1 Bigha', '33 Decimal'],
            ['1 Kani', '40 Shotangsho'],
            ['1 Aana', '1/16 Bigha'],
            ['1 Ganda', '4 Aana'],
          ].map(([a, b], i) => (
            <div key={i} style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontWeight: 700, color: A_LAND }}>{a}</span>
              <span>=</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <FloatInput
        label={lang === 'bn' ? 'পরিমাণ / মান' : 'Value / Amount'}
        accent={A_LAND} type="number" placeholder="1"
        value={value} onChange={e => setValue(e.target.value)}
      />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
          {lang === 'bn' ? 'কোন একক থেকে রূপান্তর করবেন?' : 'Convert From:'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {LAND_ORDER.map(u => (
            <button key={u} onClick={() => setFromUnit(u)} style={{
              padding: '8px 4px', fontSize: 10, fontWeight: 700,
              background: fromUnit === u ? A_LAND : '#f8faff',
              color: fromUnit === u ? '#fff' : '#475569',
              border: `1.5px solid ${fromUnit === u ? A_LAND : '#e2e8f0'}`,
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'center', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {LAND_UNITS[u].label.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {result && !result.error && (
        <ResultCard accent={A_LAND}>
          <div style={{ fontSize: 12, fontWeight: 700, color: A_LAND, marginBottom: 10 }}>
            📐 {result.from} =
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {mainResults.map(u => (
              u !== fromUnit && (
                <div key={u} style={{ background: '#fff', borderRadius: 10, padding: '10px 8px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {LAND_UNITS[u].label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: A_LAND, wordBreak: 'break-all' }}>
                    {result.conversions[u]}
                  </div>
                </div>
              )
            ))}
          </div>
        </ResultCard>
      )}
      {result?.error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>⚠️ {result.error}</div>}

      <ActionRow
        onCalc={calc}
        onSave={() => {}}
        onShare={() => { if (share) shareWA(share); }}
        accent={A_LAND} saved={false} label={lang === 'bn' ? 'রূপান্তর করুন' : 'Convert'}
      />
      <HistoryPanel items={history} accent={A_LAND} onClear={() => onClear && onClear('bdland')} labels={{ history: 'History', clear: 'Clear' }} />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}

// ─── BANGLADESH WEIGHT SCALE ──────────────────────────────────────────────────
// BD traditional + modern weight units
// 1 Maund (মণ) = 40 Seers = 37.3242 kg
// 1 Seer (সের) = 16 Chattaks = 933.1 g = 0.9331 kg
// 1 Chattak (ছটাক) = 5 Tolas = 58.32 g
// 1 Tola (তোলা) = 11.664 g (gold/silver standard)
// 1 Anna (আনা) = 1/16 Tola = 0.729 g
// 1 Ratti (রতি) = 1/8 Anna = 0.0911 g (gem weight)
// 1 Powa (পোয়া) = 1/4 Seer = 233.3 g
// 1 Adha Seer (আধা সের) = 466.5 g

const WEIGHT_UNITS = {
  kg:      { label: 'Kilogram (কেজি)',         toGram: 1000 },
  gram:    { label: 'Gram (গ্রাম)',            toGram: 1 },
  mg:      { label: 'Milligram (মিলিগ্রাম)',   toGram: 0.001 },
  pound:   { label: 'Pound (পাউন্ড)',          toGram: 453.592 },
  ounce:   { label: 'Ounce (আউন্স)',           toGram: 28.3495 },
  maund:   { label: 'Maund (মণ)',              toGram: 37324.2 },
  seer:    { label: 'Seer (সের)',              toGram: 933.105 },
  powa:    { label: 'Powa (পোয়া)',            toGram: 233.276 },
  chattak: { label: 'Chattak (ছটাক)',          toGram: 58.32 },
  tola:    { label: 'Tola (তোলা)',             toGram: 11.664 },
  anna:    { label: 'Anna (আনা)',              toGram: 0.729 },
  ratti:   { label: 'Ratti (রতি)',            toGram: 0.0911 },
  quintal: { label: 'Quintal (কুইন্টাল)',      toGram: 100000 },
  ton:     { label: 'Metric Ton (মেট্রিক টন)', toGram: 1000000 },
};

const WEIGHT_ORDER = ['gram','kg','maund','seer','powa','chattak','tola','anna','ratti','pound','ounce','quintal','ton','mg'];

const A_WEIGHT = '#7c3aed';

export function BdWeightCalc({ history, onAdd, onClear }) {
  const { lang } = useLang();
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('seer');
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState('');

  const calc = () => {
    const v = parseFloat(value);
    if (!v || v <= 0) { setResult({ error: 'Please enter a valid value.' }); return; }
    const gram = v * WEIGHT_UNITS[fromUnit].toGram;
    const conversions = {};
    WEIGHT_ORDER.forEach(u => {
      conversions[u] = parseFloat((gram / WEIGHT_UNITS[u].toGram).toFixed(8));
    });
    setResult({ gram, conversions, from: `${v} ${WEIGHT_UNITS[fromUnit].label}` });
    onAdd('bdweight', `${v} ${fromUnit} = ${conversions.kg} kg = ${conversions.seer} seer`);
  };

  const share = result && !result.error
    ? buildShare('⚖️', [
        `From: ${result.from}`,
        `= ${result.conversions.gram} Gram`,
        `= ${result.conversions.kg} Kilogram`,
        `= ${result.conversions.seer} Seer`,
        `= ${result.conversions.maund} Maund`,
        `= ${result.conversions.pound} Pound`,
      ])
    : null;

  const mainResults = ['gram', 'kg', 'maund', 'seer', 'powa', 'chattak', 'tola', 'pound', 'ounce', 'ton', 'quintal', 'anna'];

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <InfoBanner
        text={lang === 'bn'
          ? 'বাংলাদেশের ঐতিহ্যবাহী ও আধুনিক ওজনের এককে রূপান্তর করুন। মণ, সের, পোয়া, ছটাক, তোলা।'
          : 'Convert between traditional Bangladesh & modern weight units: Maund, Seer, Powa, Chattak, Tola, Ratti, Anna.'}
        accent={A_WEIGHT}
      />

      {/* Quick reference */}
      <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: 12, padding: '12px 14px', marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: A_WEIGHT, marginBottom: 8 }}>
          {lang === 'bn' ? '📋 বাংলাদেশ ওজন মানদণ্ড' : '📋 Bangladesh Weight Standard'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px', fontSize: 11, color: '#4c1d95' }}>
          {[
            ['1 Maund (মণ)', '40 Seer'],
            ['1 Seer (সের)', '16 Chattak'],
            ['1 Chattak (ছটাক)', '5 Tola'],
            ['1 Seer', '933.1 grams'],
            ['1 Maund', '37.32 kg'],
            ['1 Powa (পোয়া)', '¼ Seer = 233 g'],
            ['1 Tola (তোলা)', '11.664 g'],
            ['1 Anna (আনা)', '1/16 Tola'],
            ['1 Ratti (রতি)', '1/8 Anna'],
            ['1 Quintal', '100 kg'],
          ].map(([a, b], i) => (
            <div key={i} style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontWeight: 700, color: A_WEIGHT }}>{a}</span>
              <span>=</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      <FloatInput
        label={lang === 'bn' ? 'পরিমাণ / মান' : 'Value / Amount'}
        accent={A_WEIGHT} type="number" placeholder="1"
        value={value} onChange={e => setValue(e.target.value)}
      />

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
          {lang === 'bn' ? 'কোন একক থেকে রূপান্তর করবেন?' : 'Convert From:'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {WEIGHT_ORDER.map(u => (
            <button key={u} onClick={() => setFromUnit(u)} style={{
              padding: '8px 4px', fontSize: 10, fontWeight: 700,
              background: fromUnit === u ? A_WEIGHT : '#f8faff',
              color: fromUnit === u ? '#fff' : '#475569',
              border: `1.5px solid ${fromUnit === u ? A_WEIGHT : '#e2e8f0'}`,
              borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'center', lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {WEIGHT_UNITS[u].label.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {result && !result.error && (
        <ResultCard accent={A_WEIGHT}>
          <div style={{ fontSize: 12, fontWeight: 700, color: A_WEIGHT, marginBottom: 10 }}>
            ⚖️ {result.from} =
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            {mainResults.map(u => (
              u !== fromUnit && (
                <div key={u} style={{ background: '#fff', borderRadius: 10, padding: '10px 8px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {WEIGHT_UNITS[u].label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: A_WEIGHT, wordBreak: 'break-all' }}>
                    {result.conversions[u]}
                  </div>
                </div>
              )
            ))}
          </div>
        </ResultCard>
      )}
      {result?.error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>⚠️ {result.error}</div>}

      <ActionRow
        onCalc={calc}
        onSave={() => {}}
        onShare={() => { if (share) shareWA(share); }}
        accent={A_WEIGHT} saved={false} label={lang === 'bn' ? 'রূপান্তর করুন' : 'Convert'}
      />
      <HistoryPanel items={history} accent={A_WEIGHT} onClear={() => onClear && onClear('bdweight')} labels={{ history: 'History', clear: 'Clear' }} />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}