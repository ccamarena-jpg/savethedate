'use client';
import {useEffect,useState} from 'react';
import {remainingTime} from './countdown-time';
export default function Countdown() {
  const [now,setNow]=useState<number|null>(null);
  useEffect(()=>{
    const update=()=>setNow(Date.now());
    update();
    const timer=setInterval(update,1000);
    document.addEventListener('visibilitychange',update);
    return ()=>{clearInterval(timer);document.removeEventListener('visibilitychange',update);};
  },[]);
  const remaining=now===null?null:remainingTime(now);
  if(remaining?.finished) return <div className="countdown-arrived"><p>El gran día ha llegado.</p><span>12 de diciembre de 2026 · Lima</span></div>;
  return <div className="countdown-wrap"><p className="countdown-intro">Cada vez falta menos.</p><div className="countdown" role="timer" aria-live="off" aria-label={remaining ? 'Faltan '+remaining.days+' días, '+remaining.hours+' horas y '+remaining.minutes+' minutos para nuestra boda.' : 'Cuenta regresiva para nuestra boda'}>
    {(['days','hours','minutes','seconds'] as const).map((key,index)=><div className="countdown-unit" key={key}><span>{remaining?String(remaining[key]).padStart(2,'0'):'—'}</span><small>{['DÍAS','HORAS','MIN','SEG'][index]}</small></div>)}
  </div></div>;
}
