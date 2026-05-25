import { useState } from 'react';
import { FaHeart,FaEye,FaTint,FaBrain,FaRunning,FaHospital } from 'react-icons/fa';
import { DateThreeInput, ActionRow, ResultCard, StatGrid, InfoBanner, HistoryPanel, Toast } from '../ui';
import { useLang } from '../../context/LangContext';
import { shareWA, buildShare } from '../../utils/share';

const A = '#10b981';
const OVER40 = [
  {icon:FaHeart,c:'#ef4444',bn:'হৃদরোগ পরীক্ষা',en:'Heart Check',bn2:'প্রতি বছর হৃদযন্ত্র পরীক্ষা ও রক্তচাপ মাপুন।',en2:'Annual heart check & blood pressure monitoring.'},
  {icon:FaTint,c:'#f97316',bn:'ডায়াবেটিস',en:'Diabetes',bn2:'রক্তের শর্করা নিয়মিত পরীক্ষা করুন।',en2:'Check blood sugar regularly.'},
  {icon:FaEye,c:'#0ea5e9',bn:'চোখের পরীক্ষা',en:'Eye Check',bn2:'প্রতি বছর চোখ পরীক্ষা করুন।',en2:'Annual eye examination.'},
  {icon:FaBrain,c:'#8b5cf6',bn:'মানসিক স্বাস্থ্য',en:'Mental Health',bn2:'মেডিটেশন করুন, পর্যাপ্ত ঘুমান।',en2:'Meditate and get enough sleep.'},
  {icon:FaRunning,c:'#10b981',bn:'নিয়মিত ব্যায়াম',en:'Exercise',bn2:'প্রতিদিন ৩০ মিনিট হাঁটুন।',en2:'Walk 30 minutes daily.'},
  {icon:FaHospital,c:'#f59e0b',bn:'ডাক্তার পরামর্শ',en:'Doctor Visit',bn2:'৬ মাসে একবার স্বাস্থ্য পরীক্ষা।',en2:'Health checkup every 6 months.'},
];

export default function AgeCalc({ history, onAdd, onClear }) {
  const { t, lang } = useLang(); const a = t.age;
  const [dd,setDd]=useState(''); const [mm,setMm]=useState(''); const [yyyy,setYyyy]=useState('');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');

  const calc = () => {
    const d=parseInt(dd),m=parseInt(mm),y=parseInt(yyyy);
    if(!d||!m||!y||d<1||d>31||m<1||m>12||y<1900||y>new Date().getFullYear()){setResult({error:t.fillFields});return;}
    const birth=new Date(y,m-1,d),today=new Date();
    if(birth>today){setResult({error:lang==='bn'?'তারিখ ভবিষ্যতে হতে পারে না!':'Date cannot be in the future!'});return;}
    let yr=today.getFullYear()-birth.getFullYear(),mo=today.getMonth()-birth.getMonth(),dy=today.getDate()-birth.getDate();
    if(dy<0){mo--;dy+=new Date(today.getFullYear(),today.getMonth(),0).getDate();}
    if(mo<0){yr--;mo+=12;}
    const totalDays=Math.floor((today-birth)/86400000);
    const next=new Date(today.getFullYear(),birth.getMonth(),birth.getDate());
    if(next<=today)next.setFullYear(today.getFullYear()+1);
    const daysToNext=Math.floor((next-today)/86400000);
    setResult({yr,mo,dy,totalDays,totalWeeks:Math.floor(totalDays/7),totalMonths:yr*12+mo,daysToNext,over40:yr>=40});
    setSaved(false); onAdd('age',`${dd}/${mm}/${yyyy} → ${yr}y ${mo}m ${dy}d`);
  };

  const share = result&&!result.error ? buildShare('🎂',[`${lang==='bn'?'জন্ম':'DOB'}: ${dd}/${mm}/${yyyy}`,`${lang==='bn'?'বয়স':'Age'}: ${result.yr} ${a.yearsOld}`,`${a.totalDays}: ${result.totalDays.toLocaleString()}`,`${a.nextBirthday}: ${result.daysToNext} ${a.daysLeft}`]) : null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={a.info} accent={A}/>
      <DateThreeInput
        labels={[a.day,a.month,a.year]}
        values={[dd,mm,yyyy]}
        onChanges={[e=>setDd(e.target.value),e=>setMm(e.target.value),e=>setYyyy(e.target.value)]}
        accent={A}
        hint={lang==='bn'?'দিন (১-৩১) | মাস (১-১২) | বছর':'Day (1-31) | Month (1-12) | Year'}
      />
      {result&&!result.error&&(
        <>
          <ResultCard accent={A}>
            <div style={{textAlign:'center',marginBottom:14}}>
              <div style={{fontSize:52,fontWeight:900,color:A,lineHeight:1}}>{result.yr}</div>
              <div style={{fontSize:14,fontWeight:700,color:'#64748b',marginTop:4}}>{a.yearsOld}</div>
              <div style={{fontSize:14,color:'#94a3b8',marginTop:2}}>{result.mo} {a.month} & {result.dy} {a.day}</div>
            </div>
            <StatGrid items={[[a.totalDays,result.totalDays.toLocaleString(),A],[a.totalWeeks,result.totalWeeks.toLocaleString(),A],[a.totalMonths,result.totalMonths.toLocaleString(),A],[a.nextBirthday,`${result.daysToNext} ${a.daysLeft}`,'#f59e0b']]} cols={2}/>
          </ResultCard>
          {result.over40&&(
            <div style={{marginTop:16,background:'#fffbeb',border:'2px solid #fde68a',borderRadius:18,padding:'16px',width:'100%',overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                <FaHospital color='#f59e0b' size={18}/>
                <span style={{fontSize:15,fontWeight:700,color:'#92400e'}}>{a.over40Title}</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {OVER40.map((item,i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',background:'#fff',borderRadius:12,padding:'10px 12px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                    <item.icon size={17} color={item.c} style={{flexShrink:0,marginTop:2}}/>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:item.c}}>{lang==='bn'?item.bn:item.en}</div>
                      <div style={{fontSize:12,color:'#64748b',marginTop:2,lineHeight:1.5,wordBreak:'break-word'}}>{lang==='bn'?item.bn2:item.en2}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A} onClear={()=>onClear&&onClear('age')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
