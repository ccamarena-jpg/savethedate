'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { media } from './media';
import Countdown from './countdown';

type Stage = 'envelope' | 'film' | 'date' | 'rsvp' | 'thanks';

export default function Home() {
  const [stage,setStage]=useState<Stage>('envelope');
  const [opened,setOpened]=useState(false);
  const [name,setName]=useState('');
  const [attendance,setAttendance]=useState('yes');
  const [playing,setPlaying]=useState(true);
  const [muted,setMuted]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [videoError,setVideoError]=useState(false);
  const [transitioning,setTransitioning]=useState(false);
  const video=useRef<HTMLVideoElement>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  const requestId=useRef('');
  const transitionTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    setName((new URLSearchParams(location.search).get('guest')||'').trim().slice(0,80));
    return ()=>{if(transitionTimer.current)clearTimeout(transitionTimer.current);};
  },[]);
  useEffect(()=>{if(stage!=='envelope')heading.current?.focus();},[stage]);
  useEffect(()=>{
    if(stage==='film')video.current?.play().catch(()=>setPlaying(false));
  },[stage]);
  function discover(){
    if(transitioning)return;
    setTransitioning(true);
    transitionTimer.current=setTimeout(()=>{
      setStage('film');setPlaying(true);setTransitioning(false);
    },matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);
  }
  function togglePlayback(){
    if(!video.current)return;
    if(playing)video.current.pause();
    else video.current.play().catch(()=>{setError('Toca reproducir para iniciar la película.');setPlaying(false);});
  }
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(busy)return;
    const form=new FormData(event.currentTarget);
    setBusy(true);setError('');
    requestId.current ||= crypto.randomUUID();
    try{
      const response=await fetch('/api/rsvp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        id:requestId.current,name:name.trim(),attendance,
        message:String(form.get('message')||'').trim(),website:String(form.get('website')||''),
      })});
      if(!response.ok)throw new Error('No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.');
      setStage('thanks');
    }catch(e){setError(e instanceof Error?e.message:'No pudimos guardar tu respuesta. Inténtalo de nuevo.');}
    finally{setBusy(false);}
  }
  useEffect(()=>{
    type Context={registerTool:(tool:object,options:{signal:AbortSignal})=>void|Promise<void>};
    const context=(document as Document & {modelContext?:Context}).modelContext;
    if(!context)return;
    const lifecycle=new AbortController();
    Promise.resolve(context.registerTool({
      name:'open_invitation_envelope',title:'Abrir la carta',
      description:'Abre el sobre de la invitación y muestra las fotografías y la tarjeta.',
      inputSchema:{type:'object',properties:{},additionalProperties:false},
      annotations:{readOnlyHint:false},
      execute(input:unknown){
        if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('No se aceptan parámetros.');
        setOpened(true);return {envelope:'opened'};
      },
    },{signal:lifecycle.signal})).catch(()=>{});
    return ()=>lifecycle.abort();
  },[]);

  return <main className={'experience stage-'+stage}>
    {stage==='envelope'&&<section className={'invitation '+(opened?'is-open ':'')+(transitioning?'departing':'')} aria-label="Un mensaje de Claudia y Jorge">
      <div className="intro"><p className="eyebrow">Tienes un mensaje de</p><h1 className="couple-names"><span>Claudia</span><span>y Jorge</span></h1></div>
      <div className={'envelope '+(opened?'opened':'')}>
        <div className="lining"/>
        <div className="envelope-body"><img src="/media/stationery/envelope-ivory.png" alt=""/></div>
        <div className="flap"><div className="flap-front"><img src="/media/stationery/envelope-ivory.png" alt=""/></div><div className="flap-back"/></div>
        <div className="papers" aria-hidden={!opened}>
          <figure className="photo photo-one"><img src={media.photos[1]} alt="Claudia y Jorge caminando juntos"/><figcaption>un instante nuestro</figcaption></figure>
          <figure className="photo photo-two"><img src={media.photos[0]} alt="Claudia y Jorge bajo la luz de la tarde"/><figcaption>y todo lo que viene.</figcaption></figure>
        </div>
        <div className="letter" aria-hidden={!opened}><h2>TENEMOS ALGO<br/>QUE CONTARLES</h2><button className="text-button" tabIndex={opened?0:-1} disabled={!opened||transitioning} onClick={discover}>DESCUBRIR <span aria-hidden="true">↗</span></button></div>
        <img className="callas" src="/media/stationery/callas.png" alt="" aria-hidden="true"/>
        <button className="open-envelope" tabIndex={opened?-1:0} disabled={opened} onClick={()=>setOpened(true)} aria-label="Abrir el sobre de Claudia y Jorge"/>
      </div>
      <p className="hint" aria-live="polite">{opened?'Hay historias que merecen ser compartidas.':'Toca el sobre para abrir'}</p>
    </section>}
    {stage==='film'&&<section className="cinema" aria-label="Nuestra película">
      <h1 className="sr-only" tabIndex={-1} ref={heading}>Nuestra película</h1>
      <video ref={video} className="real-film" src={media.video} poster={media.photos[0]} playsInline preload="metadata" muted={muted}
        onPlay={()=>{setPlaying(true);setError('');}}
        onPause={()=>setPlaying(false)}
        onEnded={()=>setStage('date')}
        onError={()=>{setVideoError(true);setPlaying(false);}}/>
      {!playing&&!videoError&&<button className="film-play" onClick={togglePlayback}>VER NUESTRA PELÍCULA <span aria-hidden="true">▷</span></button>}
      {videoError&&<div className="video-retry" role="alert"><p>No se pudo cargar nuestra película.</p><button onClick={()=>{setVideoError(false);setError('');video.current?.load();video.current?.play().catch(()=>setPlaying(false));}}>VOLVER A INTENTAR</button></div>}
      <div className="cinema-controls"><button onClick={togglePlayback}>{playing?'PAUSAR':'REPRODUCIR'}</button><button onClick={()=>setMuted(v=>!v)}>{muted?'ACTIVAR SONIDO':'SILENCIAR'}</button></div>
      {error&&<p className="film-error" role="alert">{error}</p>}
    </section>}
    {stage==='date'&&<section className="date-page">
      <h1 className="sr-only" ref={heading} tabIndex={-1}>Nuestra celebración</h1>
      <div className="date-photo"><img src={media.photos[0]} alt="Claudia y Jorge, juntos bajo la luz de la tarde"/><span className="script-names">Claudia y Jorge</span></div>
      <Countdown/>
      <p className="personal-note">Lo mejor de nuestra historia<br/>también se escribe contigo.</p>
      <button className="primary-button" onClick={()=>setStage('rsvp')}>CONFIRMAR ASISTENCIA <span aria-hidden="true">↗</span></button>
      <p className="small-note">Pronto, todos los detalles.</p>
    </section>}
    {stage==='rsvp'&&<section className="rsvp-page">
      <button className="back-button" onClick={()=>setStage('date')}>← VOLVER</button>
      <h1 ref={heading} tabIndex={-1}>¿Nos acompañas?</h1><p className="form-intro">Nos encantará compartir este día contigo.</p>
      <form onSubmit={submit}>
        <label htmlFor="name">Tu nombre completo</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/>
        <fieldset><legend>¿Podrás asistir?</legend><label className={'choice '+(attendance==='yes'?'selected':'')}><input type="radio" name="attendance" value="yes" checked={attendance==='yes'} onChange={()=>setAttendance('yes')}/>Sí, ahí estaré</label><label className={'choice '+(attendance==='no'?'selected':'')}><input type="radio" name="attendance" value="no" checked={attendance==='no'} onChange={()=>setAttendance('no')}/>Esta vez no podré</label></fieldset>
        <label htmlFor="message">Un mensaje para nosotros <span>(opcional)</span></label><textarea name="message" id="message" rows={3} maxLength={1000} placeholder="Los leemos con cariño…"/>
        <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input name="website" id="website" tabIndex={-1} autoComplete="off"/></div>
        <p className="privacy-note">Usaremos tu respuesta únicamente para organizar nuestra boda.</p>
        {error&&<p role="alert" className="form-error">{error}</p>}
        <button type="submit" className="primary-button" disabled={busy}>{busy?'GUARDANDO…':'ENVIAR RESPUESTA'} <span aria-hidden="true">↗</span></button>
      </form>
    </section>}
    {stage==='thanks'&&<section className="thanks-page">
      <p className="eyebrow">RESPUESTA RECIBIDA</p><span className="thanks-mark" aria-hidden="true">C & J</span><h1 ref={heading} tabIndex={-1}>Gracias, {name.trim().split(/\s+/)[0]}.</h1>
      <p>{attendance==='yes'?'Qué alegría saber que estarás con nosotros.':'Gracias por hacérnoslo saber. Te llevaremos con nosotros en este día.'}</p>
      <p className="personal-note">Con todo nuestro cariño,<br/><i className="script-names">Claudia y Jorge</i></p><Countdown/><p className="eyebrow">LIMA, PERÚ</p>
    </section>}
  </main>;
}
