import { useState } from 'react';
import { FaAppleAlt,FaWalking,FaHospitalAlt,FaExclamationTriangle,FaFire,FaRunning,FaFlag,FaGlobeAsia,FaChartLine,FaArrowUp,FaArrowDown } from 'react-icons/fa';
import { FloatInput, FloatSelect, ToggleGroup, ActionRow, ResultCard, StatGrid, InfoBanner, HistoryPanel, PresetPills, Toast } from '../ui';
import { useLang } from '../../context/LangContext.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

// ─── BMI ────────────────────────────────────────────────────────────────────
const A_BMI = '#f59e0b';
const CATS=[{max:18.5,en:'Underweight',bn:'ওজন কম',c:'#38bdf8'},{max:25,en:'Normal',bn:'স্বাভাবিক',c:'#10b981'},{max:30,en:'Overweight',bn:'অতিরিক্ত ওজন',c:'#f97316'},{max:35,en:'Obesity I',bn:'স্থূলতা (১ম)',c:'#ef4444'},{max:40,en:'Obesity II',bn:'স্থূলতা (২য়)',c:'#dc2626'},{max:Infinity,en:'Severe Obesity',bn:'অতি গুরুতর',c:'#9f1239'}];
const OB_ADV=[{icon:FaAppleAlt,c:'#10b981',en:'Improve diet',bn:'খাদ্যাভ্যাস পরিবর্তন',en2:'Eat more vegetables and protein. Reduce sugar.',bn2:'শাকসবজি ও প্রোটিন বেশি খান। মিষ্টি কমান।'},{icon:FaWalking,c:'#0ea5e9',en:'Daily exercise',bn:'নিয়মিত হাঁটুন',en2:'Walk 30-45 minutes daily.',bn2:'প্রতিদিন ৩০-৪৫ মিনিট হাঁটুন।'},{icon:FaHospitalAlt,c:'#ef4444',en:'See a doctor',bn:'ডাক্তার দেখান',en2:'BMI over 30 needs medical guidance.',bn2:'BMI ৩০+ হলে ডাক্তার দেখান।'}];
const getCat = bmi => CATS.find(c=>bmi<c.max);
const H_REF=[['5\'0"','60'],['5\'2"','62'],['5\'4"','64'],['5\'6"','66'],['5\'8"','68'],['6\'0"','72']];

export function BmiCalc({ history, onAdd, onClear }) {
  const {t,lang}=useLang(); const b=t.bmi;
  const [weight,setWeight]=useState(''); const [height,setHeight]=useState('');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');

  const calc=()=>{
    const w=parseFloat(weight),hIn=parseFloat(height);
    if(!w||!hIn){setResult({error:t.fillFields});return;}
    const hCm=hIn*2.54,bmi=parseFloat((w/((hCm/100)**2)).toFixed(1));
    setResult({bmi,cat:getCat(bmi),hCm:hCm.toFixed(0)});
    setSaved(false); onAdd('bmi',`${w}kg,${hIn}in→BMI${bmi}`);
  };
  const pct=result&&!result.error?Math.min(Math.max(((result.bmi-10)/30)*100,0),100):0;
  const isObese=result&&!result.error&&result.bmi>=30;
  const share=result&&!result.error?buildShare('⚖️',[`${b.weight}: ${weight}kg`,`${b.height}: ${height}in (${result.hCm}cm)`,`BMI: ${result.bmi}`,lang==='bn'?result.cat.bn:result.cat.en]):null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={b.info} accent={A_BMI}/>
      <FloatInput label={b.weight} accent={A_BMI} type="number" placeholder="70" value={weight} onChange={e=>setWeight(e.target.value)}/>
      <FloatInput label={b.height} accent={A_BMI} type="number" placeholder="66" value={height} onChange={e=>setHeight(e.target.value)} hint={lang==='bn'?'ইঞ্চিতে। ৫ ফুট ৬ ইঞ্চি = ৬৬':'In inches. 5\'6" = 66'}/>
      <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'10px 14px',marginBottom:18}}>
        <div style={{fontSize:11,fontWeight:700,color:'#92400e',marginBottom:6}}>{b.heightRef}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'4px 12px'}}>
          {H_REF.map(([f,i])=>(<button key={i} onClick={()=>setHeight(i)} style={{background:'none',border:'none',color:A_BMI,fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',padding:'2px 0'}}>{f}={i}"</button>))}
        </div>
      </div>
      {result&&!result.error&&(
        <>
          <ResultCard accent={result.cat.c}>
            <div style={{textAlign:'center',marginBottom:14}}>
              <div style={{fontSize:52,fontWeight:900,color:result.cat.c,lineHeight:1}}>{result.bmi}</div>
              <div style={{fontSize:16,fontWeight:700,color:result.cat.c,marginTop:6}}>{lang==='bn'?result.cat.bn:result.cat.en}</div>
            </div>
            <div style={{background:'#f1f5f9',borderRadius:8,height:14,overflow:'hidden',position:'relative',display:'flex',marginBottom:6}}>
              {[['#38bdf8',25],['#10b981',18],['#f97316',14],['#ef4444',14],['#dc2626',14],['#9f1239',15]].map(([c,w],i)=>(
                <div key={i} style={{width:w+'%',background:c}}/>
              ))}
              <div style={{position:'absolute',top:'50%',left:`${pct}%`,transform:'translateX(-50%) translateY(-50%)',width:18,height:18,background:'#fff',border:`3px solid ${result.cat.c}`,borderRadius:'50%',boxShadow:'0 2px 8px rgba(0,0,0,0.15)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#94a3b8'}}><span>{'<'}18.5</span><span>18.5-25</span><span>25-30</span><span>30+</span></div>
          </ResultCard>
          {isObese&&(
            <div style={{marginTop:14,background:'#fff1f2',border:'2px solid #fecaca',borderRadius:16,padding:'14px',width:'100%',overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}><FaExclamationTriangle color='#ef4444' size={16}/><span style={{fontSize:14,fontWeight:700,color:'#9f1239'}}>{b.obesityTitle}</span></div>
              {OB_ADV.map((a2,i)=>(<div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',background:'#fff',borderRadius:10,padding:'10px 12px',marginBottom:8}}><a2.icon size={16} color={a2.c} style={{flexShrink:0,marginTop:2}}/><div style={{minWidth:0}}><div style={{fontSize:13,fontWeight:700,color:a2.c}}>{lang==='bn'?a2.bn:a2.en}</div><div style={{fontSize:12,color:'#64748b',marginTop:2,lineHeight:1.5,wordBreak:'break-word'}}>{lang==='bn'?a2.bn2:a2.en2}</div></div></div>))}
            </div>
          )}
        </>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A_BMI} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A_BMI} onClear={()=>onClear&&onClear('bmi')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}

// ─── CALORIE ────────────────────────────────────────────────────────────────
const A_CAL='#ef4444';
const ACTS=[{v:'1.2',bn:'😴 নিষ্ক্রিয়',en:'😴 Sedentary',d2:'প্রায় বসে থাকেন',d2e:'Little/no exercise'},{v:'1.375',bn:'🚶 হালকা',en:'🚶 Light',d2:'সপ্তাহে ১-৩ দিন',d2e:'1-3 days/week'},{v:'1.55',bn:'🏃 মাঝারি',en:'🏃 Moderate',d2:'সপ্তাহে ৩-৫ দিন',d2e:'3-5 days/week'},{v:'1.725',bn:'💪 বেশি',en:'💪 Active',d2:'সপ্তাহে ৬-৭ দিন',d2e:'6-7 days/week'},{v:'1.9',bn:'🔥 অতি সক্রিয়',en:'🔥 Very Active',d2:'কঠোর পরিশ্রম',d2e:'Hard daily training'}];
const CAL_ADV={low:{c:'#0ea5e9',bn:'ক্যালরি চাহিদা কম',en:'Low Calorie Needs',tips:[{bn:'বেশি পুষ্টিকর খাবার খান।',en:'Eat more nutritious foods.'},{bn:'সক্রিয় থাকুন।',en:'Stay more active.'}]},normal:{c:'#10b981',bn:'চাহিদা স্বাভাবিক',en:'Normal Calorie Needs',tips:[{bn:'ভারসাম্যপূর্ণ খাবার খান।',en:'Eat balanced meals.'},{bn:'নিয়মিত ব্যায়াম করুন।',en:'Exercise regularly.'}]},high:{c:'#f97316',bn:'ক্যালরি চাহিদা বেশি',en:'High Calorie Needs',tips:[{bn:'প্রোটিন বেশি খান।',en:'Eat more protein.'},{bn:'ব্যায়াম করুন।',en:'Exercise to burn calories.'}]}};

export function CalorieCalc({ history, onAdd, onClear }) {
  const {t,lang}=useLang(); const c=t.calorie;
  const [gender,setGender]=useState('male'); const [age,setAge]=useState(''); const [weight,setWeight]=useState(''); const [height,setHeight]=useState(''); const [act,setAct]=useState('1.55');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');
  const H_REF2=[['5\'0"','60'],['5\'2"','62'],['5\'4"','64'],['5\'6"','66'],['5\'8"','68'],['6\'0"','72']];

  const calc=()=>{
    const a=parseFloat(age),w=parseFloat(weight),hIn=parseFloat(height);
    if(!a||!w||!hIn){setResult({error:t.fillFields});return;}
    const h=hIn*2.54;
    let bmr=gender==='male'?88.362+13.397*w+4.799*h-5.677*a:447.593+9.247*w+3.098*h-4.330*a;
    const tdee=Math.round(bmr*parseFloat(act));
    const k=tdee<1600?'low':tdee<=2500?'normal':'high';
    setResult({tdee,bmr:Math.round(bmr),loss:Math.round(tdee-500),gain:Math.round(tdee+500),k});
    setSaved(false); onAdd('calorie',`${gender==='male'?'M':'F'},${a}yr,${w}kg,${hIn}in→${tdee}kcal`);
  };
  const adv=result&&!result.error?CAL_ADV[result.k]:null;
  const share=result&&!result.error?buildShare('🔥',[`${c.maintenance}: ${result.tdee}kcal`,`${c.lose}: ${result.loss}`,`${c.gain}: ${result.gain}`]):null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={c.info} accent={A_CAL}/>
      <ToggleGroup options={[['male',`👨 ${t.male}`],['female',`👩 ${t.female}`]]} value={gender} onChange={setGender} accent={A_CAL}/>
      <FloatInput label={c.age} accent={A_CAL} type="number" placeholder="25" value={age} onChange={e=>setAge(e.target.value)}/>
      <FloatInput label={c.weight} accent={A_CAL} type="number" placeholder="70" value={weight} onChange={e=>setWeight(e.target.value)}/>
      <FloatInput label={c.height} accent={A_CAL} type="number" placeholder="66" value={height} onChange={e=>setHeight(e.target.value)} hint={lang==='bn'?'ইঞ্চিতে। ৫\'৬\" = ৬৬':'In inches. 5\'6" = 66'}/>
      <div style={{background:'#fff1f2',border:'1px solid #fecaca',borderRadius:12,padding:'10px 14px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'#9f1239',marginBottom:6}}>{lang==='bn'?'উচ্চতা রূপান্তর':'Height Reference'}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'4px 12px'}}>{H_REF2.map(([f,i])=>(<button key={i} onClick={()=>setHeight(i)} style={{background:'none',border:'none',color:A_CAL,fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',padding:'2px 0'}}>{f}={i}"</button>))}</div>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:13,fontWeight:600,color:'#475569',marginBottom:8}}>{c.activity}</div>
        {ACTS.map(l=>(
          <button key={l.v} onClick={()=>setAct(l.v)} style={{width:'100%',padding:'11px 14px',textAlign:'left',marginBottom:8,background:act===l.v?`${A_CAL}08`:'#f8faff',border:`2px solid ${act===l.v?A_CAL:'#e2e8f0'}`,borderRadius:12,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',overflow:'hidden'}}>
            <span style={{fontSize:14,fontWeight:600,color:act===l.v?A_CAL:'#475569',flexShrink:0}}>{lang==='bn'?l.bn:l.en}</span>
            <span style={{fontSize:11,color:'#94a3b8',marginLeft:8,textAlign:'right'}}>{lang==='bn'?l.d2:l.d2e}</span>
          </button>
        ))}
      </div>
      {result&&!result.error&&(
        <>
          <ResultCard accent={A_CAL}>
            <div style={{textAlign:'center',marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'#64748b',marginBottom:4}}>{c.maintenance}</div>
              <div style={{fontSize:40,fontWeight:900,color:A_CAL,lineHeight:1.2}}>{result.tdee}</div>
              <div style={{fontSize:12,color:'#94a3b8'}}>kcal / {lang==='bn'?'দিন':'day'}</div>
            </div>
            <StatGrid items={[[c.lose,result.loss,'#0ea5e9'],[c.maintain,result.tdee,A_CAL],[c.gain,result.gain,'#10b981']]} cols={3}/>
          </ResultCard>
          {adv&&(
            <div style={{marginTop:14,background:`${adv.c}08`,border:`2px solid ${adv.c}22`,borderRadius:16,padding:'14px',width:'100%',overflow:'hidden'}}>
              <div style={{fontSize:14,fontWeight:700,color:adv.c,marginBottom:10}}>{lang==='bn'?adv.bn:adv.en}</div>
              {adv.tips.map((tip,i)=>(<div key={i} style={{background:'#fff',borderRadius:10,padding:'9px 12px',marginBottom:6,fontSize:13,color:'#475569',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>{lang==='bn'?tip.bn:tip.en}</div>))}
            </div>
          )}
        </>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A_CAL} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A_CAL} onClear={()=>onClear&&onClear('calorie')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}

// ─── VAT ────────────────────────────────────────────────────────────────────
const A_VAT='#8b5cf6';
const BD_RATES=[['15','সাধারণ / Standard 15%'],['10','হোটেল/রেস্তোরাঁ 10%'],['7.5','নির্মাণ 7.5%'],['5','কৃষি 5%'],['2','বিশেষ 2%'],['0','ভ্যাট মুক্ত 0%']];
const INTL=[['20','UK/Austria 20%'],['19','Germany 19%'],['18','Turkey/India 18%'],['10','Australia 10%'],['8','Switzerland 8%'],['7','Singapore 7%']];

export function VatCalc({ history, onAdd, onClear }) {
  const {t,lang}=useLang(); const v=t.vat;
  const [mode,setMode]=useState('bd'); const [calcMode,setCalcMode]=useState('add');
  const [amount,setAmount]=useState(''); const [rate,setRate]=useState('15');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');

  const calc=()=>{
    const a=parseFloat(amount),r=parseFloat(rate);
    if(!a||a<=0||r<0){setResult({error:t.fillFields});return;}
    let net,vat,gross;
    if(calcMode==='add'){net=a;vat=a*r/100;gross=a+vat;}
    else{gross=a;net=a/(1+r/100);vat=gross-net;}
    setResult({net:net.toFixed(2),vat:vat.toFixed(2),gross:gross.toFixed(2)});
    setSaved(false); onAdd('vat',`${mode==='bd'?'৳':'$'}${a}@${r}%→VAT${vat.toFixed(2)}`);
  };
  const cur=mode==='bd'?'৳':'$';
  const pct=result&&!result.error?Math.round(parseFloat(result.net)/parseFloat(result.gross)*100):0;
  const share=result&&!result.error?buildShare('🧾',[`${v.amount}: ${cur}${amount}`,`${v.rate}: ${rate}%`,`${v.netPrice}: ${cur}${result.net}`,`${v.vatAmount}: ${cur}${result.vat}`,`${v.grossPrice}: ${cur}${result.gross}`]):null;
  const presets=mode==='bd'?BD_RATES:INTL;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={v.info} accent={A_VAT}/>
      <ToggleGroup options={[['bd',`🇧🇩 ${v.bdMode}`],['intl',`🌍 ${v.intlMode}`]]} value={mode} onChange={nm=>{setMode(nm);setRate(nm==='bd'?'15':'20');setResult(null);}} accent={A_VAT}/>
      {mode==='bd'&&<div style={{background:'#f5f3ff',border:'1px solid #ddd6fe',borderRadius:10,padding:'9px 13px',marginBottom:14,fontSize:12,color:'#5b21b6',fontWeight:500}}>{v.bdInfo}</div>}
      <ToggleGroup options={[['add',`➕ ${v.addVat}`],['remove',`➖ ${v.removeVat}`]]} value={calcMode} onChange={setCalcMode} accent={A_VAT}/>
      <FloatInput label={`${v.amount} (${cur})`} accent={A_VAT} type="number" placeholder="1000" value={amount} onChange={e=>setAmount(e.target.value)}/>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:600,color:'#64748b',marginBottom:8}}>{v.rate}</div>
        <PresetPills options={presets} active={rate} onSelect={setRate} accent={A_VAT}/>
        <FloatInput label={lang==='bn'?'কাস্টম হার (%)':'Custom Rate (%)'} accent={A_VAT} type="number" placeholder="%" value={rate} onChange={e=>setRate(e.target.value)}/>
      </div>
      {result&&!result.error&&(
        <ResultCard accent={A_VAT}>
          <StatGrid items={[[v.netPrice,`${cur}${result.net}`,A_VAT],[v.vatAmount,`${cur}${result.vat}`,'#ef4444'],[v.grossPrice,`${cur}${result.gross}`,'#10b981']]} cols={3}/>
          <div style={{marginTop:10,background:'#f1f5f9',borderRadius:8,height:10,overflow:'hidden',display:'flex'}}>
            <div style={{width:pct+'%',background:A_VAT,borderRadius:'8px 0 0 8px'}}/><div style={{flex:1,background:'#fca5a5'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8',marginTop:4}}><span>{lang==='bn'?'নেট':'Net'} {pct}%</span><span>VAT {100-pct}%</span></div>
        </ResultCard>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A_VAT} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A_VAT} onClear={()=>onClear&&onClear('vat')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}

// ─── SMV ────────────────────────────────────────────────────────────────────
const A_SMV='#14b8a6';
export function SmvCalc({ history, onAdd, onClear }) {
  const {t,lang}=useLang(); const s=t.smv;
  const [shares,setShares]=useState(''); const [buy,setBuy]=useState(''); const [cur2,setCur]=useState(''); const [brok,setBrok]=useState('0.5');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');

  const calc=()=>{
    const sh=parseFloat(shares),b=parseFloat(buy),c=parseFloat(cur2),br=parseFloat(brok)||0;
    if(!sh||!b||!c){setResult({error:t.fillFields});return;}
    const inv=sh*b,val=sh*c,fee=(inv+val)*br/100,pl=val-inv-fee,pct=((pl/inv)*100).toFixed(2);
    setResult({inv:inv.toFixed(2),val:val.toFixed(2),pl:Math.abs(pl).toFixed(2),pct,profit:pl>=0,fee:fee.toFixed(2)});
    setSaved(false); onAdd('smv',`${sh}sh@৳${b}→৳${c}=${pl>=0?'+':'-'}৳${Math.abs(pl).toFixed(2)}(${pct}%)`);
  };
  const rc=result&&!result.error?(result.profit?'#10b981':'#ef4444'):A_SMV;
  const share=result&&!result.error?buildShare('📈',[`${s.shares}: ${shares}`,`${s.buyPrice}: ৳${buy}`,`${s.currentPrice}: ৳${cur2}`,`${s.invested}: ৳${result.inv}`,`${result.profit?s.netProfit:s.netLoss}: ৳${result.pl} (${result.pct}%)`]):null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={s.info} accent={A_SMV}/>
      <FloatInput label={s.shares} accent={A_SMV} type="number" placeholder="100" value={shares} onChange={e=>setShares(e.target.value)}/>
      <FloatInput label={s.buyPrice} accent={A_SMV} type="number" placeholder="50.25" value={buy} onChange={e=>setBuy(e.target.value)}/>
      <FloatInput label={s.currentPrice} accent={A_SMV} type="number" placeholder="65.00" value={cur2} onChange={e=>setCur(e.target.value)}/>
      <FloatInput label={s.brokerage} accent={A_SMV} type="number" placeholder="0.5" value={brok} onChange={e=>setBrok(e.target.value)}/>
      {result&&!result.error&&(
        <ResultCard accent={rc}>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:6}}>
              {result.profit?<FaArrowUp color='#10b981' size={18}/>:<FaArrowDown color='#ef4444' size={18}/>}
              <span style={{fontSize:14,fontWeight:700,color:rc}}>{result.profit?(lang==='bn'?'লাভ':'Profit'):(lang==='bn'?'ক্ষতি':'Loss')}</span>
            </div>
            <div style={{fontSize:36,fontWeight:900,color:rc,lineHeight:1.2,wordBreak:'break-word'}}>{result.profit?'+':'-'}৳{result.pl}</div>
            <div style={{fontSize:18,fontWeight:700,color:rc}}>({result.pct}%)</div>
          </div>
          <StatGrid items={[[s.invested,`৳${result.inv}`,A_SMV],[lang==='bn'?'বর্তমান মূল্য':'Current Value',`৳${result.val}`,A_SMV],[lang==='bn'?'ব্রোকারেজ':'Brokerage',`৳${result.fee}`,'#f59e0b'],[result.profit?s.netProfit:s.netLoss,`৳${result.pl}`,rc]]} cols={2}/>
        </ResultCard>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A_SMV} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A_SMV} onClear={()=>onClear&&onClear('smv')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
