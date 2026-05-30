import { useState } from 'react';
import { useLang } from '../../context/LangContext';
import { FloatInput, ToggleGroup, ActionRow, InfoBanner, HistoryPanel, Toast } from '../ui/index.jsx';
import { shareWA, buildShare } from '../../utils/share';

const A = '#f97316';

// ─── PATTERN CALCULATION HELPERS ─────────────────────────────────────────────
function calcShirtPattern(measurements, gender) {
  const {
    chest = 0, waist = 0, hip = 0, shoulder = 0,
    sleeve = 0, height = 0, neck = 0, armhole = 0
  } = measurements;

  const C = parseFloat(chest) || 0;
  const W = parseFloat(waist) || (C - 4);
  const S = parseFloat(shoulder) || (C / 2 - 2);
  const SL = parseFloat(sleeve) || 24;
  const H = parseFloat(height) || 66;
  const N = parseFloat(neck) || 15;
  const AH = parseFloat(armhole) || (C / 4 + 1);

  // Ease allowances
  const chestEase = gender === 'male' ? 4 : 2;
  const waistEase = gender === 'male' ? 2 : 1;

  const finishedChest = C + chestEase;
  const finishedWaist = W + waistEase;
  const shirtLength = gender === 'male' ? (H * 0.43) : (H * 0.38);

  return {
    // Front pattern pieces
    front: {
      width: (finishedChest / 4 + 0.5).toFixed(1),
      length: shirtLength.toFixed(1),
      shoulderSlope: '0.75',
      neckWidth: (N / 5 + 0.5).toFixed(1),
      neckDepth: (N / 5 + 1).toFixed(1),
      armholeDepth: AH.toFixed(1),
      dartWidth: gender === 'female' ? ((C - W) / 4).toFixed(1) : null,
      dartLength: gender === 'female' ? '4.5' : null,
    },
    // Back pattern pieces
    back: {
      width: (finishedChest / 4).toFixed(1),
      length: shirtLength.toFixed(1),
      shoulderSlope: '0.5',
      neckWidth: (N / 5).toFixed(1),
      neckDepth: '0.75',
      armholeDepth: AH.toFixed(1),
    },
    // Sleeve
    sleeve: {
      length: SL.toFixed(1),
      capHeight: (AH - 1).toFixed(1),
      cuffWidth: (N + 2).toFixed(1),
      bicepWidth: (C / 4 + 2).toFixed(1),
    },
    // Collar
    collar: {
      length: (N + 1).toFixed(1),
      stand: '1.25',
      fall: '1.5',
    },
    // Fabric requirements
    fabric: {
      main: (shirtLength * 2 + SL + 10).toFixed(0) + ' inches',
      mainCm: ((shirtLength * 2 + SL + 10) * 2.54).toFixed(0) + ' cm',
    },
    finishedChest: finishedChest.toFixed(1),
    finishedWaist: finishedWaist.toFixed(1),
    shirtLength: shirtLength.toFixed(1),
  };
}

function calcPantPattern(measurements, gender) {
  const {
    waist = 0, hip = 0, inseam = 0, outseam = 0, thigh = 0, rise = 0
  } = measurements;

  const W = parseFloat(waist) || 32;
  const H = parseFloat(hip) || (W + 10);
  const IS = parseFloat(inseam) || 30;
  const OS = parseFloat(outseam) || 41;
  const T = parseFloat(thigh) || (H / 2 + 2);
  const R = parseFloat(rise) || (OS - IS);

  const waistEase = 1;
  const hipEase = 2;
  const finishedWaist = W + waistEase;
  const finishedHip = H + hipEase;
  const crotchDepth = R - 1;
  const frontRise = crotchDepth * 0.55;
  const backRise = crotchDepth * 0.6;

  return {
    front: {
      waistWidth: (finishedWaist / 4 + 0.5).toFixed(1),
      hipWidth: (finishedHip / 4 + 0.5).toFixed(1),
      rise: frontRise.toFixed(1),
      inseam: IS.toFixed(1),
      thighWidth: (T / 2 + 1).toFixed(1),
      crotchCurve: (H / 12).toFixed(1),
      kneeWidth: (T / 2 - 1).toFixed(1),
      hemWidth: gender === 'male' ? '8.5' : '7.5',
      darts: gender === 'female' ? { count: 1, width: '0.75', length: '3' } : null,
    },
    back: {
      waistWidth: (finishedWaist / 4 + 1).toFixed(1),
      hipWidth: (finishedHip / 4 + 1.5).toFixed(1),
      rise: backRise.toFixed(1),
      inseam: IS.toFixed(1),
      thighWidth: (T / 2 + 2).toFixed(1),
      crotchCurve: (H / 10).toFixed(1),
      kneeWidth: (T / 2).toFixed(1),
      hemWidth: gender === 'male' ? '9' : '8',
      darts: { count: 2, width: '0.75', length: '4' },
    },
    waistband: {
      length: (finishedWaist + 1.5).toFixed(1),
      width: '1.5',
    },
    pocket: {
      frontWidth: '6.5', frontDepth: '7',
      backWidth: '5.5', backDepth: '6',
    },
    fabric: {
      main: ((OS + 10) * 2).toFixed(0) + ' inches',
      mainCm: (((OS + 10) * 2) * 2.54).toFixed(0) + ' cm',
    },
    finishedWaist: finishedWaist.toFixed(1),
    finishedHip: finishedHip.toFixed(1),
    outseam: OS.toFixed(1),
  };
}

// ─── VISUAL PATTERN DIAGRAM ───────────────────────────────────────────────────
function PatternDiagram({ type, data, gender }) {
  if (!data) return null;
  if (type === 'shirt') return <ShirtDiagram data={data} gender={gender} />;
  if (type === 'pant') return <PantDiagram data={data} gender={gender} />;
  return null;
}

function ShirtDiagram({ data, gender }) {
  const { front, back, sleeve, collar } = data;
  const accent = A;
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: accent, marginBottom: 8 }}>📐 Pattern Pieces</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {/* Front piece */}
        <div style={{ background: '#fff7ed', border: `2px solid ${accent}`, borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: accent, marginBottom: 6 }}>FRONT PIECE</div>
          <svg viewBox="0 0 100 130" width="100%" style={{ display: 'block' }}>
            <path d={`M15,10 Q${50 - parseFloat(front.neckWidth)*2},10 ${50},${parseFloat(front.neckDepth) * 3 + 10}
              Q${50 + parseFloat(front.neckWidth)*2},10 85,10
              L92,${parseFloat(front.armholeDepth) * 4}
              Q80,${parseFloat(front.armholeDepth) * 4 + 10} 80,${parseFloat(front.armholeDepth) * 5}
              L78,120 L22,120 L20,${parseFloat(front.armholeDepth) * 5}
              Q20,${parseFloat(front.armholeDepth) * 4 + 10} 8,${parseFloat(front.armholeDepth) * 4}
              Z`}
              fill="#fff7ed" stroke={accent} strokeWidth="2" />
            {gender === 'female' && (
              <line x1="50" y1="50" x2="50" y2="95" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3,2" />
            )}
            <text x="50" y="70" textAnchor="middle" fontSize="7" fill={accent} fontWeight="700">FRONT</text>
            <text x="50" y="80" textAnchor="middle" fontSize="6" fill="#64748b">{front.width}" × {front.length}"</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Width:</b> {front.width}"<br/>
            <b>Length:</b> {front.length}"<br/>
            <b>Neck W:</b> {front.neckWidth}"<br/>
            <b>Neck D:</b> {front.neckDepth}"<br/>
            <b>Armhole:</b> {front.armholeDepth}"<br/>
            {front.dartWidth && <><b>Dart:</b> {front.dartWidth}" × {front.dartLength}"<br/></>}
          </div>
        </div>
        {/* Back piece */}
        <div style={{ background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', marginBottom: 6 }}>BACK PIECE</div>
          <svg viewBox="0 0 100 130" width="100%" style={{ display: 'block' }}>
            <path d="M15,10 Q50,18 85,10 L92,38 Q80,48 80,55 L78,120 L22,120 L20,55 Q20,48 8,38 Z"
              fill="#eff6ff" stroke="#3b82f6" strokeWidth="2" />
            <text x="50" y="70" textAnchor="middle" fontSize="7" fill="#3b82f6" fontWeight="700">BACK</text>
            <text x="50" y="80" textAnchor="middle" fontSize="6" fill="#64748b">{back.width}" × {back.length}"</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Width:</b> {back.width}"<br/>
            <b>Length:</b> {back.length}"<br/>
            <b>Neck W:</b> {back.neckWidth}"<br/>
            <b>Shoulder slope:</b> {back.shoulderSlope}"<br/>
          </div>
        </div>
        {/* Sleeve */}
        <div style={{ background: '#f0fdf4', border: '2px solid #10b981', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981', marginBottom: 6 }}>SLEEVE (×2)</div>
          <svg viewBox="0 0 100 120" width="100%" style={{ display: 'block' }}>
            <path d="M50,5 Q80,25 88,55 L75,110 L25,110 L12,55 Q20,25 50,5 Z"
              fill="#f0fdf4" stroke="#10b981" strokeWidth="2" />
            <text x="50" y="65" textAnchor="middle" fontSize="7" fill="#10b981" fontWeight="700">SLEEVE</text>
            <text x="50" y="75" textAnchor="middle" fontSize="6" fill="#64748b">{sleeve.bicepWidth}" × {sleeve.length}"</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Length:</b> {sleeve.length}"<br/>
            <b>Cap height:</b> {sleeve.capHeight}"<br/>
            <b>Bicep width:</b> {sleeve.bicepWidth}"<br/>
            <b>Cuff width:</b> {sleeve.cuffWidth}"<br/>
          </div>
        </div>
        {/* Collar */}
        <div style={{ background: '#fdf4ff', border: '2px solid #a21caf', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#a21caf', marginBottom: 6 }}>COLLAR</div>
          <svg viewBox="0 0 100 60" width="100%" style={{ display: 'block' }}>
            <rect x="5" y="15" width="90" height="20" rx="4" fill="#fdf4ff" stroke="#a21caf" strokeWidth="2" />
            <line x1="5" y1="25" x2="95" y2="25" stroke="#a21caf" strokeWidth="1" strokeDasharray="3,2" />
            <text x="50" y="30" textAnchor="middle" fontSize="7" fill="#a21caf" fontWeight="700">COLLAR</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Length:</b> {collar.length}"<br/>
            <b>Stand:</b> {collar.stand}"<br/>
            <b>Fall:</b> {collar.fall}"<br/>
          </div>
        </div>
      </div>
      {/* Seam allowance note */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#92400e' }}>
        ⚠️ <b>Seam allowance NOT included.</b> Add 0.5" (1.3 cm) on all edges. Hemline: add 1" (2.5 cm).
      </div>
    </div>
  );
}

function PantDiagram({ data, gender }) {
  const { front, back, waistband, pocket } = data;
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', marginBottom: 8 }}>📐 Pattern Pieces</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {/* Front pant */}
        <div style={{ background: '#f5f3ff', border: '2px solid #8b5cf6', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', marginBottom: 6 }}>FRONT LEG (×2)</div>
          <svg viewBox="0 0 80 140" width="100%" style={{ display: 'block' }}>
            <path d="M10,5 L70,5 Q75,25 72,45 L65,135 L40,135 L38,80 L35,135 L15,135 L8,45 Q5,25 10,5 Z"
              fill="#f5f3ff" stroke="#8b5cf6" strokeWidth="2" />
            {front.darts && (
              <line x1="40" y1="5" x2="40" y2="30" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3,2" />
            )}
            <text x="40" y="70" textAnchor="middle" fontSize="7" fill="#8b5cf6" fontWeight="700">FRONT</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Waist:</b> {front.waistWidth}"<br/>
            <b>Hip:</b> {front.hipWidth}"<br/>
            <b>Rise:</b> {front.rise}"<br/>
            <b>Thigh:</b> {front.thighWidth}"<br/>
            <b>Knee:</b> {front.kneeWidth}"<br/>
            <b>Hem:</b> {front.hemWidth}"<br/>
            {front.darts && <><b>Dart:</b> {front.darts.count}×{front.darts.width}"<br/></>}
          </div>
        </div>
        {/* Back pant */}
        <div style={{ background: '#f0f9ff', border: '2px solid #0ea5e9', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0ea5e9', marginBottom: 6 }}>BACK LEG (×2)</div>
          <svg viewBox="0 0 80 140" width="100%" style={{ display: 'block' }}>
            <path d="M5,5 L75,5 Q82,28 78,50 L68,135 L43,135 L40,80 L37,135 L12,135 L2,50 Q-2,28 5,5 Z"
              fill="#f0f9ff" stroke="#0ea5e9" strokeWidth="2" />
            <line x1="30" y1="5" x2="30" y2="32" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
            <line x1="50" y1="5" x2="50" y2="32" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="40" y="70" textAnchor="middle" fontSize="7" fill="#0ea5e9" fontWeight="700">BACK</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Waist:</b> {back.waistWidth}"<br/>
            <b>Hip:</b> {back.hipWidth}"<br/>
            <b>Rise:</b> {back.rise}"<br/>
            <b>Thigh:</b> {back.thighWidth}"<br/>
            <b>Crotch curve:</b> {back.crotchCurve}"<br/>
            <b>Darts:</b> {back.darts.count}×{back.darts.width}" (L:{back.darts.length}")<br/>
          </div>
        </div>
        {/* Waistband */}
        <div style={{ background: '#ecfdf5', border: '2px solid #10b981', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981', marginBottom: 6 }}>WAISTBAND</div>
          <svg viewBox="0 0 100 40" width="100%" style={{ display: 'block' }}>
            <rect x="5" y="8" width="90" height="24" rx="4" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
            <line x1="5" y1="20" x2="95" y2="20" stroke="#10b981" strokeWidth="1" strokeDasharray="4,3" />
            <text x="50" y="24" textAnchor="middle" fontSize="7" fill="#10b981" fontWeight="700">WAISTBAND</text>
          </svg>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Length:</b> {waistband.length}"<br/>
            <b>Width:</b> {waistband.width}" (folded)
          </div>
        </div>
        {/* Pocket */}
        <div style={{ background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: 10, padding: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f59e0b', marginBottom: 6 }}>POCKETS</div>
          <div style={{ fontSize: 10, color: '#64748b', lineHeight: 1.7 }}>
            <b>Front pocket:</b><br/>
            {pocket.frontWidth}" × {pocket.frontDepth}"<br/><br/>
            <b>Back pocket:</b><br/>
            {pocket.backWidth}" × {pocket.backDepth}"
          </div>
        </div>
      </div>
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 12px', fontSize: 11, color: '#92400e' }}>
        ⚠️ <b>Seam allowance NOT included.</b> Add 0.5" on all edges, 1" on hem, 1" on waistband top.
      </div>
    </div>
  );
}

// ─── SHIRT TAB ────────────────────────────────────────────────────────────────
function ShirtTab({ history, onAdd, onClear, lang, t }) {
  const [gender, setGender] = useState('male');
  const [m, setM] = useState({ chest: '', shoulder: '', sleeve: '', neck: '', waist: '', height: '', armhole: '' });
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');

  const set = (k, v) => setM(prev => ({ ...prev, [k]: v }));

  const calc = () => {
    if (!m.chest) { setResult({ error: t.fillFields }); return; }
    const data = calcShirtPattern(m, gender);
    setResult(data);
    setSaved(false);
    onAdd('garments', `Shirt|${gender}|Chest:${m.chest}" → Finished:${data.finishedChest}"`);
  };

  const fields = [
    ['chest', '* Chest (inches)', '38', '* Required'],
    ['shoulder', 'Shoulder Width (inches)', '17', ''],
    ['sleeve', 'Sleeve Length (inches)', '25', ''],
    ['neck', 'Neck Circumference (inches)', '15', ''],
    ['waist', 'Waist (inches)', '34', ''],
    ['height', 'Height (inches)', '66', '5\'6" = 66'],
    ['armhole', 'Armhole Depth (inches)', '10', 'Optional override'],
  ];

  return (
    <div style={{ width: '100%' }}>
      <InfoBanner text={lang === 'bn' ? 'মাপ দিন এবং শার্টের প্যাটার্ন পান। সেলাই ভাতা যোগ করুন।' : 'Enter measurements to get shirt pattern pieces with all dimensions.'} accent={A} />
      <ToggleGroup options={[['male', '👨 Male'], ['female', '👩 Female']]} value={gender} onChange={setGender} accent={A} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
        {fields.map(([key, label, ph, hint]) => (
          <FloatInput key={key} label={label} accent={A} type="number" placeholder={ph}
            value={m[key]} onChange={e => set(key, e.target.value)} hint={hint || undefined} />
        ))}
      </div>
      {result && !result.error && (
        <div style={{ marginTop: 16, width: '100%' }}>
          {/* Summary */}
          <div style={{ background: `${A}10`, border: `1.5px solid ${A}28`, borderRadius: 14, padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: A, marginBottom: 10 }}>📏 Finished Measurements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                ['Chest', result.finishedChest + '"'],
                ['Waist', result.finishedWaist + '"'],
                ['Length', result.shirtLength + '"'],
                ['Fabric needed', '', 'full'],
                [result.fabric.main, result.fabric.mainCm, 'full'],
              ].filter(x => x[2] !== 'full').map(([l, v], i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: A }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, background: '#fff', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Fabric Required</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: A }}>{result.fabric.main} = {result.fabric.mainCm}</div>
            </div>
          </div>
          <PatternDiagram type="shirt" data={result} gender={gender} />
        </div>
      )}
      {result?.error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>⚠️ {result.error}</div>}
      <ActionRow
        onCalc={calc}
        onSave={() => { if (result && !result.error) { setSaved(true); setToast('Saved! ✅'); } }}
        onShare={() => { if (result && !result.error) shareWA(buildShare('👕', [`Shirt Pattern | ${gender}`, `Chest: ${m.chest}"`, `Finished Chest: ${result.finishedChest}"`])); }}
        accent={A} saved={saved} label="Calculate Pattern"
      />
      <HistoryPanel items={history} accent={A} onClear={() => onClear && onClear('garments')} labels={{ history: 'History', clear: 'Clear' }} />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}

// ─── PANT TAB ─────────────────────────────────────────────────────────────────
function PantTab({ history, onAdd, onClear, lang, t }) {
  const [gender, setGender] = useState('male');
  const [m, setM] = useState({ waist: '', hip: '', inseam: '', outseam: '', thigh: '', rise: '' });
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');

  const set = (k, v) => setM(prev => ({ ...prev, [k]: v }));

  const calc = () => {
    if (!m.waist) { setResult({ error: t.fillFields }); return; }
    const data = calcPantPattern(m, gender);
    setResult(data);
    setSaved(false);
    onAdd('garments', `Pant|${gender}|Waist:${m.waist}" → Finished:${data.finishedWaist}"`);
  };

  const fields = [
    ['waist', '* Waist (inches)', '32', '* Required'],
    ['hip', 'Hip / Seat (inches)', '40', ''],
    ['inseam', 'Inseam Length (inches)', '30', 'Crotch to ankle'],
    ['outseam', 'Outseam Length (inches)', '41', 'Waist to ankle'],
    ['thigh', 'Thigh Circumference (inches)', '22', ''],
    ['rise', 'Rise (inches)', '11', 'Waist to crotch'],
  ];

  return (
    <div style={{ width: '100%' }}>
      <InfoBanner text="Enter measurements to get pant/trouser pattern pieces for tailoring." accent="#8b5cf6" />
      <ToggleGroup options={[['male', '👨 Male'], ['female', '👩 Female']]} value={gender} onChange={setGender} accent="#8b5cf6" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 10px' }}>
        {fields.map(([key, label, ph, hint]) => (
          <FloatInput key={key} label={label} accent="#8b5cf6" type="number" placeholder={ph}
            value={m[key]} onChange={e => set(key, e.target.value)} hint={hint || undefined} />
        ))}
      </div>
      {result && !result.error && (
        <div style={{ marginTop: 16, width: '100%' }}>
          <div style={{ background: '#f5f3ff', border: '1.5px solid #8b5cf628', borderRadius: 14, padding: '14px', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6', marginBottom: 10 }}>📏 Finished Measurements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[['Waist', result.finishedWaist + '"'], ['Hip', result.finishedHip + '"'], ['Length', result.outseam + '"']].map(([l, v], i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#8b5cf6' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, background: '#fff', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>Fabric Required</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#8b5cf6' }}>{result.fabric.main} = {result.fabric.mainCm}</div>
            </div>
          </div>
          <PatternDiagram type="pant" data={result} gender={gender} />
        </div>
      )}
      {result?.error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 10, fontWeight: 600 }}>⚠️ {result.error}</div>}
      <ActionRow
        onCalc={calc}
        onSave={() => { if (result && !result.error) { setSaved(true); setToast('Saved! ✅'); } }}
        onShare={() => { if (result && !result.error) shareWA(buildShare('👖', [`Pant Pattern | ${gender}`, `Waist: ${m.waist}"`, `Hip: ${m.hip || 'auto'}"`])); }}
        accent="#8b5cf6" saved={saved} label="Calculate Pattern"
      />
      <HistoryPanel items={history} accent="#8b5cf6" onClear={() => onClear && onClear('garments')} labels={{ history: 'History', clear: 'Clear' }} />
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function GarmentsPattern({ history, onAdd, onClear }) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState('shirt');

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {[['shirt', '👔 Shirt / Top'], ['pant', '👖 Pant / Trouser']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flex: 1, padding: '11px 6px',
            background: tab === id ? '#fff' : 'transparent',
            color: tab === id ? (id === 'shirt' ? A : '#8b5cf6') : '#64748b',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
            boxShadow: tab === id ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.18s', minWidth: 0,
          }}>{label}</button>
        ))}
      </div>

      {tab === 'shirt'
        ? <ShirtTab history={history} onAdd={onAdd} onClear={onClear} lang={lang} t={t} />
        : <PantTab history={history} onAdd={onAdd} onClear={onClear} lang={lang} t={t} />
      }
    </div>
  );
}