import { useState } from 'react';
import { FaMoneyBillWave, FaPercent, FaCalendarAlt } from 'react-icons/fa';
import { FloatInput, ActionRow, ResultCard, StatGrid, InfoBanner, HistoryPanel, Toast } from '../ui';
import { useLang } from '../../context/LangContext';
import { shareWA, buildShare } from '../../utils/share';

const A = '#0ea5e9';
export default function EmiCalc({ history, onAdd, onClear }) {
  const { t } = useLang(); const e = t.emi;
  const [loan,setLoan]=useState(''); const [rate,setRate]=useState(''); const [tenure,setTenure]=useState('');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');

  const calc = () => {
    const L=parseFloat(loan),r=parseFloat(rate)/12/100,n=parseFloat(tenure)*12;
    if(!L||!r||!n){setResult({error:t.fillFields});return;}
    const emi=(L*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1);
    const total=emi*n, interest=total-L;
    setResult({emi:emi.toFixed(2),total:total.toFixed(2),interest:interest.toFixed(2)});
    setSaved(false); onAdd('emi',`৳${L}@${rate}%/${tenure}yr→EMI৳${emi.toFixed(2)}`);
  };
  const pPct = result&&!result.error ? Math.round(parseFloat(loan)/parseFloat(result.total)*100) : 0;
  const share = result&&!result.error ? buildShare('🏦',[`${e.loanAmount}: ৳${loan}`,`${e.annualRate}: ${rate}%`,`${e.monthlyEmi}: ৳${result.emi}`,`${e.totalPayment}: ৳${result.total}`,`${e.totalInterest}: ৳${result.interest}`]) : null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={e.info} accent={A}/>
      <FloatInput label={e.loanAmount} accent={A} type="number" placeholder="500000" value={loan} onChange={ev=>setLoan(ev.target.value)}/>
      <FloatInput label={e.annualRate} accent={A} type="number" placeholder="9.5" value={rate} onChange={ev=>setRate(ev.target.value)}/>
      <FloatInput label={e.tenureYears} accent={A} type="number" placeholder="10" value={tenure} onChange={ev=>setTenure(ev.target.value)}/>
      {result&&!result.error&&(
        <ResultCard accent={A}>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{fontSize:11,color:'#64748b',fontWeight:600,marginBottom:4}}>{e.monthlyEmi}</div>
            <div style={{fontSize:34,fontWeight:900,color:A,lineHeight:1.2,wordBreak:'break-word'}}>৳{result.emi}</div>
          </div>
          <StatGrid items={[[e.principal,`৳${loan}`,A],[e.totalInterest,`৳${result.interest}`,'#ef4444'],[e.totalPayment,`৳${result.total}`,'#10b981']]} cols={3}/>
          <div style={{marginTop:10,background:'#f1f5f9',borderRadius:8,height:10,overflow:'hidden',display:'flex'}}>
            <div style={{width:pPct+'%',background:A,borderRadius:'8px 0 0 8px'}}/>
            <div style={{flex:1,background:'#fca5a5'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8',marginTop:4}}>
            <span>{e.principal} {pPct}%</span><span>{e.totalInterest} {100-pPct}%</span>
          </div>
        </ResultCard>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A} onClear={()=>onClear&&onClear('emi')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
