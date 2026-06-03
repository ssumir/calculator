import { useState } from 'react';
import { FaTshirt, FaRuler, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import { FloatInput, FloatSelect, ToggleGroup, ActionRow, ResultCard, StatGrid, InfoBanner, HistoryPanel, Toast } from '../ui';
import { useLang } from '../../context/LangContext.tsx';
import { shareWA, buildShare } from '../../utils/share.ts';

const A_GAR='#f97316';
const A_GSIZE='#ec4899';
const A_UNIT='#3b82f6';

// ─── GARMENTS MEASUREMENT ───────────────────────────────────────────────────
function getSizeFromChest(chest,gender) {
  const male=[['3XL',47],['2XL',45],['XL',43],['L',40],['M',37],['S',34],['XS',0]];
  const female=[['2XL',42],['XL',40],['L',37],['M',35],['S',32],['XS',0]];
  const chart=gender==='male'?male:female;
  for(const[size,min] of chart){ if(chest>min) return size; }
  return gender==='male'?'XS':'XS';
}

export function GarmentsCalc({ history, onAdd, onClear }) {
  const {t,lang}=useLang(); const g=t.garments;
  const [gender,setGender]=useState('male');
  const [chest,setChest]=useState(''); const [waist,setWaist]=useState(''); const [hip,setHip]=useState('');
  const [shoulder,setShoulder]=useState(''); const [sleeve,setSleeve]=useState(''); const [height,setHeight]=useState('');
  const [result,setResult]=useState(null); const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');

  const calc=()=>{
    const c=parseFloat(chest);
    if(!c||c<=0){setResult({error:t.fillFields});return;}
    const size=getSizeFromChest(c,gender);
    setResult({size,chestCm:(c*2.54).toFixed(1),waistCm:waist?(parseFloat(waist)*2.54).toFixed(1):null,hipCm:hip?(parseFloat(hip)*2.54).toFixed(1):null});
    setSaved(false); onAdd('garments',`${gender==='male'?'M':'F'},${lang==='bn'?'বুক':'Chest'}:${c}"→${size}`);
  };
  const share=result&&!result.error?buildShare('👕',[`${lang==='bn'?'লিঙ্গ':'Gender'}: ${gender}`,`${g.chest}: ${chest}" (${result.chestCm}cm)`,`${g.recommended}: ${result.size}`]):null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={g.info} accent={A_GAR}/>
      <ToggleGroup options={[['male',`👨 ${t.male}`],['female',`👩 ${t.female}`]]} value={gender} onChange={setGender} accent={A_GAR}/>
      <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:12,padding:'12px 14px',marginBottom:18}}>
        <div style={{fontSize:12,fontWeight:700,color:'#9a3412',marginBottom:8,display:'flex',alignItems:'center',gap:6}}><FaInfoCircle size={11}/>{g.howTo}</div>
        {g.howToTips.map((tip,i)=>(<div key={i} style={{fontSize:12,color:'#7c3a00',padding:'2px 0',display:'flex',gap:6}}><span style={{color:A_GAR,fontWeight:700,flexShrink:0}}>•</span><span style={{wordBreak:'break-word'}}>{tip}</span></div>))}
      </div>
      <FloatInput label={`${g.chest} *`} accent={A_GAR} type="number" placeholder="38" value={chest} onChange={e=>setChest(e.target.value)} hint={lang==='bn'?'* আবশ্যক':'* Required'}/>
      <FloatInput label={g.waist} accent={A_GAR} type="number" placeholder="32" value={waist} onChange={e=>setWaist(e.target.value)}/>
      <FloatInput label={g.hip} accent={A_GAR} type="number" placeholder="40" value={hip} onChange={e=>setHip(e.target.value)}/>
      <FloatInput label={g.shoulder} accent={A_GAR} type="number" placeholder="17" value={shoulder} onChange={e=>setShoulder(e.target.value)}/>
      <FloatInput label={g.sleeve} accent={A_GAR} type="number" placeholder="25" value={sleeve} onChange={e=>setSleeve(e.target.value)}/>
      <FloatInput label={g.height} accent={A_GAR} type="number" placeholder="66" value={height} onChange={e=>setHeight(e.target.value)}/>
      {result&&!result.error&&(
        <ResultCard accent={A_GAR}>
          <div style={{textAlign:'center',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'#64748b',marginBottom:4}}>{g.recommended}</div>
            <div style={{fontSize:60,fontWeight:900,color:A_GAR,lineHeight:1}}>{result.size}</div>
          </div>
          <StatGrid items={[[g.chest,`${chest}" / ${result.chestCm}cm`,A_GAR],[g.waist,waist?`${waist}" / ${result.waistCm}cm`:'—',A_GAR],[g.hip,hip?`${hip}" / ${result.hipCm}cm`:'—',A_GAR],[g.shoulder,shoulder?`${shoulder}"`:'—',A_GAR]]} cols={2}/>
        </ResultCard>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result&&!result.error){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A_GAR} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A_GAR} onClear={()=>onClear&&onClear('garments')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}

// ─── GARMENTS SIZE CHART ─────────────────────────────────────────────────────
const SIZE_DATA={shirt:{male:[{s:'XS',bd:'36-37"',us:'XS',uk:'14',eu:'44',asia:'S',ref:'32-34"'},{s:'S',bd:'38-39"',us:'S',uk:'15',eu:'46',asia:'M',ref:'34-36"'},{s:'M',bd:'40-41"',us:'M',uk:'15.5',eu:'48',asia:'L',ref:'38-40"'},{s:'L',bd:'42-43"',us:'L',uk:'16',eu:'50',asia:'XL',ref:'40-42"'},{s:'XL',bd:'44-45"',us:'XL',uk:'17',eu:'52',asia:'2XL',ref:'42-44"'},{s:'2XL',bd:'46-47"',us:'XXL',uk:'18',eu:'54',asia:'3XL',ref:'44-46"'}],female:[{s:'XS',bd:'6',us:'0-2',uk:'4-6',eu:'32',asia:'XS',ref:'30-32"'},{s:'S',bd:'8',us:'4-6',uk:'8-10',eu:'36',asia:'S',ref:'32-34"'},{s:'M',bd:'10',us:'8-10',uk:'12-14',eu:'40',asia:'M',ref:'35-37"'},{s:'L',bd:'12',us:'12-14',uk:'16-18',eu:'44',asia:'L',ref:'38-40"'},{s:'XL',bd:'14',us:'16-18',uk:'20',eu:'48',asia:'XL',ref:'41-43"'},{s:'2XL',bd:'16',us:'20+',uk:'22+',eu:'52+',asia:'2XL',ref:'44"+'}]},pants:{male:[{s:'28',bd:'28"',us:'28',uk:'28',eu:'44',asia:'28',ref:'28"'},{s:'30',bd:'30"',us:'30',uk:'30',eu:'46',asia:'30',ref:'30"'},{s:'32',bd:'32"',us:'32',uk:'32',eu:'48',asia:'32',ref:'32"'},{s:'34',bd:'34"',us:'34',uk:'34',eu:'50',asia:'34',ref:'34"'},{s:'36',bd:'36"',us:'36',uk:'36',eu:'52',asia:'36',ref:'36"'},{s:'38',bd:'38"',us:'38',uk:'38',eu:'54',asia:'38',ref:'38"'}],female:[{s:'XS',bd:'24-25"',us:'0-2',uk:'6',eu:'32',asia:'XS',ref:'24-25"'},{s:'S',bd:'26-27"',us:'4-6',uk:'8',eu:'34',asia:'S',ref:'26-27"'},{s:'M',bd:'28-29"',us:'8-10',uk:'12',eu:'36',asia:'M',ref:'28-29"'},{s:'L',bd:'30-31"',us:'12-14',uk:'16',eu:'38',asia:'L',ref:'30-31"'},{s:'XL',bd:'32-33"',us:'16-18',uk:'20',eu:'40',asia:'XL',ref:'32-33"'},{s:'2XL',bd:'34-35"',us:'20+',uk:'22+',eu:'42',asia:'2XL',ref:'34+'}]},shoes:{male:[{s:'6',bd:'6',us:'6',uk:'5.5',eu:'39',asia:'24cm'},{s:'7',bd:'7',us:'7',uk:'6.5',eu:'40',asia:'25cm'},{s:'8',bd:'8',us:'8',uk:'7.5',eu:'41',asia:'26cm'},{s:'9',bd:'9',us:'9',uk:'8.5',eu:'43',asia:'27cm'},{s:'10',bd:'10',us:'10',uk:'9.5',eu:'44',asia:'28cm'},{s:'11',bd:'11',us:'11',uk:'10.5',eu:'45',asia:'29cm'}],female:[{s:'4',bd:'4',us:'5',uk:'2.5',eu:'35',asia:'22cm'},{s:'5',bd:'5',us:'6',uk:'3.5',eu:'36',asia:'23cm'},{s:'6',bd:'6',us:'7',uk:'4.5',eu:'37',asia:'23.5cm'},{s:'7',bd:'7',us:'8',uk:'5.5',eu:'38',asia:'24cm'},{s:'8',bd:'8',us:'9',uk:'6.5',eu:'39',asia:'25cm'},{s:'9',bd:'9',us:'10',uk:'7.5',eu:'40',asia:'26cm'}]}};

export function GSizeCalc() {
  const {t,lang}=useLang(); const g=t.gsize;
  const [cat,setCat]=useState('shirt'); const [gender,setGender]=useState('male');
  const data=SIZE_DATA[cat]?.[gender]||[];
  const isShoes=cat==='shoes';

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={g.info} accent={A_GSIZE}/>
      <ToggleGroup options={[['male',`👨 ${t.male}`],['female',`👩 ${t.female}`]]} value={gender} onChange={setGender} accent={A_GSIZE}/>
      <div style={{display:'flex',gap:8,marginBottom:18,width:'100%'}}>
        {[['shirt',g.shirt],['pants',g.pants],['shoes',g.shoes]].map(([v,l])=>(
          <button key={v} onClick={()=>setCat(v)} style={{flex:1,padding:'10px 6px',background:cat===v?A_GSIZE:'#f8faff',color:cat===v?'#fff':'#64748b',border:`2px solid ${cat===v?A_GSIZE:'#e2e8f0'}`,borderRadius:10,fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l}</button>
        ))}
      </div>
      <div style={{overflowX:'auto',borderRadius:14,border:'1px solid #e2e8f0',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',WebkitOverflowScrolling:'touch'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,minWidth:320}}>
          <thead>
            <tr style={{background:A_GSIZE}}>
              {(isShoes?['BD','US','UK','EU','Asia']:['Size','BD','US','UK','EU','Asia',lang==='bn'?'রেফ':'Ref']).map(c=>(
                <th key={c} style={{padding:'10px 8px',color:'#fff',fontWeight:700,textAlign:'center',whiteSpace:'nowrap'}}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row,i)=>(
              <tr key={i} style={{background:i%2===0?'#fff':'#fdf2f8'}}>
                {isShoes
                  ?[row.bd,row.us,row.uk,row.eu,row.asia].map((v,j)=>(<td key={j} style={{padding:'10px 8px',textAlign:'center',fontWeight:j===0?800:500,color:j===0?A_GSIZE:'#475569',borderBottom:'1px solid #f1f5f9',whiteSpace:'nowrap'}}>{v}</td>))
                  :[row.s,row.bd,row.us,row.uk,row.eu,row.asia,row.ref].map((v,j)=>(<td key={j} style={{padding:'10px 8px',textAlign:'center',fontWeight:j===0?800:500,color:j===0?A_GSIZE:'#475569',borderBottom:'1px solid #f1f5f9',whiteSpace:'nowrap'}}>{v}</td>))
                }
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:10,fontSize:11,color:'#94a3b8',textAlign:'center',lineHeight:1.6,wordBreak:'break-word'}}>
        {lang==='bn'?'* সাইজ প্রস্তুতকারক ভেদে ভিন্ন হতে পারে।':'* Sizes may vary between manufacturers.'}
      </div>
    </div>
  );
}

// ─── UNIT CONVERTER ──────────────────────────────────────────────────────────
const UNITS={
  length:{en:'Length',bn:'দৈর্ঘ্য',units:['meter','kilometer','centimeter','millimeter','inch','foot','yard','mile'],labels:{meter:'Meter (m)',kilometer:'Kilometer (km)',centimeter:'Centimeter (cm)',millimeter:'Millimeter (mm)',inch:'Inch (in)',foot:'Foot (ft)',yard:'Yard (yd)',mile:'Mile (mi)'},toBase:{meter:1,kilometer:1000,centimeter:0.01,millimeter:0.001,inch:0.0254,foot:0.3048,yard:0.9144,mile:1609.344}},
  weight:{en:'Weight',bn:'ওজন',units:['kilogram','gram','milligram','pound','ounce','ton','maund','seer'],labels:{kilogram:'Kilogram (kg)',gram:'Gram (g)',milligram:'Milligram (mg)',pound:'Pound (lb)',ounce:'Ounce (oz)',ton:'Metric Ton',maund:'Maund (মণ)',seer:'Seer (সের)'},toBase:{kilogram:1,gram:0.001,milligram:0.000001,pound:0.453592,ounce:0.0283495,ton:1000,maund:37.3242,seer:0.933105}},
  temperature:{en:'Temperature',bn:'তাপমাত্রা',units:['celsius','fahrenheit','kelvin'],labels:{celsius:'Celsius (°C)',fahrenheit:'Fahrenheit (°F)',kelvin:'Kelvin (K)'},toBase:null},
  area:{en:'Area',bn:'ক্ষেত্রফল',units:['squaremeter','squarefoot','squareinch','acre','hectare','bigha','katha'],labels:{squaremeter:'m²',squarefoot:'ft²',squareinch:'in²',acre:'Acre',hectare:'Hectare',bigha:'Bigha (বিঘা)',katha:'Katha (কাঠা)'},toBase:{squaremeter:1,squarefoot:0.092903,squareinch:0.000645,acre:4046.86,hectare:10000,bigha:1338.46,katha:66.89}},
  volume:{en:'Volume',bn:'আয়তন',units:['liter','milliliter','gallon','cup','tablespoon','teaspoon'],labels:{liter:'Liter (L)',milliliter:'mL',gallon:'Gallon (US)',cup:'Cup',tablespoon:'Tablespoon',teaspoon:'Teaspoon'},toBase:{liter:1,milliliter:0.001,gallon:3.78541,cup:0.236588,tablespoon:0.0147868,teaspoon:0.00492892}},
  speed:{en:'Speed',bn:'গতি',units:['kph','mph','mps','knot'],labels:{kph:'km/h',mph:'mph',mps:'m/s',knot:'Knot'},toBase:{kph:1,mph:1.60934,mps:3.6,knot:1.852}},
};
function convTemp(v,from,to){let c=from==='celsius'?v:from==='fahrenheit'?(v-32)*5/9:v-273.15;return to==='celsius'?c:to==='fahrenheit'?c*9/5+32:c+273.15;}
const CATS2=['length','weight','temperature','area','volume','speed'];
const CAT_ICONS={length:'📏',weight:'⚖️',temperature:'🌡️',area:'📐',volume:'🧊',speed:'💨'};

export function UnitCalc({ history, onAdd, onClear }) {
  const {t,lang}=useLang(); const u=t.unit;
  const [cat,setCat]=useState('length');
  const [fromU,setFromU]=useState('meter'); const [toU,setToU]=useState('kilometer');
  const [val,setVal]=useState(''); const [result,setResult]=useState(null);
  const [saved,setSaved]=useState(false); const [toast,setToast]=useState('');
  const data=UNITS[cat];

  const calc=()=>{
    const v=parseFloat(val);
    if(isNaN(v)){setResult({error:t.fillFields});return;}
    let res=cat==='temperature'?convTemp(v,fromU,toU):(v*data.toBase[fromU])/data.toBase[toU];
    const display=Math.abs(res)<0.00001||Math.abs(res)>1e10?res.toExponential(4):parseFloat(res.toFixed(6));
    setResult(display);
    setSaved(false); onAdd('unit',`${v} ${fromU} = ${display} ${toU}`);
  };
  const share=result!==null&&!result?.error?buildShare('📏',[`${val} ${data.labels[fromU]} = ${result} ${data.labels[toU]}`]):null;

  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <InfoBanner text={u.info} accent={A_UNIT}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8,marginBottom:18}}>
        {CATS2.map(c=>(
          <button key={c} onClick={()=>{setCat(c);setFromU(UNITS[c].units[0]);setToU(UNITS[c].units[1]);setResult(null);setVal('');}} style={{padding:'10px 6px',background:cat===c?A_UNIT:'#f8faff',color:cat===c?'#fff':'#64748b',border:`2px solid ${cat===c?A_UNIT:'#e2e8f0'}`,borderRadius:10,fontSize:12,fontWeight:700,fontFamily:'inherit',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,overflow:'hidden'}}>
            <span style={{fontSize:18}}>{CAT_ICONS[c]}</span>
            <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{lang==='bn'?UNITS[c].bn:UNITS[c].en}</span>
          </button>
        ))}
      </div>
      <FloatInput label={u.value} accent={A_UNIT} type="number" placeholder="1" value={val} onChange={e=>setVal(e.target.value)}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 36px 1fr',gap:8,alignItems:'center',marginBottom:18}}>
        <FloatSelect label={u.from} accent={A_UNIT} value={fromU} onChange={e=>setFromU(e.target.value)}>
          {data.units.map(u2=><option key={u2} value={u2}>{data.labels[u2]}</option>)}
        </FloatSelect>
        <div style={{textAlign:'center',color:A_UNIT,fontSize:20,fontWeight:700,paddingTop:8}}>⇄</div>
        <FloatSelect label={u.to} accent={A_UNIT} value={toU} onChange={e=>setToU(e.target.value)}>
          {data.units.map(u2=><option key={u2} value={u2}>{data.labels[u2]}</option>)}
        </FloatSelect>
      </div>
      {result!==null&&!result?.error&&(
        <ResultCard accent={A_UNIT}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:13,color:'#64748b',marginBottom:6}}>{val} {data.labels[fromU]}</div>
            <div style={{fontSize:34,fontWeight:900,color:A_UNIT,lineHeight:1.2,wordBreak:'break-word'}}>{result}</div>
            <div style={{fontSize:15,fontWeight:600,color:'#475569',marginTop:4}}>{data.labels[toU]}</div>
          </div>
        </ResultCard>
      )}
      {result?.error&&<div style={{color:'#ef4444',fontSize:13,marginTop:10,fontWeight:600}}>⚠️ {result.error}</div>}
      <ActionRow onCalc={calc} onSave={()=>{if(result!==null){setSaved(true);setToast(t.saved);}}} onShare={()=>{if(share)shareWA(share);}} accent={A_UNIT} saved={saved} label={t.calculate}/>
      <HistoryPanel items={history} accent={A_UNIT} onClear={()=>onClear&&onClear('unit')} labels={{history:t.history,clear:t.clearHistory}}/>
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
    </div>
  );
}
