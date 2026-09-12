'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { media } from './media';
import Countdown from './countdown';

type Stage = 'envelope' | 'film' | 'date' | 'rsvp' | 'thanks';

export default function Home() {
  const [stage,setStage]=useState<Stage>('envelope');
  const [opened,setOpened]=useState(false);
  const [enlargedPhoto,setEnlargedPhoto]=useState<string|null>(null);
  const photoDialog=useRef<HTMLDialogElement>(null);
  const [name,setName]=useState('');
  const [attendance,setAttendance]=useState('yes');
  const [playing,setPlaying]=useState(true);
  const cinema=useRef<HTMLElement>(null);
  const [fullscreen,setFullscreen]=useState(false);
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
  useEffect(()=>{
    if(enlargedPhoto)photoDialog.current?.showModal();
    else photoDialog.current?.close();
  },[enlargedPhoto]);
  function discover(){
    if(transitioning)return;
    setTransitioning(true);
    transitionTimer.current=setTimeout(()=>{
      setStage('film');setPlaying(true);setTransitioning(false);
    },matchMedia('(prefers-reduced-motion: reduce)').matches?0:950);
  }
  function togglePlayback(){
    if(!video.current)return;
    if(!video.current.paused)video.current.pause();
    else video.current.play().catch(()=>setPlaying(false));
  }
  useEffect(()=>{
    const changed=()=>setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange',changed);
    return ()=>document.removeEventListener('fullscreenchange',changed);
  },[]);
  async function toggleFullscreen(){
    const player=video.current as (HTMLVideoElement & {webkitEnterFullscreen?:()=>void})|null;
    if(!player)return;
    try{
      if(document.fullscreenElement){await document.exitFullscreen();return;}
      if(cinema.current?.requestFullscreen){
        await cinema.current.requestFullscreen();
        const orientation=screen.orientation as ScreenOrientation & {lock?:(mode:string)=>Promise<void>};
        await orientation?.lock?.('landscape').catch(()=>{});
      }else{player.webkitEnterFullscreen?.();}
    }catch{try{player.webkitEnterFullscreen?.();}catch{}}
  }
  async function finishFilm(){
    if(document.fullscreenElement)await document.exitFullscreen().catch(()=>{});
    const player=video.current as (HTMLVideoElement & {webkitExitFullscreen?:()=>void})|null;
    try{player?.webkitExitFullscreen?.();}catch{}
    setStage('date');
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
    {stage==='envelope'&&<section className={'invitation '+(opened?'is-open ':'')+(transitioning?'departing':'')} aria-label="Un mensaje de Jorge y Claudia">
      <div className="intro"><p className="eyebrow">Tienes un mensaje de</p><h1 className="couple-names"><span>Jorge</span><span>y Claudia</span></h1></div>
      <div className={'envelope '+(opened?'opened':'')}>
        <div className="lining"/>
        <div className="envelope-body"><img src="/media/stationery/envelope-jc.png" alt=""/></div>
        <div className="flap"><div className="flap-front"><img src="/media/stationery/envelope-jc.png" alt=""/></div><div className="flap-back"/></div>
        <div className="papers" aria-hidden={!opened}>
          <figure className="photo photo-one"><button className="photo-open" disabled={!opened||transitioning} tabIndex={opened?0:-1} onClick={()=>setEnlargedPhoto(media.photos[1])} aria-label="Ampliar foto de Jorge y Claudia caminando juntos"><img src={media.photos[1]} alt="Jorge y Claudia caminando juntos"/></button><figcaption>un instante nuestro</figcaption></figure>
          <figure className="photo photo-two"><button className="photo-open" disabled={!opened||transitioning} tabIndex={opened?0:-1} onClick={()=>setEnlargedPhoto(media.photos[0])} aria-label="Ampliar foto de Jorge y Claudia bajo la luz de la tarde"><img src={media.photos[0]} alt="Jorge y Claudia bajo la luz de la tarde"/></button><figcaption>y todo lo que viene.</figcaption></figure>
        </div>
        <div className="letter" aria-hidden={!opened}><h2>TENEMOS ALGO<br/>QUE CONTARLES</h2><button className="text-button" tabIndex={opened?0:-1} disabled={!opened||transitioning} onClick={discover}>DESCÚBRELO <span aria-hidden="true">↗</span></button></div>
        <img className="anthuriums" src="/media/stationery/anthuriums.png" alt="" aria-hidden="true"/>
        <button className="open-envelope" tabIndex={opened?-1:0} disabled={opened} onClick={()=>setOpened(true)} aria-label="Abrir el sobre de Jorge y Claudia"/>
      </div>
      <p className="hint" aria-live="polite">{opened?'Hay historias que merecen ser compartidas.':'Toca el sobre para abrir'}</p>
    </section>}
    {stage==='film'&&<section ref={cinema} className="cinema" aria-label="Nuestra película">
      <h1 className="sr-only" tabIndex={-1} ref={heading}>Nuestra película</h1>
      <video ref={video} className="real-film" src={media.video} poster={media.photos[0]} playsInline preload="metadata" onClick={togglePlayback} tabIndex={0} role="button" aria-label={playing?'Pausar video':'Reanudar video'} onKeyDown={e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();togglePlayback();}}}
        onPlay={()=>{setPlaying(true);setError('');}}
        onPause={()=>setPlaying(false)}
        onEnded={finishFilm}
        onError={()=>{setVideoError(true);setPlaying(false);}}/>
      {videoError&&<div className="video-retry" role="alert"><p>No se pudo cargar nuestra película.</p><button onClick={()=>{setVideoError(false);setError('');video.current?.load();video.current?.play().catch(()=>setPlaying(false));}}>VOLVER A INTENTAR</button></div>}
      <button className="fullscreen-button" onClick={toggleFullscreen} aria-label={fullscreen?'Salir de pantalla completa':'Ver en pantalla completa'} title="Pantalla completa"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={fullscreen?'M3 9h6V3m6 0v6h6M3 15h6v6m6 0v-6h6':'M9 3H3v6m12-6h6v6M3 15v6h6m6 0h6v-6'}/></svg></button>
    </section>}
    {stage==='date'&&<section className="date-page">
      <h1 className="sr-only" ref={heading} tabIndex={-1}>Nuestra celebración</h1>
      <div className="date-photo"><img src={media.photos[0]} alt="Jorge y Claudia, juntos bajo la luz de la tarde"/><span className="script-names">Jorge y Claudia</span></div>
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
      <p className="eyebrow">RESPUESTA RECIBIDA</p><span className="thanks-mark" aria-hidden="true">J & C</span><h1 ref={heading} tabIndex={-1}>Gracias, {name.trim().split(/\s+/)[0]}.</h1>
      <p>{attendance==='yes'?'Qué alegría saber que estarás con nosotros.':'Gracias por hacérnoslo saber. Te llevaremos con nosotros en este día.'}</p>
      <p className="personal-note">Con todo nuestro cariño,<br/><i className="script-names">Jorge y Claudia</i></p><Countdown/><p className="eyebrow">LIMA, PERÚ</p>
    </section>}
    <dialog ref={photoDialog} className="photo-dialog" aria-label="Fotografía ampliada" onCancel={()=>setEnlargedPhoto(null)} onClose={()=>setEnlargedPhoto(null)} onClick={e=>{if(e.target===e.currentTarget)setEnlargedPhoto(null);}}>
      <button className="photo-close" onClick={()=>setEnlargedPhoto(null)} aria-label="Cerrar fotografía" autoFocus>×</button>
      {enlargedPhoto&&<img src={enlargedPhoto} alt="Jorge y Claudia" />}
    </dialog>
  </main>;
}

