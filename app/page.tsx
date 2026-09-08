'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { media } from './media';
import Countdown from './countdown';

type Stage = 'envelope' | 'film' | 'date' | 'rsvp' | 'thanks';
const DURATION = 17;

export default function Home() {
  const [stage, setStage] = useState<Stage>('envelope');
  const [opened, setOpened] = useState(false);
  const [guest, setGuest] = useState('');
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState('yes');
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const requestId = useRef('');
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demo = !media.video;

  useEffect(() => {
    const value = (new URLSearchParams(location.search).get('guest') || '').trim().slice(0, 80);
    setGuest(value); setName(value);
    return () => { if (transitionTimer.current) clearTimeout(transitionTimer.current); };
  }, []);
  useEffect(() => { if (stage !== 'envelope') heading.current?.focus(); }, [stage]);
  useEffect(() => {
    if (stage !== 'film' || !playing || !demo) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden) setElapsed(t => Math.min(DURATION, t + (now - last) / 1000));
      last = now;
    }, 100);
    return () => clearInterval(timer);
  }, [stage, playing, demo]);
  useEffect(() => { if (stage === 'film' && demo && elapsed >= DURATION) setStage('date'); }, [elapsed, stage, demo]);
  useEffect(() => {
    if (stage !== 'film' || demo || !video.current) return;
    video.current.play().catch(() => setPlaying(false));
  }, [stage, demo]);

  function discover() {
    if (transitioning) return;
    setTransitioning(true);
    transitionTimer.current = setTimeout(() => { setStage('film'); setElapsed(0); setPlaying(true); setTransitioning(false); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 950);
  }
  function togglePlayback() {
    if (video.current && !demo) {
      if (playing) video.current.pause();
      else video.current.play().catch(() => { setError('Toca reproducir para iniciar la película.'); setPlaying(false); });
    } else setPlaying(p => !p);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError('');
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        id: requestId.current, name: name.trim(), attendance,
        message: String(form.get('message') || '').trim(), website: String(form.get('website') || ''),
      }) });
      if (!response.ok) throw new Error('No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.');
      setStage('thanks');
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar tu respuesta. Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    type Context = { registerTool: (tool: object, options: { signal: AbortSignal }) => void | Promise<void> };
    const context = (document as Document & { modelContext?: Context }).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    Promise.resolve(context.registerTool({
      name: 'open_invitation_envelope', title: 'Abrir la carta',
      description: 'Abre el sobre de la invitación y muestra las fotografías y la tarjeta.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false },
      execute(input: unknown) {
        if (!input || typeof input !== 'object' || Object.keys(input).length) throw new Error('No se aceptan parámetros.');
        setOpened(true); return { envelope: 'opened' };
      },
    }, { signal: lifecycle.signal })).catch(() => {});
    return () => lifecycle.abort();
  }, []);

  return (
    <main className={'experience stage-' + stage}>
      {stage === 'envelope' && <section className={'invitation ' + (opened ? 'is-open ' : '') + (transitioning ? 'departing' : '')} aria-label="Una carta de Claudia y Jorge">
        <div className="intro"><p className="eyebrow">UNA CARTA, SOLO PARA TI</p><h1>Claudia <i>&</i> Jorge</h1><p className="dedication">{guest ? 'PARA: ' + guest.toLocaleUpperCase('es') : 'PARA TI'}</p></div>
        <div className={'envelope ' + (opened ? 'opened' : '')}>
          <div className="lining" />
          <div className="flap"><div className="flap-front"/><div className="flap-back"/></div>
          <div className="papers" aria-hidden={!opened}>
            <figure className="photo photo-one"><img src={media.photos[0]} alt="Claudia y Jorge mirándose en una calle soleada" /><figcaption>un instante nuestro</figcaption></figure>
            <figure className="photo photo-two"><img src={media.photos[1]} alt="Claudia y Jorge, una fotografía de nuestra historia" /><figcaption>y todo lo que viene.</figcaption></figure>
            <div className="letter"><p className="letter-mark">C <i>&</i> J</p><h2>TENEMOS ALGO<br/>QUE CONTARLES</h2><button className="text-button" tabIndex={opened ? 0 : -1} disabled={!opened || transitioning} onClick={discover}>DESCUBRIR <span aria-hidden="true">↗</span></button></div>
          </div>
          <div className="pocket"/><div className="fold-left"/><div className="fold-right"/>
          <button className="seal" tabIndex={opened ? -1 : 0} disabled={opened} onClick={() => setOpened(true)} aria-label="Abrir la carta"><span>C</span><i>&</i><span>J</span></button>
          <span className="envelope-signature" aria-hidden="true">con cariño, C & J</span>
        </div>
        <p className="hint" aria-live="polite">{opened ? 'Hay historias que merecen ser compartidas.' : 'Toca el sello para abrir'}</p>
        <span className="edition" aria-hidden="true">HECHO DE MOMENTOS</span>
      </section>}

      {stage === 'film' && <section className="cinema" aria-label="Nuestra película">
        <h1 className="sr-only" tabIndex={-1} ref={heading}>Nuestra película</h1>
        {demo ? <div className="demo-film" role="img" aria-label={elapsed < 8 ? 'Imágenes de una pareja junto al mar.' : elapsed < 12 ? 'Claudia y Jorge: nos casamos.' : 'Save the Date. 12 de diciembre de 2026. Lima, Perú.'}>
          <img className={'film-photo first ' + (elapsed > 5 ? 'away' : '')} src={media.photos[0]} alt="" style={{transform: 'scale(' + (1 + Math.min(elapsed, 6) * .008) + ')'}}/>
          <img className={'film-photo second ' + (elapsed > 5 ? 'shown' : '')} src={media.photos[1]} alt="" style={{transform: 'scale(' + (1.08 - Math.max(0, elapsed - 5) * .004) + ')'}}/>
          <div className={'film-shade ' + (elapsed >= 8 ? 'shown' : '')}/>
          <div className="film-words" aria-live="polite" aria-atomic="true">
            {elapsed < 4 && <p key="one">Hay momentos<br/><i>que lo cambian todo.</i></p>}
            {elapsed >= 4 && elapsed < 8 && <p key="two">Y personas<br/><i>con quienes vivirlos.</i></p>}
            {elapsed >= 8 && elapsed < 12 && <div key="three"><span className="eyebrow">CLAUDIA & JORGE</span><p>Nos casamos.</p></div>}
            {elapsed >= 12 && <div key="four"><span className="eyebrow">SAVE THE DATE</span><p>12 · 12 · 26</p><span className="eyebrow">LIMA, PERÚ</span></div>}
          </div>
        </div> : <video ref={video} className="real-film" src={media.video} poster={media.photos[0]} playsInline preload="metadata" muted={muted} onPlay={()=>{setPlaying(true);setError('');}} onPause={()=>setPlaying(false)} onEnded={()=>setStage('date')} onError={()=>{setVideoError(true);setPlaying(false);}} onTimeUpdate={()=>setElapsed(video.current?.currentTime || 0)} />}
        {!demo && !videoError && elapsed >= 30 && <div className="real-film-reveal" aria-live="polite">{elapsed < 33 ? <><span className="eyebrow">CLAUDIA & JORGE</span><p>Nos casamos.</p></> : <><span className="eyebrow">SAVE THE DATE</span><p>12 · 12 · 26</p><span className="eyebrow">LIMA, PERÚ</span></>}</div>}
        {!demo && !playing && !videoError && <button className="film-play" onClick={togglePlayback}>VER NUESTRA PELÍCULA <span aria-hidden="true">▷</span></button>}
        {videoError && <div className="video-retry" role="alert"><p>No se pudo cargar nuestra película.</p><button onClick={()=>{setVideoError(false);setError('');video.current?.load();video.current?.play().catch(()=>setPlaying(false));}}>VOLVER A INTENTAR</button></div>}
        <div className="cinema-controls"><span className="film-credit">UNA PELÍCULA DE C & J</span><div><button onClick={togglePlayback}>{playing ? 'PAUSAR' : 'REPRODUCIR'}</button>{!demo && <button onClick={()=>setMuted(v=>!v)}>{muted ? 'ACTIVAR SONIDO' : 'SILENCIAR'}</button>}</div></div>
        {error && <p className="film-error" role="alert">{error}</p>}
      </section>}

      {stage === 'date' && <section className="date-page">
        <p className="eyebrow">SAVE THE DATE</p><h1 ref={heading} tabIndex={-1}>Nos casamos.</h1>
        <div className="date-photo"><img src={media.photos[0]} alt="Claudia y Jorge, juntos bajo la luz de la tarde"/><span>Claudia <i>&</i> Jorge</span></div>
        <Countdown/><p className="date-full">12 de diciembre de 2026 · Lima, Perú</p>
        <p className="personal-note">Lo mejor de nuestra historia<br/>también se escribe contigo.</p>
        <button className="primary-button" onClick={()=>setStage('rsvp')}>CONFIRMAR ASISTENCIA <span aria-hidden="true">↗</span></button>
        <p className="small-note">Pronto, todos los detalles.</p>
      </section>}

      {stage === 'rsvp' && <section className="rsvp-page">
        <button className="back-button" onClick={()=>setStage('date')}>← VOLVER</button><p className="eyebrow">12 · 12 · 26 — LIMA</p>
        <h1 ref={heading} tabIndex={-1}>¿Nos acompañas?</h1><p className="form-intro">Nos encantará compartir este día contigo.</p>
        <form onSubmit={submit}>
          <label htmlFor="name">Tu nombre completo</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} />
          <fieldset><legend>¿Podrás asistir?</legend><label className={'choice ' + (attendance==='yes'?'selected':'')}><input type="radio" name="attendance" value="yes" checked={attendance==='yes'} onChange={()=>setAttendance('yes')}/>Sí, ahí estaré</label><label className={'choice ' + (attendance==='no'?'selected':'')}><input type="radio" name="attendance" value="no" checked={attendance==='no'} onChange={()=>setAttendance('no')}/>Esta vez no podré</label></fieldset>
          <label htmlFor="message">Un mensaje para nosotros <span>(opcional)</span></label><textarea name="message" id="message" rows={3} maxLength={1000} placeholder="Los leemos con cariño…"/>
          <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input name="website" id="website" tabIndex={-1} autoComplete="off"/></div>
          <p className="privacy-note">Usaremos tu respuesta únicamente para organizar nuestra boda.</p>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button type="submit" className="primary-button" disabled={busy}>{busy ? 'GUARDANDO…' : 'ENVIAR RESPUESTA'} <span aria-hidden="true">↗</span></button>
        </form>
      </section>}

      {stage === 'thanks' && <section className="thanks-page"><p className="eyebrow">RESPUESTA RECIBIDA</p><span className="thanks-mark" aria-hidden="true">C<i>&</i>J</span><h1 ref={heading} tabIndex={-1}>Gracias, {name.trim().split(/\s+/)[0]}.</h1><p>{attendance === 'yes' ? 'Qué alegría saber que estarás con nosotros.' : 'Gracias por hacérnoslo saber. Te llevaremos con nosotros en este día.'}</p><p className="personal-note">Con todo nuestro cariño,<br/><i>Claudia & Jorge</i></p><Countdown/><p className="eyebrow">LIMA, PERÚ</p></section>}
    </main>
  );
}
