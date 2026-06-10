import { useState } from 'react';
import { FloatInput, ResultCard, StatGrid } from '../ui';
import CalcShell from '../CalcShell';
import { useLang } from '../../context/LangContext.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

const A = '#0ea5e9';

export default function EmiCalc({ history, onAdd, onClear }: any) {
  const { t, lang } = useLang(); const e = t.emi;
  const [loan,   setLoan]   = useState('');
  const [rate,   setRate]   = useState('');
  const [tenure, setTenure] = useState('');
  const [result, setResult] = useState<any>(null);

  const calc = () => {
    const L = parseFloat(loan), r = parseFloat(rate) / 12 / 100, n = parseFloat(tenure) * 12;
    if (!L || !r || !n) { setResult({ error: t.fillFields }); return; }
    const emi = (L * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n, interest = total - L;
    setResult({ emi: emi.toFixed(2), total: total.toFixed(2), interest: interest.toFixed(2) });
    onAdd('emi', `${L} @ ${rate}% / ${tenure}yr -> EMI ${emi.toFixed(2)}`);
  };

  const pPct  = result && !result.error ? Math.round(parseFloat(loan) / parseFloat(result.total) * 100) : 0;
  const share = result && !result.error ? buildShare('EMI', [`${e.loanAmount}: ${loan}`, `${e.annualRate}: ${rate}%`, `${e.monthlyEmi}: ${result.emi}`, `${e.totalPayment}: ${result.total}`, `${e.totalInterest}: ${result.interest}`]) : null;

  return (
    <CalcShell
      accent={A}
      onCalc={calc}
      calcLabel={t.calculate}
      hasResult={!!(result && !result.error)}
      onShare={() => share && shareWA(share)}
      history={history}
      onClear={() => onClear?.('emi')}
      historyLabel={t.history}
      clearLabel={t.clearHistory}
    >
      <FloatInput label={e.loanAmount} accent={A} type="number" placeholder="500000" value={loan}   onChange={(e: any) => setLoan(e.target.value)} />
      <FloatInput label={e.annualRate} accent={A} type="number" placeholder="9.5"    value={rate}   onChange={(e: any) => setRate(e.target.value)} />
      <FloatInput label={e.tenureYears} accent={A} type="number" placeholder="10"   value={tenure} onChange={(e: any) => setTenure(e.target.value)} />

      {result && !result.error && (
        <ResultCard accent={A}>
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#6b6780', fontWeight: 600, marginBottom: 4 }}>{e.monthlyEmi}</div>
            <div style={{ fontSize: 'clamp(30px,7vw,40px)', fontWeight: 900, color: A, lineHeight: 1.2, wordBreak: 'break-word' }}>
              {result.emi}
            </div>
          </div>
          <StatGrid items={[
            [e.principal,     loan,           A],
            [e.totalInterest, result.interest, '#ef4444'],
            [e.totalPayment,  result.total,    '#10b981'],
          ]} cols={3} />
          <div style={{ marginTop: 10, background: '#222', borderRadius: 8, height: 10, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: pPct + '%', background: A, borderRadius: '8px 0 0 8px' }} />
            <div style={{ flex: 1, background: '#7f1d1d' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6b6780', marginTop: 4 }}>
            <span>{e.principal} {pPct}%</span><span>{e.totalInterest} {100 - pPct}%</span>
          </div>
        </ResultCard>
      )}
      {result?.error && <div style={{ color: '#ef4444', fontSize: 14, marginTop: 10, fontWeight: 600 }}>{result.error}</div>}
    </CalcShell>
  );
}