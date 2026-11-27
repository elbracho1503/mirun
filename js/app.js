// MiRun — lógica de la app. Busca secciones por marcador "// ---------- NOMBRE" (mapa en CLAUDE.md)
(function(){
  "use strict";

  // ---------- ÍCONOS ----------
  // Íconos de Lucide (https://lucide.dev, licencia ISC; ver docs/LICENCIAS.md), copiados aquí: nada se carga de internet.
  // Mismo trazo que el menú inferior (2 px, puntas redondas). ico('nombre') da el <svg> listo para poner en el HTML.
  const ICONS = {
    'award': '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
    'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m16 9-5.5 5.5L8 12"/>',
    'biceps-flexed': '<path d="M12.409 13.017A5 5 0 0 1 22 15c0 3.866-4 7-9 7-4.077 0-8.153-.82-10.371-2.462-.426-.316-.631-.832-.62-1.362C2.118 12.723 2.627 2 10 2a3 3 0 0 1 3 3 2 2 0 0 1-2 2c-1.105 0-1.64-.444-2-1"/><path d="M15 14a5 5 0 0 0-7.584 2"/><path d="M9.964 6.825C8.019 7.977 9.5 13 8 15"/>',
    'bike': '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'circle-check': '<circle cx="12" cy="12" r="10"/><path d="m16 9-5.5 5.5L8 12"/>',
    'circle-person-arms-spread': '<path d="m15 17-3-3"/><path d="M8 10s2 1 4 1 4-1 4-1"/><path d="m9 17 3-3v-3"/><circle cx="12" cy="12" r="10"/><circle cx="12" cy="7" r=".5" fill="currentColor"/>',
    'compass': '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
    'crown': '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
    'dumbbell': '<path d="M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z"/><path d="m2.5 21.5 1.4-1.4"/><path d="m20.1 3.9 1.4-1.4"/><path d="M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z"/><path d="m9.6 14.4 4.8-4.8"/>',
    'flame': '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
    'flower-2': '<path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"/><circle cx="12" cy="8" r="2"/><path d="M12 10v12"/><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"/><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"/>',
    'footprints': '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/><path d="M16 17h4"/><path d="M4 13h4"/>',
    'gem': '<path d="M10.5 3 8 9l4 13 4-13-2.5-6"/><path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z"/><path d="M2 9h20"/>',
    'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    'hourglass': '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'medal': '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
    'mountain-snow': '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/>',
    'pencil-line': '<path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    'person-standing': '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>',
    'rocket': '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09"/><path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05"/>',
    'route': '<path d="M9 5h8.5a1 1 0 010 7h-11a1 1 0 000 7H15"/><circle cx="18" cy="19" r="3"/><circle cx="6" cy="5" r="3"/>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'sparkles': '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
    'sprout': '<path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3"/><path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4"/><path d="M5 21h14"/>',
    'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'timer': '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    'trophy': '<path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/><path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/><path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/>',
    'volleyball': '<path d="M11 7a16 16 20 0 1 10.98 4.362"/><path d="M12 12a13 13 0 0 1-8.66 5"/><path d="M16.83 13.634a16 16 0 0 1-9.267 7.328"/><path d="M20.66 17A13 13 0 0 0 12 12a13 13 0 0 1 0-10"/><path d="M8.17 15.366a16 16 0 0 1-1.713-11.69"/><circle cx="12" cy="12" r="10"/>',
    'waves-horizontal': '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"/><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'zap': '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>'
  };
  function ico(k, cls){ return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[k] || '') + '</svg>'; }

  // ---------- STORAGE ----------
  const LS_LIMIT = 5242880; // caracteres (clave + valor) que Chrome deja guardar por sitio; medido el 2026-11-25
  const LS = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
    fails: 0, failNow: false, warned: {}, runUnsaved: null, persisted: false, rescue: new Set(),
    // devuelve true si se guardó. Sin espacio: avisa CADA vez (mode 'quiet' = sin aviso, para datos que la app rehace
    // sola; 'once' = una vez por carrera o sesión, para los respaldos automáticos cada pocos segundos).
    // failNow queda en true hasta terminar lo que se está haciendo: showSaved no dice "Guardado" si algo falló.
    set(k, v, mode){
      try{ localStorage.setItem(k, JSON.stringify(v)); }
      catch(e){
        LS.fails++; LS.failNow = true; setTimeout(()=>{ LS.failNow = false; });
        if(mode !== 'quiet' && !(mode === 'once' && LS.warned[k])){ LS.warned[k] = true; storageFullAlert(); }
        return false;
      }
      if(k === 'mirun_history' && Array.isArray(v)){
        // una carrera que no cupo al terminar quedó en su respaldo (mirun_current) o guardada aparte (RESCATE):
        // cuando ya entró al historial, se quitan
        if(LS.runUnsaved && v.some(h=>h && h.date === LS.runUnsaved)){ LS.runUnsaved = null; clearCurrentRun(); }
        LS.rescue.forEach(d=>{ if(v.some(h=>h && h.date === d)){ LS.rescue.delete(d); rescueDelete(d); } });
        setTimeout(spaceCheck);
      }
      return true;
    },
    // parte del límite usada (0 a 1)
    used(){
      let n = 0;
      try{ for(let i = 0; i < localStorage.length; i++){ const k = localStorage.key(i); n += k.length + (localStorage.getItem(k) || '').length; } }catch(e){}
      return n / LS_LIMIT;
    }
  };
  const NOT_SAVED = 'No se pudo guardar: la memoria está llena. Ve a Perfil → "Guardar copia".';
  function storageFullAlert(){
    alert('No se pudo guardar: la memoria de la app está llena.\n\nVe a Perfil → "Guardar copia" ahora: la copia incluye lo que no se pudo guardar (mientras no cierres la app).');
  }

  // texto de la persona dentro de HTML (nombres de rutinas y ejercicios propios): siempre escapado
  const esc = t=>String(t).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Ejercicios de las rutinas y límites (arriba porque el Historial los usa al cargar; ver MIS RUTINAS)
  const EXERCISES = [
    {k:'flexiones', n:'Flexiones'}, {k:'abdominales', n:'Abdominales'}, {k:'sentadillas', n:'Sentadillas'},
    {k:'zancadas', n:'Zancadas'}, {k:'burpees', n:'Burpees'}, {k:'tijera', n:'Saltos de tijera'},
    {k:'escaladores', n:'Escaladores'}, {k:'puente', n:'Puente de glúteos'}, {k:'fondos', n:'Fondos en silla'},
    {k:'elev_piernas', n:'Elevación de piernas'}, {k:'giros_rusos', n:'Giros rusos'}, {k:'rodillas_pecho', n:'Rodillas al pecho'},
    {k:'plancha', n:'Plancha'}, {k:'plancha_lateral', n:'Plancha lateral'}, {k:'sentadilla_pared', n:'Sentadilla en pared'},
    {k:'superman', n:'Superman'}, {k:'dominadas', n:'Dominadas'}];
  const RT_LIM = {routines:50, items:30, name:40, reps:[1,999], secs:[1,3600], sets:[1,20], rest:[1,600]};
  // orden y descanso de una rutina (modo guiado): mode 'ejercicio' (sin campo) o 'circuito'; rest = segundos (sin campo = sin descanso)
  function cleanRtMeta(x){
    const c = {}; if(!x || typeof x !== 'object') return c;
    if(x.mode === 'ejercicio' || x.mode === 'circuito') c.mode = x.mode;
    const r = Number(x.rest); if(Number.isInteger(r) && r >= RT_LIM.rest[0] && r <= RT_LIM.rest[1]) c.rest = r;
    return c;
  }
  // ---------- FRASES ----------
  // Frases motivacionales por categoría (texto del usuario). Una frase por día y por lugar, la misma todo el día,
  // sin repetir hasta agotar la categoría. 'fe' solo entra si profile.faith === true ("Incluir frases de fe", Perfil).
  // Lugares: inicio = cualquier categoría (junto a la mascota), correr = GPS antes de salir,
  // cortas = celebración de la meta, superacion = saludo al volver. Estado en mirun_phrases (no va en la copia).
  const PHRASES = {
    disciplina: ['La disciplina te lleva donde la motivación no alcanza.', 'No necesitas ser perfecto, necesitas ser constante.',
      'Hazlo incluso cuando no tengas ganas.', 'Cada pequeño esfuerzo construye grandes resultados.',
      'Tu compromiso debe ser más fuerte que tus excusas.', 'La constancia convierte lo imposible en realidad.',
      'Los resultados se construyen, no se improvisan.', 'Tu mejor versión te espera.'],
    superacion: ['Tu mayor competencia es quien eras ayer.', 'No entrenes para ser mejor que otros, entrena para superarte.',
      'Cada paso cuenta, incluso el más pequeño.', 'Sé más fuerte que tus excusas.', 'Descubre de lo que eres capaz.',
      'Que tu próximo logro sea superar tu propia marca.', 'No subestimes el poder de empezar de nuevo.'],
    correr: ['Tu meta comienza con un paso.', 'Cada kilómetro cuenta una historia.', 'No importa el ritmo, importa seguir avanzando.',
      'Corre por tus sueños, no por tus excusas.', 'Un kilómetro más, una excusa menos.', 'El camino también es parte de la victoria.',
      'Hoy corres un poco más lejos que ayer.'],
    cortas: ['Activa tu potencial.', 'Supera tus límites.', 'Conquista tu ritmo.', 'Haz que hoy cuente.', 'Construye tu mejor versión.',
      'Avanza a tu manera.', 'Tu esfuerzo tiene recompensa.', 'Entrena con propósito.', 'Cree. Entrena. Supera.', 'Hoy es tu oportunidad.',
      'Tu momento es ahora.', 'El progreso comienza contigo.'],
    fe: ['Dios te dio la fuerza, tú pon la disciplina.', 'Entrena tu cuerpo, fortalece tu espíritu.', 'Avanza con fe y perseverancia.',
      'Cuida el cuerpo que Dios te ha dado.', 'Todo lo puedo en Cristo que me fortalece.']
  };
  function phrasePool(slot){
    if(slot !== 'inicio') return PHRASES[slot] || [];
    return Object.keys(PHRASES).filter(k=>k !== 'fe' || profile.faith === true).reduce((a, k)=>a.concat(PHRASES[k]), []);
  }
  function dailyPhrase(slot){
    const pool = phrasePool(slot); if(!pool.length) return '';
    const today = dayKey(new Date());
    let all = LS.get('mirun_phrases', {}); if(!all || typeof all !== 'object' || Array.isArray(all)) all = {};
    const s = all[slot] && typeof all[slot] === 'object' ? all[slot] : {};
    if(s.day === today && pool.includes(s.text)) return s.text; // la misma todo el día
    let used = (Array.isArray(s.used) ? s.used : []).filter(t=>pool.includes(t));
    let left = pool.filter(t=>!used.includes(t));
    if(!left.length){ used = []; left = pool.filter(t=>t !== s.text); if(!left.length) left = pool.slice(); } // categoría agotada: otra vuelta
    const text = left[Math.floor(Math.random() * left.length)];
    used.push(text); all[slot] = {day: today, text, used}; LS.set('mirun_phrases', all, 'quiet');
    return text;
  }

  // ---------- PLANEADOR DE LA SEMANA ----------
  // mirun_weekplan = {"0".."6": id de rutina} (0 = domingo). Mis rutinas -> "Mi semana" lo edita; Inicio muestra
  // "Hoy toca". Esta parte corre antes que MIS RUTINAS, por eso lee las rutinas y la sesión directo de localStorage.
  function weekPlan(){ const p = LS.get('mirun_weekplan', {}); return p && typeof p === 'object' && !Array.isArray(p) ? p : {}; }
  const DAY2 = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];
  // minutos de esa rutina: promedio de sus sesiones guardadas (por id; las viejas sin id, por nombre). null = sin sesiones
  function routineAvgMin(r){
    const s = history.filter(h=>h.routine && (h.routine.rid ? h.routine.rid === r.id : h.routine.name === r.name));
    return s.length ? Math.max(1, Math.round(s.reduce((a, h)=>a + h.seconds, 0) / s.length / 60)) : null;
  }
  function renderTodayPlan(today, tk){
    const box = document.getElementById('todayPlan'), list = LS.get('mirun_routines', []);
    const r = Array.isArray(list) ? list.find(x=>x && x.id === weekPlan()[today.getDay()]) : null;
    const act = LS.get('mirun_session', null);
    if(!r && !(act && act.items)){ box.style.display = 'none'; return; }
    box.style.display = '';
    if(act && Array.isArray(act.items) && act.items.length){ // una sesión a medias manda: no se empieza otra encima
      box.innerHTML = `<div class="tpTxt">Tienes <b>${esc(act.name)}</b> a medias ${ico('biceps-flexed', 'tpIco')}</div>
        <div class="btnRow"><button class="btn btn-ghost" id="btnPlanGo">Seguir</button></div>`; return; }
    const done = history.some(h=>h.routine && dayKey(new Date(actRange(h)[0])) === tk && (h.routine.rid ? h.routine.rid === r.id : h.routine.name === r.name));
    if(done){ box.innerHTML = `<div class="tpTxt">Hoy tocaba <b>${esc(r.name)}</b>: ¡hecho! ${ico('circle-check', 'tpIco ok')}</div>`; return; }
    const m = routineAvgMin(r);
    box.innerHTML = `<div class="tpTxt">Hoy toca: <b>${esc(r.name)}</b> ${ico('biceps-flexed', 'tpIco')} ${m ? '¿Le sacamos ' + m + ' minutos?' : '¿Le sacamos un rato?'}</div>
      ${restDaysOn(today).includes(today.getDay()) ? '<div class="hint">Es tu día de descanso: solo si te animas.</div>' : ''}
      <div class="btnRow"><button class="btn btn-ghost" id="btnPlanGo" data-rid="${esc(r.id)}">Empezar</button></div>`;
  }

  // limpia los ejercicios de una rutina (copias importadas): solo campos conocidos y valores en rango.
  // withDone = sesión guardada en el Historial (lleva cuántas series se hicieron, de 0 a sets)
  function cleanRtItems(items, withDone){
    if(!Array.isArray(items)) return [];
    const out = [];
    items.slice(0, RT_LIM.items).forEach(it=>{
      if(!it || typeof it !== 'object') return;
      const kind = it.kind === 'secs' ? 'secs' : it.kind === 'reps' ? 'reps' : null;
      const amount = Number(it.amount), sets = Number(it.sets), lim = RT_LIM[kind];
      if(!kind || !Number.isInteger(amount) || amount < lim[0] || amount > lim[1]) return;
      if(!Number.isInteger(sets) || sets < RT_LIM.sets[0] || sets > RT_LIM.sets[1]) return;
      const c = {};
      if(EXERCISES.some(e=>e.k === it.ex)) c.ex = it.ex;
      else if(typeof it.name === 'string' && it.name.trim()) c.name = it.name.trim().slice(0, RT_LIM.name);
      else return;
      c.kind = kind; c.amount = amount; c.sets = sets;
      if(withDone){ const d = Number(it.done); c.done = Number.isInteger(d) && d >= 0 ? Math.min(d, sets) : 0; }
      out.push(c);
    });
    return out;
  }

  // Versión del formato de datos. Las migraciones SOLO agregan campos, nunca borran.
  const SCHEMA = 5;
  if(LS.get('mirun_schema', 0) < SCHEMA) LS.set('mirun_schema', SCHEMA, 'quiet');

  // ---------- UNIDADES ----------
  // Los datos se guardan SIEMPRE en km, kg y ritmo en segundos por km. Esto solo convierte al MOSTRAR
  // y al LEER lo que la persona escribe. profile.units: 'metric' (por defecto) o 'imperial' (mi, lb).
  const KM_MI = 1.609344, KG_LB = 2.20462262;
  function imp(){ return profile.units === 'imperial'; }
  function dU(){ return imp() ? 'mi' : 'km'; }                  // unidad de distancia
  function wU(){ return imp() ? 'lb' : 'kg'; }                  // unidad de peso
  function paceU(){ return imp() ? 'min/mi' : 'min/km'; }
  function toD(km){ return imp() ? km / KM_MI : km; }           // km -> lo que se muestra
  function fromD(v){ return imp() ? v * KM_MI : v; }            // lo que se escribe -> km
  function toW(kg){ return imp() ? kg * KG_LB : kg; }
  function fromW(v){ return imp() ? v / KG_LB : v; }
  function toPace(secPerKm){ return imp() ? secPerKm * KM_MI : secPerKm; } // seg por km o por milla
  function fmtD(km, dec){ return toD(km).toFixed(dec === undefined ? 2 : dec) + ' ' + dU(); }
  function paceTxt(seconds, km){ return km > 0 ? fmtPace(toPace(seconds / km)) : '--:--'; }
  // distancias de carrera: el nombre queda en km (5 km, 10 km) y en millas se agrega la equivalencia
  function raceTxt(k){ return k.toLocaleString('es-ES') + ' km' + (imp() ? ' (' + (k / KM_MI).toLocaleString('es-ES', {maximumFractionDigits:1}) + ' mi)' : ''); }
  // textos fijos del HTML marcados con estas clases
  function refreshUnitLabels(){
    const set = (sel, t)=>document.querySelectorAll(sel).forEach(e=>{ e.textContent = t; });
    set('.uD', dU()); set('.uDU', dU().toUpperCase()); set('.uW', wU()); set('.uP', paceU());
    set('.uDL', imp() ? 'Millas' : 'Kilómetros');
    set('.uDLr', imp() ? 'Millas recorridas' : 'Kilómetros recorridos');
  }

  // ---------- MASCOTA ----------
  // PERSONAJES: cada uno con su carpeta y sus poses (nombre de la pose -> archivo sin .png).
  // Brío (clave interna 'monster', archivos en img/mascota/) es el principal y el que se usa por defecto.
  // Agregar un personaje = sumar aquí su carpeta y sus poses. Una pose puede apuntar a otro archivo del
  // mismo personaje (Nova decidido = su 03_corriendo; Tizón cansado = su 08_agotado). Si falta una pose, se usa la de Brío.
  // Originales de las hojas de poses: respaldo/personajes-original/ (fuera de GitHub y del teléfono).
  const POSES_STD = {
    aprobacion:'01_aprobacion', pesas:'02_pesas', corriendo:'03_corriendo', carino:'04_carino',
    decidido:'05_decidido', pensando:'06_pensando', emocionado:'07_emocionado', agotado:'08_agotado',
    celebrando:'09_celebrando', cansado:'10_cansado', frustrado:'11_frustrado', estudiando:'12_estudiando',
    tu_puedes:'13_tu_puedes', durmiendo:'14_durmiendo', asomado:'15_asomado'};
  const CHARACTERS = {
    monster: {name:'Brío',   dir:'img/mascota/', poses: POSES_STD},
    zafira:  {name:'Zafira', dir:'img/zafira/',  poses: POSES_STD},
    nova:    {name:'Nova',   dir:'img/nova/',    poses: Object.assign({}, POSES_STD, {decidido:'03_corriendo'})},
    tizon:   {name:'Tizón',  dir:'img/tizon/',   poses: Object.assign({}, POSES_STD, {cansado:'08_agotado'})},
    // Rayo (rojo) y Jade (verde): misma tabla que Zafira (cansado = 10_cansado, la pose meditando)
    // Rayo: su dibujo de "tú puedes" no tiene pies, se usa "aprobacion" (pulgar arriba, cuerpo completo)
    rayo:    {name:'Rayo',   dir:'img/rayo/',    poses: Object.assign({}, POSES_STD, {tu_puedes:'01_aprobacion'})},
    jade:    {name:'Jade',   dir:'img/jade/',    poses: POSES_STD}
  };
  const DEFAULT_CHAR = 'monster';
  // personaje elegido en Perfil ("Elige tu compañero", profile.character). Esta sección corre antes que PROFILE,
  // por eso se lee directo del perfil guardado; setCharacter lo cambia después.
  let charKey = (LS.get('mirun_profile', null) || {}).character;
  if(!Object.prototype.hasOwnProperty.call(CHARACTERS, charKey)) charKey = DEFAULT_CHAR;
  function character(){ return CHARACTERS[charKey]; }
  function poseSrc(pose){
    const c = character(), f = c.poses[pose] ? c : CHARACTERS[DEFAULT_CHAR];
    return f.dir + f.poses[pose] + '.png';
  }
  // Qué pose se muestra en cada momento (nombre de pose, vale para cualquier personaje).
  // Para cambiar una pose: editar solo esta lista.
  const MASCOT = {
    hoy:        'tu_puedes',   // Inicio, todavía sin actividad hoy
    enCamino:   'decidido',    // Inicio, ya hay minutos hoy pero falta para la meta
    cumplido:   'emocionado',  // Inicio, meta del día cumplida (celebra)
    descanso:   'durmiendo',   // Inicio, día de descanso
    rota:       'cansado',     // Inicio, se rompió la racha (triste)
    logro:      'celebrando',  // aviso de logro nuevo (salta)
    legendario: 'aprobacion',  // aviso de logro legendario (salta)
    guardado:   'carino',      // al guardar una actividad
    guardadoLargo: 'agotado',  // al guardar una actividad de 60 min o más
    vacio:      'asomado',     // listas vacías
    cuerpo:     'estudiando',  // IMC y medidas
    error:      'pensando',    // error en un formulario
    meta:       'celebrando',  // celebración al cumplir la meta del día
    vuelta:     'carino',      // Inicio, vuelve después de 3 días o más sin actividad
    toque:      'carino',      // al tocar la mascota
    mareado:    'frustrado'    // al tocarla muchas veces seguidas
  };
  function mascot(k){ return poseSrc(MASCOT[k]); }
  // cambia la pose de una imagen de mascota (si está en medio de una reacción al toque, la deja para después)
  function setMascot(img, k){ const s = mascot(k); if(img.dataset.base) img.dataset.base = s; else img.src = s; }
  // imágenes fijas del HTML con data-pose="..." (siguen al personaje)
  function refreshPoseImgs(){ document.querySelectorAll('img[data-pose]').forEach(i=>{ i.src = poseSrc(i.dataset.pose); }); }
  refreshPoseImgs();
  // El teléfono guarda (para usar sin internet) SOLO las imágenes del compañero elegido: se le pide al
  // Service Worker con el mensaje 'mascota' (ver sw.js). keep = se descargan; spare = las de muestra del
  // selector de Perfil (no se descargan aquí, pero si ya se vieron no se borran).
  function syncCharacterCache(){
    if(!('serviceWorker' in navigator)) return;
    const c = character(), keep = [...new Set(Object.values(c.poses))].map(f=>c.dir + f + '.png');
    const spare = Object.values(CHARACTERS).map(x=>x.dir + x.poses.aprobacion + '.png');
    navigator.serviceWorker.ready.then(reg=>{ if(reg.active) reg.active.postMessage({type:'mascota', keep, spare}); }).catch(()=>{});
  }
  syncCharacterCache();
  // versión nueva de la app (caché nuevo): se vuelven a pedir las del elegido
  if('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', syncCharacterCache);
  // mensaje con la mascota pequeña al lado (formularios)
  function mascotMsg(el, k, text, color){
    el.innerHTML = `<span class="msgM"><img src="${mascot(k)}" alt=""><span></span></span>`;
    el.querySelector('span span').textContent = text;
    el.style.color = color;
  }
  // Movimiento (solo CSS, ver "MASCOTA: movimiento" en app.css): reposo = clase mIdle (respira);
  // reacción de una vez = mHop (salta), mCheer (celebra), mSad (se pone triste), mWave (saluda), mTilt (se inclina).
  // Con "reducir movimiento" del teléfono el CSS las apaga y solo cambia la pose.
  function mascotReact(img, cls){
    if(!img) return;
    img.classList.remove('mHop','mCheer','mSad','mWave','mTilt');
    void img.offsetWidth; // reinicia la animación aunque sea la misma
    img.classList.add(cls);
  }
  document.addEventListener('animationend', ev=>{
    if(/^m(Hop|Cheer|Sad|Wave|Tilt)$/.test(ev.animationName)) ev.target.classList.remove(ev.animationName);
  });
  let lastHomeMk = null; // último estado de la mascota de Inicio (para reaccionar solo al cambiar)
  // tocar la mascota: salta y pone cara de cariño; 5 toques seguidos (en 3 s) = mareada
  let tapTimes = [];
  function mascotTap(img){
    const now = Date.now();
    if(img._dizzyUntil > now) return; // mareada: los toques de más no cambian nada hasta que se le pase
    tapTimes = tapTimes.filter(t=>now - t < 3000).concat(now);
    if(!img.dataset.base) img.dataset.base = img.getAttribute('src');
    const dizzy = tapTimes.length >= 5;
    if(dizzy) img._dizzyUntil = now + 1600;
    img.src = mascot(dizzy ? 'mareado' : 'toque');
    mascotReact(img, dizzy ? 'mSad' : 'mHop');
    if(dizzy) tapTimes = [];
    clearTimeout(img._back);
    img._back = setTimeout(()=>{ img.src = img.dataset.base; delete img.dataset.base; }, 1600);
  }
  ['homeMascot','achMascot'].forEach(id=>{
    const i = document.getElementById(id);
    i.addEventListener('click', ()=>mascotTap(i));
  });
  // Gestos espontáneos de la mascota de Inicio cada 8 a 10 s: saltito, inclinación o cambio breve de pose.
  // Solo si Inicio está en pantalla y la app visible (si se oculta, el temporizador se detiene), sin otra capa
  // encima ni otra reacción en curso, y nunca con "reducir movimiento". Durmiendo no se mueve; triste solo se inclina.
  const GESTURE_POSES = ['aprobacion', 'emocionado', 'tu_puedes', 'carino'];
  let gestureTimer = 0;
  function scheduleGesture(){
    clearTimeout(gestureTimer);
    if(document.visibilityState === 'hidden') return;
    gestureTimer = setTimeout(()=>{ mascotGesture(); scheduleGesture(); }, 8000 + Math.random() * 2000);
  }
  function mascotGesture(){
    const hm = document.getElementById('homeMascot');
    if(reducedMotion() || document.visibilityState === 'hidden') return;
    if(!document.getElementById('tab-home').classList.contains('active')) return;
    if(document.querySelector('#summaryOverlay.show, #achOverlay.show, #welcome.show, #bigMap.show, #editSheet.show, #plusSheet.show, .celebrate')) return;
    if(hm.dataset.base || /\bm(Hop|Cheer|Sad|Wave|Tilt)\b/.test(hm.className)) return; // ya está reaccionando
    if(lastHomeMk === 'descanso') return;
    const g = lastHomeMk === 'rota' ? 1 : Math.floor(Math.random() * 3);
    if(g === 0){ mascotReact(hm, 'mHop'); return; }
    if(g === 1){ mascotReact(hm, 'mTilt'); return; }
    // cambio breve de pose (vuelve a la de siempre en 1,5 s)
    const now = hm.getAttribute('src'), opts = GESTURE_POSES.map(poseSrc).filter(x=>x !== now);
    hm.dataset.base = now;
    hm.src = opts[Math.floor(Math.random() * opts.length)];
    clearTimeout(hm._back);
    hm._back = setTimeout(()=>{ hm.src = hm.dataset.base; delete hm.dataset.base; }, 1500);
  }
  document.addEventListener('visibilitychange', scheduleGesture);
  scheduleGesture();

  // ---------- TIPOS DE ACTIVIDAD ----------
  // k = valor guardado en history[].type (sin type = 'correr'). met = gasto [baja, media, alta].
  // gps:true = se registra con la pantalla GPS (su gasto sale de la velocidad, ver calcCalories)
  const ACTIVITIES = [
    {k:'correr',     n:'Correr',              i:'footprints', gps:true},
    {k:'caminar',    n:'Caminar',             i:'person-standing', gps:true},
    {k:'bici',       n:'Bicicleta',           i:'bike', gps:true},
    {k:'gimnasio',   n:'Gimnasio',            i:'dumbbell', met:[3.5, 5.0, 6.0]},
    {k:'ejercicios', n:'Flexiones, abdominales, burpees', i:'biceps-flexed', met:[3.8, 5.0, 8.0]},
    {k:'natacion',   n:'Natación',            i:'waves-horizontal', met:[5.8, 8.0, 10.0]},
    {k:'deportes',   n:'Deportes',            i:'volleyball', met:[5.0, 7.0, 9.0]},
    {k:'baile',      n:'Baile',               i:'circle-person-arms-spread', met:[4.5, 5.5, 7.8]},
    {k:'yoga',       n:'Yoga / estiramiento', i:'flower-2', met:[2.5, 3.0, 4.0]},
    {k:'otros',      n:'Otra actividad',      i:'sparkles', met:[3.0, 4.5, 6.0]}
  ];
  const INTENSITY = ['baja', 'media', 'alta'];
  function actInfo(k){ return ACTIVITIES.find(a=>a.k === (k || 'correr')) || ACTIVITIES[ACTIVITIES.length-1]; }
  function typeName(k){ return actInfo(k).n; }
  function isRun(h){ return !h.type || h.type === 'correr'; }
  function selectedGpsType(){ const c = document.querySelector('#gpsTypeRow .chip.on'); return c ? c.dataset.gtype : 'correr'; }

  // perfil NUEVO (sin nada guardado): sexo 'x' (neutro) hasta que la persona elija otro.
  // Un perfil ya guardado se lee tal cual: su sexo no cambia.
  let profile = LS.get('mirun_profile', {weight:70, age:30, sex:'x'});
  let goal = LS.get('mirun_goal', {dist:null, time:null, paceMin:null, paceSec:null});
  let history = LS.get('mirun_history', []);
  let ivl = null, ivlNext = null; // entreno por intervalos en curso / elegido para la próxima salida (ver INTERVALOS)
  let zoneBuf = [], zoneOut = null, zoneOutSince = 0, zoneLastSay = -1e9; // zona de ritmo durante la carrera (ver ZONA DE RITMO)
  // nombres de los bloques de intervalos: arriba porque el Historial se dibuja al abrir y los usa (ver INTERVALOS)
  const IVL_LBL = {calentamiento:'Calentamiento', suave:'Suave', fuerte:'Fuerte', serie:'Serie', descanso:'Descanso', calma:'Vuelta a la calma', extra:'Después del entreno'};
  const IVL_K = Object.keys(IVL_LBL);
  let body = LS.get('mirun_body', []); // [{date:'AAAA-MM-DD', peso, barriga, biceps, muslo, pantorrilla}]

  // ---------- PASOS ----------
  // Pasos ESTIMADOS (no se guardan): distancia ÷ largo de paso. Paso = estatura × factor
  // (caminar: m 0.415, f 0.413, otro 0.414; correr: 0.65). Sin estatura en el perfil = null.
  function stepsOf(h){
    if(!(h.dist > 0) || !(profile.height > 0)) return null;
    const t = h.type || 'correr';
    if(t !== 'caminar' && t !== 'correr') return null;
    const f = t === 'correr' ? 0.65 : (profile.sex === 'f' ? 0.413 : profile.sex === 'm' ? 0.415 : 0.414);
    return Math.round(h.dist * 100000 / (profile.height * f)); // km -> cm ÷ paso en cm
  }
  function stepsTxt(h){ const s = stepsOf(h); return s ? '≈ ' + s.toLocaleString('es-ES') + ' pasos' : ''; }

  // ---------- TABS ----------
  // showTab('history') muestra una pantalla; también sirve para pantallas sin botón en el menú (goal)
  function showTab(tab){
    document.querySelectorAll('.tabBtn').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById('tab-'+tab).classList.add('active');
    document.body.dataset.tab = tab; // el CSS muestra el estado del GPS solo en la pantalla GPS
    window.scrollTo(0, 0);
    if(tab==='home') renderHome();
    if(tab==='history'){ histWeeks = 4; renderHistory(); }
    if(tab==='records'){ renderRecords(); renderAchievements(); }
    if(tab==='body') renderEvo();
    if(tab==='rutinas') renderRoutines();
    if(tab==='ivl') renderIvl();
    if(tab==='profile') renderSpace();
    if(tab==='run'){ const rp = document.getElementById('runPhrase'); if(rp) rp.textContent = dailyPhrase('correr');
      if(profile.mapMode !== 'linea' && navigator.onLine) loadLeaflet(); }
  }
  document.querySelectorAll('.tabBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>showTab(btn.dataset.tab));
  });
  // botones con data-goto="pantalla"
  document.addEventListener('click', (ev)=>{
    const b = ev.target.closest('[data-goto]');
    if(!b) return;
    showTab(b.dataset.goto);
  });
  // botón "+": si hay una actividad GPS en curso va directo a ella; si no, abre el menú de opciones
  const plusSheet = document.getElementById('plusSheet');
  document.getElementById('plusBtn').addEventListener('click', ()=>{
    if(running){ showTab('run'); return; }
    plusSheet.classList.add('show');
  });
  // Inicio: "Empezar actividad" hace lo mismo que el "+"
  document.getElementById('btnHomeStart').addEventListener('click', ()=>document.getElementById('plusBtn').click());
  plusSheet.addEventListener('click', (ev)=>{
    const o = ev.target.closest('[data-plus]');
    plusSheet.classList.remove('show'); // tocar fuera también cierra
    if(!o) return;
    if(o.dataset.plus === 'manual'){
      showTab('add'); document.getElementById('actForm').scrollIntoView({block:'start'}); // pantalla Registrar (#tab-add): actividad sin GPS arriba
    } else if(o.dataset.plus === 'carrera'){
      showTab('add'); document.getElementById('manForm').scrollIntoView({block:'start'}); // carrera sin GPS (a mano)
    } else if(o.dataset.plus === 'intervalos'){
      showTab('ivl'); // Intervalos con GPS (ver INTERVALOS)
    } else if(o.dataset.plus === 'rutina'){
      showTab('rutinas'); // Mis rutinas (ver MIS RUTINAS)
    } else {
      document.querySelectorAll('#gpsTypeRow .chip').forEach(c=>c.classList.toggle('on', c.dataset.gtype === o.dataset.plus));
      ivlNext = null; renderIvlPre(); // correr, caminar o bici normal: sin el entreno por intervalos elegido antes
      showTab('run');
    }
  });

  // fecha de hoy en formato del campo de fecha (AAAA-MM-DD, hora local)
  function todayStr(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function fmtShortDate(s){
    const d = /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + 'T12:00:00') : new Date(s);
    return d.toLocaleDateString('es-ES', {day:'numeric', month:'short', year:'2-digit'});
  }
  function fmtPace(secPerKm){
    const t = Math.round(secPerKm);
    return Math.floor(t/60) + ':' + String(t%60).padStart(2,'0');
  }

  function showSaved(){
    if(LS.failNow) return; // algo no se pudo guardar: ya avisó storageFullAlert
    const bar = document.getElementById('savedBar');
    bar.classList.add('show');
    clearTimeout(showSaved.t); showSaved.t = setTimeout(()=>bar.classList.remove('show'), 1500); // varios cambios seguidos: se ve hasta el último
  }

  // ---------- PROFILE ----------
  // objetivo físico y nivel de actividad (v5). El nivel sugiere la meta semanal si no se eligió otra en Metas.
  const GOAL_TYPES = ['salud','bajar','musculo','mantener','resistencia'];
  const LEVEL_WEEK = {sedentario:90, ligero:150, moderado:200, activo:250, muy:300};
  if(profile.voice === undefined) profile.voice = true; // voz activada por defecto
  if(profile.sounds === undefined) profile.sounds = true; // "Sonidos y vibración" de la celebración: encendidos por defecto
  if(profile.mapMode !== 'linea') profile.mapMode = 'calles'; // calles por defecto

  // llena el formulario con el perfil guardado (al abrir y después de recuperar una copia)
  function fillProfileForm(){
    const set = (id, v)=>{ document.getElementById(id).value = v; };
    set('profName', profile.name || '');
    set('profUnits', imp() ? 'imperial' : 'metric');
    set('profWeight', Math.round(toW(profile.weight) * 10) / 10); // se guarda en kg, se muestra en kg o lb
    set('profAge', profile.age);
    set('profHeight', profile.height || '');
    set('profSex', profile.sex);
    set('profGoalType', profile.goalType || 'salud');
    set('profLevel', profile.level || 'ligero');
    const on = (id, v)=>{ document.getElementById(id).checked = v; }; // interruptores
    on('profVoice', !!profile.voice);
    on('profSounds', profile.sounds !== false);
    on('profFaith', profile.faith === true); // frases de fe: sin campo = apagado
    on('profAutoPause', profile.autoPause !== false); // sin campo = encendida
    set('profMap', profile.mapMode);
    if(typeof renderVoicePick === 'function') renderVoicePick();
    refreshLevelHint(); refreshHello(); refreshAvatars(); refreshUnitLabels();
  }
  function refreshLevelHint(){
    const lv = document.getElementById('profLevel').value;
    document.getElementById('levelHint').textContent = 'Meta semanal sugerida: ' + LEVEL_WEEK[lv] + ' min' +
      (goal.weekMin ? '. Tú elegiste ' + goal.weekMin + ' min en Metas.' : ', se usa mientras no elijas otra en Metas.');
  }
  document.getElementById('profLevel').addEventListener('change', refreshLevelHint);

  // "Elige tu compañero": se guarda al tocar (profile.character) y la mascota cambia en toda la app.
  // Cada opción muestra la pose "aprobación" de ese personaje.
  function renderCharPick(){
    document.getElementById('charPick').innerHTML = Object.keys(CHARACTERS).map(k=>{ const c = CHARACTERS[k], on = k === charKey;
      return `<button class="charOpt${on ? ' on' : ''}" data-char="${k}" aria-pressed="${on}">
        <img src="${c.dir + c.poses.aprobacion}.png" alt="" loading="lazy"><span>${c.name}</span></button>`; }).join('');
  }
  function setCharacter(k){
    charKey = Object.prototype.hasOwnProperty.call(CHARACTERS, k) ? k : DEFAULT_CHAR;
    profile.character = charKey; LS.set('mirun_profile', profile);
    refreshPoseImgs(); renderCharPick(); renderHome(); syncCharacterCache();
    const img = document.querySelector('#charPick .charOpt.on img'); if(img) mascotReact(img, 'mHop'); // saluda el elegido
    showSaved();
  }
  document.getElementById('charPick').addEventListener('click', ev=>{
    const b = ev.target.closest('[data-char]'); if(b && b.dataset.char !== charKey) setCharacter(b.dataset.char);
  });
  renderCharPick();
  // saludo en la cabecera: "Hola, Nombre" o la marca si no hay nombre
  function refreshHello(){
    const h = document.getElementById('hello');
    if(profile.name) h.textContent = 'Hola, ' + profile.name; else h.innerHTML = 'Mi<span>Run</span>';
  }

  // Foto de perfil: al elegirla se abre "Ajusta tu foto" (photoCrop): se mueve con el dedo y se acerca o aleja (pellizco,
  // control deslizante o rueda). "Listo" guarda lo que se ve en el círculo a 256 px (JPEG ~30 KB) en mirun_photo, igual
  // que antes; "Cancelar" deja la foto anterior.
  // Sin foto: iniciales del nombre sobre azul, o un ícono si no hay nombre (decisión del usuario 2026-11-08; antes, círculo negro).
  // iniciales del nombre (primera letra de la primera y de la última palabra), para cuando no hay foto
  function initials(name){
    const w = String(name || '').trim().split(/\s+/).filter(Boolean);
    if(!w.length) return '';
    return ((w[0][0] || '') + (w.length > 1 ? w[w.length-1][0] : '')).toLocaleUpperCase('es-ES');
  }
  const AVATAR_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
  function refreshAvatars(){
    const ph = LS.get('mirun_photo', null), ini = initials(profile.name);
    ['hdrAvatar','profAvatar'].forEach(id=>{
      const el = document.getElementById(id);
      el.style.backgroundImage = ph ? 'url("' + ph + '")' : '';
      el.classList.toggle('noPhoto', !ph); // sin foto: iniciales (o un ícono si no hay nombre)
      if(ph) el.textContent = '';
      else if(ini) el.textContent = ini;
      else el.innerHTML = AVATAR_ICON;
    });
    document.getElementById('btnPhotoDel').style.display = ph ? '' : 'none';
  }
  const photoFile = document.getElementById('photoFile');
  document.getElementById('btnPhoto').addEventListener('click', ()=>photoFile.click());
  photoFile.addEventListener('change', ()=>{
    const f = photoFile.files && photoFile.files[0]; photoFile.value = '';
    if(!f || !/^image\//.test(f.type)) return;
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = ()=>{ URL.revokeObjectURL(url); openPhotoCrop(img); };
    img.onerror = ()=>{ URL.revokeObjectURL(url); alert('No se pudo abrir esa imagen.'); };
    img.src = url;
  });
  // "Ajusta tu foto": z = acercamiento (1 = el lado corto llena el círculo), ox/oy = desplazamiento en px de pantalla
  const pc = {el: document.getElementById('photoCrop'), stage: document.getElementById('pcStage'), cv: document.getElementById('pcCanvas'),
              zoom: document.getElementById('pcZoom'), img: null, z: 1, ox: 0, oy: 0, ptrs: new Map(), pinch: null};
  function pcSize(){ return pc.stage.clientWidth; }
  function pcBase(){ return pcSize() / Math.min(pc.img.width, pc.img.height); } // escala con z = 1
  function pcClamp(){ // la foto siempre cubre todo el círculo
    const D = pcSize(), k = pcBase() * pc.z, mx = Math.max(0, (pc.img.width * k - D) / 2), my = Math.max(0, (pc.img.height * k - D) / 2);
    pc.ox = Math.max(-mx, Math.min(mx, pc.ox)); pc.oy = Math.max(-my, Math.min(my, pc.oy));
  }
  function pcDraw(){
    const D = pcSize(), r = window.devicePixelRatio || 1, k = pcBase() * pc.z, ctx = pc.cv.getContext('2d');
    pc.cv.width = Math.round(D * r); pc.cv.height = Math.round(D * r); pc.cv.style.width = pc.cv.style.height = D + 'px';
    ctx.setTransform(r, 0, 0, r, 0, 0); ctx.clearRect(0, 0, D, D);
    const w = pc.img.width * k, h = pc.img.height * k;
    ctx.drawImage(pc.img, D / 2 + pc.ox - w / 2, D / 2 + pc.oy - h / 2, w, h);
  }
  function pcSetZoom(z){ pc.z = Math.max(1, Math.min(4, z)); pc.zoom.value = pc.z; pcClamp(); pcDraw(); }
  function openPhotoCrop(img){
    pc.img = img; pc.z = 1; pc.ox = 0; pc.oy = 0; pc.ptrs.clear(); pc.pinch = null; pc.zoom.value = 1;
    pc.el.classList.add('show'); document.body.classList.add('noScroll');
    requestAnimationFrame(pcDraw);
  }
  function closePhotoCrop(){ pc.el.classList.remove('show'); document.body.classList.remove('noScroll'); pc.img = null; }
  pc.zoom.addEventListener('input', ()=>pcSetZoom(Number(pc.zoom.value)));
  pc.cv.addEventListener('wheel', ev=>{ ev.preventDefault(); pcSetZoom(pc.z * (ev.deltaY < 0 ? 1.08 : 1 / 1.08)); }, {passive: false});
  pc.cv.addEventListener('pointerdown', ev=>{ try{ pc.cv.setPointerCapture(ev.pointerId); }catch(e){} pc.ptrs.set(ev.pointerId, {x: ev.clientX, y: ev.clientY}); pc.pinch = null; });
  pc.cv.addEventListener('pointermove', ev=>{
    const p = pc.ptrs.get(ev.pointerId); if(!p) return;
    if(pc.ptrs.size === 1){ pc.ox += ev.clientX - p.x; pc.oy += ev.clientY - p.y; } // un dedo: mover
    p.x = ev.clientX; p.y = ev.clientY;
    if(pc.ptrs.size === 2){ // dos dedos: pellizco
      const [a, b] = [...pc.ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
      if(pc.pinch) pc.z = Math.max(1, Math.min(4, pc.pinch.z * d / pc.pinch.d)); else pc.pinch = {d, z: pc.z};
      pc.zoom.value = pc.z;
    }
    pcClamp(); pcDraw();
  });
  const pcUp = ev=>{ pc.ptrs.delete(ev.pointerId); pc.pinch = null; };
  pc.cv.addEventListener('pointerup', pcUp); pc.cv.addEventListener('pointercancel', pcUp);
  document.getElementById('btnPcCancel').addEventListener('click', closePhotoCrop); // la foto anterior queda igual
  document.addEventListener('keydown', ev=>{ if(ev.key === 'Escape' && pc.el.classList.contains('show')) closePhotoCrop(); });
  document.getElementById('btnPcOk').addEventListener('click', ()=>{
    // lo que se ve dentro del cuadro (el círculo) pasa a 256 x 256, igual que antes
    const D = pcSize(), k = pcBase() * pc.z, S = 256, c = document.createElement('canvas');
    const sx = (pc.img.width * k / 2 - D / 2 - pc.ox) / k, sy = (pc.img.height * k / 2 - D / 2 - pc.oy) / k, s = D / k;
    c.width = c.height = S;
    c.getContext('2d').drawImage(pc.img, sx, sy, s, s, 0, 0, S, S);
    closePhotoCrop();
    if(LS.set('mirun_photo', c.toDataURL('image/jpeg', 0.82))){ refreshAvatars(); showSaved(); }
  });
  document.getElementById('btnPhotoDel').addEventListener('click', ()=>{
    if(!confirm('¿Quitar tu foto de perfil?')) return;
    try{ localStorage.removeItem('mirun_photo'); }catch(e){}
    refreshAvatars();
  });
  fillProfileForm();

  // al cambiar la unidad, el peso escrito se convierte en el momento (dataset.prev = unidad que muestra)
  const profUnits = document.getElementById('profUnits');
  profUnits.dataset.prev = profUnits.value;
  profUnits.addEventListener('change', ()=>{
    const el = document.getElementById('profWeight'), v = parseFloat(el.value), to = profUnits.value;
    if(v > 0 && to !== profUnits.dataset.prev) el.value = Math.round((to === 'imperial' ? v * KG_LB : v / KG_LB) * 10) / 10;
    profUnits.dataset.prev = to;
    document.querySelectorAll('#tab-profile .uW').forEach(e=>{ e.textContent = to === 'imperial' ? 'lb' : 'kg'; });
  });

  // Perfil: se guarda al cambiar cualquier ajuste (sin botón "Guardar perfil"); mismos campos y reglas que antes
  const PROF_FIELDS = ['profName','profUnits','profWeight','profAge','profHeight','profSex','profGoalType','profLevel',
                       'profVoice','profSounds','profFaith','profAutoPause','profMap','profVoiceName'];
  document.getElementById('tab-profile').addEventListener('change', ev=>{ if(PROF_FIELDS.includes(ev.target.id)){ clearTimeout(profTypeT); saveProfile(); } });
  // los campos de texto también se guardan mientras se escribe: 1 s después de la última tecla (por si se cierra la app
  // sin salir del campo). Así no se reescribe el campo que se está usando (typing = true).
  const PROF_TYPED = ['profName','profWeight','profAge','profHeight'];
  let profTypeT = null;
  document.getElementById('tab-profile').addEventListener('input', ev=>{
    const t = ev.target; if(!PROF_TYPED.includes(t.id)) return;
    clearTimeout(profTypeT);
    profTypeT = setTimeout(()=>{
      // un número a medio escribir ("64." o vacío) no se guarda: se espera al resto o al salir del campo
      if(t.type === 'number' && (t.value === '' || (t.validity && t.validity.badInput))) return;
      saveProfile(true);
    }, 1000);
  });
  function saveProfile(typing){
    const units = profUnits.value, wIn = parseFloat(document.getElementById('profWeight').value);
    const wKg = wIn > 0 ? (units === 'imperial' ? wIn / KG_LB : wIn) : 70; // el peso se guarda en kg
    // si el número que se ve es el mismo que había (solo se cambió la unidad), se conserva el peso exacto
    const shownBefore = Math.round((units === 'imperial' ? profile.weight * KG_LB : profile.weight) * 10) / 10;
    const keepW = wIn === shownBefore;
    // Object.assign conserva campos que esta pantalla no muestra (no se pierden datos)
    profile = Object.assign(profile, {
      name: document.getElementById('profName').value.trim().slice(0,30),
      units: units,
      weight: keepW ? profile.weight : Math.round(wKg * 100) / 100,
      age: parseInt(document.getElementById('profAge').value)||30,
      height: (h=>h >= 100 && h <= 250 ? h : null)(parseInt(document.getElementById('profHeight').value)),
      sex: document.getElementById('profSex').value,
      goalType: document.getElementById('profGoalType').value,
      level: document.getElementById('profLevel').value,
      voice: document.getElementById('profVoice').checked,
      sounds: document.getElementById('profSounds').checked,
      faith: document.getElementById('profFaith').checked, // "Frases de fe"
      autoPause: document.getElementById('profAutoPause').checked, // pausa automática en GPS
      mapMode: document.getElementById('profMap').value,
      voiceName: document.getElementById('profVoiceName').value.slice(0, 100) // '' = Automática
    });
    if(typeof refreshLiveMap === 'function') refreshLiveMap();
    LS.set('mirun_profile', profile);
    refreshHello(); refreshAvatars();
    // las unidades cambian lo que se muestra en varias pantallas
    if(typing){ refreshHello(); refreshAvatars(); showSaved(); return; } // sin tocar lo que se está escribiendo
    fillProfileForm(); profUnits.dataset.prev = profUnits.value;
    loadGoalForm(); refreshGoalLabels(); buildBodyForm();
    showSaved();
  }

  // ---------- GOAL ----------
  // la meta se guarda en km y min/km; aquí se muestra en la unidad elegida (ver UNIDADES)
  function goalPaceShown(){ // [min, seg] del ritmo objetivo en min/km o min/mi, o null
    if(goal.paceMin == null || goal.paceMin === '') return null;
    const t = Math.round(toPace(goal.paceMin * 60 + (goal.paceSec || 0)));
    return [Math.floor(t / 60), t % 60];
  }
  function loadGoalForm(){
    document.getElementById('goalDist').value = goal.dist ? Math.round(toD(goal.dist) * 100) / 100 : '';
    document.getElementById('goalTime').value = goal.time || '';
    const gp = goalPaceShown();
    document.getElementById('paceMin').value = gp ? gp[0] : '';
    document.getElementById('paceSec').value = gp ? gp[1] : '';
    renderZoneForms();
  }
  loadGoalForm();

  function refreshGoalLabels(){
    document.getElementById('goalDistLbl').textContent = goal.dist ? fmtD(goal.dist, toD(goal.dist) % 1 ? 1 : 0) : '--';
    document.getElementById('goalTimeLbl').textContent = goal.time ? goal.time+' min' : '--';
    const gp = goalPaceShown();
    document.getElementById('goalPaceLbl').textContent = gp ? pad(gp[0]) + ':' + pad(gp[1]) : '--';
  }
  refreshGoalLabels();

  // racha y metas de actividad (campos agregados en v5; si no existen se usan estos valores)
  const DEF_DAILY = 20, DEF_WEEK = 150;
  function dailyMin(){ return goal.dailyMin || DEF_DAILY; }
  function weekMin(){ return goal.weekMin || LEVEL_WEEK[profile.level] || DEF_WEEK; } // sin meta propia: la del nivel
  // Descanso PROGRAMADO: goal.restPlan = [{from:'AAAA-MM-DD' (un lunes), days:[0..6]}].
  // Cada cambio rige desde el lunes siguiente, así no se puede "rescatar" un día ya perdido.
  // goal.restDays (v5 temprano) se lee como un plan vigente desde siempre.
  const WD = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  function mondayOf(d){ const m = new Date(d); m.setHours(12,0,0,0); m.setDate(m.getDate() - ((m.getDay()+6) % 7)); return m; }
  function nextMonday(){ const m = mondayOf(new Date()); m.setDate(m.getDate() + 7); return m; }
  function restPlan(){
    if(Array.isArray(goal.restPlan)) return goal.restPlan;
    return Array.isArray(goal.restDays) && goal.restDays.length ? [{from:'2000-01-03', days:goal.restDays}] : [];
  }
  function restDaysOn(d){ const k = dayKey(d); let days = []; restPlan().forEach(p=>{ if(p.from <= k) days = p.days; }); return days; }
  function restDays(){ return restDaysOn(nextMonday()); } // lo que se edita: el plan desde el próximo lunes
  function loadStreakForm(){
    document.getElementById('goalDailyMin').value = goal.dailyMin || '';
    document.getElementById('goalWeekMin').value = goal.weekMin || '';
    document.querySelectorAll('#restChips .chip').forEach(c=>c.classList.toggle('on', restDays().includes(+c.dataset.wd)));
    const now = restDaysOn(new Date()), nm = nextMonday();
    document.getElementById('restNote').textContent = 'Esta semana: ' + (now.length ? now.map(x=>WD[x]).join(', ') : 'sin descanso') +
      '. Lo que marques aquí empieza el lunes ' + nm.getDate() + '/' + (nm.getMonth()+1) + '.';
  }
  loadStreakForm();
  document.getElementById('restChips').addEventListener('click', (ev)=>{
    const c = ev.target.closest('.chip'); if(!c) return;
    if(!c.classList.contains('on') && document.querySelectorAll('#restChips .chip.on').length >= 3){
      alert('Máximo 3 días de descanso por semana.'); return;
    }
    c.classList.toggle('on');
  });

  document.getElementById('btnSaveGoal').addEventListener('click', ()=>{
    const zr = readZone('zoneGoal'); // zona de ritmo: si está mal escrita, no se guarda nada y se avisa
    if(zr.error){ const m = document.getElementById('zoneGoalMsg'); m.textContent = zr.error; m.style.color = 'var(--amber)'; return; }
    if(zr.zone) goal.zone = zr.zone; else delete goal.zone;
    const dm = parseInt(document.getElementById('goalDailyMin').value);
    const wm = parseInt(document.getElementById('goalWeekMin').value);
    // ritmo objetivo escrito en min/km o min/mi -> segundos por km
    const pmIn = document.getElementById('paceMin').value, psIn = document.getElementById('paceSec').value;
    const paceShown = pmIn !== '' ? (parseInt(pmIn) || 0) * 60 + (parseInt(psIn) || 0) : 0;
    // en min/mi se redondea a 0,1 s por km: así vuelve a mostrarse exacto lo escrito (a segundo entero no siempre)
    const paceKm = paceShown > 0 ? (imp() ? Math.round(paceShown / KM_MI * 10) / 10 : paceShown) : 0;
    // si lo que se ve no cambió, se conserva el valor guardado exacto (evita redondeos al convertir)
    const gp = goalPaceShown(), distIn = document.getElementById('goalDist').value;
    const keepDist = goal.dist && parseFloat(distIn) === Math.round(toD(goal.dist) * 100) / 100;
    const keepPace = gp && pmIn !== '' && parseInt(pmIn) === gp[0] && (parseInt(psIn) || 0) === gp[1];
    const newRest = [...document.querySelectorAll('#restChips .chip.on')].map(c=>+c.dataset.wd).sort();
    if(newRest.join() !== restDays().slice().sort().join()){
      const nk = dayKey(nextMonday()); // reemplaza lo que estuviera programado desde ese lunes
      goal.restPlan = restPlan().filter(p=>p.from < nk).concat([{from: nk, days: newRest}]);
    }
    // Object.assign conserva cualquier otro campo de la meta
    goal = Object.assign(goal, {
      // se guarda en km; escrita en millas se redondea al metro (3 decimales)
      dist: keepDist ? goal.dist : ((d=>imp() ? Math.round(d * 1000) / 1000 : d)(fromD(parseFloat(document.getElementById('goalDist').value)))||null),
      time: parseFloat(document.getElementById('goalTime').value)||null,
      paceMin: keepPace ? goal.paceMin : (paceKm ? Math.floor(paceKm / 60) : null), // se guarda en min/km
      paceSec: keepPace ? goal.paceSec : (paceKm ? Math.round((paceKm - Math.floor(paceKm / 60) * 60) * 10) / 10 : null), // nunca 60
      dailyMin: dm > 0 ? Math.min(60, Math.max(10, dm)) : null, // racha: entre 10 y 60 min
      weekMin: wm > 0 ? Math.min(3000, wm) : null
    });
    LS.set('mirun_goal', goal);
    loadStreakForm();
    refreshGoalLabels();
    showSaved();
    showTab('home');
  });

  // ---------- ROUTE DRAWING (canvas, no internet needed) ----------
  // ---------- RUTA LIVIANA ----------
  // Rutas NUEVAS (desde 2026-11-25): campo route = [[lat, lon], ...] con 5 decimales (1,1 m) y sin los puntos que no
  // cambian la forma (Douglas-Peucker, 2 m), y path = []. Las rutas viejas siguen en path = [{lat, lon}] sin cambios.
  // Distancia, ritmo, splits y récords se calculan DURANTE la carrera con todos los puntos: la ruta guardada solo dibuja.
  const ROUTE_TOL_M = 2;
  function lightRoute(pts){
    const n = pts.length; if(n < 2) return pts.map(p=>[Math.round(p.lat * 1e5) / 1e5, Math.round(p.lon * 1e5) / 1e5]);
    const lat0 = pts[0].lat * Math.PI / 180, mx = 111320 * Math.cos(lat0), my = 110540;
    const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1;
    const stack = [[0, n - 1]];
    while(stack.length){
      const [a, b] = stack.pop(); if(b - a < 2) continue;
      const ax = pts[a].lon * mx, ay = pts[a].lat * my, bx = pts[b].lon * mx - ax, by = pts[b].lat * my - ay, len = Math.hypot(bx, by);
      let far = -1, fd = 0;
      for(let i = a + 1; i < b; i++){
        const px = pts[i].lon * mx - ax, py = pts[i].lat * my - ay;
        const d = len ? Math.abs(px * by - py * bx) / len : Math.hypot(px, py);
        if(d > fd){ fd = d; far = i; }
      }
      if(fd > ROUTE_TOL_M){ keep[far] = 1; stack.push([a, far], [far, b]); }
    }
    const out = [];
    for(let i = 0; i < n; i++) if(keep[i]) out.push([Math.round(pts[i].lat * 1e5) / 1e5, Math.round(pts[i].lon * 1e5) / 1e5]);
    return out;
  }
  // puntos para dibujar una actividad, en cualquiera de los dos formatos: [{lat, lon}]
  function routeOf(h){
    if(h && Array.isArray(h.route) && h.route.length) return h.route.map(p=>({lat: p[0], lon: p[1]}));
    return h && Array.isArray(h.path) ? h.path : [];
  }

  function drawRoute(canvas, points, color){
    if(!canvas || !points || points.length < 2) {
      if(canvas){
        const ctx = canvas.getContext('2d');
        const w = canvas.clientWidth, h = canvas.clientHeight;
        canvas.width = w * (window.devicePixelRatio||1);
        canvas.height = h * (window.devicePixelRatio||1);
        ctx.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
      }
      return;
    }
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,w,h);

    const lats = points.map(p=>p.lat), lons = points.map(p=>p.lon);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const pad = 14;
    const spanLat = (maxLat-minLat)||0.0001;
    const spanLon = (maxLon-minLon)||0.0001;
    const scaleX = (w-pad*2)/spanLon;
    const scaleY = (h-pad*2)/spanLat;
    const scale = Math.min(scaleX, scaleY);
    const offX = (w - spanLon*scale)/2;
    const offY = (h - spanLat*scale)/2;

    function toXY(p){
      const x = offX + (p.lon-minLon)*scale;
      const y = h - (offY + (p.lat-minLat)*scale);
      return [x,y];
    }

    ctx.beginPath();
    points.forEach((p,i)=>{
      const [x,y] = toXY(p);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color || '#4d9bff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    const [sx,sy] = toXY(points[0]);
    ctx.beginPath(); ctx.arc(sx,sy,4.5,0,Math.PI*2); ctx.fillStyle='#eef3ff'; ctx.fill();
    const [ex,ey] = toXY(points[points.length-1]);
    ctx.beginPath(); ctx.arc(ex,ey,4.5,0,Math.PI*2); ctx.fillStyle=color||'#4d9bff'; ctx.fill();
  }

  // ---------- MAPA CON CALLES (OpenStreetMap + Leaflet) ----------
  // Si se eligio "calles", hay internet y la libreria cargo: mapa real.
  // Si no: la linea dibujada de siempre (drawRoute), que no necesita internet.
  const streetMaps = {};
  // Leaflet (lib/leaflet.js y .css) se carga recién cuando se pide un mapa con calles (o al entrar al GPS), no al
  // abrir la app. Mientras carga (o sin internet) se ve la línea de siempre; al terminar, 'leafletready' redibuja.
  let leafletP = null;
  function loadLeaflet(){
    if(window.L) return Promise.resolve(true);
    if(leafletP) return leafletP;
    leafletP = new Promise(res=>{
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'lib/leaflet.css'; document.head.appendChild(css);
      const s = document.createElement('script'); s.src = 'lib/leaflet.js';
      s.onload = ()=>{ res(true); document.dispatchEvent(new Event('leafletready')); };
      s.onerror = ()=>{ leafletP = null; s.remove(); res(false); }; // se reintenta la próxima vez
      document.head.appendChild(s);
    });
    return leafletP;
  }
  // texto bajo el mapa cuando se pidió "calles" pero se ve la línea
  function streetsNote(){ return navigator.onLine && leafletP && !window.L ? 'Cargando el mapa con calles…' : 'Sin internet: mostrando solo la línea'; }
  function streetsAvailable(mode){ // mode: vista pedida ('calles' o 'linea'); sin mode = la del Perfil
    const want = (mode || profile.mapMode) !== 'linea' && navigator.onLine;
    if(want && typeof window.L === 'undefined') loadLeaflet();
    return want && typeof window.L !== 'undefined';
  }
  document.addEventListener('leafletready', ()=>{
    if(running) refreshLiveMap();
    if(bigMap.el.classList.contains('show') && bigMap.mode !== 'linea') showBigMap();
    if(document.getElementById('summaryOverlay').classList.contains('show') && sumPath.length > 1){
      const c = document.getElementById('sumMap'), dv = document.getElementById('sumStreet');
      try{ renderRoute('sum', c, dv, sumPath, '#4d9bff', false); }catch(e){}
    }
  });
  function renderRoute(key, canvas, div, points, color, follow, mode){
    if(!streetsAvailable(mode)){
      div.style.display = 'none';
      canvas.style.display = 'block';
      drawRoute(canvas, points, color);
      return 'linea';
    }
    canvas.style.display = 'none';
    div.style.display = 'block';
    let m = streetMaps[key];
    if(!m){
      const map = L.map(div, {zoomControl:false, attributionControl:false});
      L.control.attribution({prefix:false}).addTo(map);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom:19, attribution:'© OpenStreetMap'
      }).addTo(map);
      const line = L.polyline([], {color:color, weight:5, opacity:.95, lineJoin:'round'}).addTo(map);
      const start = L.circleMarker([0,0], {radius:5, color:'#070d1f', weight:2, fillColor:'#eef3ff', fillOpacity:1});
      const dot = L.circleMarker([0,0], {radius:8, color:'#070d1f', weight:3, fillColor:color, fillOpacity:1});
      m = streetMaps[key] = {map, line, start, dot, n:-1, touchedAt:0, centered:false};
      // si mueves el mapa con el dedo, deja de seguirte 15 s
      map.on('dragstart zoomstart', ()=>{ m.touchedAt = Date.now(); });
    }
    m.map.invalidateSize();
    if(points.length === 0) return 'calles';
    const ll = points.map(p=>[p.lat, p.lon]);
    // el mapa necesita una posicion antes de dibujar encima
    if(!m.centered){ m.map.setView(ll[ll.length-1], 17); m.centered = true; }
    if(m.n !== points.length){
      m.n = points.length;
      m.line.setLatLngs(ll);
      m.start.setLatLng(ll[0]);
      m.dot.setLatLng(ll[ll.length-1]);
      if(!m.map.hasLayer(m.start)) m.start.addTo(m.map);
      if(!m.map.hasLayer(m.dot)) m.dot.addTo(m.map); // se agrega despues: queda encima
    }
    if(follow){
      if(Date.now() - m.touchedAt > 15000) m.map.panTo(ll[ll.length-1], {animate:true});
    } else if(ll.length > 1){
      m.map.fitBounds(m.line.getBounds(), {padding:[24,24], maxZoom:17});
    } else {
      m.map.setView(ll[0], 17);
    }
    return 'calles';
  }
  function resetStreetMap(key){
    const m = streetMaps[key];
    if(m){ m.n = -1; m.centered = false; m.touchedAt = 0; m.line.setLatLngs([]); m.start.remove(); m.dot.remove(); }
  }

  // ---------- MAPA GRANDE (pantalla completa) ----------
  // Botón "Ver mapa" en el Historial y en el resumen. Solo lee la ruta guardada.
  // Calles: el mismo mapa Leaflet (pellizco y arrastre con los dedos ya vienen incluidos).
  // Línea: canvas propio con zoom (pellizco, rueda, doble toque o botones + −) y arrastre; no necesita internet.
  // El botón "Ver: ..." cambia la vista solo aquí (no cambia lo elegido en Perfil).
  // Botón Atrás del teléfono: al abrir se agrega un paso al historial del navegador (window.history; ojo,
  // "history" en este archivo es la lista de actividades) y Atrás lo cierra sin salir de la app.
  const bigMap = {el: document.getElementById('bigMap'), canvas: document.getElementById('bigMapLine'),
                  div: document.getElementById('bigMapStreet'), pts: [], mode: 'linea', shown: 'linea',
                  s: 1, tx: 0, ty: 0, ptrs: new Map(), raf: 0};
  function openBigMap(points, title){
    if(!points || points.length < 2) return;
    bigMap.pts = points;
    bigMap.mode = profile.mapMode === 'linea' ? 'linea' : 'calles';
    document.getElementById('bigMapTitle').textContent = title || 'Tu ruta';
    bigMap.el.classList.add('show');
    document.body.classList.add('noScroll');
    try{ if(!(window.history.state && window.history.state.bigMap)) window.history.pushState({bigMap:true}, ''); }catch(e){}
    showBigMap();
  }
  function hideBigMap(){
    bigMap.el.classList.remove('show');
    document.body.classList.remove('noScroll');
    bigMap.ptrs.clear();
  }
  // ✕ o Escape: deshace el paso agregado (eso dispara popstate, que oculta el mapa)
  function closeBigMap(){
    if(window.history.state && window.history.state.bigMap){ try{ window.history.back(); return; }catch(e){} }
    hideBigMap();
  }
  window.addEventListener('popstate', ()=>{ if(bigMap.el.classList.contains('show')) hideBigMap(); });
  function showBigMap(){
    bigMap.s = 1; bigMap.tx = 0; bigMap.ty = 0;
    resetStreetMap('big');
    try{ bigMap.shown = renderRoute('big', bigMap.canvas, bigMap.div, bigMap.pts, '#4d9bff', false, bigMap.mode); }
    catch(e){ bigMap.shown = 'linea'; bigMap.div.style.display = 'none'; bigMap.canvas.style.display = 'block'; }
    if(bigMap.shown === 'linea') drawBigLine();
    document.getElementById('bigMapMode').textContent = bigMap.mode === 'linea' ? 'Ver: calles' : 'Ver: solo línea';
    document.getElementById('bigMapNote').textContent =
      bigMap.mode !== 'linea' && bigMap.shown === 'linea' ? streetsNote() : '';
  }
  // posición en pantalla de un punto: ajuste a la pantalla × zoom (s) + desplazamiento (tx, ty)
  function bigLineGeo(){
    const c = bigMap.canvas, w = c.clientWidth, h = c.clientHeight, pts = bigMap.pts;
    const lats = pts.map(p=>p.lat), lons = pts.map(p=>p.lon);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLon = Math.min(...lons), maxLon = Math.max(...lons);
    const cy = (minLat + maxLat) / 2, cx = (minLon + maxLon) / 2;
    const kx = Math.cos(cy * Math.PI / 180); // un grado de longitud mide menos lejos del ecuador
    const pad = 36, fit = Math.min((w - pad*2) / (((maxLon - minLon) * kx) || 1e-4), (h - pad*2) / ((maxLat - minLat) || 1e-4));
    const k = fit * bigMap.s; // píxeles por grado de latitud
    return {w, h, k, xy: p=>[w/2 + bigMap.tx + (p.lon - cx) * kx * k, h/2 + bigMap.ty - (p.lat - cy) * k]};
  }
  function drawBigLine(){
    const c = bigMap.canvas, dpr = window.devicePixelRatio || 1;
    if(!c.clientWidth || !c.clientHeight || bigMap.pts.length < 2) return;
    const g = bigLineGeo(), ctx = c.getContext('2d');
    c.width = g.w * dpr; c.height = g.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, g.w, g.h);
    ctx.beginPath();
    bigMap.pts.forEach((p, i)=>{ const [x, y] = g.xy(p); if(i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    ctx.strokeStyle = '#4d9bff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
    const dot = (p, r, fill)=>{ const [x, y] = g.xy(p); ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#070d1f'; ctx.stroke(); };
    dot(bigMap.pts[0], 6, '#eef3ff'); dot(bigMap.pts[bigMap.pts.length-1], 7, '#4d9bff');
    // escala: una distancia redonda que mida al menos 60 px
    const mPerPx = 111320 / g.k;
    const nice = [10,20,50,100,200,500,1000,2000,5000,10000,20000,50000].find(m=>m / mPerPx >= 60) || 50000;
    const len = nice / mPerPx, x0 = 14, y0 = g.h - 18;
    ctx.strokeStyle = '#9fb0d0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, y0 - 5); ctx.lineTo(x0, y0); ctx.lineTo(x0 + len, y0); ctx.lineTo(x0 + len, y0 - 5); ctx.stroke();
    ctx.fillStyle = '#9fb0d0'; ctx.font = '600 11px Inter, sans-serif';
    const dTxt = imp() ? (nice >= 1609 ? (nice / 1609.344).toFixed(1) + ' mi' : Math.round(nice * 3.28084) + ' ft')
                       : (nice >= 1000 ? nice / 1000 + ' km' : nice + ' m');
    ctx.fillText(dTxt, x0 + 4, y0 - 8);
  }
  function redrawBigLine(){ if(!bigMap.raf) bigMap.raf = requestAnimationFrame(()=>{ bigMap.raf = 0; drawBigLine(); }); }
  // zoom manteniendo fijo el punto (px, py) de la pantalla; entre 1× (ruta completa) y 60×
  function bigZoomAt(px, py, f){
    const s2 = Math.min(60, Math.max(1, bigMap.s * f)); f = s2 / bigMap.s;
    const c = bigMap.canvas, ox = px - c.clientWidth/2 - bigMap.tx, oy = py - c.clientHeight/2 - bigMap.ty;
    bigMap.tx += ox - ox * f; bigMap.ty += oy - oy * f; bigMap.s = s2;
    if(bigMap.s === 1){ bigMap.tx = 0; bigMap.ty = 0; } // al alejar del todo vuelve a centrar la ruta
    redrawBigLine();
  }
  {
    const bc = bigMap.canvas, P = bigMap.ptrs;
    const pos = e=>{ const r = bc.getBoundingClientRect(); return {x: e.clientX - r.left, y: e.clientY - r.top}; };
    bc.addEventListener('pointerdown', e=>{ try{ bc.setPointerCapture(e.pointerId); }catch(x){} P.set(e.pointerId, pos(e)); });
    bc.addEventListener('pointermove', e=>{
      if(!P.has(e.pointerId)) return;
      const now = pos(e);
      if(P.size === 1){ const o = P.get(e.pointerId); bigMap.tx += now.x - o.x; bigMap.ty += now.y - o.y; P.set(e.pointerId, now); redrawBigLine(); return; }
      // dos dedos: pellizco (zoom en el punto medio) y arrastre a la vez
      const ids = [...P.keys()].slice(0, 2); if(!ids.includes(e.pointerId)) return;
      const a0 = P.get(ids[0]), b0 = P.get(ids[1]);
      P.set(e.pointerId, now);
      const a1 = P.get(ids[0]), b1 = P.get(ids[1]);
      const d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y), d1 = Math.hypot(a1.x - b1.x, a1.y - b1.y);
      bigMap.tx += (a1.x + b1.x)/2 - (a0.x + b0.x)/2; bigMap.ty += (a1.y + b1.y)/2 - (a0.y + b0.y)/2;
      if(d0 > 0) bigZoomAt((a1.x + b1.x)/2, (a1.y + b1.y)/2, d1 / d0); else redrawBigLine();
    });
    const up = e=>{ P.delete(e.pointerId); };
    bc.addEventListener('pointerup', up); bc.addEventListener('pointercancel', up);
    bc.addEventListener('wheel', e=>{ e.preventDefault(); const p = pos(e); bigZoomAt(p.x, p.y, e.deltaY < 0 ? 1.25 : 0.8); }, {passive:false});
    bc.addEventListener('dblclick', e=>{ const p = pos(e); bigZoomAt(p.x, p.y, 2); });
    const zoomBtn = f=>{
      const m = streetMaps.big;
      if(bigMap.shown === 'calles' && m){ if(f > 1) m.map.zoomIn(); else m.map.zoomOut(); }
      else bigZoomAt(bc.clientWidth/2, bc.clientHeight/2, f);
    };
    document.getElementById('bigZoomIn').addEventListener('click', ()=>zoomBtn(1.6));
    document.getElementById('bigZoomOut').addEventListener('click', ()=>zoomBtn(1/1.6));
    document.getElementById('bigMapMode').addEventListener('click', ()=>{
      bigMap.mode = bigMap.mode === 'linea' ? 'calles' : 'linea'; showBigMap();
    });
    document.getElementById('btnBigMapClose').addEventListener('click', closeBigMap);
    document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && bigMap.el.classList.contains('show')) closeBigMap(); });
    window.addEventListener('resize', ()=>{
      if(!bigMap.el.classList.contains('show')) return;
      if(bigMap.shown === 'linea') redrawBigLine(); else if(streetMaps.big) streetMaps.big.map.invalidateSize();
    });
  }

  // ---------- HISTORY ----------
  // detalle de una sesión de rutina guardada (solo lectura)
  function routineDetail(r){
    if(!r || !Array.isArray(r.items) || !r.items.length) return '';
    const exN = it=>{ const e = EXERCISES.find(x=>x.k === it.ex); return e ? e.n : String(it.name || 'Ejercicio'); };
    const done = r.items.reduce((a,it)=>a + (Number(it.done) || 0), 0), total = r.items.reduce((a,it)=>a + (Number(it.sets) || 0), 0);
    const rows = r.items.map(it=>`<li><b>${esc(exN(it))}</b> · ${Number(it.done) || 0} de ${it.sets} series × ${it.amount}${it.kind === 'secs' ? ' s' : ''}</li>`).join('');
    return `<details class="rtHist"><summary>Rutina «${esc(r.name || 'Sin nombre')}» · ${r.items.length} ${r.items.length === 1 ? 'ejercicio' : 'ejercicios'} · ${done} de ${total} series</summary><ul>${rows}</ul></details>`;
  }
  // estrella: marcar o desmarcar favorita (campo favorite: true; sin campo = no favorita)
  document.getElementById('histList').addEventListener('click', ev=>{
    const b = ev.target.closest('[data-fav]'); if(!b) return;
    const h = history.find(x=>x.date === decodeURIComponent(b.dataset.fav)); if(!h) return;
    const was = !!h.favorite;
    if(was) delete h.favorite; else h.favorite = true;
    if(!LS.set('mirun_history', history)){ if(was) h.favorite = true; else delete h.favorite; return; } // no cupo: queda como estaba
    const y = window.scrollY, bs = document.body.scrollTop; renderHistory(); window.scrollTo(0, y); document.body.scrollTop = bs;
  });
  // "Ver más": otras 4 semanas
  document.getElementById('histList').addEventListener('click', ev=>{
    if(!ev.target.closest('#histMore')) return;
    const y = window.scrollY, b = document.body.scrollTop; histWeeks += 4; renderHistory(); window.scrollTo(0, y); document.body.scrollTop = b;
  });
  // "Ver mapa" (o tocar la ruta pequeña) abre el mapa grande de esa actividad
  document.getElementById('histList').addEventListener('click', ev=>{
    const w = ev.target.closest('[data-map]'); if(!w) return;
    const h = history.find(x=>x.date === decodeURIComponent(w.dataset.map)); if(!h) return;
    const d = new Date(h.date);
    openBigMap(routeOf(h), actInfo(h.type).n + ' · ' + d.toLocaleDateString('es-ES', {day:'numeric', month:'short'}));
  });
  let histWeeks = 4, histIO = null; // semanas con actividad que se ven en el Historial (crece con "Ver más")
  function renderHistory(){
    const list = document.getElementById('histList');
    if(history.length===0){
      list.innerHTML = '<div class="empty"><img src="' + mascot('vacio') + '" alt="">Todavía no tienes actividades registradas.<br>¡Muévete hoy!</div>';
    } else {
      // la más nueva arriba, agrupadas por semana (lunes a domingo) con su total. Por partes: se muestran las
      // primeras histWeeks semanas con actividad y "Ver más" agrega otras 4 (rápido aunque haya cientos)
      const sorted = history.slice().sort((a,b)=>a.date < b.date ? 1 : -1);
      const weeks = [];
      sorted.forEach((h,ri)=>{
        const wk = dayKey(mondayOf(new Date(actRange(h)[0])));
        if(!weeks.length || weeks[weeks.length - 1].wk !== wk) weeks.push({wk, items: []});
        weeks[weeks.length - 1].items.push({h, ri});
      });
      const shown = weeks.slice(0, histWeeks), rest = weeks.slice(histWeeks).reduce((s,w)=>s + w.items.length, 0);
      list.innerHTML = shown.map(w=>histWeekHead(w.wk, w.items.map(x=>x.h)) + w.items.map(x=>histCard(x.h, x.ri)).join('')).join('') +
        (rest ? `<div class="btnRow"><button class="btn btn-ghost" id="histMore">Ver más (${rest} ${rest === 1 ? 'actividad' : 'actividades'})</button></div>` : '');
      function histCard(h, ri){
        const d = new Date(h.date);
        const fecha = d.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) + ' · ' +
                      d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
        const hasRoute = routeOf(h).length > 1;
        const a = actInfo(h.type);
        const head = `<div class="top"><span>${ico(a.i)} <b style="color:var(--text);">${a.n}</b> · ${fecha}${h.manual && h.dist > 0 ? '<span class="tag">a mano</span>' : ''}${h.edited ? '<span class="tag">editada</span>' : ''}</span>
            <span class="histBtns"><button class="linkBtn favBtn${h.favorite ? ' on' : ''}" data-fav="${encodeURIComponent(h.date)}" aria-pressed="${!!h.favorite}" aria-label="${h.favorite ? 'Quitar de favoritas' : 'Marcar como favorita'}">${ico('star')}</button><button class="linkBtn" data-edit="${encodeURIComponent(h.date)}">Editar</button><button class="linkBtn" data-del="${encodeURIComponent(h.date)}">Borrar</button></span></div>`;
        if(!(h.dist > 0)){ // actividad sin distancia (gimnasio, natación, etc.)
          return `<div class="histItem">${head}<div class="stats">
            <div><div class="num">${Math.round(h.seconds/60)}</div><small>min</small></div>
            <div><div class="num">${h.intensity || '-'}</div><small>intensidad</small></div>
            <div><div class="num">${h.cal}</div><small>kcal</small></div></div>${routineDetail(h.routine)}</div>`;
        }
        return `<div class="histItem">
          ${head}
          <div class="stats">
            <div><div class="num">${toD(h.dist).toFixed(2)}</div><small>${dU()}</small></div>
            <div><div class="num">${fmtTime(h.seconds)}</div><small>tiempo</small></div>
            <div><div class="num">${paceTxt(h.seconds, h.dist)}</div><small>${paceU()}</small></div>
            <div><div class="num">${h.cal}</div><small>kcal</small></div>
          </div>
          ${stepsOf(h) ? `<div class="histSteps">${stepsTxt(h)}</div>` : ''}
          ${ivlDetail(h.intervals)}
          ${hasRoute ? `<div class="mini-route" data-map="${encodeURIComponent(h.date)}"><canvas id="hist-route-${ri}" data-ri="${ri}"></canvas>
            <button class="mapBigBtn" aria-label="Ver mapa a pantalla completa">Ver mapa</button></div>` : ''}
        </div>`;
      }
      // pasos: un solo aviso si falta la estatura y hay caminatas o carreras con distancia
      if(!(profile.height > 0) && history.some(h=>h.dist > 0 && (!h.type || h.type === 'correr' || h.type === 'caminar')))
        list.insertAdjacentHTML('afterbegin', '<div class="hint histStepsHint">Agrega tu estatura en Perfil para ver tus pasos</div>');

      // cada mapa pequeño se dibuja cuando aparece en pantalla (no todos de una vez)
      if(histIO) histIO.disconnect();
      const draw = c=>{ const h = sorted[Number(c.dataset.ri)]; if(h) drawRoute(c, routeOf(h), '#7cc4ff'); };
      const canvases = list.querySelectorAll('canvas[data-ri]');
      if('IntersectionObserver' in window){
        histIO = new IntersectionObserver(ents=>ents.forEach(e=>{ if(e.isIntersecting){ histIO.unobserve(e.target); draw(e.target); } }), {rootMargin: '300px 0px'});
        canvases.forEach(c=>histIO.observe(c));
      } else canvases.forEach(draw);
    }
    document.getElementById('totRuns').textContent = history.length;
    document.getElementById('totKm').textContent = toD(history.reduce((s,h)=>s+h.dist,0)).toFixed(1); // km o mi
    document.getElementById('totCal').textContent = Math.round(history.reduce((s,h)=>s+h.cal,0));
    // recordatorio de copia de seguridad si hay datos y la última copia es vieja (o nunca se hizo)
    const lastB = LS.get('mirun_lastBackup', null);
    const daysB = lastB ? Math.floor((Date.now() - new Date(lastB).getTime()) / 86400000) : null;
    const bm = document.getElementById('backupMsg');
    if(history.length >= 3 && (daysB === null || daysB >= 30) && !bm.dataset.set){
      bm.textContent = daysB === null ? 'Aún no has guardado una copia de tus datos. Te recomendamos hacerlo.'
                                      : 'Tu última copia es de hace ' + daysB + ' días. Te recomendamos guardar una nueva.';
      bm.style.color = 'var(--amber)';
    }
  }
  // título de cada semana del Historial: "Esta semana", "Semana pasada" o "17 – 23 nov", con actividades, tiempo y distancia
  function histWeekHead(wk, items){
    const mon = new Date(wk + 'T12:00:00'), sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const now = dayKey(mondayOf(new Date())), prev = dayKey(mondayOf(new Date(Date.now() - 7 * 86400000)));
    const dm = d=>d.toLocaleDateString('es-ES', {day:'numeric', month:'short'}).replace('.', '');
    const title = wk === now ? 'Esta semana' : wk === prev ? 'Semana pasada'
      : (mon.getMonth() === sun.getMonth() ? mon.getDate() : dm(mon)) + ' – ' + dm(sun);
    const min = Math.round(items.reduce((s,h)=>s + h.seconds, 0) / 60), km = items.reduce((s,h)=>s + (h.dist || 0), 0);
    const t = min >= 60 ? Math.floor(min / 60) + ' h' + (min % 60 ? ' ' + (min % 60) + ' min' : '') : min + ' min';
    return `<div class="histWeek"><b>${title}</b><span>${items.length} ${items.length === 1 ? 'actividad' : 'actividades'} · ${t}${km > 0 ? ' · ' + fmtD(km, 1) : ''}</span></div>`;
  }
  renderHistory();

  // Borrar una carrera del historial (con confirmacion)
  document.getElementById('histList').addEventListener('click', (ev)=>{
    const b = ev.target.closest('[data-del]');
    if(!b) return;
    const date = decodeURIComponent(b.dataset.del);
    const h = history.find(x=>x.date === date);
    if(!h) return;
    const what = h.dist > 0 ? fmtD(h.dist) : Math.round(h.seconds/60) + ' min';
    if(!confirm('¿Borrar ' + typeName(h.type) + ' (' + what + ') del ' + fmtShortDate(h.date) + '? No se puede deshacer.')) return;
    history = history.filter(x=>x.date !== date);
    LS.set('mirun_history', history);
    renderHistory();
  });

  // ---------- EDITAR ACTIVIDAD ----------
  // Hoja #editSheet. Cambia SOLO esa actividad (copia profunda). 'date' es el identificador: si cambia,
  // origDate guarda el ORIGINAL (de la primera edición, nunca se sobrescribe) para que la importación
  // de copias viejas no la duplique. edited = fecha ISO de la última edición. "Deshacer" ~8 s.
  const editSheet = document.getElementById('editSheet');
  const edChips = document.getElementById('edChips'), edInt = document.getElementById('edInt');
  edChips.innerHTML = ACTIVITIES.map(a=>`<button class="chip" data-act="${a.k}">${ico(a.i)}${a.n}</button>`).join('');
  let edTarget = null, edInit = null, undoPrev = null, undoObj = null, undoTimer = null;
  function edType(){ return edChips.querySelector('.chip.on').dataset.act; }
  function edShowFields(){ // distancia solo en tipos con GPS; intensidad solo en tipos sin GPS
    const g = !!actInfo(edType()).gps;
    document.getElementById('edDistBox').style.display = g ? '' : 'none';
    document.getElementById('edIntBox').style.display = g ? 'none' : '';
  }
  edChips.addEventListener('click', ev=>{ pickOne(edChips, ev); edShowFields(); });
  edInt.addEventListener('click', ev=>pickOne(edInt, ev));
  function edVals(){
    return {date: document.getElementById('edDate').value, time: document.getElementById('edTime').value,
            min: document.getElementById('edMin').value, sec: document.getElementById('edSec').value,
            dist: document.getElementById('edDist').value};
  }
  function openEdit(h){
    edTarget = h;
    const st = new Date(actRange(h)[0]), t = h.type || 'correr', s = Math.round(h.seconds);
    edChips.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on', c.dataset.act === t));
    // sesión de rutina: el tipo y el detalle no se editan (solo fecha, duración e intensidad)
    edChips.style.display = h.routine ? 'none' : '';
    const rn = document.getElementById('edRoutineNote');
    rn.style.display = h.routine ? '' : 'none';
    rn.textContent = h.routine ? 'Rutina "' + h.routine.name + '": solo se editan la fecha, la duración y la intensidad.' : '';
    const it = INTENSITY.includes(h.intensity) ? h.intensity : 'media';
    edInt.querySelectorAll('.chip').forEach(c=>c.classList.toggle('on', c.dataset.int === it));
    document.getElementById('edDate').value = dayKey(st);
    document.getElementById('edTime').value = pad(st.getHours()) + ':' + pad(st.getMinutes());
    document.getElementById('edMin').value = Math.floor(s/60);
    document.getElementById('edSec').value = s % 60;
    document.getElementById('edDist').value = h.dist > 0 ? toD(h.dist).toFixed(2) : '';
    edInit = edVals(); // si un campo no se toca se conserva el valor guardado exacto (sin redondeos)
    document.getElementById('edMsg').textContent = '';
    edShowFields();
    editSheet.classList.add('show');
  }
  function closeEdit(){ editSheet.classList.remove('show'); edTarget = null; }
  editSheet.addEventListener('click', ev=>{ if(ev.target === editSheet) closeEdit(); });
  document.getElementById('btnEdCancel').addEventListener('click', closeEdit);
  document.getElementById('histList').addEventListener('click', (ev)=>{
    const b = ev.target.closest('[data-edit]');
    if(!b) return;
    const h = history.find(x=>x.date === decodeURIComponent(b.dataset.edit));
    if(h) openEdit(h);
  });

  document.getElementById('btnEdSave').addEventListener('click', ()=>{
    const h = edTarget, idx = history.indexOf(h);
    if(!h || idx < 0){ closeEdit(); return; }
    const bad = t=>mascotMsg(document.getElementById('edMsg'), 'error', t, 'var(--danger)');
    const v = edVals(), type = edType(), gps = !!actInfo(type).gps;
    const intensity = edInt.querySelector('.chip.on').dataset.int;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || !/^\d{2}:\d{2}$/.test(v.time)) return bad('Falta la fecha o la hora de inicio.');
    const mi = Number(v.min || 0), se = Number(v.sec || 0);
    if(!(Number.isInteger(mi) && Number.isInteger(se) && mi >= 0 && se >= 0 && se <= 59)) return bad('Revisa los minutos y segundos.');
    const seconds = (v.min === edInit.min && v.sec === edInit.sec) ? h.seconds : mi*60 + se;
    if(!gps && !(seconds >= 60 && seconds <= 600*60)) return bad('La duración debe estar entre 1 y 600 minutos.');
    if(gps && !(seconds > 0 && seconds <= 24*3600)) return bad('Revisa la duración.');
    let dist = 0;
    if(gps){
      dist = (v.dist === edInit.dist && h.dist > 0) ? h.dist : fromD(parseFloat(v.dist));
      if(!(dist > 0)) return bad('Escribe la distancia.');
      if(dist > 300) return bad('La distancia no puede pasar de ' + fmtD(300, 0) + '.');
      if(type === 'correr' && seconds/dist < 120) return bad('Revisa los datos: ese ritmo no parece real.');
    }
    const start = (v.date === edInit.date && v.time === edInit.time) ? actRange(h)[0]
                  : new Date(v.date + 'T' + v.time + ':00').getTime();
    if(!isFinite(start)) return bad('Falta la fecha o la hora de inicio.');
    if(start > Date.now()) return bad('La hora de inicio no puede ser en el futuro.');
    if(!h.manual && start + seconds*1000 > Date.now() + 60000) return bad('La actividad no puede terminar en el futuro.');

    const prev = JSON.parse(JSON.stringify(h)); // versión anterior exacta (para "Deshacer")
    const n = JSON.parse(JSON.stringify(h));    // copia profunda: no se toca el original
    const oldType = h.type || 'correr';
    const changed = type !== oldType || seconds !== h.seconds || dist !== h.dist ||
                    (!gps && intensity !== h.intensity);
    if(type !== oldType) n.type = type;          // sin cambio de tipo no se agrega el campo
    n.seconds = seconds;
    if(dist !== h.dist) n.dist = dist;
    if(dist !== h.dist || seconds !== h.seconds) n.splits = []; // splits viejos ya no valen; la ruta se conserva
    if(gps) delete n.intensity; else n.intensity = intensity;
    if(changed){
      if(dist > 0){ n.pace = fmtPace(seconds/dist); n.cal = calcCalories(dist, seconds, type); }
      else { n.pace = '--:--'; n.cal = metCalories(actInfo(type).met[INTENSITY.indexOf(intensity)], seconds); }
    }
    // date = inicio si se registró a mano, fin si fue con GPS
    let iso = new Date(h.manual ? start : start + seconds*1000).toISOString();
    if(iso !== h.date){
      const taken = x=>x !== h && (x.date === iso || x.origDate === iso);
      while(history.some(taken)) iso = new Date(new Date(iso).getTime() + 1000).toISOString();
      if(h.origDate === undefined) n.origDate = h.date; // solo la primera vez: nunca se sobrescribe
      n.date = iso;
    }
    if(JSON.stringify(n) === JSON.stringify(h)){ closeEdit(); return; } // sin cambios: no se guarda nada
    n.edited = new Date().toISOString();
    history[idx] = n;
    history.sort((a,b)=>a.date < b.date ? -1 : 1);
    const ok = LS.set('mirun_history', history);
    closeEdit();
    renderHistory(); checkAchievements();
    if(ok) showUndo(prev, n);
  });

  // barra "Deshacer": vuelve a poner la versión anterior exacta de la actividad editada
  function showUndo(prev, obj){
    undoPrev = prev; undoObj = obj;
    const bar = document.getElementById('undoBar');
    bar.classList.add('show');
    clearTimeout(undoTimer);
    undoTimer = setTimeout(()=>{ bar.classList.remove('show'); undoPrev = undoObj = null; }, 8000);
  }
  document.getElementById('btnUndo').addEventListener('click', ()=>{
    clearTimeout(undoTimer);
    document.getElementById('undoBar').classList.remove('show');
    const idx = history.indexOf(undoObj);
    if(idx >= 0 && undoPrev){
      history[idx] = undoPrev;
      history.sort((a,b)=>a.date < b.date ? -1 : 1);
      LS.set('mirun_history', history);
      renderHistory(); checkAchievements();
    }
    undoPrev = undoObj = null;
  });

  // ---------- CARRERA A MANO ----------
  document.getElementById('manDate').value = todayStr();
  document.getElementById('btnManual').addEventListener('click', ()=>{
    const msg = document.getElementById('manMsg');
    const dateStr = document.getElementById('manDate').value;
    const km = fromD(parseFloat(document.getElementById('manKm').value)); // se escribe en km o mi, se guarda en km
    const mins = parseInt(document.getElementById('manMin').value)||0;
    const secs = parseInt(document.getElementById('manSec').value)||0;
    const total = mins*60 + secs;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !(km > 0) || !(total > 0)){
      msg.textContent = 'Falta la fecha, los kilómetros o el tiempo.'; msg.style.color = 'var(--danger)'; return;
    }
    if(km > 300 || total/km < 120){ // menos de 2 min/km no es correr
      msg.textContent = 'Revisa los datos: ese ritmo no parece real.'; msg.style.color = 'var(--danger)'; return;
    }
    const before = computeRecords(history);
    // hora fija al mediodia para que no choque con otra carrera del mismo dia
    let iso = new Date(dateStr + 'T12:00:00').toISOString();
    while(history.some(h=>h.date === iso)) iso = new Date(new Date(iso).getTime() + 1000).toISOString();
    history.push({date: iso, dist: km, seconds: total, pace: fmtPace(total/km),
                  cal: calcCalories(km, total), path: [], splits: [], manual: true});
    history.sort((a,b)=>a.date < b.date ? -1 : 1);
    const ok = LS.set('mirun_history', history);
    const news = newRecords(before, computeRecords(history));
    msg.style.color = ok ? 'var(--signal)' : 'var(--amber)';
    msg.textContent = !ok ? NOT_SAVED : 'Carrera agregada.' + (news.length ? ' ¡Nuevo récord en ' + news.map(n=>raceTxt(n.k)).join(', ') + '!' : '');
    document.getElementById('manKm').value = '';
    document.getElementById('manMin').value = '';
    document.getElementById('manSec').value = '';
    renderHistory(); checkAchievements();
  });

  // ---------- RECORDS ----------
  // Categorias de distancia. 21 y 42 = media maraton y maraton.
  const REC_CATS = [1, 3, 5, 10, 21, 42];
  const REC_TOL = 0.97; // el GPS suele marcar un poquito menos: 4.86 km cuenta como 5 km

  // Tiempo del tramo mas rapido de k km dentro de una carrera (segundos), o null
  function bestEffort(h, k){
    if(!(h.dist >= k*REC_TOL)) return null;
    const full = (h.splits||[]).filter(s=>!s.partial);
    if(full.length >= k){
      let best = Infinity;
      for(let i=0; i+k<=full.length; i++){
        let sum = 0;
        for(let j=i; j<i+k; j++) sum += full[j].seconds;
        if(sum < best) best = sum;
      }
      return best;
    }
    // sin tramos por km (carrera a mano o muy corta): se usa el ritmo promedio
    return h.seconds * k / h.dist;
  }

  function computeRecords(list){
    list = list.filter(isRun); // los récords solo cuentan carreras (no caminatas, bici, etc.)
    return REC_CATS.map((k,i)=>{
      const next = REC_CATS[i+1] || Infinity;
      let best = null;
      list.forEach(h=>{
        const s = bestEffort(h, k);
        if(s && (!best || s < best.sec)) best = {sec: s, date: h.date};
      });
      // carreras "de esa distancia": desde k hasta antes de la siguiente categoria
      const inCat = list.filter(h=>h.dist >= k*REC_TOL && h.dist < next*REC_TOL);
      let bestPace = null;
      inCat.forEach(h=>{
        const p = h.seconds / h.dist;
        if(!bestPace || p < bestPace.p) bestPace = {p, date: h.date};
      });
      return {k, best, bestPace, count: inCat.length};
    });
  }

  function newRecords(before, after){
    return after.filter((r,i)=>r.best && (!before[i].best || r.best.sec < before[i].best.sec - 0.5));
  }

  function renderRecords(){
    const recs = computeRecords(history);
    document.getElementById('recList').innerHTML = recs.map(r=>{
      const name = r.k === 21 ? '21 km' : r.k === 42 ? '42 km' : r.k + ' km';
      if(!r.best) return `<div class="recRow none"><div class="recCat">${name}</div>
        <div class="recCol"><div class="l">Todavía no has corrido esta distancia</div></div></div>`;
      return `<div class="recRow"><div class="recCat">${name}</div>
        <div class="recCol"><div class="v">${fmtTime(r.best.sec)}</div>
          <div class="l">Mejor tiempo · ${paceTxt(r.best.sec, r.k)} /${dU()}<br>${fmtShortDate(r.best.date)}</div></div>
        <div class="recCol"><div class="v">${r.bestPace ? fmtPace(toPace(r.bestPace.p)) : '--'}</div>
          <div class="l">Mejor ritmo promedio<br>${r.count} ${r.count===1?'carrera':'carreras'}</div></div>
      </div>`;
    }).join('');
  }

  // ---------- CUERPO (medidas) ----------
  // good: hacia donde es "mejorar". -1 = bajar es bueno, 1 = subir es bueno.
  // h = cómo medir (se muestra bajo el campo). ph = ejemplo. Para agregar una medida: una línea nueva.
  const MEASURES = [
    {k:'peso',        n:'Peso',        u:'kg', id:'bPeso',        good:-1, ph:'70', h:'En ayunas, con poca ropa'},
    {k:'barriga',     n:'Abdomen',     u:'cm', id:'bBarriga',     good:-1, ph:'85', h:'A la altura del ombligo'}, // clave 'barriga' se conserva por los datos guardados
    {k:'cintura',     n:'Cintura',     u:'cm', id:'bCintura',     good:-1, ph:'80', h:'Parte más angosta, entre costilla y cadera'},
    {k:'cadera',      n:'Cadera',      u:'cm', id:'bCadera',      good:-1, ph:'95', h:'Parte más ancha de los glúteos'},
    {k:'pecho',       n:'Pecho',       u:'cm', id:'bPecho',       good: 1, ph:'95', h:'A la altura de las axilas, al soltar el aire'},
    {k:'hombros',     n:'Hombros',     u:'cm', id:'bHombros',     good: 1, ph:'110', h:'Contorno por la parte más ancha'},
    {k:'biceps',      n:'Bíceps',      u:'cm', id:'bBiceps',      good: 1, ph:'32', h:'Brazo relajado, en la parte más gruesa'},
    {k:'antebrazo',   n:'Antebrazo',   u:'cm', id:'bAntebrazo',   good: 1, ph:'27', h:'Parte más gruesa, bajo el codo'},
    {k:'muslo',       n:'Muslo',       u:'cm', id:'bMuslo',       good: 1, ph:'55', h:'Parte más gruesa, bajo el glúteo'},
    {k:'pantorrilla', n:'Pantorrilla', u:'cm', id:'bPantorrilla', good: 1, ph:'37', h:'Parte más gruesa, de pie'}
  ];
  // medidas que sigue la persona (profile.measures). Por defecto, las que existían antes de v5 + cintura
  // el peso se guarda en kg; se muestra en kg o lb (las demás medidas siempre en cm)
  function mU(m){ return m.k === 'peso' ? wU() : m.u; }
  function mV(m, v){ return m.k === 'peso' ? toW(v) : v; }
  const DEF_MEAS = ['peso','barriga','cintura','biceps','muslo','pantorrilla'];
  // dirección de mejora según el objetivo: solo cambia el peso (ganar músculo = subir, mantener = neutral)
  function goodOf(m){
    if(m.k !== 'peso') return m.good;
    return profile.goalType === 'musculo' ? 1 : profile.goalType === 'mantener' ? 0 : -1;
  }
  function tracked(){ return Array.isArray(profile.measures) && profile.measures.length ? profile.measures : DEF_MEAS; }
  const fmt1 = v => (Math.round(v*10)/10).toLocaleString('es-ES');

  // ayuda visual: dónde se mide la cintura (lo más angosto) y dónde el abdomen (el ombligo); SVG en línea
  const WAIST_HELP = `<div class="waistHelp" role="img" aria-label="Cintura: la parte más angosta, entre las costillas y la cadera. Abdomen: a la altura del ombligo.">
    <svg viewBox="0 0 120 140" aria-hidden="true">
      <path class="wTorso" d="M22 8 C24 38 31 50 33 60 C35 72 29 98 22 132 L98 132 C91 98 85 72 87 60 C89 50 96 38 98 8"/>
      <line class="wWaist" x1="24" y1="60" x2="96" y2="60"/><line class="wAbd" x1="22" y1="80" x2="98" y2="80"/>
      <circle class="wNavel" cx="60" cy="80" r="2.6"/></svg>
    <div><p><i class="wWaistDot"></i><b>Cintura</b>: la parte más angosta, entre las costillas y la cadera.</p>
      <p><i class="wAbdDot"></i><b>Abdomen</b>: a la altura del ombligo, aunque ahí no sea lo más angosto.</p></div></div>`;
  function buildBodyForm(){
    const help = tracked().some(k=>k === 'cintura' || k === 'barriga') ? WAIST_HELP : '';
    document.getElementById('bodyInputs').innerHTML = help + MEASURES.filter(m=>tracked().includes(m.k)).map(m=>
      `<div class="measIn"><label>${m.n} (${mU(m)})</label>
        <input type="number" id="${m.id}" step="0.1" placeholder="ej. ${m.k === 'peso' && imp() ? 154 : m.ph}"><small>${m.h}</small></div>`).join('');
    document.getElementById('measChips').innerHTML = MEASURES.map(m=>
      `<button class="chip${tracked().includes(m.k) ? ' on' : ''}" data-meas="${m.k}">${m.n}</button>`).join('');
    // el gráfico ofrece lo que se sigue y también lo que tenga datos guardados
    chartSel.innerHTML = MEASURES.filter(m=>tracked().includes(m.k) || seriesOf(m.k).length)
      .map(m=>`<option value="${m.k}">${m.n} (${mU(m)})</option>`).join('');
  }
  document.getElementById('measChips').addEventListener('click', (ev)=>{
    const c = ev.target.closest('.chip'); if(!c) return;
    const list = tracked().slice(), k = c.dataset.meas, i = list.indexOf(k);
    if(i >= 0){ if(list.length === 1) return; list.splice(i, 1); } else list.push(k);
    profile.measures = MEASURES.map(m=>m.k).filter(x=>list.includes(x)); // mismo orden que MEASURES
    LS.set('mirun_profile', profile);
    buildBodyForm();
  });

  // IMC = peso / estatura² (estatura en el perfil, peso de la última medición o del perfil)
  function renderBMI(){
    const box = document.getElementById('bmiBox');
    const ps = seriesOf('peso'), w = ps.length ? ps[ps.length-1].peso : profile.weight;
    if(!(profile.height > 0)){
      box.innerHTML = '<div class="hint">Agrega tu estatura en <button class="linkBtn" data-goto="profile" style="padding:0;color:var(--signal);">Perfil</button> para ver tu IMC.</div>';
      return;
    }
    const bmi = w / Math.pow(profile.height/100, 2);
    const [cat, cls] = bmi < 18.5 ? ['Bajo peso','warn'] : bmi < 25 ? ['Saludable','ok'] : bmi < 30 ? ['Sobrepeso','warn'] : ['Obesidad','bad'];
    box.innerHTML = `<img class="mascotSide" src="${mascot('cuerpo')}" alt=""><div class="bmiRow"><div class="num bmiV">${fmt1(bmi)}</div><div class="bmiTag ${cls}">${cat}</div></div>
      <div class="hint">Con ${fmt1(toW(w))} ${wU()} y ${profile.height} cm. El IMC es solo una referencia: no distingue músculo de grasa.
      Tu cintura y tu progreso dicen más.</div>`;
  }

  document.getElementById('bodyDate').value = todayStr();
  const chartSel = document.getElementById('bodyChartSel');
  chartSel.addEventListener('change', drawBodyChart);
  buildBodyForm();

  function seriesOf(k){
    return body.filter(e=>isFinite(e[k]) && e[k] > 0).sort((a,b)=>a.date < b.date ? -1 : 1);
  }

  // Silueta del cuerpo con las últimas medidas encima. La figura depende del sexo del perfil
  // (m = masculina, f = femenina, x o vacío = neutra). y = altura en % de la imagen; s = lado de la etiqueta.
  const BODY_FIG = {m:'masculina', f:'femenina', x:'neutra'};
  const BODY_POS = {
    hombros:{y:15, s:'L'}, biceps:{y:27, s:'L'}, antebrazo:{y:39, s:'L'}, cadera:{y:51, s:'L'}, muslo:{y:63, s:'L'},
    pecho:{y:22, s:'R'}, cintura:{y:34, s:'R'}, barriga:{y:46, s:'R'}, pantorrilla:{y:79, s:'R'}
  };
  // Punto exacto del cuerpo al que apunta la línea de cada etiqueta: [x, y] en % del ancho y alto de la imagen.
  // Medidos sobre cada figura (lado izquierdo para etiquetas L, derecho para R).
  const BODY_PTS = {
    masculina:{hombros:[23.6,21], biceps:[20,29.7], antebrazo:[12.7,40], cadera:[34.5,48], muslo:[39,59],
               pecho:[62,26], cintura:[63.6,36.7], barriga:[58,41.4], pantorrilla:[72,73.4]},
    femenina: {hombros:[28.6,21.9], biceps:[21.6,30.5], antebrazo:[14.3,39.8], cadera:[31.8,46.9], muslo:[39.6,58.6],
               pecho:[63.3,26.6], cintura:[63.3,35.2], barriga:[57,41], pantorrilla:[72.5,74.2]},
    neutra:   {hombros:[25.5,21], biceps:[18.9,30.5], antebrazo:[11.6,40.6], cadera:[30.9,47], muslo:[38.2,59.4],
               pecho:[61.8,25.8], cintura:[66.2,36], barriga:[60,41], pantorrilla:[71,73.4]}
  };
  function bodyFigName(){ return BODY_FIG[profile.sex] || 'neutra'; }
  // líneas finas (SVG) de cada etiqueta al punto del cuerpo; se redibujan al cargar la imagen o cambiar el tamaño
  function drawBodyLines(){
    const fig = document.querySelector('.bodyFig'), svg = document.getElementById('bodyFigLines');
    const img = document.getElementById('bodyFigImg'), fr = fig.getBoundingClientRect();
    if(!fr.width || !img.complete || !img.naturalWidth){ svg.innerHTML = ''; return; }
    const ir = img.getBoundingClientRect(), pts = BODY_PTS[bodyFigName()];
    svg.setAttribute('viewBox', '0 0 ' + fr.width + ' ' + fr.height);
    svg.innerHTML = [...document.querySelectorAll('#bodyFigLbls .mLbl')].map(l=>{
      const p = pts[l.dataset.k]; if(!p) return '';
      const r = l.getBoundingClientRect(), left = l.classList.contains('L');
      const x1 = (left ? r.right : r.left) - fr.left, y1 = r.top + r.height/2 - fr.top;
      const x2 = ir.left - fr.left + p[0]/100*ir.width, y2 = ir.top - fr.top + p[1]/100*ir.height;
      const f = n=>n.toFixed(1);
      return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/><circle cx="${f(x2)}" cy="${f(y2)}" r="2.6"/>`;
    }).join('');
  }
  document.getElementById('bodyFigImg').addEventListener('load', drawBodyLines);
  if('ResizeObserver' in window) new ResizeObserver(drawBodyLines).observe(document.querySelector('.bodyFig'));
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(drawBodyLines);
  function renderBodyFig(){
    document.getElementById('bodyFigImg').src = 'img/siluetas/' + bodyFigName() + '.png';
    const shown = MEASURES.filter(m=>BODY_POS[m.k] && tracked().includes(m.k));
    document.getElementById('bodyFigLbls').innerHTML = shown.map(m=>{
      const s = seriesOf(m.k), p = BODY_POS[m.k];
      const val = s.length ? fmt1(mV(m, s[s.length-1][m.k])) + ' ' + mU(m) : '—';
      return `<div class="mLbl ${p.s}" data-k="${m.k}" style="top:${p.y}%"><small>${m.n}</small><b>${val}</b></div>`;
    }).join('');
    drawBodyLines();
    const ps = seriesOf('peso');
    document.getElementById('bodyFigHint').textContent = ps.length
      ? 'Peso ' + fmt1(toW(ps[ps.length-1].peso)) + ' ' + wU() + ' · última medición ' + fmtShortDate(body.map(e=>e.date).sort().pop())
      : 'Registra tus medidas abajo y aparecerán aquí.';
  }

  function renderBody(){
    renderBMI(); renderBodyFig();
    const prog = document.getElementById('bodyProg');
    const rows = MEASURES.map(m=>{
      const s = seriesOf(m.k);
      if(s.length === 0) return '';
      const first = s[0], last = s[s.length-1];
      const diff = last[m.k] - first[m.k];
      let cls = 'same', txt = 'igual';
      if(s.length > 1 && Math.abs(diff) >= 0.05){
        cls = goodOf(m) === 0 ? 'same' : (diff * goodOf(m) > 0) ? 'good' : 'bad';
        txt = (diff > 0 ? '▲ +' : '▼ −') + fmt1(mV(m, Math.abs(diff))) + ' ' + mU(m);
      } else if(s.length === 1){ txt = 'inicio'; }
      return `<div class="progRow"><div class="pn">${m.n}</div>
        <div class="pv">${fmt1(mV(m, last[m.k]))} ${mU(m)}
          <small>${s.length > 1 ? 'empezaste en ' + fmt1(mV(m, first[m.k])) + ' ' + mU(m) + ' (' + fmtShortDate(first.date) + ')' : 'primera medición ' + fmtShortDate(first.date)}</small></div>
        <div class="pd ${cls}">${txt}</div></div>`;
    }).join('');
    if(rows){
      const lastDate = body.map(e=>e.date).sort().pop();
      const days = Math.round((new Date(todayStr()+'T12:00:00') - new Date(lastDate+'T12:00:00')) / 86400000);
      prog.innerHTML = rows + `<div class="hint" style="margin-top:10px;">Última medición: ${days===0 ? 'hoy' : 'hace ' + days + (days===1?' día':' días')}.
        ${days >= 14 ? ' <b>Ya toca medirte otra vez.</b>' : ''}</div>`;
    } else {
      prog.innerHTML = '<div class="hint">Todavía no tienes medidas. Llena tu primera medición abajo y desde ahí la app te muestra cuánto has avanzado.</div>';
    }
    document.getElementById('bodyChartPanel').style.display = rows ? 'block' : 'none';

    const list = document.getElementById('bodyList');
    if(body.length === 0){
      list.innerHTML = '<div class="hint">Sin mediciones todavía.</div>';
    } else {
      list.innerHTML = body.slice().sort((a,b)=>a.date < b.date ? 1 : -1).map(e=>`<div class="bodyItem">
        <div class="top"><span>${fmtShortDate(e.date)}</span><button class="linkBtn" data-bdel="${e.date}">Borrar</button></div>
        <div class="vals">${MEASURES.filter(m=>isFinite(e[m.k]) && e[m.k] > 0)
          .map(m=>`<span><small>${m.n}</small>${fmt1(mV(m, e[m.k]))}</span>`).join('')}</div></div>`).join('');
    }
    if(rows) setTimeout(drawBodyChart, 30);
  }

  // Gráfico compartido (canvas, sin librerías), lo usan Cuerpo y Evolución.
  // o.type: 'line' (medidas, ritmo) o 'bar' (minutos, distancia).
  // o.pts: [{x, v}] (x = posición en el eje: fecha en ms o número de barra), o.color,
  // o.fmtY (texto de las guías; por defecto fmt1), o.firstLbl / o.lastLbl (debajo, a los lados),
  // o.empty (texto en vez de gráfico), o.goal (línea de meta en barras), o.single (texto grande si hay 1 punto).
  function drawChart(canvas, o){
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if(!w) return;
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0,0,w,h);
    ctx.font = '11px Inter, sans-serif';
    if(o.empty){
      ctx.fillStyle = '#8fa0c2';
      ctx.fillText(o.empty, 4, h/2);
      return;
    }
    if(o.single){ // un solo dato: se muestra el valor en grande
      ctx.fillStyle = '#eef3ff'; ctx.font = '800 28px Inter, sans-serif';
      ctx.fillText(o.single, (w - ctx.measureText(o.single).width) / 2, h/2 + 6);
      ctx.fillStyle = '#8fa0c2'; ctx.font = '11px Inter, sans-serif';
      if(o.lastLbl) ctx.fillText(o.lastLbl, (w - ctx.measureText(o.lastLbl).width) / 2, h/2 + 26);
      return;
    }
    const fmtY = o.fmtY || fmt1, bar = o.type === 'bar';
    const padL = 40, padR = 10, padT = 12, padB = 24;
    const vals = o.pts.map(p=>p.v);
    let min = Math.min(...vals), max = Math.max(...vals);
    if(bar){ min = 0; max = Math.max(max, o.goal || 0); if(max <= 0) max = 1; }
    else if(max - min < 1){ min -= 0.5; max += 0.5; }
    const t0 = o.pts[0].x, t1 = o.pts[o.pts.length-1].x, n = o.pts.length;
    const slot = (w-padL-padR) / n; // ancho de cada barra (con su espacio)
    const X = t => bar ? padL + (t + 0.5) * slot : padL + (t1===t0 ? 0 : (t-t0)/(t1-t0)) * (w-padL-padR);
    const Y = v => padT + (1 - (v-min)/(max-min)) * (h-padT-padB);
    // lineas guia
    ctx.strokeStyle = '#1e2c4d'; ctx.lineWidth = 1; ctx.fillStyle = '#5d6d8f';
    [max, (max+min)/2, min].forEach(v=>{
      ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(w-padR, Y(v)); ctx.stroke();
      ctx.fillText(fmtY(v), 2, Y(v)+4);
    });
    ctx.fillText(o.firstLbl, padL, h-6);
    const lastLbl = o.lastLbl;
    ctx.fillText(lastLbl, w - padR - ctx.measureText(lastLbl).width, h-6);
    if(bar){
      ctx.fillStyle = o.color;
      o.pts.forEach(p=>{ if(p.v > 0) ctx.fillRect(X(p.x) - slot*0.3, Y(p.v), slot*0.6, Y(0) - Y(p.v)); });
      if(o.goal){ // meta semanal: línea punteada dorada
        ctx.strokeStyle = '#f5b82e'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(padL, Y(o.goal)); ctx.lineTo(w-padR, Y(o.goal)); ctx.stroke(); ctx.setLineDash([]);
      }
      return;
    }
    // linea del avance
    ctx.strokeStyle = o.color; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    ctx.beginPath();
    o.pts.forEach((p,i)=>{ const x = X(p.x), y = Y(p.v); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke();
    ctx.fillStyle = o.color;
    o.pts.forEach(p=>{ ctx.beginPath(); ctx.arc(X(p.x), Y(p.v), 3.5, 0, Math.PI*2); ctx.fill(); });
  }

  function drawBodyChart(){
    const m = MEASURES.find(x=>x.k === chartSel.value) || MEASURES[0];
    const s = seriesOf(m.k);
    const vals = s.map(e=>mV(m, e[m.k])); // peso en kg o lb
    const diff = vals[vals.length-1] - vals[0];
    drawChart(document.getElementById('bodyChart'), {
      type: 'line',
      empty: s.length < 2 ? (s.length ? 'Con la próxima medición verás la línea de tu avance.' : 'Sin datos de ' + m.n.toLowerCase() + ' todavía.') : null,
      pts: s.map((e,i)=>({x: new Date(e.date+'T12:00:00').getTime(), v: vals[i]})),
      firstLbl: s.length ? fmtShortDate(s[0].date) : '',
      lastLbl: s.length ? fmtShortDate(s[s.length-1].date) : '',
      color: Math.abs(diff) < 0.05 || goodOf(m) === 0 ? '#8fa0c2' : (diff * goodOf(m) > 0 ? '#4d9bff' : '#ff8a3d')
    });
  }

  document.getElementById('btnSaveBody').addEventListener('click', ()=>{
    const date = document.getElementById('bodyDate').value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){ alert('Elige la fecha de la medición.'); return; }
    const entry = {date};
    let any = false;
    MEASURES.forEach(m=>{
      const el = document.getElementById(m.id); if(!el) return; // medida que no se sigue
      // peso escrito en kg o lb -> kg; escrito en lb se redondea a 2 decimales (como en Perfil)
      const v = m.k === 'peso' ? (w=>imp() ? Math.round(w * 100) / 100 : w)(fromW(parseFloat(el.value))) : parseFloat(el.value);
      if(v > 0 && v < 400){ entry[m.k] = v; any = true; }
    });
    if(!any){ alert('Escribe al menos una medida.'); return; }
    const i = body.findIndex(e=>e.date === date);
    if(i >= 0) body[i] = Object.assign(body[i], entry); else body.push(entry);
    LS.set('mirun_body', body);
    // el peso tambien se usa para calcular las calorias
    if(entry.peso){
      profile.weight = entry.peso;
      LS.set('mirun_profile', profile);
      document.getElementById('profWeight').value = Math.round(toW(entry.peso) * 10) / 10;
    }
    MEASURES.forEach(m=>{ const el = document.getElementById(m.id); if(el) el.value = ''; });
    buildBodyForm();
    renderBody();
    showSaved();
  });

  document.getElementById('bodyList').addEventListener('click', (ev)=>{
    const b = ev.target.closest('[data-bdel]');
    if(!b) return;
    if(!confirm('¿Borrar la medición del ' + fmtShortDate(b.dataset.bdel) + '?')) return;
    body = body.filter(e=>e.date !== b.dataset.bdel);
    LS.set('mirun_body', body);
    renderBody();
  });

  // ---------- RUN LOGIC ----------
  let watchId = null;
  let running = false, paused = false;
  let startTime = 0, elapsedBeforePause = 0;
  let totalDist = 0; // km
  let runType = 'correr'; // tipo de actividad con GPS: correr | caminar | bici
  let lastPos = null;
  let timerInterval = null;
  let path = [];
  let splits = []; // {km: 1, seconds: 320}
  let lastSplitDist = 0;
  let lastSplitTime = 0;
  // aviso por voz en millas (profile.units 'imperial'): los splits se siguen guardando por km
  let lastVoiceMi = 0, lastVoiceTime = 0;
  let lastFixTime = 0;   // ultima vez que llego una posicion buena
  let badJumps = 0;      // saltos imposibles seguidos
  let wakeLock = null;
  let hiddenSince = 0;   // cuando se apago la pantalla / se cambio de app

  // ---------- PAUSA AUTOMÁTICA (actividades con GPS) ----------
  // "Quieta" = en los últimos 2 minutos se movió menos de 25 m (stillAnchor se mueve con la persona cada 25 m).
  // Entonces se pausa sola, avisa por voz y DESCUENTA esos 2 minutos: el tiempo guardado (seconds) es el
  // tiempo EN MOVIMIENTO, que es lo que cuentan la racha, las metas, el ritmo y las calorías.
  // Sigue sola cuando se aleja 15 m del punto de la pausa en 2 posiciones seguidas (o con "Reanudar").
  // Si el GPS se pierde no se pausa (no se sabe si está quieta). Se apaga en Perfil (profile.autoPause).
  // Se guarda en la actividad: autoPausedSeconds (tiempo quieta descontado) y autoPauses (cuántas veces).
  // A los 10 minutos en pausa automática pregunta UNA vez por pausa "¿Terminaste tu actividad?" y muestra Terminar.
  const AUTO_STILL_MS = 120000, AUTO_STILL_M = 25, AUTO_RESUME_M = 15, AUTO_ASK_MS = 600000;
  let autoPaused = false, stillAnchor = null, lastFix = null, pauseAt = null, pauseStartedAt = 0;
  let autoPausedMs = 0, autoPauses = 0, resumeHits = 0, autoAsked = false;
  function autoPauseOn(){ return profile.autoPause !== false && !ivl; } // en un entreno por intervalos no actúa (plan 22b)
  function resetAutoPause(){ autoPaused = false; stillAnchor = null; lastFix = null; pauseAt = null; pauseStartedAt = 0; autoPausedMs = 0; autoPauses = 0; resumeHits = 0; autoAsked = false; }
  // aviso en pantalla; con ask = true, la pregunta de los 10 minutos con el botón Terminar
  function showAutoPause(on, ask){
    document.getElementById('autoPauseBox').style.display = on ? '' : 'none';
    document.getElementById('autoPauseMsg').textContent = ask
      ? '¿Terminaste tu actividad? Llevas 10 minutos sin moverte.'
      : 'Llevas 2 minutos sin moverte. Cuando vuelvas a moverte, sigue sola.';
    document.getElementById('btnAutoStop').style.display = on && ask ? '' : 'none';
  }
  // cada posición buena del GPS (también en pausa)
  function autoPauseOnFix(lat, lon, now){
    lastFix = {lat, lon};
    if(!running || !autoPauseOn()) return;
    if(autoPaused){
      const d = haversine(pauseAt.lat, pauseAt.lon, lat, lon) * 1000;
      resumeHits = d >= AUTO_RESUME_M ? resumeHits + 1 : 0;
      if(resumeHits >= 2) autoResume(now, true);
      return;
    }
    if(paused) return;
    if(!stillAnchor || haversine(stillAnchor.lat, stillAnchor.lon, lat, lon) * 1000 >= AUTO_STILL_M) stillAnchor = {lat, lon, t: now};
  }
  // cada segundo (desde updateDisplay)
  function autoPauseTick(now){
    if(running && autoPaused && !autoAsked && now - pauseStartedAt >= AUTO_ASK_MS){ // 10 minutos quieta
      autoAsked = true; showAutoPause(true, true); say('¿Terminaste tu actividad?'); saveCurrentRun(true); return;
    }
    if(!running || paused || !autoPauseOn() || !stillAnchor) return;
    if(now - lastFixTime > 20000) return; // GPS perdido: no se sabe si está quieta
    if(now - stillAnchor.t >= AUTO_STILL_MS) autoPause(now);
  }
  function autoPause(now){
    const ran = elapsedBeforePause + (now - startTime);
    const stillMs = Math.min(now - stillAnchor.t, ran); // nunca más que lo que lleva
    elapsedBeforePause = ran - stillMs;
    paused = true; autoPaused = true; resumeHits = 0; autoAsked = false; // la pregunta de los 10 min es por pausa
    pauseAt = lastFix || {lat: stillAnchor.lat, lon: stillAnchor.lon};
    pauseStartedAt = now; autoPausedMs += stillMs; autoPauses++;
    stillAnchor = null;
    const t = elapsedBeforePause / 1000; // por si un kilómetro se cumplió dentro del rato descontado
    lastSplitTime = Math.min(lastSplitTime, t); lastVoiceTime = Math.min(lastVoiceTime, t);
    document.getElementById('btnPause').textContent = 'Reanudar';
    showAutoPause(true);
    say('Pausa automática.');
    saveCurrentRun(true);
  }
  function autoResume(now, spoken){
    autoPausedMs += now - pauseStartedAt;
    autoPaused = false; paused = false; startTime = now; lastFixTime = now; resumeHits = 0;
    stillAnchor = lastFix ? {lat: lastFix.lat, lon: lastFix.lon, t: now} : null;
    document.getElementById('btnPause').textContent = 'Pausar';
    showAutoPause(false);
    if(spoken) say('Seguimos.');
    saveCurrentRun(true);
  }

  const gpsStatus = document.getElementById('gpsStatus');
  const liveMapWrap = document.getElementById('liveMapWrap');
  const liveMapCanvas = document.getElementById('liveMap');
  const liveStreet = document.getElementById('liveStreet');
  const liveMapMode = document.getElementById('liveMapMode');
  const liveMapNote = document.getElementById('liveMapNote');

  // Dibuja el mapa en vivo (calles o linea) y actualiza el boton de cambio
  function refreshLiveMap(){
    if(!running){ liveMapWrap.style.display = 'none'; return; }
    liveMapWrap.style.display = 'block';
    let shown;
    // Un fallo del mapa nunca debe frenar el cronometro ni el guardado
    try{ shown = renderRoute('live', liveMapCanvas, liveStreet, path, '#4d9bff', true); }
    catch(e){ liveStreet.style.display = 'none'; liveMapCanvas.style.display = 'block';
              drawRoute(liveMapCanvas, path, '#4d9bff'); shown = 'linea'; }
    liveMapMode.textContent = profile.mapMode === 'linea' ? 'Ver: calles' : 'Ver: solo línea';
    if(profile.mapMode !== 'linea' && shown === 'linea'){
      liveMapNote.textContent = streetsNote();
    } else if(path.length === 0){
      liveMapNote.textContent = 'Esperando tu primera posición…';
    } else {
      liveMapNote.textContent = '';
    }
  }
  liveMapMode.addEventListener('click', ()=>{
    profile.mapMode = profile.mapMode === 'linea' ? 'calles' : 'linea';
    LS.set('mirun_profile', profile);
    document.getElementById('profMap').value = profile.mapMode;
    refreshLiveMap();
  });
  window.addEventListener('online', ()=>{ if(running) refreshLiveMap(); });
  window.addEventListener('offline', ()=>{ if(running) refreshLiveMap(); });

  function haversine(lat1, lon1, lat2, lon2){
    const R = 6371; // km
    const dLat = (lat2-lat1)*Math.PI/180;
    const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function pad(n){ n = Math.floor(n); return n<10 ? '0'+n : ''+n; }
  function fmtTime(totalSec){
    const h = Math.floor(totalSec/3600);
    const m = Math.floor((totalSec%3600)/60);
    const s = Math.floor(totalSec%60);
    return h>0 ? pad(h)+':'+pad(m)+':'+pad(s) : pad(m)+':'+pad(s);
  }

  function currentElapsedSec(){
    if(!running) return elapsedBeforePause/1000;
    if(paused) return elapsedBeforePause/1000;
    return (elapsedBeforePause + (Date.now()-startTime))/1000;
  }

  // kcal = MET × peso × horas × ajuste por edad/sexo
  function metCalories(met, seconds){
    const sexFactor = profile.sex === 'f' ? 0.93 : (profile.sex === 'm' ? 1.0 : 0.965); // 'x' = promedio
    const ageFactor = profile.age > 50 ? 0.95 : (profile.age > 35 ? 0.98 : 1.0);
    return Math.round(met * profile.weight * (seconds/3600) * sexFactor * ageFactor);
  }

  // type: 'correr' (por defecto), 'caminar' o 'bici'; el MET sale de la velocidad
  function calcCalories(distKm, seconds, type){
    const hrs = seconds/3600;
    const kmh = hrs > 0 ? distKm/hrs : 0;
    if(type === 'caminar') return metCalories(kmh < 4 ? 2.8 : kmh < 5.5 ? 3.5 : kmh < 6.5 ? 4.3 : 5.0, seconds);
    if(type === 'bici') return metCalories(kmh < 16 ? 4.0 : kmh < 19 ? 6.8 : kmh < 22 ? 8.0 : kmh < 25 ? 10.0 : 12.0, seconds);
    const paceMinPerKm = hrs>0 ? (seconds/60)/Math.max(distKm,0.001) : 0;
    let met = 8;
    if(paceMinPerKm > 0){
      if(paceMinPerKm <= 4.3) met = 14.5;
      else if(paceMinPerKm <= 5) met = 12.8;
      else if(paceMinPerKm <= 5.6) met = 11.5;
      else if(paceMinPerKm <= 6.2) met = 10.3;
      else if(paceMinPerKm <= 7) met = 9.0;
      else if(paceMinPerKm <= 8) met = 8.3;
      else if(paceMinPerKm <= 9.6) met = 6.7;
      else met = 6.0;
    }
    return metCalories(met, seconds);
  }

  function checkSplit(sec){
    const currentKm = Math.floor(totalDist);
    if(currentKm > lastSplitDist){
      const splitTime = sec - lastSplitTime;
      splits.push({km: currentKm, seconds: splitTime});
      lastSplitDist = currentKm;
      lastSplitTime = sec;
      if(!imp()) announceSplit('Kilómetro', 'Ese kilómetro', currentKm, splitTime, sec);
    }
    // en millas el aviso (voz y vibración) es por cada milla completa
    const currentMi = Math.floor(totalDist / KM_MI);
    if(currentMi > lastVoiceMi){
      const t = sec - lastVoiceTime;
      lastVoiceMi = currentMi; lastVoiceTime = sec;
      if(imp()) announceSplit('Milla', 'Esa milla', currentMi, t, sec);
    }
  }
  function announceSplit(name, that, n, splitTime, sec){
    if(ivl) return; // en intervalos la voz y la vibración son solo para los cambios de bloque
    try{ if(navigator.vibrate) navigator.vibrate([200,100,200]); }catch(e){}
    const pm = Math.floor(splitTime/60), ps = Math.round(splitTime%60);
    say(name + ' ' + n + '. ' + that + ' en ' + pm + ' minutos ' +
        (ps ? 'y ' + ps + ' segundos' : '') + '. Tiempo total ' + spokenTime(sec) + '.');
  }

  // ---------- AVISO POR VOZ (funciona sin internet) ----------
  function say(text, force){ // force: "Probar" en Perfil (aunque el aviso por voz esté apagado)
    if((!profile.voice && !force) || !('speechSynthesis' in window)) return;
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES'; u.rate = 1;
      const v = chosenVoice(); if(v){ u.voice = v; u.lang = v.lang; } // la elegida en Perfil; si ya no está, la automática
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
  // ---------- ELEGIR LA VOZ ----------
  // Perfil > Avisos > Voz: las voces en español del teléfono (speechSynthesis.getVoices). profile.voiceName = nombre de la
  // voz elegida ('' o sin campo = Automática). Si esa voz no está en este teléfono, se usa la automática sin fallar.
  function esVoices(){
    try{ return ('speechSynthesis' in window ? window.speechSynthesis.getVoices() : []).filter(v=>/^es([-_]|$)/i.test(v.lang || '')); }catch(e){ return []; }
  }
  function chosenVoice(){ return profile.voiceName ? esVoices().find(v=>v.name === profile.voiceName) || null : null; }
  // mujer u hombre, solo si el nombre lo dice (palabras o nombres propios comunes de las voces); si no, nada
  function voiceGender(name){ // (las listas van adentro: el Perfil se llena al abrir, antes de esta sección)
    const VOICE_F = /\b(female|mujer|femenin[ao]|helena|laura|sabina|paulina|m[oó]nica|elvira|dalia|luc[ií]a|conchita|pen[eé]lope|lupe|paloma|elena|marisol|esperanza|francisca|ximena|valentina|camila|elsa|isabela|isabel|carmen|sof[ií]a|catalina|abril|beatriz|renata|salome|salom[eé]|teresa|marta|ana|mar[ií]a|ines|in[eé]s|julia|lola|rosa|paula|andrea|dolores|karla|carla|amelia|yolanda|lorena|triana|irene|vera|alba|estrella|larissa|nora)\b/i;
    const VOICE_M = /\b(male|hombre|masculin[oa]|pablo|jorge|ra[uú]l|diego|enrique|[aá]lvaro|carlos|juan|andr[eé]s|miguel|sergio|jordi|tom[aá]s|gonzalo|federico|gerardo|alonso|dario|dar[ií]o|lorenzo|mateo|emilio|tadeo|liam|jos[eé]|antonio|manuel|luis|fernando|javier|alejandro|ricardo|eduardo|arnau|alberto|santiago|rodrigo|nicol[aá]s|teo)\b/i;
    if(/\b(female|mujer)\b/i.test(name) || (VOICE_F.test(name) && !VOICE_M.test(name))) return 'mujer';
    if(/\b(male|hombre)\b/i.test(name) || VOICE_M.test(name)) return 'hombre'; return ''; }
  function renderVoicePick(){
    const sel = document.getElementById('profVoiceName'), saved = profile.voiceName || '', list = esVoices();
    const opt = (v, t)=>{ const o = document.createElement('option'); o.value = v; o.textContent = t; return o; };
    sel.textContent = ''; sel.appendChild(opt('', 'Automática'));
    list.forEach(v=>{ const g = voiceGender(v.name); sel.appendChild(opt(v.name, v.name.replace(/^Microsoft\s+/i, '') + ' · ' + v.lang + (g ? ' · ' + g : ''))); });
    // la guardada no está en este teléfono: se conserva (por si vuelve) y se avisa que se usa la automática
    if(saved && !list.some(v=>v.name === saved)) sel.appendChild(opt(saved, saved + ' (no está en este teléfono: se usa la automática)'));
    sel.value = saved;
  }
  renderVoicePick();
  try{ if('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', renderVoicePick); }catch(e){}
  document.getElementById('btnVoiceTest').addEventListener('click', ()=>{
    const keep = profile.voiceName; profile.voiceName = document.getElementById('profVoiceName').value; // prueba la que se ve elegida
    try{ window.speechSynthesis.cancel(); }catch(e){}
    say('Hola, soy tu voz en MiRun. ¡Vamos con todo!', true);
    profile.voiceName = keep;
  });
  function spokenTime(sec){
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
    return (h ? h + (h===1?' hora ':' horas ') : '') + m + (m===1?' minuto':' minutos');
  }

  // ---------- CARRERA EN CURSO (se guarda por si se cierra la app) ----------
  let lastSaveAt = 0;
  function saveCurrentRun(force, mode){
    if(!running) return;
    if(!force && Date.now() - lastSaveAt < 5000) return;
    lastSaveAt = Date.now();
    LS.set('mirun_current', {
      type: runType, startTime, elapsedBeforePause, paused, totalDist, path, splits,
      lastSplitDist, lastSplitTime, lastVoiceMi, lastVoiceTime,
      autoPaused, pauseAt, pauseStartedAt, autoPausedMs, autoPauses, autoAsked, // pausa automática (se agregan)
      ivl, // entreno por intervalos en curso (o null)
      savedAt: Date.now()
    }, mode || 'once');
  }
  function clearCurrentRun(){ try{ localStorage.removeItem('mirun_current'); }catch(e){} }
  // guarda en el historial la carrera recién terminada. Si no cabe, prueba quitando su respaldo (mirun_current, casi del
  // mismo tamaño). Si igual no cabe, la guarda aparte en IndexedDB (RESCATE); solo si eso también falla, el respaldo
  // vuelve a su lugar y al abrir la app se ofrece "Guardarla así". "Guardar copia" la incluye mientras la app siga abierta.
  function saveRunToHistory(run){
    if(LS.set('mirun_history', history, 'quiet')){ clearCurrentRun(); return true; }
    let cur = null; try{ cur = localStorage.getItem('mirun_current'); }catch(e){}
    clearCurrentRun();
    if(LS.set('mirun_history', history, 'quiet')) return true;
    // no cabe: se guarda aparte (IndexedDB, otro espacio del navegador). Si eso también falla, vuelve el respaldo.
    LS.runUnsaved = run.date;
    rescueSave(run).then(ok=>{
      if(ok){ if(history.some(h=>h.date === run.date)) LS.rescue.add(run.date); else rescueDelete(run.date); } // ya descartada
      else{ try{ if(cur) localStorage.setItem('mirun_current', cur); }catch(e){} }
      document.querySelector('#summaryOverlay h2').textContent = typeName(run.type) +
        (ok ? ': guardada aparte (memoria llena)' : ': NO se pudo guardar (memoria llena)');
      if(ok) alert('La memoria de la app está llena: tu carrera quedó guardada aparte y la verás en el Historial.\n\nVe a Perfil → "Guardar copia" para tenerla a salvo.');
      else storageFullAlert();
    });
    return false;
  }

  // ---------- RESCATE ----------
  // Carreras que no cupieron en localStorage: base IndexedDB "mirun_rescue" (almacén "runs", clave = date).
  // Al abrir la app vuelven al Historial; se borran de aquí cuando ya quedaron en mirun_history.
  function rescueDB(){
    return new Promise((res, rej)=>{
      try{
        const r = indexedDB.open('mirun_rescue', 1);
        r.onupgradeneeded = ()=>r.result.createObjectStore('runs', {keyPath: 'date'});
        r.onsuccess = ()=>res(r.result); r.onerror = ()=>rej(r.error);
      }catch(e){ rej(e); }
    });
  }
  function rescueTx(mode, fn){
    return rescueDB().then(db=>new Promise(res=>{
      const tx = db.transaction('runs', mode), out = fn(tx.objectStore('runs'));
      tx.oncomplete = ()=>{ db.close(); res(out && 'result' in out ? out.result : true); };
      tx.onerror = tx.onabort = ()=>{ db.close(); res(false); };
    })).catch(()=>false);
  }
  function rescueSave(run){ return rescueTx('readwrite', st=>{ st.put(JSON.parse(JSON.stringify(run))); }); }
  function rescueDelete(date){ return rescueTx('readwrite', st=>{ st.delete(date); }); }
  function rescueAll(){ return rescueTx('readonly', st=>st.getAll()).then(r=>Array.isArray(r) ? r : []); }

  function updateDisplay(){
    autoPauseTick(Date.now()); // antes de leer el tiempo: la pausa automática lo descuenta
    const sec = currentElapsedSec();
    document.getElementById('distVal').textContent = toD(totalDist).toFixed(2); // km o mi
    document.getElementById('timeVal').textContent = fmtTime(sec);
    const paceMinPerKm = totalDist > 0.02 ? sec/60/totalDist : 0;
    if(paceMinPerKm > 0 && isFinite(paceMinPerKm)){
      const shownPace = toPace(paceMinPerKm); // min/km o min/mi (la alerta de ritmo sigue en min/km)
      const pm = Math.floor(shownPace);
      const ps = Math.round((shownPace-pm)*60);
      document.getElementById('paceVal').textContent = pad(pm)+':'+pad(ps>=60?59:ps);
    } else {
      document.getElementById('paceVal').textContent = '--:--';
    }
    document.getElementById('calVal').textContent = calcCalories(totalDist, sec, runType);
    checkSplit(sec);
    ivlTick(sec);
    zoneTick(sec);

    const alertEl = document.getElementById('paceAlert');
    if(runType==='correr' && goal.paceMin!=null && paceMinPerKm>0){
      const goalPace = goal.paceMin + (goal.paceSec||0)/60;
      const diff = paceMinPerKm - goalPace;
      if(diff > 0.33){
        alertEl.className = 'slow';
        alertEl.textContent = 'Vas más lento que tu ritmo objetivo';
      } else if(diff < -0.33){
        alertEl.className = 'fast';
        alertEl.textContent = 'Vas más rápido que tu ritmo objetivo';
      } else {
        alertEl.className = 'good';
        alertEl.textContent = 'Ritmo perfecto';
      }
    } else {
      alertEl.className = '';
      alertEl.textContent='';
    }

    refreshLiveMap();

    if(running && !paused){
      // Avisa si el GPS lleva rato sin dar posicion buena
      if(watchId !== null && lastFixTime && Date.now() - lastFixTime > 20000){
        gpsStatus.textContent = 'GPS perdido';
        gpsStatus.className = 'bad';
      }
      saveCurrentRun(false);
      if(goal.dist && totalDist >= goal.dist){
        say('Meta de distancia cumplida.');
        finishRun();
        return;
      }
      if(goal.time && sec/60 >= goal.time){
        say('Meta de tiempo cumplida.');
        finishRun();
        return;
      }
    }
  }

  const gpsHelp = document.getElementById('gpsHelp');
  const gpsHelpMsg = document.getElementById('gpsHelpMsg');
  let gpsGotFix = false;
  let gpsLowAccuracy = false; // segundo intento: acepta ubicacion por red/wifi

  function showGpsHelp(msg){
    gpsHelpMsg.innerHTML = msg;
    gpsHelp.style.display = 'block';
  }
  function hideGpsHelp(){ gpsHelp.style.display = 'none'; }

  function onPosition(pos){
    gpsGotFix = true;
    hideGpsHelp();
    const {latitude, longitude, accuracy} = pos.coords;
    if(accuracy && accuracy > 30){
      // Hay ubicacion pero todavia imprecisa (normal los primeros segundos o bajo techo)
      gpsStatus.textContent = 'GPS débil (±' + Math.round(accuracy) + ' m)';
      gpsStatus.className = '';
      return;
    }
    gpsStatus.textContent = 'GPS activo (±' + Math.round(accuracy||0) + ' m)';
    gpsStatus.className = 'ok';
    const now = Date.now();
    lastFixTime = now;
    autoPauseOnFix(latitude, longitude, now); // pausa automática: quieta / vuelve a moverse
    if(!running || paused || !lastPos){
      // Sin correr (o en pausa) solo se mueve el punto de referencia: no suma distancia
      lastPos = {lat:latitude, lon:longitude, t:now};
      if(running && !paused && path.length === 0) path.push({lat:latitude, lon:longitude, t:now});
      return;
    }
    const dMeters = haversine(lastPos.lat, lastPos.lon, latitude, longitude) * 1000;
    const dtSec = Math.max((now - lastPos.t)/1000, 1);
    // Filtro de "temblor": parado, el GPS salta unos metros. Solo cuenta si
    // el movimiento supera la mitad del margen de error (minimo 3 m).
    if(dMeters < Math.max(3, (accuracy||0)*0.5)) return;
    // Filtro de saltos imposibles: mas de 10 m/s (36 km/h) no es correr.
    if(dMeters/dtSec > 10){
      badJumps++;
      if(badJumps >= 3){ lastPos = {lat:latitude, lon:longitude, t:now}; badJumps = 0; }
      return;
    }
    badJumps = 0;
    totalDist += dMeters/1000;
    path.push({lat:latitude, lon:longitude, t:now});
    lastPos = {lat:latitude, lon:longitude, t:now};
  }

  // Detecta si la pagina esta metida dentro de otra (ej. el visor de Claude),
  // donde el navegador bloquea el GPS sin preguntar.
  function inFrame(){ try{ return window.self !== window.top; }catch(e){ return true; } }

  function onGpsError(err){
    if(err.code === 1){ // PERMISSION_DENIED
      stopGps();
      gpsStatus.textContent = 'GPS bloqueado';
      gpsStatus.className = 'bad';
      if(inFrame()){
        showGpsHelp('Esta página está abierta <b>dentro de otra aplicación</b> y ahí el GPS no funciona.<br>Ábrela directamente en <b>Chrome</b> con su propio link.');
      } else {
        showGpsHelp('Chrome tiene el GPS <b>bloqueado para esta página</b>.<br>Toca el ícono que está a la izquierda de la dirección (arriba) → <b>Permisos</b> → <b>Ubicación</b> → <b>Permitir</b>. Luego toca “Reintentar GPS”.');
      }
      return;
    }
    if(err.code === 3 && !gpsGotFix){ // TIMEOUT: aun buscando satelites
      gpsStatus.textContent = 'Buscando GPS…';
      gpsStatus.className = '';
      if(!gpsLowAccuracy){
        // segundo intento con menos precision para no quedarse en "no disponible"
        gpsLowAccuracy = true;
        restartGps();
      }
      showGpsHelp('Todavía no hay señal de GPS. Sal al aire libre, revisa que la <b>Ubicación</b> del teléfono esté encendida y espera unos segundos.');
      return;
    }
    if(err.code === 2){ // POSITION_UNAVAILABLE
      gpsStatus.textContent = 'GPS sin señal';
      gpsStatus.className = 'bad';
      showGpsHelp('El teléfono no da ubicación. Baja la cortina de notificaciones y enciende <b>Ubicación</b>. Luego toca “Reintentar GPS”.');
    }
  }

  function startGps(){
    if(!window.isSecureContext){
      gpsStatus.textContent = 'GPS bloqueado';
      gpsStatus.className = 'bad';
      showGpsHelp('El GPS solo funciona si el link empieza por <b>https://</b>.');
      return;
    }
    if(!navigator.geolocation){
      gpsStatus.textContent = 'Sin GPS';
      gpsStatus.className = 'bad';
      return;
    }
    gpsStatus.textContent = 'Buscando GPS…';
    gpsStatus.className = '';
    watchId = navigator.geolocation.watchPosition(onPosition, onGpsError, {
      enableHighAccuracy: !gpsLowAccuracy, maximumAge: 2000, timeout: 20000
    });
  }
  function restartGps(){ stopGps(); startGps(); }

  document.getElementById('btnGpsRetry').addEventListener('click', ()=>{
    gpsLowAccuracy = false; gpsGotFix = false;
    hideGpsHelp();
    restartGps();
  });

  // Si el permiso cambia (ej. lo activa en los ajustes de Chrome), reintenta solo
  if(navigator.permissions && navigator.permissions.query){
    navigator.permissions.query({name:'geolocation'}).then(st=>{
      st.onchange = ()=>{ if(st.state !== 'denied'){ hideGpsHelp(); restartGps(); } };
    }).catch(()=>{});
  }

  // ---------- MODO BOLSILLO ----------
  // Durante una actividad GPS, tapa la pantalla para que nada se toque por error (la pantalla sigue
  // encendida y se ve debajo). Se desbloquea manteniendo presionado el candado 1,5 s.
  const lockOv = document.getElementById('lockOverlay'), lockRing = document.getElementById('lockRing');
  let lockTimer = null;
  document.getElementById('btnLock').addEventListener('click', ()=>{ lockOv.classList.add('show'); });
  lockRing.addEventListener('pointerdown', (ev)=>{
    ev.preventDefault();
    lockRing.classList.add('holding');
    lockTimer = setTimeout(()=>{
      lockOv.classList.remove('show'); lockRing.classList.remove('holding');
      if(navigator.vibrate) navigator.vibrate(40);
    }, 1500);
  });
  ['pointerup','pointerleave','pointercancel'].forEach(e=>lockRing.addEventListener(e, ()=>{
    clearTimeout(lockTimer); lockRing.classList.remove('holding');
  }));
  lockOv.addEventListener('contextmenu', e=>e.preventDefault());

  // ---------- PANTALLA ENCENDIDA ----------
  // Chrome suelta este permiso cada vez que la pantalla se apaga o cambias de
  // app, por eso se vuelve a pedir al regresar.
  async function keepScreenOn(){
    if(!('wakeLock' in navigator) || !running) return;
    try{ wakeLock = await navigator.wakeLock.request('screen'); }catch(e){}
  }
  function releaseScreen(){
    try{ if(wakeLock) wakeLock.release(); }catch(e){}
    wakeLock = null;
  }

  const runNote = document.getElementById('runNote');
  function showRunNote(msg){ runNote.innerHTML = msg; runNote.style.display = 'block'; }

  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState === 'hidden'){
      hiddenSince = Date.now();
      saveCurrentRun(true);
      return;
    }
    // volvio a la app
    if(watchId === null && gpsHelp.style.display === 'none') startGps();
    if(running){
      keepScreenOn();
      const away = hiddenSince ? Math.round((Date.now() - hiddenSince)/1000) : 0;
      if(!paused && away >= 15){
        showRunNote('La pantalla estuvo apagada ' + (away >= 60 ? Math.round(away/60) + ' min' : away + ' s') +
          '. En ese rato Chrome no deja usar el GPS, así que la distancia de ese tramo se calculó en línea recta. ' +
          '<b>Para que sea exacta, deja la pantalla encendida mientras corres.</b>');
      }
      updateDisplay();
    }
    hiddenSince = 0;
  });
  function stopGps(){
    if(watchId!==null){ navigator.geolocation.clearWatch(watchId); watchId=null; }
  }

  startGps();

  function beginRun(state){
    LS.warned.mirun_current = false; // si la memoria se llena durante esta carrera, se avisa una vez
    running = true;
    paused = !!(state && state.paused);
    startTime = state ? state.startTime : Date.now();
    elapsedBeforePause = state ? state.elapsedBeforePause : 0;
    totalDist = state ? state.totalDist : 0;
    runType = (state && state.type) || selectedGpsType();
    // intervalos: al retomar, el entreno sigue donde iba; al empezar, el elegido en la pantalla Intervalos
    if(state) ivl = state.ivl ? ivlRestore(state.ivl) : null;
    else { ivl = ivlNext ? ivlStart(ivlNext) : null; ivlNext = null; }
    if(ivl) runType = 'correr';
    renderIvlPre();
    zoneBuf = []; zoneOut = null; zoneOutSince = 0; zoneLastSay = -1e9; // zona de ritmo: se mide de nuevo
    document.getElementById('gpsTypeRow').style.display = 'none';
    path = state ? (state.path || []) : [];
    splits = state ? (state.splits || []) : [];
    lastSplitDist = state ? state.lastSplitDist : 0;
    lastSplitTime = state ? state.lastSplitTime : 0;
    // carrera guardada por una versión anterior (sin estos campos): se sigue desde la milla actual
    lastVoiceMi = state ? (state.lastVoiceMi != null ? state.lastVoiceMi : Math.floor(totalDist / KM_MI)) : 0;
    // (el tiempo de esa milla no se guardó: se estima con el ritmo promedio hasta ahora)
    lastVoiceTime = state ? (state.lastVoiceTime != null ? state.lastVoiceTime
      : (totalDist > 0 ? currentElapsedSec() * Math.min(1, lastVoiceMi * KM_MI / totalDist) : 0)) : 0;
    lastPos = null; badJumps = 0; lastFixTime = Date.now();
    // pausa automática: se sigue donde estaba; la cuenta de "quieta" empieza de nuevo (con la app
    // cerrada no se sabe si se movió, así que ese rato no se descuenta)
    resetAutoPause();
    if(state){
      autoPaused = !!(state.autoPaused && state.paused);
      pauseAt = state.pauseAt || null; pauseStartedAt = state.pauseStartedAt || 0;
      autoPausedMs = state.autoPausedMs || 0; autoPauses = state.autoPauses || 0; autoAsked = !!state.autoAsked;
      if(autoPaused && !pauseAt) autoPaused = false;
    }
    showAutoPause(autoPaused, autoPaused && autoAsked);
    runNote.style.display = 'none';
    resetStreetMap('live');
    document.getElementById('btnStart').style.display='none';
    document.getElementById('resumeBox').style.display='none';
    document.getElementById('activeBtns').style.display='flex';
    document.body.classList.add('gpsOn'); // registrando con GPS: sin menú ni saludo, botones fijos abajo (CSS GPS EN CURSO)
    document.getElementById('btnPause').textContent = paused ? 'Reanudar' : 'Pausar';
    clearInterval(timerInterval);
    timerInterval = setInterval(updateDisplay, 1000);
    keepScreenOn();
    saveCurrentRun(true);
    updateDisplay();
    if(ivl && !state) ivlCue(); // anuncia el primer bloque
  }

  document.getElementById('btnStart').addEventListener('click', ()=>{
    clearCurrentRun();
    // "Despierta" la voz con el toque del usuario (algunos telefonos lo exigen)
    if(profile.voice) say(typeName(selectedGpsType()) + '. Iniciado.');
    beginRun(null);
  });

  // Si quedo una carrera a medias (se cerro la app o se recargo), ofrecer seguirla. Nunca se borra sola:
  // si es de hace más de 6 horas se avisa y el rato con la app cerrada NO cuenta (ni al seguir ni al guardarla así).
  // "Borrarla" pide confirmación.
  const pending = LS.get('mirun_current', null);
  if(pending && pending.startTime){
    showTab('run'); // la app abre en Inicio; si hay una actividad sin terminar, mostrarla
    const box = document.getElementById('resumeBox');
    const stale = Date.now() - (Number(pending.savedAt) || 0) >= 6*3600*1000;
    document.getElementById('resumeInfo').textContent =
      'Tienes una actividad sin terminar: ' + fmtD(pending.totalDist||0) + '.' +
      (stale ? ' Es de hace más de 6 horas: el tiempo con la app cerrada no cuenta.' : '');
    box.style.display = 'block';
    // vieja y sin pausa: el tiempo cuenta solo hasta el último guardado y sigue desde ahora
    const fixStale = ()=>{
      if(!stale || pending.paused || pending.staleFixed) return;
      pending.elapsedBeforePause = (Number(pending.elapsedBeforePause) || 0) + Math.max(0, (Number(pending.savedAt) || 0) - pending.startTime);
      pending.startTime = Date.now(); pending.staleFixed = true;
    };
    document.getElementById('btnResume').addEventListener('click', ()=>{ fixStale(); beginRun(pending); });
    document.getElementById('btnResumeSave').addEventListener('click', ()=>{
      fixStale(); beginRun(pending); finishRun();
    });
    document.getElementById('btnResumeDiscard').addEventListener('click', ()=>{
      if(!confirm('¿Borrar la actividad sin terminar? No se guarda nada.')) return;
      clearCurrentRun(); box.style.display = 'none';
      if(rtSessionActive()) showTab('rutinas'); // si también quedó una rutina sin terminar, se muestra
    });
  } else if(pending){
    clearCurrentRun(); // dato dañado (sin hora de inicio): no se puede seguir
  }

  document.getElementById('btnPause').addEventListener('click', function(){
    if(autoPaused){ autoResume(Date.now(), false); return; } // "Reanudar" durante la pausa automática
    stillAnchor = null; // la cuenta de "quieta" empieza de nuevo
    if(!paused){
      paused = true;
      elapsedBeforePause += Date.now()-startTime;
      this.textContent = 'Reanudar';
    } else {
      paused = false;
      startTime = Date.now();
      lastFixTime = Date.now();
      this.textContent = 'Pausar';
    }
    saveCurrentRun(true);
  });

  // Terminar pide confirmación (Pausar no): "¿Terminar actividad?" con "Sí, terminar" y "Seguir".
  // Tocar fuera de la hoja o Escape = Seguir. Si la actividad termina sola (meta cumplida), la hoja se cierra.
  const stopConfirm = document.getElementById('stopConfirm');
  const closeStopConfirm = ()=>stopConfirm.classList.remove('show');
  document.getElementById('btnStop').addEventListener('click', ()=>{ if(running) stopConfirm.classList.add('show'); });
  document.getElementById('btnStopNo').addEventListener('click', closeStopConfirm);
  document.getElementById('btnStopYes').addEventListener('click', ()=>{ closeStopConfirm(); finishRun(); });
  // "Terminar" de la pregunta de los 10 minutos en pausa automática: ya es la respuesta, termina directo
  document.getElementById('btnAutoStop').addEventListener('click', ()=>{ if(running) finishRun(); });
  stopConfirm.addEventListener('click', ev=>{ if(ev.target === stopConfirm) closeStopConfirm(); });
  document.addEventListener('keydown', ev=>{ if(ev.key === 'Escape' && stopConfirm.classList.contains('show')) closeStopConfirm(); });

  let sumPath = []; // ruta del último resumen, para el mapa grande
  let sumRunDate = null; // la carrera del resumen (ya guardada): "Descartar" la quita
  document.getElementById('btnSumBigMap').addEventListener('click', ()=>openBigMap(sumPath, 'Tu ruta'));
  function finishRun(){
    if(!running) return;
    document.getElementById('stopConfirm').classList.remove('show'); // por si terminó sola con la hoja abierta
    const sec = currentElapsedSec();
    if(autoPaused) autoPausedMs += Date.now() - pauseStartedAt; // terminó estando en pausa automática
    const autoInfo = autoPauses ? {autoPausedSeconds: Math.round(autoPausedMs / 1000), autoPauses} : {};
    saveCurrentRun(true, 'quiet'); // respaldo al día: se borra solo cuando la carrera ya quedó en el historial
    running = false;
    clearInterval(timerInterval);
    releaseScreen();
    runNote.style.display = 'none';
    const cal = calcCalories(totalDist, sec, runType);
    const paceMinPerKm = totalDist > 0.02 ? sec/60/totalDist : 0;
    const paceTotalSec = Math.round(paceMinPerKm*60);
    const paceStr = paceMinPerKm>0 ? pad(Math.floor(paceTotalSec/60))+':'+pad(paceTotalSec%60) : '--:--';

    if(totalDist > lastSplitDist){
      splits.push({km: Math.round((totalDist-lastSplitDist)*100)/100, seconds: sec-lastSplitTime, partial:true});
    }

    const recBefore = computeRecords(history);
    let runSaved = true;
    const ivlInfo = ivl ? ivlFinish(sec) : null; // detalle de cada bloque del entreno por intervalos
    if(totalDist > 0.01){
      history.push({
        date: new Date().toISOString(),
        dist: totalDist,
        seconds: sec,
        pace: paceStr,
        cal: cal,
        path: [], route: lightRoute(path), // ruta liviana (ver RUTA LIVIANA); los números ya se calcularon con todos los puntos
        splits: splits,
        type: runType,
        ...autoInfo, // pausa automática (solo si hubo)
        ...(ivlInfo && ivlInfo.blocks.length ? {intervals: ivlInfo} : {}) // intervalos: {name, kind, blocks:[{k, s, d, r}]}
      });
      sumRunDate = history[history.length - 1].date;
      runSaved = saveRunToHistory(history[history.length - 1]);
    } else { sumRunDate = null; clearCurrentRun(); } // tan corta que no se guarda
    document.getElementById('sumDiscardRow').style.display = sumRunDate ? '' : 'none';
    ivl = null; renderIvlBox(0); // el entreno terminó con la carrera

    document.querySelector('#summaryOverlay h2').textContent = runSaved ? '¡Terminaste! ' + typeName(runType) : typeName(runType) + ': NO se pudo guardar (memoria llena)'; // guardada; "Descartar" la quita
    document.getElementById('gpsTypeRow').style.display = 'flex';
    document.getElementById('btnStart').style.display='block';
    document.getElementById('activeBtns').style.display='none';
    document.body.classList.remove('gpsOn'); // vuelve el menú, el + y el saludo
    document.getElementById('btnPause').textContent='Pausar';
    paused = false;

    document.getElementById('sumDist').textContent = fmtD(totalDist);
    document.getElementById('sumTime').textContent = fmtTime(sec);
    document.getElementById('sumPace').textContent = paceTxt(sec, totalDist) + ' ' + paceU(); // paceStr (min/km) es lo que se guarda
    document.getElementById('sumCal').textContent = cal;
    document.getElementById('sumSteps').textContent = stepsTxt({type: runType, dist: totalDist}) + // pasos aproximados
      (autoInfo.autoPauses ? (stepsTxt({type: runType, dist: totalDist}) ? ' · ' : '') + 'Sin moverte ' + fmtTime(autoInfo.autoPausedSeconds) + ' (pausa automática, no cuenta)' : '');
    resetAutoPause(); showAutoPause(false);

    const sumMapWrap = document.getElementById('sumMapWrap');
    sumPath = [];
    refreshLiveMap(); // ya no esta corriendo: oculta el mapa en vivo
    if(path.length > 1){
      sumMapWrap.style.display = 'block';
      resetStreetMap('sum');
      const finalPath = path.slice();
      sumPath = finalPath; // para "Ver mapa" del resumen
      setTimeout(()=>{
        const c = document.getElementById('sumMap'), dv = document.getElementById('sumStreet');
        try{ renderRoute('sum', c, dv, finalPath, '#4d9bff', false); }
        catch(e){ dv.style.display = 'none'; c.style.display = 'block'; drawRoute(c, finalPath, '#4d9bff'); }
      }, 80);
    } else {
      sumMapWrap.style.display = 'none';
    }

    const splitsCard = document.getElementById('sumSplitsCard');
    const splitsList = document.getElementById('sumSplitsList');
    if(splits.length > 0){
      splitsCard.style.display = 'block';
      const fastest = Math.min(...splits.filter(s=>!s.partial).map(s=>s.seconds));
      const maxSec = Math.max(...splits.map(s=>s.seconds));
      splitsList.innerHTML = splits.map(s=>{
        const isBest = !s.partial && s.seconds === fastest;
        const pct = Math.max(15, (s.seconds/maxSec)*100);
        return `<div class="splitRow ${isBest?'best':''}">
          <div class="splitnum">${s.partial ? s.km : s.km}</div>
          <div class="bar"><div class="bar-fill" style="width:${pct}%;"></div></div>
          <div class="time num">${fmtTime(s.seconds)}</div>
        </div>`;
      }).join('');
    } else {
      splitsCard.style.display = 'none';
    }

    // ¿Rompio algun record con esta carrera?
    const recCard = document.getElementById('sumRecCard');
    const news = newRecords(recBefore, computeRecords(history));
    if(news.length){
      recCard.style.display = 'block';
      document.getElementById('sumRecList').innerHTML = news.map(r=>{
        const old = recBefore[REC_CATS.indexOf(r.k)].best;
        return `<div class="newRec">${raceTxt(r.k)} en ${fmtTime(r.best.sec)}
          <small>${old ? 'Antes: ' + fmtTime(old.sec) + ' · mejoraste ' + fmtTime(old.sec - r.best.sec) : 'Primera vez que corres esta distancia'}</small></div>`;
      }).join('');
      say('Nuevo récord en ' + news.map(r=>r.k + ' kilómetros').join(' y ') + '.');
    } else {
      recCard.style.display = 'none';
    }

    document.getElementById('summaryOverlay').classList.add('show');

    totalDist = 0; elapsedBeforePause=0;
    document.getElementById('distVal').textContent='0.00';
    document.getElementById('timeVal').textContent='00:00';
    document.getElementById('paceVal').textContent='--:--';
    document.getElementById('calVal').textContent='0';
    document.getElementById('paceAlert').className='';
    document.getElementById('paceAlert').textContent='';
  }

  document.getElementById('btnCloseSummary').addEventListener('click', ()=>{
    document.getElementById('summaryOverlay').classList.remove('show');
    renderHistory(); checkAchievements();
  });
  // "Descartar": la carrera ya estaba guardada (por si la app se cierra antes de elegir); aquí se quita
  document.getElementById('btnSumDiscard').addEventListener('click', ()=>{
    if(!sumRunDate || !confirm('¿Descartar esta carrera? No se guarda nada.')) return;
    const d = sumRunDate; sumRunDate = null;
    history = history.filter(h=>h.date !== d);
    LS.set('mirun_history', history);
    if(LS.runUnsaved === d){ LS.runUnsaved = null; clearCurrentRun(); }
    if(LS.rescue.has(d)){ LS.rescue.delete(d); rescueDelete(d); }
    document.getElementById('summaryOverlay').classList.remove('show');
    renderHistory();
  });

  // ---------- INTERVALOS ----------
  // Entrenos por intervalos con GPS que arma la persona (la app no recomienda cantidades). mirun_intervals = lista de:
  // {id, name, kind:'tiempo'|'distancia'|'libre', warm, cool (segundos, 0 = sin), easy, hard (s), reps (tiempo y distancia),
  //  dist (m), restKind:'tiempo'|'distancia', rest (s o m) (distancia)}. Libre (fartlek): botón "Acelero" / "Bajo".
  function ivlNum(v, lo, hi){ v = Math.round(Number(v)); return isFinite(v) && v >= lo ? Math.min(hi, v) : null; }
  function cleanIvlPlan(p){
    if(!p || typeof p !== 'object' || !['tiempo','distancia','libre'].includes(p.kind)) return null;
    const o = {id: typeof p.id === 'string' && /^[\w-]{1,40}$/.test(p.id) ? p.id : 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
               name: String(p.name || '').trim().slice(0, 40) || 'Intervalos', kind: p.kind,
               warm: p.kind === 'libre' ? 0 : ivlNum(p.warm, 0, 3600) || 0, cool: p.kind === 'libre' ? 0 : ivlNum(p.cool, 0, 3600) || 0};
    if(o.kind === 'tiempo'){ o.easy = ivlNum(p.easy, 5, 3600); o.hard = ivlNum(p.hard, 5, 3600); o.reps = ivlNum(p.reps, 1, 50);
      if(!o.easy || !o.hard || !o.reps) return null; }
    if(o.kind === 'distancia'){ o.dist = ivlNum(p.dist, 20, 10000); o.reps = ivlNum(p.reps, 1, 50);
      o.restKind = p.restKind === 'distancia' ? 'distancia' : 'tiempo'; o.rest = ivlNum(p.rest, 0, o.restKind === 'tiempo' ? 1800 : 5000) || 0;
      if(!o.dist || !o.reps) return null; }
    return o;
  }
  function cleanIvlPlans(a){ return Array.isArray(a) ? a.map(cleanIvlPlan).filter(Boolean).slice(0, 30) : []; }
  let ivlPlans = cleanIvlPlans(LS.get('mirun_intervals', []));
  function saveIvlPlans(){ return LS.set('mirun_intervals', ivlPlans); }
  function mmss(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function ivlSummary(p){
    const wc = (p.warm ? ' · calentamiento ' + mmss(p.warm) : '') + (p.cool ? ' · calma ' + mmss(p.cool) : '');
    if(p.kind === 'tiempo') return p.reps + ' × (' + mmss(p.easy) + ' suave + ' + mmss(p.hard) + ' fuerte)' + wc;
    if(p.kind === 'distancia') return p.reps + ' × ' + p.dist + ' m' + (p.rest ? ' · descanso ' + (p.restKind === 'tiempo' ? mmss(p.rest) : p.rest + ' m') : ' · sin descanso') + wc;
    return 'Libre (Acelero / Bajo)' + wc;
  }
  let ivlEditId = null;
  function ivlView(edit){ document.getElementById('ivlListView').style.display = edit ? 'none' : ''; document.getElementById('ivlEditView').style.display = edit ? '' : 'none'; }
  function renderIvl(){
    ivlView(false);
    document.getElementById('ivlList').innerHTML = ivlPlans.length ? ivlPlans.map(p=>`<div class="rtCard">
        <div class="rtName">${esc(p.name)}</div><div class="hint">${esc(ivlSummary(p))}</div>
        <div class="btnRow"><button class="btn btn-start" data-ivl-go="${esc(p.id)}">Empezar</button>
          <button class="btn btn-ghost" data-ivl-edit="${esc(p.id)}">Editar</button></div>
        <button class="linkBtn rtDel" data-ivl-del="${esc(p.id)}">Borrar entreno</button></div>`).join('')
      : '<div class="hint" style="margin-top:12px;">Todavía no tienes entrenos por intervalos. Crea el primero.</div>';
  }
  function ivlKindShow(k){
    document.querySelectorAll('#ivlKind .chip').forEach(c=>c.classList.toggle('on', c.dataset.kind === k));
    document.getElementById('ivlFTiempo').style.display = k === 'tiempo' ? '' : 'none';
    document.getElementById('ivlFDist').style.display = k === 'distancia' ? '' : 'none';
    document.getElementById('ivlFReps').style.display = k === 'libre' ? 'none' : '';
    document.getElementById('ivlFLibre').style.display = k === 'libre' ? '' : 'none';
    document.getElementById('ivlWarmCool').style.display = k === 'libre' ? 'none' : '';
  }
  function ivlRestShow(rk){
    document.querySelectorAll('#ivlRestKind .chip').forEach(c=>c.classList.toggle('on', c.dataset.rk === rk));
    document.getElementById('ivlRestUnit').textContent = rk === 'tiempo' ? 'segundos (0 = sin descanso)' : 'metros (0 = sin descanso)';
  }
  function ivlEdit(p){
    ivlEditId = p ? p.id : null;
    document.getElementById('ivlEdTitle').textContent = p ? 'Editar entreno' : 'Nuevo entreno';
    const v = (id, x)=>{ document.getElementById(id).value = x === undefined || x === null || x === '' ? '' : x; };
    v('ivlName', p ? p.name : ''); v('ivlReps', p && p.reps);
    v('ivlEasyMin', p && p.easy ? Math.floor(p.easy / 60) : ''); v('ivlEasySec', p && p.easy ? p.easy % 60 : '');
    v('ivlHardMin', p && p.hard ? Math.floor(p.hard / 60) : ''); v('ivlHardSec', p && p.hard ? p.hard % 60 : '');
    v('ivlDist', p && p.dist); v('ivlRest', p && p.kind === 'distancia' ? p.rest : '');
    v('ivlWarm', p && p.warm ? Math.round(p.warm / 60) : ''); v('ivlCool', p && p.cool ? Math.round(p.cool / 60) : '');
    ivlKindShow(p ? p.kind : 'tiempo'); ivlRestShow(p && p.restKind === 'distancia' ? 'distancia' : 'tiempo');
    document.getElementById('ivlEdMsg').textContent = '';
    ivlView(true);
  }
  document.getElementById('ivlKind').addEventListener('click', ev=>{ const c = ev.target.closest('[data-kind]'); if(c) ivlKindShow(c.dataset.kind); });
  document.getElementById('ivlRestKind').addEventListener('click', ev=>{ const c = ev.target.closest('[data-rk]'); if(c) ivlRestShow(c.dataset.rk); });
  document.getElementById('btnIvlNew').addEventListener('click', ()=>{
    if(ivlPlans.length >= 30){ alert('Puedes tener hasta 30 entrenos por intervalos.'); return; }
    ivlEdit(null);
  });
  document.getElementById('btnIvlCancel').addEventListener('click', renderIvl);
  document.getElementById('btnIvlSave').addEventListener('click', ()=>{
    const g = id=>document.getElementById(id).value, n = id=>Number(g(id)) || 0, msg = document.getElementById('ivlEdMsg');
    const kind = document.querySelector('#ivlKind .chip.on').dataset.kind, restKind = document.querySelector('#ivlRestKind .chip.on').dataset.rk;
    const raw = {id: ivlEditId || undefined, name: g('ivlName'), kind, warm: n('ivlWarm') * 60, cool: n('ivlCool') * 60,
      easy: n('ivlEasyMin') * 60 + n('ivlEasySec'), hard: n('ivlHardMin') * 60 + n('ivlHardSec'), reps: n('ivlReps'),
      dist: n('ivlDist'), restKind, rest: n('ivlRest')};
    const p = cleanIvlPlan(raw);
    if(!p){ msg.style.color = 'var(--amber)';
      msg.textContent = kind === 'tiempo' ? 'Escribe cuánto dura lo suave y lo fuerte (5 segundos o más) y cuántas repeticiones (1 a 50).'
        : 'Escribe la distancia de cada serie (20 m o más) y cuántas repeticiones (1 a 50).'; return; }
    const i = ivlPlans.findIndex(x=>x.id === p.id);
    if(i >= 0) ivlPlans[i] = p; else ivlPlans.push(p);
    if(!saveIvlPlans()) return;
    showSaved(); renderIvl();
  });
  document.getElementById('ivlList').addEventListener('click', ev=>{
    const b = ev.target.closest('[data-ivl-go],[data-ivl-edit],[data-ivl-del]'); if(!b) return;
    const p = ivlPlans.find(x=>x.id === (b.dataset.ivlGo || b.dataset.ivlEdit || b.dataset.ivlDel)); if(!p) return;
    if(b.dataset.ivlEdit) ivlEdit(p);
    else if(b.dataset.ivlDel){ if(!confirm('¿Borrar el entreno "' + p.name + '"? Las actividades que ya guardaste no se borran.')) return;
      ivlPlans = ivlPlans.filter(x=>x !== p); saveIvlPlans(); renderIvl(); }
    else ivlChoose(p);
  });
  // "Empezar": el entreno queda elegido en la pantalla del GPS (siempre como correr); se arranca con "Empezar" de allá
  function ivlChoose(p){
    if(running){ showTab('run'); return; }
    ivlNext = p;
    document.querySelectorAll('#gpsTypeRow .chip').forEach(c=>c.classList.toggle('on', c.dataset.gtype === 'correr'));
    showTab('run'); renderIvlPre();
  }
  function renderIvlPre(){
    const b = document.getElementById('ivlPre'); if(!b) return;
    b.style.display = ivlNext && !running ? '' : 'none';
    if(ivlNext) b.querySelector('span').innerHTML = '<b>Intervalos: ' + esc(ivlNext.name) + '</b><small>' + esc(ivlSummary(ivlNext)) + '</small>';
  }
  document.getElementById('btnIvlPreDel').addEventListener('click', ()=>{ ivlNext = null; renderIvlPre(); });

  // Durante el entreno. ivl = {plan, blocks: [{k, s (segundos) o m (metros), r (n° de serie)}], i: bloque actual,
  // t0 / d0: tiempo en movimiento (s) y distancia (km) al empezar el bloque, done: bloques terminados {k, s, d, r},
  // free: 'fuerte' o 'suave' (libre), ended: ya terminó el plan}. Va dentro de mirun_current: se retoma si se cierra la app.
  // Avanza con el tiempo EN MOVIMIENTO (la pausa lo detiene) y con la distancia del GPS. La pausa automática no actúa.
  function ivlBlocks(p){
    const b = [];
    if(p.warm) b.push({k: 'calentamiento', s: p.warm});
    if(p.kind === 'tiempo') for(let r = 1; r <= p.reps; r++){ b.push({k: 'suave', s: p.easy, r}); b.push({k: 'fuerte', s: p.hard, r}); }
    if(p.kind === 'distancia') for(let r = 1; r <= p.reps; r++){
      b.push({k: 'serie', m: p.dist, r});
      if(r < p.reps && p.rest) b.push(p.restKind === 'distancia' ? {k: 'descanso', m: p.rest, r} : {k: 'descanso', s: p.rest, r});
    }
    if(p.cool) b.push({k: 'calma', s: p.cool});
    return b;
  }
  function ivlStart(p){ const blocks = ivlBlocks(p);
    return {plan: p, blocks, i: 0, t0: 0, d0: 0, done: [], free: p.kind === 'libre' ? 'suave' : null, ended: p.kind !== 'libre' && !blocks.length}; }
  function cleanIvlBlocks(a){
    return Array.isArray(a) ? a.filter(x=>x && IVL_K.includes(x.k) && isFinite(x.s) && isFinite(x.d)).slice(0, 500).map(x=>Object.assign(
      {k: x.k, s: Math.max(0, Math.min(86400, Math.round(Number(x.s)))), d: Math.max(0, Math.min(1000, Math.round(Number(x.d) * 1000) / 1000))},
      Number.isInteger(x.r) && x.r > 0 && x.r <= 50 ? {r: x.r} : {})) : [];
  }
  function ivlRestore(st){ // entreno guardado en mirun_current (al retomar)
    const p = cleanIvlPlan(st && st.plan); if(!p) return null;
    const s = ivlStart(p);
    s.i = Math.max(0, Math.min(s.blocks.length, Math.round(Number(st.i)) || 0));
    s.t0 = Number(st.t0) || 0; s.d0 = Number(st.d0) || 0; s.done = cleanIvlBlocks(st.done);
    if(p.kind === 'libre') s.free = st.free === 'fuerte' ? 'fuerte' : 'suave';
    s.ended = p.kind !== 'libre' && (!!st.ended || s.i >= s.blocks.length);
    return s;
  }
  function ivlCur(){
    if(ivl.plan.kind === 'libre') return {k: ivl.free};
    return ivl.ended ? {k: 'extra'} : ivl.blocks[ivl.i];
  }
  function ivlClose(sec){ // cierra el tramo actual y lo anota en done
    const b = ivlCur(), s = sec - ivl.t0, d = Math.max(0, totalDist - ivl.d0);
    if(s >= 1 || d >= 0.001) ivl.done.push(Object.assign({k: b.k, s: Math.round(s), d: Math.round(d * 1000) / 1000}, b.r ? {r: b.r} : {}));
    ivl.t0 = sec; ivl.d0 = totalDist;
  }
  function ivlBuzz(){ if(profile.sounds !== false){ try{ if(navigator.vibrate) navigator.vibrate([250, 100, 250]); }catch(e){} } }
  function ivlCue(){ // voz y vibración al empezar cada bloque (la voz respeta "Aviso por voz"; la vibración, "Sonidos y vibración")
    const b = ivlCur(), last = b.r && b.r === ivl.plan.reps;
    let t;
    if(ivl.plan.kind === 'libre') t = 'Entreno libre. Toca Acelero cuando quieras.';
    else if(ivl.ended) t = 'Entreno terminado. Puedes seguir o tocar Terminar.';
    else if(b.k === 'fuerte') t = (last ? 'Última serie. ' : '') + '¡Ahora fuerte!';
    else if(b.k === 'serie') t = (last ? 'Última serie. ' : 'Serie ' + b.r + '. ') + '¡Ahora fuerte! ' + b.m + ' metros.';
    else if(b.k === 'suave') t = ivl.i === 0 || ivl.blocks[ivl.i - 1].k === 'calentamiento' ? 'Empieza suave.' : 'Descansa.';
    else if(b.k === 'descanso') t = 'Descansa.';
    else if(b.k === 'calentamiento') t = 'Calentamiento.';
    else t = 'Vuelta a la calma.';
    say(t); ivlBuzz();
  }
  function ivlTick(sec){ // cada segundo (updateDisplay): pasa de bloque cuando se cumple su tiempo o su distancia
    if(ivl && running && !paused && ivl.plan.kind !== 'libre'){
      for(let n = 0; n < 5 && !ivl.ended; n++){
        const b = ivl.blocks[ivl.i], el = sec - ivl.t0, dm = (totalDist - ivl.d0) * 1000;
        if(!((b.s && el >= b.s) || (b.m && dm >= b.m))) break;
        ivlClose(b.s ? ivl.t0 + b.s : sec); // por tiempo: termina justo en su duración (sin acumular atrasos)
        ivl.i++; if(ivl.i >= ivl.blocks.length) ivl.ended = true;
        ivlCue(); saveCurrentRun(true);
      }
    }
    renderIvlBox(sec);
  }
  function renderIvlBox(sec){
    const box = document.getElementById('ivlBox');
    if(!ivl || !running){ box.style.display = 'none'; return; }
    box.style.display = '';
    const b = ivlCur(), el = sec - ivl.t0, free = ivl.plan.kind === 'libre';
    box.className = 'k-' + b.k;
    document.getElementById('ivlLbl').textContent = (free ? (b.k === 'fuerte' ? 'Fuerte' : 'Suave') : ivl.ended ? 'Entreno completo' : IVL_LBL[b.k]).toUpperCase();
    document.getElementById('ivlLeft').textContent = free || ivl.ended ? mmss(el) : b.s ? mmss(b.s - el)
      : Math.max(0, Math.ceil(b.m - (totalDist - ivl.d0) * 1000)) + ' m';
    document.getElementById('ivlRep').textContent = !b.r ? '' : b.k === 'descanso' ? 'Descanso ' + b.r + ' de ' + (ivl.plan.reps - 1) : 'Serie ' + b.r + ' de ' + ivl.plan.reps;
    const nx = free || ivl.ended ? null : ivl.blocks[ivl.i + 1];
    document.getElementById('ivlNextTxt').textContent = free ? '' : ivl.ended ? 'Toca Terminar cuando quieras'
      : nx ? 'Sigue: ' + IVL_LBL[nx.k].toLowerCase() + ' ' + (nx.s ? mmss(nx.s) : nx.m + ' m') : 'Último bloque';
    const fb = document.getElementById('btnIvlFree');
    fb.style.display = free ? '' : 'none';
    if(free){ fb.textContent = b.k === 'fuerte' ? 'Bajo' : 'Acelero'; fb.disabled = paused; }
  }
  // al terminar la carrera: se cierra el tramo en curso y queda el detalle que se guarda en la actividad
  function ivlFinish(sec){
    ivlClose(sec);
    return {name: ivl.plan.name, kind: ivl.plan.kind, blocks: ivl.done.slice(0, 500)};
  }
  // detalle en el Historial: cada bloque con su tiempo, distancia y ritmo
  function ivlDetail(iv){
    if(!iv || !Array.isArray(iv.blocks) || !iv.blocks.length) return '';
    const rows = iv.blocks.map(b=>`<li><b>${IVL_LBL[b.k] || 'Tramo'}${b.r ? ' ' + b.r : ''}</b> · ${mmss(b.s)}${b.d > 0.005 ? ' · ' + fmtD(b.d) + ' · ' + paceTxt(b.s, b.d) + ' ' + paceU() : ''}</li>`).join('');
    return `<details class="rtHist"><summary>Intervalos «${esc(iv.name || 'Intervalos')}» · ${iv.blocks.length} ${iv.blocks.length === 1 ? 'tramo' : 'tramos'}</summary><ul>${rows}</ul></details>`;
  }
  // libre (fartlek): cada toque cierra el tramo y cambia entre suave y fuerte
  document.getElementById('btnIvlFree').addEventListener('click', ()=>{
    if(!ivl || ivl.plan.kind !== 'libre' || !running || paused) return;
    const sec = currentElapsedSec(); ivlClose(sec);
    ivl.free = ivl.free === 'fuerte' ? 'suave' : 'fuerte';
    say(ivl.free === 'fuerte' ? '¡Acelera!' : 'Baja el ritmo.'); ivlBuzz();
    saveCurrentRun(true); renderIvlBox(sec);
  });

  // ---------- ZONA DE RITMO ----------
  // goal.zone = {lo, hi}: ritmo en segundos por km, lo = el más rápido, hi = el más lento (sin campo = sin zona).
  // Se escribe "entre X y Y" en min/km o min/mi (según las unidades) en el GPS antes de salir o en Metas.
  // Durante la carrera: ritmo promedio de los últimos 30 s o 100 m (lo que se cumpla primero, mirando hacia atrás);
  // 20 s o más fuera del rango → aviso por voz, como mucho uno por minuto. En un entreno por intervalos se apaga.
  function parseMmss(t){
    const m = String(t || '').trim().match(/^(\d{1,2})(?:[:.,](\d{1,2}))?$/); if(!m) return null;
    const s = m[2] === undefined ? 0 : Number(m[2].length === 1 ? m[2] + '0' : m[2]);
    return s < 60 ? Number(m[1]) * 60 + s : null;
  }
  function zoneTxt(z){ return z ? [fmtPace(toPace(z.lo)), fmtPace(toPace(z.hi))] : ['', '']; }
  function renderZoneForms(){
    const [a, b] = zoneTxt(goal.zone);
    ['zoneRun', 'zoneGoal'].forEach(p=>{ document.getElementById(p + 'A').value = a; document.getElementById(p + 'B').value = b;
      document.getElementById(p + 'Msg').textContent = ''; });
  }
  // lee los dos campos: {zone} (o zone null = sin zona) o {error}
  function readZone(pre){
    const ta = document.getElementById(pre + 'A').value.trim(), tb = document.getElementById(pre + 'B').value.trim();
    if(!ta && !tb) return {zone: null};
    const a = parseMmss(ta), b = parseMmss(tb);
    if(a === null || b === null) return {error: 'Escribe los dos ritmos como minutos:segundos, por ejemplo 5:30 y 6:15.'};
    const toKm = v=>imp() ? Math.round(v / KM_MI * 10) / 10 : v; // se guarda en segundos por km
    let lo = toKm(Math.min(a, b)), hi = toKm(Math.max(a, b));
    const [sa, sb] = zoneTxt(goal.zone); // lo que se ve no cambió: se conserva el valor exacto (evita redondeos)
    if(goal.zone && fmtPace(Math.min(a, b)) === sa && fmtPace(Math.max(a, b)) === sb){ lo = goal.zone.lo; hi = goal.zone.hi; }
    if(lo < 120 || hi > 1200) return {error: 'Ese ritmo no parece de una actividad con GPS. Revisa los números.'};
    if(hi - lo < 5) return {error: 'Deja al menos 5 segundos de diferencia entre los dos ritmos.'};
    return {zone: {lo, hi}};
  }
  // en el GPS antes de salir: se guarda en las metas al cambiar
  document.getElementById('zoneRun').addEventListener('change', ()=>{
    const r = readZone('zoneRun'), m = document.getElementById('zoneRunMsg');
    if(r.error){ m.textContent = r.error; m.style.color = 'var(--amber)'; return; }
    if(r.zone) goal.zone = r.zone; else delete goal.zone;
    if(!LS.set('mirun_goal', goal)) return;
    const [a, b] = zoneTxt(goal.zone);
    renderZoneForms();
    m.textContent = goal.zone ? 'Zona guardada: entre ' + a + ' y ' + b + ' ' + paceU() + '.' : 'Sin zona de ritmo: no habrá avisos.';
    m.style.color = 'var(--good)';
  });
  function zonePace(sec){ // ritmo (s por km) de los últimos 30 s o 100 m; null si todavía no hay datos suficientes
    const n = zoneBuf[zoneBuf.length - 1];
    for(let j = zoneBuf.length - 2; j >= 0; j--){
      const s = zoneBuf[j];
      if(n.t - s.t >= 30 || n.d - s.d >= 0.1) return n.d - s.d > 0.005 ? (n.t - s.t) / (n.d - s.d) : null;
    }
    return null;
  }
  function zoneTick(sec){
    const box = document.getElementById('zoneInd'), z = goal.zone;
    if(!z || !running || ivl){ box.style.display = 'none'; return; } // sin zona, sin carrera o en intervalos: nada
    box.style.display = '';
    if(paused){ box.className = 'wait'; document.getElementById('zoneState').textContent = 'En pausa'; return; }
    const last = zoneBuf[zoneBuf.length - 1];
    if(!last || sec > last.t) zoneBuf.push({t: sec, d: totalDist});
    while(zoneBuf.length > 2 && sec - zoneBuf[1].t > 120) zoneBuf.shift(); // no hace falta más de 2 minutos
    const p = zonePace(sec), st = p === null ? 'wait' : p < z.lo ? 'fast' : p > z.hi ? 'slow' : 'in';
    const [a, b] = zoneTxt(z);
    box.className = st;
    document.getElementById('zoneState').textContent = {wait: 'Midiendo tu ritmo…', in: 'Dentro de la zona', fast: 'Muy rápido', slow: 'Muy lento'}[st];
    document.getElementById('zoneNow').textContent = (p !== null ? 'Ritmo ' + fmtPace(toPace(p)) + ' · ' : '') + 'zona ' + a + '–' + b + ' ' + paceU();
    if(st === 'fast' || st === 'slow'){
      if(zoneOut !== st){ zoneOut = st; zoneOutSince = sec; }
      if(sec - zoneOutSince >= 20 && sec - zoneLastSay >= 60){
        say(st === 'fast' ? 'Vas muy rápido, baja un poco.' : 'Vas lento, sube el ritmo.'); zoneLastSay = sec;
      }
    } else zoneOut = null;
  }

  // ---------- RACHA Y REGISTRO DE ACTIVIDADES ----------
  // fecha local AAAA-MM-DD de un Date
  function dayKey(d){ return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
  // [inicio, fin] en ms. Con GPS 'date' es el final; en las registradas a mano 'date' es el inicio
  function actRange(h){
    const t = new Date(h.date).getTime();
    return h.manual ? [t, t + h.seconds*1000] : [t - h.seconds*1000, t];
  }
  // minutos de actividad por día; si dos actividades se cruzan, el tiempo común se cuenta una vez
  function minutesByDay(){
    const byDay = new Map();
    history.forEach(h=>{
      if(!(h.seconds > 0)) return;
      const r = actRange(h), k = dayKey(new Date(r[0]));
      if(!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(r);
    });
    const out = new Map();
    byDay.forEach((rs, k)=>{
      rs.sort((a,b)=>a[0]-b[0]);
      let total = 0, s = rs[0][0], e = rs[0][1];
      for(let i=1; i<rs.length; i++){
        if(rs[i][0] <= e) e = Math.max(e, rs[i][1]);
        else { total += e - s; s = rs[i][0]; e = rs[i][1]; }
      }
      out.set(k, (total + e - s) / 60000);
    });
    return out;
  }
  // done = llegó al mínimo · rest = día de descanso · part = algo, sin llegar · miss = nada
  function dayStatus(mins, d){
    const m = mins.get(dayKey(d)) || 0;
    if(m >= dailyMin()) return 'done';
    if(restDaysOn(d).includes(d.getDay())) return 'rest';
    return m > 0 ? 'part' : 'miss';
  }
  // Se calcula desde el historial (no se guarda): el descanso no suma ni rompe; hoy solo rompe al terminar el día
  function streakInfo(mins){
    const keys = [...mins.keys()].sort();
    if(!keys.length) return {cur:0, best:0};
    const today = new Date(); today.setHours(12,0,0,0);
    const tk = dayKey(today);
    let best = 0, run = 0;
    for(const d = new Date(keys[0] + 'T12:00:00'); d <= today; d.setDate(d.getDate()+1)){
      const s = dayStatus(mins, d);
      if(s === 'done'){ run++; if(run > best) best = run; }
      else if(s !== 'rest' && dayKey(d) !== tk) run = 0;
    }
    return {cur: run, best};
  }

  function setBar(id, val, goalVal){
    document.getElementById(id+'Min').textContent = val;
    document.getElementById(id+'Goal').textContent = 'de ' + goalVal + ' min';
    const bar = document.getElementById(id+'Bar'); if(!bar) return; // "hoy" es un anillo (setRing)
    bar.style.width = Math.min(100, val/goalVal*100) + '%';
    bar.classList.toggle('full', val >= goalVal);
  }
  // anillo de "Tu meta de hoy" (circunferencia 2·π·52) y la frase de abajo
  function setRing(val, goalVal, stat){
    const c = 2 * Math.PI * 52, p = Math.min(1, val / goalVal), ring = document.getElementById('todayRing');
    ring.style.strokeDasharray = c; ring.style.strokeDashoffset = c * (1 - p);
    ring.classList.toggle('full', val >= goalVal);
    document.getElementById('todayGoalHint').textContent = stat === 'rest' && val < goalVal ? 'Hoy es tu día de descanso.'
      : val >= goalVal ? '¡Cumplida! Tu racha sigue.' : 'Te faltan ' + Math.ceil(goalVal - val) + ' min.';
  }
  // tira de lunes a domingo de esta semana: cumplido, descanso, incompleto o por venir
  function renderWeekStrip(mins, monday, today){
    const tk = dayKey(today);
    document.getElementById('weekStrip').innerHTML = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map((n, i)=>{
      const d = new Date(monday); d.setDate(monday.getDate() + i);
      const s = d > today ? 'future' : dayStatus(mins, d), lbl = {done: 'cumplido', rest: 'descanso', part: 'incompleto', future: ''}[s] || 'sin actividad';
      return `<div class="wd ${s}${dayKey(d) === tk ? ' today' : ''}" title="${lbl}"><span>${n}</span><i class="num">${d.getDate()}</i></div>`;
    }).join('');
  }
  document.getElementById('btnCalToggle').addEventListener('click', ev=>{
    const p = document.getElementById('calPanel'), open = p.style.display === 'none';
    p.style.display = open ? '' : 'none';
    ev.currentTarget.textContent = open ? 'Ocultar calendario' : 'Ver calendario';
    ev.currentTarget.setAttribute('aria-expanded', open);
    if(open) p.scrollIntoView({behavior: 'smooth', block: 'start'});
  });

  // Calendario de Inicio (solo lee datos): las últimas 4 semanas, o un mes completo con ‹ y ›.
  // ‹ desde "Últimas 4 semanas" va al mes actual y sigue hacia atrás hasta el mes de la primera actividad;
  // › desde el mes actual vuelve a las 4 semanas.
  let calMonth = null, calMins = null; // calMonth null = últimas 4 semanas; si no, n° de mes (año*12 + mes)
  function monthIdx(d){ return d.getFullYear() * 12 + d.getMonth(); }
  function renderCal(mins){
    if(mins) calMins = mins; else mins = calMins || minutesByDay();
    const today = new Date(); today.setHours(12,0,0,0);
    const tk = dayKey(today), nowIdx = monthIdx(today);
    const firstIdx = history.length ? Math.min(nowIdx, monthIdx(new Date(history.map(h=>h.date).sort()[0]))) : nowIdx;
    let start, n, lead = 0, title;
    if(calMonth === null){
      start = mondayOf(today); start.setDate(start.getDate() - 21); n = 28; title = 'Últimas 4 semanas';
    } else {
      start = new Date(Math.floor(calMonth / 12), calMonth % 12, 1, 12);
      n = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      lead = (start.getDay() + 6) % 7; // huecos antes del día 1 (la semana empieza el lunes)
      title = start.toLocaleDateString('es-ES', {month:'long', year:'numeric'});
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    let html = ['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(x=>`<div class="h">${x}</div>`).join('') + '<div class="d blank"></div>'.repeat(lead);
    let done = 0, min = 0;
    for(let i=0; i<n; i++){
      const d = new Date(start); d.setDate(start.getDate()+i);
      const s = d > today ? 'future' : dayStatus(mins, d);
      if(s === 'done') done++;
      if(d <= today) min += mins.get(dayKey(d)) || 0;
      html += `<div class="d ${s}${dayKey(d) === tk ? ' today' : ''}">${d.getDate()}</div>`;
    }
    document.getElementById('calGrid').innerHTML = html;
    document.getElementById('calTitle').textContent = title;
    document.getElementById('calSum').textContent = calMonth === null ? '' :
      done + (done === 1 ? ' día cumplido' : ' días cumplidos') + ' · ' + Math.round(min) + ' min de actividad';
    document.getElementById('calPrev').style.visibility = calMonth === null || calMonth > firstIdx ? '' : 'hidden';
    document.getElementById('calNext').style.visibility = calMonth === null ? 'hidden' : '';
  }
  document.getElementById('calPrev').addEventListener('click', ()=>{
    const nowIdx = monthIdx(new Date());
    const firstIdx = history.length ? Math.min(nowIdx, monthIdx(new Date(history.map(h=>h.date).sort()[0]))) : nowIdx;
    calMonth = calMonth === null ? nowIdx : Math.max(firstIdx, calMonth - 1); renderCal();
  });
  document.getElementById('calNext').addEventListener('click', ()=>{
    calMonth = calMonth === null || calMonth >= monthIdx(new Date()) ? null : calMonth + 1;
    renderCal();
  });
  // Vuelve después de 3 días o más sin actividad (sin contar si esos días fueron todos de descanso):
  // saludo especial en Inicio UNA vez por regreso. mirun_welcomeBack = día de la última actividad antes de ese
  // regreso; en esta sesión se mantiene hasta que haya actividad hoy, y al volver a abrir ya no sale.
  let welcomeBackFor = null;
  function welcomeBack(mins, today, tk, recent){
    if(recent || !history.length || (mins.get(tk) || 0) > 0) return false;
    const last = [...mins.keys()].filter(k=>k < tk && mins.get(k) > 0).sort().pop();
    if(!last) return false;
    const allRest = [1,2,3].every(n=>{ const d = new Date(today); d.setDate(d.getDate()-n); return restDaysOn(d).includes(d.getDay()); });
    if(allRest) return false;
    if(welcomeBackFor === last) return true;               // ya se mostró en esta sesión: se mantiene
    if(LS.get('mirun_welcomeBack', null) === last) return false; // ya se mostró antes para este regreso
    welcomeBackFor = last; LS.set('mirun_welcomeBack', last, 'quiet');
    return true;
  }
  function renderHome(){
    const mins = minutesByDay(), st = streakInfo(mins);
    document.getElementById('streakVal').textContent = st.cur;
    document.getElementById('streakLbl').textContent = st.cur === 1 ? 'día' : 'días';
    document.getElementById('streakBest').textContent = st.best;
    document.getElementById('streakBestLbl').textContent = st.best === 1 ? 'día' : 'días';
    const today = new Date(); today.setHours(12,0,0,0);
    const tk = dayKey(today);
    // semana de lunes a domingo
    const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay()+6) % 7));
    let wMin = 0;
    for(let i=0; i<7; i++){ const d = new Date(monday); d.setDate(monday.getDate()+i); wMin += mins.get(dayKey(d)) || 0; }
    setBar('today', Math.round(mins.get(tk) || 0), dailyMin());
    setBar('week', Math.round(wMin), weekMin());
    setRing(Math.round(mins.get(tk) || 0), dailyMin(), dayStatus(mins, today));
    renderWeekStrip(mins, monday, today);
    // mascota: pose y mensaje según cómo va el día
    const tStat = dayStatus(mins, today), left = Math.max(0, Math.ceil(dailyMin() - (mins.get(tk) || 0)));
    const recent = [1,2,3].some(n=>{ const d = new Date(today); d.setDate(d.getDate()-n); return (mins.get(dayKey(d)) || 0) > 0; });
    let mk, msg;
    if(tStat === 'done'){ mk = 'cumplido'; msg = '¡Meta de hoy cumplida! Llevas ' + st.cur + (st.cur === 1 ? ' día' : ' días') + ' de racha.'; }
    else if(tStat === 'rest'){ mk = 'descanso'; msg = 'Hoy es tu día de descanso. Recupera energía, tu racha sigue a salvo.'; }
    else if(st.cur === 0 && st.best > 0 && recent){ mk = 'rota'; msg = 'Tu racha se reinició, pero hoy empieza otra. ¡Vamos!'; }
    else if(welcomeBack(mins, today, tk, recent)){ mk = 'vuelta'; msg = '¡Qué bueno verte de vuelta! ¿Empezamos con 10 minutos?'; }
    else if((mins.get(tk) || 0) > 0){ mk = 'enCamino'; msg = '¡Vas bien! Te faltan ' + left + ' min para cumplir hoy.'; }
    else { mk = 'hoy'; msg = 'Te faltan ' + left + ' min para cumplir hoy. ¡Tú puedes!'; }
    const hm = document.getElementById('homeMascot');
    setMascot(hm, mk);
    hm.classList.toggle('mSadIdle', mk === 'rota'); // triste: respira más lento y cabizbaja
    if(mk !== lastHomeMk){ // reacciona solo cuando cambia el estado (no en cada repintado)
      if(mk === 'cumplido') mascotReact(hm, 'mCheer');      // racha del día mantenida: celebra
      else if(mk === 'rota') mascotReact(hm, 'mSad');
      lastHomeMk = mk;
    }
    const ph = dailyPhrase(mk === 'vuelta' ? 'superacion' : 'inicio'); // frase del día junto a la mascota
    document.getElementById('homeMsg').innerHTML = esc(msg) + (ph ? '<span class="phrase">' + esc(ph) + '</span>' : '');
    renderTodayPlan(today, tk);
    renderCal(mins);
    const todays = history.filter(h=>dayKey(new Date(actRange(h)[0])) === tk);
    document.getElementById('todayList').innerHTML = todays.length ? todays.map(h=>{
      const a = actInfo(h.type);
      return `<div class="actRow"><div class="ic">${ico(a.i)}</div><div class="an">${a.n}
        <small>${Math.round(h.seconds/60)} min${h.dist > 0 ? ' · ' + fmtD(h.dist) : ''}${stepsOf(h) ? ' · ' + stepsTxt(h) : ''}${h.intensity ? ' · intensidad ' + h.intensity : ''}</small></div>
        <div class="num">${h.cal} kcal</div></div>`;
    }).join('') : '<div class="hint">Todavía no registras actividad hoy.</div>';
  }

  // elegir una sola opción dentro de un grupo de chips
  function pickOne(group, ev){
    const c = ev.target.closest('.chip'); if(!c) return;
    group.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on', x === c));
  }
  const actChips = document.getElementById('actChips'), actInt = document.getElementById('actInt');
  const gpsTypeRow = document.getElementById('gpsTypeRow');
  actChips.innerHTML = ACTIVITIES.filter(a=>!a.gps).map((a,i)=>
    `<button class="chip${i === 0 ? ' on' : ''}" data-act="${a.k}">${ico(a.i)}${a.n}</button>`).join('');
  actChips.addEventListener('click', ev=>pickOne(actChips, ev));
  actInt.addEventListener('click', ev=>pickOne(actInt, ev));
  gpsTypeRow.addEventListener('click', ev=>pickOne(gpsTypeRow, ev));
  document.getElementById('actDate').value = todayStr();
  { const n = new Date(); document.getElementById('actTime').value = pad(n.getHours()) + ':' + pad(n.getMinutes()); }

  document.getElementById('btnAct').addEventListener('click', ()=>{
    const msg = document.getElementById('actMsg');
    const bad = t=>mascotMsg(msg, 'error', t, 'var(--danger)');
    const type = actChips.querySelector('.chip.on').dataset.act;
    const intensity = actInt.querySelector('.chip.on').dataset.int;
    const dateStr = document.getElementById('actDate').value;
    const timeStr = document.getElementById('actTime').value;
    const mins = parseInt(document.getElementById('actMin').value);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) return bad('Falta la fecha o la hora de inicio.');
    if(!(mins >= 1 && mins <= 600)) return bad('La duración debe estar entre 1 y 600 minutos.');
    const startD = new Date(dateStr + 'T' + timeStr + ':00');
    if(startD.getTime() > Date.now()) return bad('La hora de inicio no puede ser en el futuro.');
    let iso = startD.toISOString();
    while(history.some(h=>h.date === iso)) iso = new Date(new Date(iso).getTime() + 1000).toISOString();
    const seconds = mins * 60;
    history.push({date: iso, type, intensity, seconds,
                  cal: metCalories(actInfo(type).met[INTENSITY.indexOf(intensity)], seconds),
                  dist: 0, pace: '--:--', path: [], splits: [], manual: true});
    history.sort((a,b)=>a.date < b.date ? -1 : 1);
    const ok = LS.set('mirun_history', history);
    document.getElementById('actMin').value = '';
    const st = streakInfo(minutesByDay());
    if(!ok){ msg.textContent = NOT_SAVED; msg.style.color = 'var(--amber)'; }
    else mascotMsg(msg, mins >= 60 ? 'guardadoLargo' : 'guardado', typeName(type) + ' guardado. Racha: ' + st.cur + (st.cur === 1 ? ' día.' : ' días.'), 'var(--good)');
    renderHistory(); checkAchievements();
  });


  // ---------- MIS RUTINAS ----------
  // Rutinas de fuerza que arma la persona (menú "+" -> "Mi rutina de fuerza"). La app NO recomienda cantidades ni
  // da instrucciones de técnica: solo nombres de ejercicios y lo que la persona escribe.
  // mirun_routines = [{id, name, created, items:[{ex | name, kind:'reps'|'secs', amount, sets}]}]
  //   ex = clave de EXERCISES; un ejercicio propio guarda name (texto de la persona).
  // Una sesión terminada se guarda como actividad 'ejercicios' con el detalle en routine (ver SESIÓN DE RUTINA).
  let routines = LS.get('mirun_routines', []);
  if(!Array.isArray(routines)) routines = [];
  function exName(it){ const e = EXERCISES.find(x=>x.k === it.ex); return e ? e.n : String(it.name || 'Ejercicio'); }
  function itemTxt(it){ return it.sets + (it.sets === 1 ? ' serie' : ' series') + ' × ' + it.amount + (it.kind === 'secs' ? ' s' : (it.amount === 1 ? ' repetición' : ' repeticiones')); }
  function saveRoutines(){ return LS.set('mirun_routines', routines); }
  const rtViews = ['rtListView', 'rtEditView', 'rtSesView'];
  function rtView(v){ rtViews.forEach(id=>{ document.getElementById(id).style.display = id === v ? '' : 'none'; }); window.scrollTo(0, 0); }

  // lista de rutinas
  function renderRoutines(){
    if(typeof rtSessionActive === 'function' && rtSessionActive()){ rtView('rtSesView'); renderSession(); return; }
    rtView('rtListView');
    const box = document.getElementById('rtList');
    box.innerHTML = routines.length ? routines.map(r=>`<div class="rtCard">
        <div class="rtName">${esc(r.name)}</div>
        <div class="hint">${r.items.length} ${r.items.length === 1 ? 'ejercicio' : 'ejercicios'}: ${esc(r.items.map(exName).join(', '))}</div>
        <div class="hint">${r.mode === 'circuito' ? 'Circuito' : 'Por ejercicio'} · ${r.rest ? 'descanso ' + r.rest + ' s' : 'sin descanso'}</div>
        <div class="btnRow"><button class="btn btn-start" data-rt-go="${esc(r.id)}">Empezar</button>
          <button class="btn btn-ghost" data-rt-edit="${esc(r.id)}">Editar</button></div>
        <button class="linkBtn rtDel" data-rt-del="${esc(r.id)}">Borrar rutina</button></div>`).join('')
      : `<div class="empty"><img src="${mascot('vacio')}" alt="">Todavía no tienes rutinas.<br>Crea la primera con tus ejercicios.</div>`;
    renderWeek();
  }
  // "Mi semana": una rutina por día (o ninguna); se guarda al cambiar
  function renderWeek(){
    const plan = weekPlan(), box = document.getElementById('rtWeekRows');
    document.getElementById('rtWeek').style.display = routines.length ? '' : 'none';
    // tira compacta: cada día muestra su rutina; al tocarlo se abre la lista (el select va encima, invisible)
    const FULL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'], today = new Date().getDay();
    box.innerHTML = [1,2,3,4,5,6,0].map(d=>{ const r = routines.find(x=>x.id === plan[d]);
      return `<label class="wkDay${r ? ' on' : ''}${d === today ? ' today' : ''}"><b>${DAY2[d]}</b><span>${r ? ico('dumbbell') : '—'}</span>
      <select data-wday="${d}" aria-label="Rutina del ${FULL[d]}"><option value="">Sin rutina</option>${routines.map(x=>`<option value="${esc(x.id)}"${plan[d] === x.id ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>`; }).join('');
    // debajo, en una línea, qué rutina toca cada día (los nombres no caben enteros en la tira)
    const sum = [1,2,3,4,5,6,0].map(d=>{ const r = routines.find(x=>x.id === plan[d]); return r ? '<b>' + DAY2[d] + '</b> ' + esc(r.name) : ''; }).filter(Boolean);
    document.getElementById('rtWeekSum').innerHTML = sum.length ? sum.join(' · ') : 'Todavía no hay rutinas en tu semana.';
  }
  document.getElementById('rtWeekRows').addEventListener('change', ev=>{
    const s = ev.target.closest('[data-wday]'); if(!s) return;
    const plan = weekPlan(); if(s.value) plan[s.dataset.wday] = s.value; else delete plan[s.dataset.wday];
    LS.set('mirun_weekplan', plan); showSaved(); renderWeek();
  });
  document.getElementById('todayPlan').addEventListener('click', ev=>{
    const b = ev.target.closest('#btnPlanGo'); if(!b) return;
    if(rtSessionActive()){ showTab('rutinas'); return; } // ya hay una sesión: se sigue esa
    const r = routines.find(x=>x.id === b.dataset.rid); if(!r) return;
    showTab('rutinas'); startSession(r);
  });
  document.getElementById('rtList').addEventListener('click', ev=>{
    const g = ev.target.closest('[data-rt-go]'), e = ev.target.closest('[data-rt-edit]'), d = ev.target.closest('[data-rt-del]');
    const find = id=>routines.find(r=>r.id === id);
    if(g){ const r = find(g.dataset.rtGo); if(r && typeof startSession === 'function') startSession(r); }
    else if(e){ const r = find(e.dataset.rtEdit); if(r) openRoutineEditor(r); }
    else if(d){ const r = find(d.dataset.rtDel); if(!r) return;
      if(!confirm('¿Borrar la rutina "' + r.name + '"? Las sesiones que ya guardaste no se borran.')) return;
      routines = routines.filter(x=>x !== r); saveRoutines();
      const plan = weekPlan(); Object.keys(plan).forEach(k=>{ if(plan[k] === r.id) delete plan[k]; }); LS.set('mirun_weekplan', plan); // su día queda libre
      renderRoutines(); }
  });
  document.getElementById('btnRtNew').addEventListener('click', ()=>{
    if(routines.length >= RT_LIM.routines){ alert('Puedes tener hasta ' + RT_LIM.routines + ' rutinas.'); return; }
    openRoutineEditor(null);
  });

  // editor: rtDraft es una copia; solo se guarda con "Guardar rutina"
  let rtDraft = null;
  function openRoutineEditor(r){
    rtDraft = r ? {id: r.id, name: r.name, created: r.created, items: r.items.map(i=>Object.assign({}, i))}
                : {id: null, name: '', items: []};
    rtDraft.mode = r && r.mode === 'circuito' ? 'circuito' : 'ejercicio';
    document.getElementById('rtRest').value = r && r.rest ? r.rest : ''; // vacío = sin descanso (la app no sugiere)
    renderRtMode();
    document.getElementById('rtEditTitle').textContent = r ? 'Editar rutina' : 'Nueva rutina';
    document.getElementById('rtName').value = rtDraft.name;
    document.getElementById('rtCustom').value = '';
    document.getElementById('rtMsg').textContent = '';
    renderDraftItems(); rtView('rtEditView');
  }
  function renderRtMode(){
    document.querySelectorAll('#rtMode .chip').forEach(c=>c.classList.toggle('on', c.dataset.mode === rtDraft.mode));
    document.getElementById('rtModeHint').textContent = rtDraft.mode === 'circuito'
      ? 'Una serie de cada ejercicio y se repite la vuelta.' : 'Todas las series de un ejercicio y después el siguiente.';
  }
  document.getElementById('rtMode').addEventListener('click', ev=>{
    const c = ev.target.closest('[data-mode]'); if(!c || !rtDraft) return; rtDraft.mode = c.dataset.mode; renderRtMode();
  });
  document.getElementById('rtExChips').innerHTML = EXERCISES.map(e=>`<button class="chip" data-ex="${e.k}">+ ${e.n}</button>`).join('');
  function addDraftItem(it){
    if(rtDraft.items.length >= RT_LIM.items){ mascotMsg(document.getElementById('rtMsg'), 'error', 'Puedes poner hasta ' + RT_LIM.items + ' ejercicios por rutina.', 'var(--danger)'); return; }
    rtDraft.items.push(Object.assign({kind:'reps', amount:'', sets:''}, it)); renderDraftItems();
  }
  document.getElementById('rtExChips').addEventListener('click', ev=>{
    const c = ev.target.closest('[data-ex]'); if(c) addDraftItem({ex: c.dataset.ex});
  });
  document.getElementById('btnRtCustom').addEventListener('click', ()=>{
    const inp = document.getElementById('rtCustom'), n = inp.value.trim().slice(0, RT_LIM.name);
    if(!n){ inp.focus(); return; }
    addDraftItem({name: n}); inp.value = '';
  });
  // cada ejercicio: repeticiones o segundos, cantidad y series (vacíos: la app no sugiere números), subir, bajar, quitar
  function renderDraftItems(){
    const box = document.getElementById('rtItems');
    box.innerHTML = rtDraft.items.length ? rtDraft.items.map((it, i)=>`<div class="rtItem">
        <div class="rtItemTop"><b>${esc(exName(it))}</b>
          <span class="rtMove"><button class="linkBtn" data-mv="${i}" data-d="-1" aria-label="Subir"${i ? '' : ' disabled'}>↑</button>
          <button class="linkBtn" data-mv="${i}" data-d="1" aria-label="Bajar"${i < rtDraft.items.length - 1 ? '' : ' disabled'}>↓</button>
          <button class="linkBtn" data-rm="${i}" aria-label="Quitar">${ico('x')}</button></span></div>
        <div class="chips rtKind"><button class="chip${it.kind === 'reps' ? ' on' : ''}" data-kind="reps" data-i="${i}">Repeticiones</button>
          <button class="chip${it.kind === 'secs' ? ' on' : ''}" data-kind="secs" data-i="${i}">Segundos</button></div>
        <div class="row2"><div><label>${it.kind === 'secs' ? 'Segundos' : 'Repeticiones'}</label><input type="number" inputmode="numeric" data-f="amount" data-i="${i}" value="${it.amount}"></div>
          <div><label>Series</label><input type="number" inputmode="numeric" data-f="sets" data-i="${i}" value="${it.sets}"></div></div></div>`).join('')
      : '<div class="hint">Toca los ejercicios de arriba para agregarlos.</div>';
  }
  const rtItemsBox = document.getElementById('rtItems');
  rtItemsBox.addEventListener('input', ev=>{
    const f = ev.target.dataset.f; if(!f) return;
    rtDraft.items[+ev.target.dataset.i][f] = ev.target.value;
  });
  rtItemsBox.addEventListener('click', ev=>{
    const k = ev.target.closest('[data-kind]'), mv = ev.target.closest('[data-mv]'), rm = ev.target.closest('[data-rm]');
    if(k){ rtDraft.items[+k.dataset.i].kind = k.dataset.kind; renderDraftItems(); }
    else if(mv && !mv.disabled){ const i = +mv.dataset.mv, j = i + (+mv.dataset.d); const a = rtDraft.items; [a[i], a[j]] = [a[j], a[i]]; renderDraftItems(); }
    else if(rm){ rtDraft.items.splice(+rm.dataset.rm, 1); renderDraftItems(); }
  });
  document.getElementById('btnRtCancel').addEventListener('click', ()=>{ rtDraft = null; renderRoutines(); });
  document.getElementById('btnRtSave').addEventListener('click', ()=>{
    const msg = document.getElementById('rtMsg'), bad = t=>mascotMsg(msg, 'error', t, 'var(--danger)');
    const name = document.getElementById('rtName').value.trim().slice(0, RT_LIM.name);
    if(!name) return bad('Ponle un nombre a la rutina.');
    if(!rtDraft.items.length) return bad('Agrega al menos un ejercicio.');
    const items = [];
    for(const it of rtDraft.items){
      const amount = parseInt(it.amount), sets = parseInt(it.sets), lim = RT_LIM[it.kind];
      if(!(amount >= lim[0] && amount <= lim[1])) return bad(exName(it) + ': escribe ' + (it.kind === 'secs' ? 'los segundos (1 a 3600).' : 'las repeticiones (1 a 999).'));
      if(!(sets >= RT_LIM.sets[0] && sets <= RT_LIM.sets[1])) return bad(exName(it) + ': escribe las series (1 a 20).');
      items.push(Object.assign(it.ex ? {ex: it.ex} : {name: String(it.name).slice(0, RT_LIM.name)}, {kind: it.kind, amount, sets}));
    }
    const restTxt = document.getElementById('rtRest').value.trim(), rest = parseInt(restTxt);
    if(restTxt && !(rest >= RT_LIM.rest[0] && rest <= RT_LIM.rest[1])) return bad('Descanso: escribe los segundos (1 a 600) o déjalo vacío.');
    const meta = {mode: rtDraft.mode}; if(restTxt) meta.rest = rest;
    if(rtDraft.id){
      const r = routines.find(x=>x.id === rtDraft.id);
      if(r){ r.name = name; r.items = items; r.mode = meta.mode; if(meta.rest) r.rest = meta.rest; else delete r.rest; }
    } else {
      routines.push(Object.assign({id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, created: new Date().toISOString(), items}, meta));
    }
    saveRoutines(); rtDraft = null; renderRoutines(); showSaved();
  });


  // ---------- SESIÓN DE RUTINA ----------
  // Cronómetro (con pausa) y las series de cada ejercicio para marcar lo hecho. En ejercicios por segundos hay una
  // cuenta regresiva por serie que la marca sola al terminar ("Serie lista" por voz si el aviso por voz está activo).
  // mirun_session = sesión en curso {rid, name, items:[{...ejercicio, done}], start, startTime, elapsedBefore, paused, savedAt}.
  // Si la app se cierra, al abrir vuelve a la sesión EN PAUSA desde el último guardado (el rato cerrada no cuenta).
  // "Terminar": se elige la intensidad y se guarda como actividad 'ejercicios' con el detalle en routine
  // ({name, items:[{ex | name, kind, amount, sets, done}]}). La racha cuenta sus minutos como cualquier actividad.
  let ses = null, sesTimer = null, sesCd = null, sesSaveAt = 0, sesClosedNote = false, sesFinishing = false;
  function rtSessionActive(){ return !!ses; }
  function sesElapsed(){ return ses ? ses.elapsedBefore + (ses.paused ? 0 : Date.now() - ses.startTime) : 0; }
  function saveSession(){ if(ses){ ses.savedAt = Date.now(); LS.set('mirun_session', ses, 'once'); sesSaveAt = ses.savedAt; } }
  function clearSession(){ ses = null; sesCd = null; sesFinishing = false; sesClosedNote = false; clearInterval(sesTimer); sesTimer = null; try{ localStorage.removeItem('mirun_session'); }catch(e){} }
  // modo guiado: order = lista de pasos {i: ejercicio, s: número de serie}; pos = paso actual.
  // 'ejercicio': todas las series de uno y luego el siguiente; 'circuito': una serie de cada uno y se repite la vuelta.
  function buildOrder(items, mode){
    const o = [];
    if(mode === 'circuito'){ const max = Math.max(...items.map(it=>it.sets));
      for(let s = 0; s < max; s++) items.forEach((it, i)=>{ if(s < it.sets) o.push({i, s}); }); }
    else items.forEach((it, i)=>{ for(let s = 0; s < it.sets; s++) o.push({i, s}); });
    return o;
  }
  function startSession(r){
    LS.warned.mirun_session = false;
    const now = Date.now(), mode = r.mode === 'circuito' ? 'circuito' : 'ejercicio';
    ses = {rid: r.id, name: r.name, items: r.items.map(i=>Object.assign({}, i, {done: 0})),
           start: new Date(now).toISOString(), startTime: now, elapsedBefore: 0, paused: false, savedAt: now,
           guided: true, mode, rest: r.rest || 0, pos: 0}; // sin guided = sesión de la versión anterior (vista de lista)
    ses.order = buildOrder(ses.items, mode);
    saveSession(); runSessionTimer(); rtView('rtSesView'); renderSession();
  }
  function runSessionTimer(){ clearInterval(sesTimer); sesTimer = setInterval(tickSession, 1000); }
  // "Serie lista" en el modo guiado: suma la serie, pasa al siguiente paso y empieza el descanso (si hay)
  function guidedDone(){
    const st = ses.order[ses.pos]; if(!st) return;
    const it = ses.items[st.i]; if(it.done < it.sets) it.done++;
    ses.pos++; sesCd = null;
    if(ses.pos >= ses.order.length) sesFinishing = true; // terminó: "¿Guardar esta sesión?"
    else if(ses.rest > 0) ses.restEndsAt = Date.now() + ses.rest * 1000;
    saveSession(); renderSession();
  }
  function tickSession(){
    if(!ses) return;
    if(ses.guided && ses.restEndsAt && !ses.paused){ // descanso entre series
      const left = Math.ceil((ses.restEndsAt - Date.now()) / 1000), el = document.getElementById('rtRestLeft');
      if(left <= 0){
        ses.restEndsAt = null; const nx = ses.order[ses.pos];
        if(nx) say('A seguir: ' + exName(ses.items[nx.i]) + '.');
        if(profile.sounds !== false){ try{ if(navigator.vibrate) navigator.vibrate(120); }catch(e){} }
        saveSession(); renderSession(); return;
      }
      if(el) el.textContent = left + ' s';
    }
    const t = document.getElementById('rtSesTime'); if(t) t.textContent = fmtTime(sesElapsed() / 1000);
    if(sesCd){
      const left = Math.ceil((sesCd.endsAt - Date.now()) / 1000), el = document.getElementById('rtCdLeft');
      if(left <= 0){ // serie por segundos terminada: se marca sola
        say('Serie lista.');
        if(profile.sounds !== false){ try{ if(navigator.vibrate) navigator.vibrate(120); }catch(e){} }
        if(ses.guided){ guidedDone(); return; }
        const it = ses.items[sesCd.i]; if(it.done < it.sets) it.done++;
        sesCd = null;
        saveSession(); renderSession(); return;
      }
      if(el) el.textContent = left + ' s';
    }
    if(Date.now() - sesSaveAt > 5000) saveSession();
  }
  function guidedTxt(it, s){ return 'Serie ' + (s + 1) + ' de ' + it.sets + ' · ' + it.amount + (it.kind === 'secs' ? ' segundos' : (it.amount === 1 ? ' repetición' : ' repeticiones')); }
  function renderGuided(v){
    const doneSets = ses.items.reduce((a, it)=>a + it.done, 0), allSets = ses.order.length;
    if(ses.pos >= ses.order.length) sesFinishing = true;
    const st = ses.order[ses.pos], it = st && ses.items[st.i], nx = ses.order[ses.pos + 1];
    const resting = !!(ses.restEndsAt || ses.restLeft);
    const restLeft = Math.max(0, Math.ceil((ses.restEndsAt ? ses.restEndsAt - Date.now() : (ses.restLeft || 0)) / 1000));
    let body;
    if(sesFinishing) body = `<div class="panel rtFinish"><h3>¿Guardar esta sesión?</h3>
        <div class="hint">${doneSets} de ${allSets} series hechas.</div>
        <label>¿Cómo fue la intensidad?</label>
        <div class="chips" id="rtFinInt">${INTENSITY.map(x=>`<button class="chip${x === 'media' ? ' on' : ''}" data-int="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
        <div class="hint" id="rtFinMsg" style="margin-top:8px;"></div>
        <div class="btnRow"><button class="btn btn-ghost" id="btnSesDiscard">No guardar</button><button class="btn btn-start" id="btnSesSave">Guardar</button></div>
        ${st ? '<button class="linkBtn rtDel" id="btnSesKeep">Seguir con la sesión</button>' : ''}</div>`;
    else if(resting) body = `<div class="panel rtGuide">
        <div class="rtGuideLbl">Descanso</div>
        <div class="rtRestTime num" id="rtRestLeft">${restLeft} s</div>
        <div class="hint">Sigue: <b>${esc(exName(it))}</b> · ${guidedTxt(it, st.s)}</div>
        <button class="btn btn-ghost rtBigBtn" id="btnRestSkip">Saltar descanso</button></div>`;
    else {
      const cd = sesCd && sesCd.i === st.i;
      const btn = it.kind === 'secs'
        ? (cd ? `<div class="rtRestTime num" id="rtCdLeft">${Math.max(0, Math.ceil((sesCd.endsAt - Date.now()) / 1000))} s</div>
                 <button class="btn btn-ghost" data-cd-stop="1">Detener</button>`
              : `<button class="btn btn-start rtBigBtn" id="btnGuidedCd"${ses.paused ? ' disabled' : ''}>▶ Empezar ${it.amount} s</button>`)
        : `<button class="btn btn-start rtBigBtn" id="btnGuidedDone"${ses.paused ? ' disabled' : ''}>Serie lista</button>`;
      body = `<div class="panel rtGuide">
        <div class="rtGuideName">${esc(exName(it))}</div>
        <div class="rtGuideSub">${guidedTxt(it, st.s)}</div>
        ${btn}
        ${nx ? `<div class="hint rtGuideNext">Después: ${esc(exName(ses.items[nx.i]))} · Serie ${nx.s + 1} de ${ses.items[nx.i].sets}</div>`
             : '<div class="hint rtGuideNext">Es la última serie.</div>'}</div>
        <div class="btnRow"><button class="btn btn-stop" id="btnSesEnd">Terminar sesión</button></div>`;
    }
    v.innerHTML = `<div class="panel rtSesHead">
        <h3>${esc(ses.name)}</h3>
        ${sesClosedNote === 'stale' ? '<div class="hint rtSesNote">Tienes una rutina sin terminar. ¿Guardar lo hecho o descartar?</div>'
          : sesClosedNote ? '<div class="hint rtSesNote">La app se cerró: tu sesión quedó en pausa. Toca Reanudar para seguir.</div>' : ''}
        ${gpsPendingShown() ? '<div class="hint rtSesNote">También tienes una actividad con GPS sin terminar. <button class="linkBtn" id="btnSesGoRun">Ver la actividad</button></div>' : ''}
        <div class="rtSesTime num" id="rtSesTime">${fmtTime(sesElapsed() / 1000)}</div>
        <div class="hint">${ses.paused ? 'En pausa' : 'Tiempo de la sesión'} · ${doneSets} de ${allSets} series · ${ses.mode === 'circuito' ? 'Circuito' : 'Por ejercicio'}</div>
        <div class="btnRow"><button class="btn ${ses.paused ? 'btn-start' : 'btn-ghost'}" id="btnSesPause">${ses.paused ? 'Reanudar' : 'Pausar'}</button></div>
      </div>` + body;
  }
  function renderSession(){
    const v = document.getElementById('rtSesView');
    if(!ses){ v.innerHTML = ''; return; }
    if(ses.guided && Array.isArray(ses.order)){ renderGuided(v); return; }
    const doneSets = ses.items.reduce((a, it)=>a + it.done, 0), allSets = ses.items.reduce((a, it)=>a + it.sets, 0);
    v.innerHTML = `<div class="panel rtSesHead">
        <h3>${esc(ses.name)}</h3>
        ${sesClosedNote === 'stale' ? '<div class="hint rtSesNote">Tienes una rutina sin terminar. ¿Guardar lo hecho o descartar?</div>'
          : sesClosedNote ? '<div class="hint rtSesNote">La app se cerró: tu sesión quedó en pausa. Toca Reanudar para seguir.</div>' : ''}
        ${gpsPendingShown() ? '<div class="hint rtSesNote">También tienes una actividad con GPS sin terminar. <button class="linkBtn" id="btnSesGoRun">Ver la actividad</button></div>' : ''}
        <div class="rtSesTime num" id="rtSesTime">${fmtTime(sesElapsed() / 1000)}</div>
        <div class="hint">${ses.paused ? 'En pausa' : 'Tiempo de la sesión'} · ${doneSets} de ${allSets} series</div>
        <div class="btnRow"><button class="btn ${ses.paused ? 'btn-start' : 'btn-ghost'}" id="btnSesPause">${ses.paused ? 'Reanudar' : 'Pausar'}</button></div>
      </div>` + ses.items.map((it, i)=>{
        const cd = sesCd && sesCd.i === i, left = it.done < it.sets;
        return `<div class="panel rtSesItem${it.done >= it.sets ? ' full' : ''}">
          <div class="rtItemTop"><b>${esc(exName(it))}</b><span class="hint">${itemTxt(it)}</span></div>
          <div class="rtSets">${Array.from({length: it.sets}, (_, j)=>`<button class="setBtn${j < it.done ? ' on' : ''}" data-set="${j}" data-i="${i}" aria-pressed="${j < it.done}" aria-label="Serie ${j + 1}">${j < it.done ? ico('check') : j + 1}</button>`).join('')}</div>
          ${it.kind === 'secs' && left ? (cd
            ? `<div class="rtCd"><span>Cuenta regresiva</span><b class="num" id="rtCdLeft">${Math.max(0, Math.ceil((sesCd.endsAt - Date.now()) / 1000))} s</b><button class="btn btn-ghost" data-cd-stop="1">Detener</button></div>`
            : `<button class="btn btn-ghost rtCdBtn" data-cd="${i}"${ses.paused ? ' disabled' : ''}>▶ Cuenta regresiva: ${it.amount} s (serie ${it.done + 1})</button>`) : ''}
        </div>`; }).join('') +
      (sesFinishing ? `<div class="panel rtFinish"><h3>¿Cómo fue la intensidad?</h3>
          <div class="chips" id="rtFinInt">${INTENSITY.map(x=>`<button class="chip${x === 'media' ? ' on' : ''}" data-int="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
          <div class="hint" id="rtFinMsg" style="margin-top:8px;"></div>
          <div class="btnRow"><button class="btn btn-ghost" id="btnSesKeep">Seguir</button><button class="btn btn-start" id="btnSesSave">Guardar actividad</button></div>
          <button class="linkBtn rtDel" id="btnSesDiscard">Descartar la sesión sin guardar</button></div>`
        : `<div class="btnRow"><button class="btn btn-stop" id="btnSesEnd">Terminar sesión</button></div>`);
  }
  document.getElementById('rtSesView').addEventListener('click', ev=>{
    if(!ses) return;
    const set = ev.target.closest('[data-set]'), cd = ev.target.closest('[data-cd]'), id = (ev.target.closest('button') || {}).id;
    if(set){ // tocar una serie: marca hasta esa; tocar la última marcada la desmarca
      const it = ses.items[+set.dataset.i], j = +set.dataset.set;
      it.done = j < it.done ? j : j + 1;
      if(sesCd && sesCd.i === +set.dataset.i) sesCd = null;
      saveSession(); renderSession(); return;
    }
    if(cd && !cd.disabled){ const it = ses.items[+cd.dataset.cd]; sesCd = {i: +cd.dataset.cd, endsAt: Date.now() + it.amount * 1000}; renderSession(); return; }
    if(ev.target.closest('[data-cd-stop]')){ sesCd = null; renderSession(); return; }
    if(id === 'btnSesPause'){
      const now = Date.now();
      if(ses.paused){ ses.paused = false; ses.startTime = now; sesClosedNote = false; delete ses.ask;
        if(ses.restLeft){ ses.restEndsAt = now + ses.restLeft; delete ses.restLeft; } } // el descanso sigue donde quedó
      else { ses.elapsedBefore += now - ses.startTime; ses.paused = true; sesCd = null;
        if(ses.restEndsAt){ ses.restLeft = Math.max(1, ses.restEndsAt - now); ses.restEndsAt = null; } }
      saveSession(); renderSession(); return;
    }
    if(id === 'btnSesGoRun'){ showTab('run'); return; }
    if(id === 'btnGuidedDone'){ if(!ses.paused) guidedDone(); return; }
    if(id === 'btnGuidedCd'){ if(ses.paused) return; const it = ses.items[ses.order[ses.pos].i];
      sesCd = {i: ses.order[ses.pos].i, endsAt: Date.now() + it.amount * 1000}; renderSession(); return; }
    if(id === 'btnRestSkip'){ ses.restEndsAt = null; delete ses.restLeft; saveSession(); renderSession(); return; }
    if(id === 'btnSesEnd'){ sesFinishing = true; renderSession(); document.querySelector('.rtFinish').scrollIntoView({block:'center'}); return; }
    if(id === 'btnSesKeep'){ sesFinishing = false; renderSession(); return; }
    if(ev.target.closest('#rtFinInt [data-int]')){ pickOne(document.getElementById('rtFinInt'), ev); return; }
    if(id === 'btnSesDiscard'){
      if(!confirm('¿Descartar la sesión? No se guarda nada.')) return;
      clearSession(); renderRoutines(); return;
    }
    if(id === 'btnSesSave') finishSession();
  });
  function finishSession(){
    const seconds = Math.round(sesElapsed() / 1000);
    if(seconds < 60){ mascotMsg(document.getElementById('rtFinMsg'), 'error', 'La sesión duró menos de 1 minuto: no se puede guardar. Sigue o descártala.', 'var(--danger)'); return; }
    const intensity = document.querySelector('#rtFinInt .chip.on').dataset.int, type = 'ejercicios';
    let iso = ses.start;
    while(history.some(h=>h.date === iso)) iso = new Date(new Date(iso).getTime() + 1000).toISOString();
    history.push({date: iso, type, intensity, seconds,
      cal: metCalories(actInfo(type).met[INTENSITY.indexOf(intensity)], seconds),
      dist: 0, pace: '--:--', path: [], splits: [], manual: true,
      routine: Object.assign({name: ses.name, rid: ses.rid, items: ses.items.map(it=>Object.assign(it.ex ? {ex: it.ex} : {name: it.name}, {kind: it.kind, amount: it.amount, sets: it.sets, done: it.done}))},
        ses.guided ? {mode: ses.mode} : {})});
    if(!ses.rid) delete history[history.length - 1].routine.rid;
    history.sort((a,b)=>a.date < b.date ? -1 : 1);
    const ok = LS.set('mirun_history', history);
    const mins = Math.round(seconds / 60);
    clearSession(); renderRoutines();
    const st = streakInfo(minutesByDay());
    if(!ok){ const m = document.getElementById('rtSavedMsg'); m.textContent = NOT_SAVED; m.style.color = 'var(--amber)'; }
    else mascotMsg(document.getElementById('rtSavedMsg'), mins >= 60 ? 'guardadoLargo' : 'guardado',
      'Rutina guardada: ' + mins + ' min. Racha: ' + st.cur + (st.cur === 1 ? ' día.' : ' días.'), 'var(--good)');
    renderHistory(); checkAchievements();
  }
  // la actividad con GPS sin terminar (caja #resumeBox de "Correr") está a la vista para seguirla
  function gpsPendingShown(){ return document.getElementById('resumeBox').style.display === 'block'; }
  // al abrir la app: si quedó una sesión, se retoma EN PAUSA desde el último guardado (el rato cerrada no cuenta).
  // Nunca se borra sola: si pasaron más de 12 horas se abre "Terminar" y se pregunta si guardar lo hecho o descartar.
  // Si además hay una actividad con GPS sin terminar, la app se queda en esa pantalla y avisa de las dos (ninguna se pierde).
  {
    const p = LS.get('mirun_session', null);
    if(p && typeof p === 'object' && Array.isArray(p.items) && p.items.length){
      ses = p;
      // ask = la pregunta sigue pendiente aunque se vuelva a cerrar la app sin responder (se quita al reanudar)
      const stale = !!p.ask || Date.now() - (Number(p.savedAt) || 0) >= 12 * 3600 * 1000;
      if(stale) ses.ask = true;
      if(!ses.paused){ ses.elapsedBefore += Math.max(0, (ses.savedAt || Date.now()) - ses.startTime); ses.paused = true; }
      if(ses.restEndsAt){ ses.restLeft = Math.max(1, ses.restEndsAt - (ses.savedAt || Date.now())); ses.restEndsAt = null; }
      if(ses.guided && !Array.isArray(ses.order)) ses.guided = false; // sin pasos: se sigue en la vista de lista (no se pierde)
      sesClosedNote = stale ? 'stale' : 'closed'; sesFinishing = stale;
      saveSession(); runSessionTimer();
      if(gpsPendingShown()){
        document.getElementById('resumeRtInfo').textContent = 'También tienes una rutina sin terminar: «' + ses.name + '».';
        document.getElementById('resumeRt').style.display = '';
        document.getElementById('btnResumeRt').addEventListener('click', ()=>showTab('rutinas'));
      } else showTab('rutinas');
    }
  }

  // ---------- CELEBRACIÓN (meta del día cumplida) ----------
  // Se celebra SOLO cuando la meta del día pasa de "falta" a "cumplida" al registrar, editar o deshacer una
  // actividad (lo llama checkAchievements), y una sola vez por día: mirun_celebrated = 'AAAA-MM-DD' del último
  // día celebrado. Al abrir la app o importar una copia no se celebra (checkAchievements(true)).
  // Sonido corto con Web Audio (sin archivos) y vibración suave: los dos se apagan con "Sonidos y vibración" en Perfil,
  // confeti con CSS y la mascota celebrando. Con "reducir movimiento": sin confeti ni animación, con sonido y vibración.
  let celebBase = null; // {day, done}: cómo estaba la meta de hoy la última vez que se revisó
  let celebUntil = 0;   // hora en que termina la celebración en pantalla (el aviso de logro espera hasta entonces)
  const CELEB_MS = 3400;
  function todayGoalDone(){ const t = new Date(); t.setHours(12,0,0,0); return dayStatus(minutesByDay(), t) === 'done'; }
  function maybeCelebrate(silent){
    const day = todayStr(), done = todayGoalDone();
    // primera revisión (al abrir) = lo que ya había; si cambió el día, el día nuevo empezó sin cumplir
    const was = celebBase ? (celebBase.day === day ? celebBase.done : false) : done;
    celebBase = {day, done};
    if(silent || was || !done || LS.get('mirun_celebrated', null) === day) return;
    LS.set('mirun_celebrated', day, 'quiet');
    celebrate();
  }
  let audioCtx = null;
  function playCheer(){ // do-mi-sol-do (C5 E5 G5 C6), notas cortas con caída suave, unos 0,7 s
    if(profile.sounds === false) return;
    try{
      const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
      audioCtx = audioCtx || new AC();
      if(audioCtx.state === 'suspended') audioCtx.resume();
      const t0 = audioCtx.currentTime + 0.03;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i)=>{
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        const t = t0 + i * 0.09, len = i === 3 ? 0.45 : 0.16;
        o.type = 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t); o.stop(t + len + 0.05);
      });
    }catch(e){}
  }
  function reducedMotion(){ return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function celebrate(){
    playCheer();
    if(profile.sounds !== false){ try{ if(navigator.vibrate) navigator.vibrate([40, 60, 40]); }catch(e){} }
    // capa encima de todo que no bloquea los toques y se borra sola
    const layer = document.createElement('div');
    layer.className = 'celebrate'; layer.setAttribute('role', 'status');
    const colors = ['#4d9bff', '#f5b82e', '#34d399', '#ff7a59', '#c084fc', '#eef3ff'];
    const conf = reducedMotion() ? '' : Array.from({length:36}, (_, i)=>
      `<i style="left:${(Math.random()*100).toFixed(1)}%;background:${colors[i % colors.length]};` +
      `animation-delay:${(Math.random()*0.5).toFixed(2)}s;animation-duration:${(1.8 + Math.random()*1.2).toFixed(2)}s;` +
      `--dx:${Math.round(Math.random()*80 - 40)}px;--r:${Math.round(Math.random()*720 - 360)}deg"></i>`).join('');
    const st = streakInfo(minutesByDay()).cur;
    layer.innerHTML = conf + `<div class="celebCard"><img class="mCheer" src="${mascot('meta')}" alt="">` +
      `<b>¡Meta de hoy cumplida!</b><small>Racha: ${st} ${st === 1 ? 'día' : 'días'}</small><em class="phrase">${esc(dailyPhrase('cortas'))}</em></div>`;
    document.body.appendChild(layer);
    celebUntil = Date.now() + CELEB_MS;
    setTimeout(()=>layer.remove(), CELEB_MS);
  }

  // ---------- LOGROS ----------
  // Se calculan desde el historial; solo se guarda cuáles ya se mostraron (mirun_achSeen).
  // v(s) = valor actual, g = meta, c = categoría (ACH_CATS), leg = legendario (insignia dorada especial).
  // Nombres y emojis propuestos por el diseñador. Para agregar un logro: una línea con id nuevo y único
  // (los id no se cambian: se usan en mirun_achSeen).
  const ACH_CATS = ['Actividades', 'Constancia y rachas', 'Metas semanales', 'Tiempo de entrenamiento',
                    'Distancia acumulada', 'Distancia en una carrera', 'Variedad'];
  const ACH = [
    {id:'first',   c:0, i:'sprout', n:'Primer paso',         d:'Completa 1 actividad',          g:1,   v:s=>s.count},
    {id:'act10',   c:0, i:'star', n:'Explorador',          d:'Completa 10 actividades',       g:10,  v:s=>s.count},
    {id:'act50',   c:0, i:'award', n:'Aventurero',          d:'Completa 50 actividades',       g:50,  v:s=>s.count},
    {id:'act100',  c:0, i:'badge-check', n:'Veterano',            d:'Completa 100 actividades',      g:100, v:s=>s.count, leg:true},
    {id:'st3',     c:1, i:'flame', n:'En llamas',           d:'3 días seguidos',               g:3,   v:s=>s.best},
    {id:'st7',     c:1, i:'zap', n:'Semana eléctrica',    d:'7 días seguidos',               g:7,   v:s=>s.best},
    {id:'st15',    c:1, i:'shield-check', n:'Disciplina total',    d:'15 días seguidos',              g:15,  v:s=>s.best},
    {id:'st30',    c:1, i:'gem', n:'Diamante',            d:'30 días seguidos',              g:30,  v:s=>s.best},
    {id:'st60',    c:1, i:'rocket', n:'Imparable',           d:'60 días seguidos',              g:60,  v:s=>s.best},
    {id:'st100',   c:1, i:'crown', n:'Leyenda',             d:'100 días seguidos',             g:100, v:s=>s.best, leg:true},
    {id:'week',    c:2, i:'target', n:'Objetivo cumplido',   d:'Alcanza tu meta semanal',       g:1,   v:s=>s.bestWeek >= weekMin() ? 1 : 0},
    {id:'h10',     c:3, i:'hourglass', n:'Tiempo inicial',      d:'10 horas acumuladas',           g:600, v:s=>s.totalMin},
    {id:'h50',     c:3, i:'timer', n:'Maestro del tiempo',  d:'50 horas acumuladas',           g:3000,v:s=>s.totalMin, leg:true},
    {id:'km50',    c:4, i:'route', n:'Primer recorrido',    get d(){ return fmtD(50, 0) + (imp() ? ' acumuladas' : ' acumulados'); }, g:50,  v:s=>s.totalKm},
    {id:'km250',   c:4, i:'globe', n:'Conquistador',        get d(){ return fmtD(250, 0) + (imp() ? ' acumuladas' : ' acumulados'); }, g:250, v:s=>s.totalKm, leg:true},
    {id:'run5',    c:5, i:'footprints', n:'Primeros kilómetros', get d(){ return 'Corre ' + raceTxt(5) + ' de una vez'; }, g:5,   v:s=>s.longRun},
    {id:'run10',   c:5, i:'medal', n:'Corredor de 10K',     get d(){ return 'Corre ' + raceTxt(10) + ' de una vez'; }, g:10,  v:s=>s.longRun},
    {id:'run21',   c:5, i:'mountain-snow', n:'Media maratón',       get d(){ return 'Corre ' + raceTxt(21.1) + ' de una vez'; }, g:21.1,v:s=>s.longRun, leg:true},
    {id:'variety', c:6, i:'compass', n:'Todoterreno',         d:'Prueba 4 tipos de actividad',   g:4,   v:s=>s.types}
  ];

  function achStats(){
    const mins = minutesByDay();
    const weeks = new Map(); // minutos por semana (clave = lunes)
    mins.forEach((m, k)=>{
      const d = new Date(k + 'T12:00:00'); d.setDate(d.getDate() - ((d.getDay()+6) % 7));
      const wk = dayKey(d); weeks.set(wk, (weeks.get(wk) || 0) + m);
    });
    return {
      count: history.length,
      best: streakInfo(mins).best,
      bestWeek: Math.max(0, ...weeks.values()),
      totalMin: [...mins.values()].reduce((a,b)=>a+b, 0),
      totalKm: history.reduce((a,h)=>a + (h.dist || 0), 0),
      longRun: Math.max(0, ...history.filter(isRun).map(h=>h.dist || 0)),
      types: new Set(history.map(h=>h.type || 'correr')).size
    };
  }

  // Logro bloqueado más cercano (el de mayor avance) y cuánto falta, en palabras.
  // Rachas: se cuenta desde la racha ACTUAL (la mejor ya pasada no ayuda a subirla).
  function nextAchievement(s){
    const cur = streakInfo(minutesByDay()).cur;
    const plural = (n, a, b)=>n + ' ' + (n === 1 ? a : b);
    let best = null;
    ACH.forEach(a=>{
      const v = a.v(s); if(v >= a.g) return; // ya desbloqueado
      const have = a.c === 1 ? cur : v, ratio = Math.max(0, have) / a.g;
      if(!best || ratio > best.ratio || (ratio === best.ratio && a.g < best.a.g)) best = {a, ratio, have};
    });
    if(!best) return null;
    const a = best.a, left = a.g - best.have;
    let txt;
    if(a.c === 0) txt = 'Te ' + (left === 1 ? 'falta ' : 'faltan ') + plural(left, 'actividad', 'actividades');
    else if(a.c === 1) txt = 'Te ' + (left === 1 ? 'falta ' : 'faltan ') + plural(left, 'día', 'días') + ' seguidos';
    else if(a.c === 2) txt = 'Cumple tu meta semanal de ' + weekMin() + ' min';
    else if(a.c === 3){ const m = Math.ceil(left); txt = 'Te faltan ' + (m >= 60 ? Math.ceil(m / 60) + ' h' : m + ' min') + ' de actividad'; }
    else if(a.c === 4) txt = 'Te faltan ' + fmtD(left, 1);
    else if(a.c === 5) txt = 'Corre ' + raceTxt(a.g) + ' de una vez';
    else txt = 'Te ' + (left === 1 ? 'falta ' : 'faltan ') + plural(left, 'tipo', 'tipos') + ' de actividad más';
    if(a.c === 1 && left === 1) txt = 'Te falta 1 día'; // "Te falta 1 día para Semana eléctrica"
    return {a, ratio: best.ratio, txt: txt + ' para ' + a.n};
  }
  function renderAchievements(){
    const s = achStats();
    // arriba: el logro más cercano a desbloquear
    const nx = nextAchievement(s), nb = document.getElementById('nextAch');
    nb.innerHTML = nx
      ? `<div class="medal">${ico(nx.a.i)}</div><div class="nxT"><small>Tu próximo logro</small><b></b>
          <div class="pbar"><div style="width:${Math.round(nx.ratio * 100)}%"></div></div></div>`
      : `<div class="medal">${ico('trophy')}</div><div class="nxT"><small>Tus logros</small><b>¡Tienes todos los logros!</b></div>`;
    if(nx) nb.querySelector('b').textContent = nx.txt;
    let on = 0;
    // tres estados: bloqueado (gris + candado), desbloqueado (azul), legendario (dorado)
    const card = a=>{
      const v = a.v(s), ok = v >= a.g; if(ok) on++;
      const pct = Math.min(100, v / a.g * 100);
      const st = !ok ? 'lock' : a.leg ? 'leg' : 'on';
      return `<div class="ach ${st}"><div class="medal">${ico(a.i)}${ok ? '' : '<i class="lk">' + ico('lock') + '</i>'}</div>
        <div class="an2">${a.n}</div><div class="ad">${a.d}</div>
        ${ok || a.g === 1 ? '' : `<div class="pbar"><div style="width:${pct}%"></div></div>`}</div>`;
    };
    document.getElementById('achGrid').innerHTML = ACH_CATS.map((name, ci)=>
      `<div class="achCat">${name}</div><div class="achRow">${ACH.filter(a=>a.c === ci).map(card).join('')}</div>`).join('');
    document.getElementById('achCount').textContent = on + ' de ' + ACH.length;
  }

  // Muestra los logros nuevos de a uno. silent = marcarlos como vistos sin aviso
  // (primera vez con esta versión o al recuperar una copia, para no llenar de avisos).
  let achQueue = [];
  function checkAchievements(silent){
    // meta del día recién cumplida (ver CELEBRACIÓN); un error ahí nunca debe frenar los logros
    try{ maybeCelebrate(silent); }catch(e){}
    const s = achStats();
    const seen = LS.get('mirun_achSeen', null);
    const unlocked = ACH.filter(a=>a.v(s) >= a.g).map(a=>a.id);
    const fresh = seen ? unlocked.filter(id=>!seen.includes(id)) : [];
    if(!seen || fresh.length) LS.set('mirun_achSeen', [...new Set([...(seen || []), ...unlocked])], 'quiet');
    if(silent || !seen || !fresh.length) return;
    achQueue = achQueue.concat(fresh);
    // si se está celebrando la meta del día, el aviso espera a que termine
    if(!document.getElementById('achOverlay').classList.contains('show'))
      setTimeout(showAchievement, Math.max(0, celebUntil - Date.now()));
  }
  function showAchievement(){
    if(document.getElementById('achOverlay').classList.contains('show')) return; // ya hay uno: sigue al tocar Continuar
    const id = achQueue.shift(); if(!id) return;
    const a = ACH.find(x=>x.id === id);
    document.getElementById('achMedal').innerHTML = ico(a.i);
    document.getElementById('achMedal').classList.toggle('blue', !a.leg); // legendario = dorado
    document.querySelector('#achOverlay .achTitle').textContent = a.leg ? '¡Logro legendario!' : '¡Nuevo logro!';
    document.getElementById('achName').textContent = a.n;
    document.getElementById('achDesc').textContent = a.d + '. ¡Sigue así!';
    const am = document.getElementById('achMascot');
    setMascot(am, a.leg ? 'legendario' : 'logro');
    document.getElementById('achOverlay').classList.add('show');
    mascotReact(am, 'mCheer'); // salta y celebra
    say('Nuevo logro: ' + a.n);
  }
  document.getElementById('btnAchOk').addEventListener('click', ()=>{
    document.getElementById('achOverlay').classList.remove('show');
    renderHome();
    setTimeout(showAchievement, 250);
  });

  checkAchievements(true); // al abrir: los logros que ya tenías no se anuncian
  renderHome();

  // ---------- EVOLUCIÓN ----------
  // Pestaña "Evolución" = data-tab "body" con dos vistas: Actividad (aquí) y Cuerpo (medidas, sin cambios).
  // SOLO LEE datos (history y la suma de minutos de la racha). Respeta km/mi con toD y toPace.
  // Períodos: 4 semanas y 3 meses se agrupan por semana; 1 año y Todo, por mes.
  const EVO_RANGES = {s4:{n:4, u:'w'}, m3:{n:13, u:'w'}, a1:{n:12, u:'m'}, all:{n:0, u:'m'}};
  let evoRange = 's4', evoView = 'act';
  function evoBuckets(){ // [{s, e, lbl}] con s incluido y e excluido (fechas a mediodía)
    const r = EVO_RANGES[evoRange], today = new Date(); today.setHours(12,0,0,0);
    if(r.u === 'w'){
      const mon = mondayOf(today);
      return Array.from({length:r.n}, (_, i)=>{
        const s = new Date(mon); s.setDate(mon.getDate() - 7*(r.n-1-i));
        const e = new Date(s); e.setDate(s.getDate() + 7);
        return {s, e, lbl: fmtShortDate(dayKey(s))};
      });
    }
    let n = r.n;
    if(!n){ // Todo: desde el mes de la primera actividad
      const first = history.length ? new Date(history.map(h=>h.date).sort()[0]) : today;
      n = Math.max(1, (today.getFullYear() - first.getFullYear())*12 + today.getMonth() - first.getMonth() + 1);
    }
    return Array.from({length:n}, (_, i)=>{
      const s = new Date(today.getFullYear(), today.getMonth() - (n-1-i), 1, 12);
      const e = new Date(s.getFullYear(), s.getMonth() + 1, 1, 12);
      return {s, e, lbl: s.toLocaleDateString('es-ES', {month:'short', year:'2-digit'})};
    });
  }
  // totales de un rango [s, e): minutos (sin contar dos veces lo que se cruza), km y ritmo de carreras
  function evoTotals(mins, s, e){
    let min = 0; mins.forEach((m, k)=>{ const d = new Date(k + 'T12:00:00'); if(d >= s && d < e) min += m; });
    let km = 0, runSec = 0, runKm = 0;
    history.forEach(h=>{
      const d = new Date(actRange(h)[0]); if(d < s || d >= e || !(h.dist > 0)) return;
      km += h.dist;
      if(isRun(h)){ runSec += h.seconds; runKm += h.dist; }
    });
    return {min, km, pace: runKm > 0 ? runSec / runKm : null}; // pace en seg/km
  }
  // texto del cambio porcentual de b a a. Si el período anterior tuvo muy poco (el cambio pasa de +200 %),
  // un porcentaje enorme (+555 %) no ayuda: se muestra el valor anterior ("antes 12 min"), como en Ritmo.
  const EVO_MAX_PCT = 200;
  function pct(a, b, prevTxt){
    if(!(b > 0)) return a > 0 ? 'nuevo' : '—';
    const p = Math.round((a - b) / b * 100);
    if(p > EVO_MAX_PCT) return 'antes ' + prevTxt;
    return (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p) + ' %';
  }

  function renderEvo(){
    document.querySelectorAll('#evoTabs .chip').forEach(c=>c.classList.toggle('on', c.dataset.evo === evoView));
    document.querySelectorAll('#evoRange .chip').forEach(c=>c.classList.toggle('on', c.dataset.r === evoRange));
    document.getElementById('evoAct').style.display = evoView === 'act' ? '' : 'none';
    document.getElementById('evoBody').style.display = evoView === 'body' ? '' : 'none';
    if(evoView === 'body'){ renderBody(); return; }
    const none = history.length === 0;
    document.getElementById('evoEmpty').style.display = none ? '' : 'none';
    document.getElementById('evoCharts').style.display = none ? 'none' : '';
    if(none) return;
    const mins = minutesByDay(), B = evoBuckets(), weekly = EVO_RANGES[evoRange].u === 'w';
    const T = B.map(b=>evoTotals(mins, b.s, b.e));
    const per = weekly ? 'por semana' : 'por mes';
    document.getElementById('evoMinT').textContent = 'Minutos de actividad ' + per;
    document.getElementById('evoDistT').textContent = 'Distancia ' + per + ' (' + dU() + ')';
    document.getElementById('evoPaceT').textContent = 'Ritmo promedio al correr (' + paceU() + ')';
    document.getElementById('evoMinH').textContent = weekly ? 'La línea dorada es tu meta semanal: ' + weekMin() + ' min.' : '';
    const first = B[0].lbl, last = B[B.length-1].lbl;
    // minutos y distancia: barras (los períodos sin actividad quedan en 0)
    const totMin = T.reduce((a, t)=>a + t.min, 0), totKm = T.reduce((a, t)=>a + t.km, 0);
    drawChart(document.getElementById('evoMin'), {type:'bar', color:'#4d9bff', firstLbl:first, lastLbl:last,
      empty: totMin > 0 ? null : 'Sin actividad en este período.', goal: weekly ? weekMin() : 0,
      fmtY: v=>String(Math.round(v)), pts: T.map((t, i)=>({x:i, v:Math.round(t.min)}))});
    drawChart(document.getElementById('evoDist'), {type:'bar', color:'#7cc4ff', firstLbl:first, lastLbl:last,
      empty: totKm > 0 ? null : 'Sin distancia registrada en este período.',
      pts: T.map((t, i)=>({x:i, v:toD(t.km)}))});
    // ritmo: línea solo con los períodos en que hubo carreras (más abajo = más rápido)
    const P = T.map((t, i)=>({x:i, v:t.pace ? toPace(t.pace)/60 : null, lbl:B[i].lbl})).filter(p=>p.v !== null);
    drawChart(document.getElementById('evoPace'), {type:'line', color:'#34d399', fmtY: v=>fmtPace(v*60),
      empty: P.length ? null : 'Aún no hay carreras en este período.',
      single: P.length === 1 ? fmtPace(P[0].v*60) + ' ' + paceU() : null,
      firstLbl: P.length ? P[0].lbl : '', lastLbl: P.length ? P[P.length-1].lbl : '', pts: P});
    // comparación con el período anterior del mismo largo (no aplica a "Todo")
    const box = document.getElementById('evoCompare');
    if(evoRange === 'all'){ box.innerHTML = '<div class="hint">Elige 4 semanas, 3 meses o 1 año para comparar.</div>'; return; }
    const s = B[0].s, e = B[B.length-1].e, ps = new Date(s.getTime() - (e - s)), prev = evoTotals(mins, ps, s), cur = evoTotals(mins, s, e);
    const paceCur = cur.pace ? fmtPace(toPace(cur.pace)) : '--:--', pacePrev = prev.pace ? fmtPace(toPace(prev.pace)) : '--:--';
    box.innerHTML = `<div class="evoCmp">
      <div><small>Minutos</small><b>${Math.round(cur.min)}</b><i>${pct(cur.min, prev.min, Math.round(prev.min) + ' min')}</i></div>
      <div><small>Distancia</small><b>${toD(cur.km).toFixed(1)} ${dU()}</b><i>${pct(cur.km, prev.km, toD(prev.km).toFixed(toD(prev.km) < 1 ? 2 : 1) + ' ' + dU())}</i></div>
      <div><small>Ritmo</small><b>${paceCur}</b><i>antes ${pacePrev}</i></div></div>`;
  }
  document.getElementById('evoTabs').addEventListener('click', ev=>{
    const c = ev.target.closest('.chip'); if(!c) return; evoView = c.dataset.evo; renderEvo();
  });
  document.getElementById('evoRange').addEventListener('click', ev=>{
    const c = ev.target.closest('.chip'); if(!c) return; evoRange = c.dataset.r; renderEvo();
  });

  // ---------- COPIA DE SEGURIDAD DEL HISTORIAL ----------
  const backupMsg = document.getElementById('backupMsg');
  // "Espacio usado: X %" en Perfil; desde el 80 % en naranja y un aviso al día (mirun_spaceWarned = día del último aviso)
  function renderSpace(){
    const u = LS.used(), el = document.getElementById('spaceInfo');
    el.textContent = 'Espacio usado: ' + Math.min(100, Math.round(u * 100)) + ' %' +
      (u >= 0.8 ? '. Queda poco: guarda una copia.' : '') + (LS.persisted ? ' · Protegido: el navegador no lo borra solo.' : '');
    el.style.color = u >= 0.8 ? 'var(--amber)' : '';
    return u;
  }
  function spaceCheck(){
    const u = renderSpace();
    if(u < 0.8 || LS.get('mirun_spaceWarned', '') === dayKey(new Date())) return;
    LS.set('mirun_spaceWarned', dayKey(new Date()), 'quiet');
    alert('La memoria de MiRun está al ' + Math.round(u * 100) + ' %.\n\nVe a Perfil → "Guardar copia" para tener tus datos a salvo.');
  }
  // ---------- LIBERAR ESPACIO ----------
  // Borra SOLO la ruta del mapa (path = [] y sin route) de actividades que terminaron hace más de X meses y no son
  // favoritas. Distancia, tiempo, ritmo, splits, calorías y lo demás quedan igual: racha, logros, récords y Evolución
  // no usan la ruta. Antes dice cuánto libera, cuántas actividades toca y recomienda "Guardar copia"; pide confirmación.
  function freeCandidates(months){
    const lim = new Date(); lim.setMonth(lim.getMonth() - months);
    return history.filter(h=>!h.favorite && actRange(h)[1] < lim.getTime() &&
      ((Array.isArray(h.route) && h.route.length) || (Array.isArray(h.path) && h.path.length)));
  }
  function noRoute(h){ const c = Object.assign({}, h, {path: []}); delete c.route; return c; }
  document.getElementById('btnFreeSpace').addEventListener('click', ()=>{
    const months = Number(document.getElementById('freeMonths').value), list = freeCandidates(months);
    const msg = document.getElementById('freeMsg'); msg.style.color = '';
    if(!list.length){ msg.textContent = 'No hay mapas de actividades de hace más de ' + months + ' meses (sin contar favoritas).'; return; }
    const chars = list.reduce((s,h)=>s + JSON.stringify(h).length - JSON.stringify(noRoute(h)).length, 0);
    const kb = Math.max(1, Math.round(chars / 1024)), pct = Math.round(chars / LS_LIMIT * 100);
    if(!confirm('Se borrarán los mapas de ' + list.length + (list.length === 1 ? ' actividad' : ' actividades') + ' de hace más de ' + months +
      ' meses. Se liberan unos ' + kb + ' KB (' + pct + ' % del espacio).\n\nSe conservan distancia, tiempo, ritmo, splits y todo lo demás. ' +
      'Los mapas de tus favoritas no se tocan. Esto no se puede deshacer.\n\nTe recomendamos tocar "Guardar copia" antes. ¿Liberar espacio ahora?')) return;
    const prev = list.map(h=>[h, h.path, h.route]);
    list.forEach(h=>{ h.path = []; delete h.route; });
    if(!LS.set('mirun_history', history)){ prev.forEach(([h, p, r])=>{ h.path = p; if(r !== undefined) h.route = r; }); return; } // quedó como estaba
    msg.textContent = 'Listo: se borraron los mapas de ' + list.length + (list.length === 1 ? ' actividad' : ' actividades') + ' y se liberaron unos ' + kb + ' KB.';
    msg.style.color = 'var(--good)';
    renderSpace(); renderHistory();
  });

  // pedir al navegador que no borre los datos solo (si no lo da, no se insiste)
  try{
    if(navigator.storage && navigator.storage.persist)
      navigator.storage.persisted().then(p=>p || navigator.storage.persist()).then(p=>{ LS.persisted = !!p; renderSpace(); }).catch(()=>{});
  }catch(e){}
  setTimeout(spaceCheck, 1500);
  // carreras guardadas aparte (RESCATE): vuelven al Historial; si ya caben en la memoria, se guardan y se borran de allá
  if(window.indexedDB) rescueAll().then(list=>{
    list = list.filter(r=>r && typeof r.date === 'string' && isFinite(r.dist) && isFinite(r.seconds));
    if(!list.length) return;
    list.forEach(r=>LS.rescue.add(r.date));
    const add = list.filter(r=>!history.some(h=>h.date === r.date));
    if(!add.length){ LS.rescue.forEach(d=>{ LS.rescue.delete(d); rescueDelete(d); }); return; }
    history = history.concat(add).sort((a,b)=>a.date < b.date ? -1 : 1);
    renderHistory(); if(document.body.dataset.tab === 'home') renderHome();
    if(!LS.set('mirun_history', history, 'quiet'))
      alert('Tienes ' + add.length + (add.length === 1 ? ' carrera guardada' : ' carreras guardadas') +
        ' aparte porque la memoria está llena. Ya aparecen en tu Historial.\n\nVe a Perfil → "Guardar copia" para tenerlas a salvo.');
  });
  function backupNote(t){ backupMsg.textContent = t; backupMsg.style.color = 'var(--signal)'; backupMsg.dataset.set = '1'; }

  document.getElementById('btnExport').addEventListener('click', ()=>{
    LS.set('mirun_lastBackup', new Date().toISOString(), 'quiet');
    const data = JSON.stringify({app:'MiRun', version:4, exported:new Date().toISOString(), photo: LS.get('mirun_photo', null),
                                 profile, goal, history, body, routines, weekplan: weekPlan(), intervals: ivlPlans});
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    const d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = 'MiRun-copia-' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
    backupNote('Copia guardada en la carpeta Descargas del teléfono (' + history.length + ' actividades, ' + body.length + ' mediciones' +
              (routines.length ? ', ' + routines.length + (routines.length === 1 ? ' rutina' : ' rutinas') : '') + ', tu perfil y metas).');
  });

  const fileInput = document.getElementById('importFile');
  document.getElementById('btnImport').addEventListener('click', ()=>fileInput.click());
  fileInput.addEventListener('change', ()=>{
    const f = fileInput.files && fileInput.files[0];
    if(!f) return;
    if(f.size > 20*1024*1024){ backupNote('Ese archivo es demasiado grande.'); return; }
    const r = new FileReader();
    r.onload = ()=>{
      try{
        const importFails0 = LS.fails; // si algo no se guarda, no se dice "Listo"
        const data = JSON.parse(r.result);
        if(!data || data.app !== 'MiRun' || !Array.isArray(data.history)) throw 0;
        // Solo se aceptan campos esperados y con el tipo correcto (nada de codigo)
        const clean = data.history.filter(h=>h && typeof h.date==='string' && isFinite(h.dist) && isFinite(h.seconds))
          .map(h=>({
            date: String(h.date).slice(0,40),
            dist: Number(h.dist), seconds: Number(h.seconds),
            pace: String(h.pace||'--:--').replace(/[^0-9:\-]/g,'').slice(0,8),
            cal: Math.round(Number(h.cal)||0),
            path: Array.isArray(h.path) ? h.path.filter(p=>p&&isFinite(p.lat)&&isFinite(p.lon))
                    .map(p=>({lat:Number(p.lat), lon:Number(p.lon)})) : [],
            // ruta liviana (formato nuevo): [[lat, lon], ...] con números válidos
            ...(Array.isArray(h.route) ? {route: h.route.filter(p=>Array.isArray(p) && p.length === 2 && isFinite(p[0]) && isFinite(p[1]) &&
                    Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180).slice(0, 50000).map(p=>[Number(p[0]), Number(p[1])])} : {}),
            splits: Array.isArray(h.splits) ? h.splits.filter(s=>s&&isFinite(s.km)&&isFinite(s.seconds))
                    .map(s=>({km:Number(s.km), seconds:Number(s.seconds), partial:!!s.partial})) : [],
            manual: !!h.manual,
            ...(h.favorite === true ? {favorite: true} : {}), // favorita (estrella del Historial)
            // detalle de un entreno por intervalos: solo bloques conocidos con números válidos
            ...(h.intervals && typeof h.intervals === 'object' && cleanIvlBlocks(h.intervals.blocks).length ? {intervals: {
              name: String(h.intervals.name || 'Intervalos').slice(0, 40), kind: ['tiempo','distancia','libre'].includes(h.intervals.kind) ? h.intervals.kind : 'libre',
              blocks: cleanIvlBlocks(h.intervals.blocks)}} : {}),
            // campos de v5 (actividades): solo valores conocidos
            ...(ACTIVITIES.some(a=>a.k === h.type) ? {type: h.type} : {}),
            ...(INTENSITY.includes(h.intensity) ? {intensity: h.intensity} : {}),
            // campos de edición: identificador original y fecha de la edición (texto corto)
            ...(typeof h.origDate === 'string' ? {origDate: h.origDate.slice(0,40)} : {}),
            ...(typeof h.edited === 'string' ? {edited: h.edited.slice(0,40)} : {}),
            // pausa automática (actividades con GPS): tiempo quieta descontado y cuántas veces
            ...(Number(h.autoPausedSeconds) >= 0 && isFinite(h.autoPausedSeconds) ? {autoPausedSeconds: Math.round(Number(h.autoPausedSeconds))} : {}),
            ...(Number.isInteger(h.autoPauses) && h.autoPauses >= 0 ? {autoPauses: h.autoPauses} : {}),
            // sesión de rutina: nombre y ejercicios con las series hechas
            ...(h.routine && typeof h.routine === 'object' && cleanRtItems(h.routine.items, true).length ?
                {routine: Object.assign({name: String(h.routine.name || 'Rutina').slice(0, RT_LIM.name), items: cleanRtItems(h.routine.items, true)},
                  typeof h.routine.rid === 'string' && /^[\w-]{1,40}$/.test(h.routine.rid) ? {rid: h.routine.rid} : {},
                  cleanRtMeta(h.routine).mode ? {mode: cleanRtMeta(h.routine).mode} : {})} : {})
          }));
        // teléfono "nuevo" (sin datos): la copia restaura perfil, metas y foto completos;
        // si ya hay datos, solo completa lo que falta y nunca reemplaza lo que existe
        const fresh = history.length === 0 && body.length === 0;
        // repetida = su date u origDate coincide con un date u origDate que ya está (actividades editadas)
        const have = new Set();
        history.forEach(h=>{ have.add(h.date); if(h.origDate) have.add(h.origDate); });
        const nuevas = clean.filter(h=>!have.has(h.date) && !(h.origDate && have.has(h.origDate)));
        history = history.concat(nuevas).sort((a,b)=>a.date < b.date ? -1 : 1);
        LS.set('mirun_history', history);
        // medidas del cuerpo (copias nuevas): solo fechas validas y numeros
        let nuevasMed = 0;
        if(Array.isArray(data.body)){
          const haveB = new Set(body.map(e=>e.date));
          data.body.forEach(e=>{
            if(!e || typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || haveB.has(e.date)) return;
            const c = {date: e.date};
            MEASURES.forEach(m=>{ const v = Number(e[m.k]); if(v > 0 && v < 400) c[m.k] = v; });
            body.push(c); haveB.add(e.date); nuevasMed++;
          });
          LS.set('mirun_body', body);
        }
        // rutinas (copias nuevas): se agregan las que faltan (mismo id = ya está), sin pasar de 50
        let nuevasRt = 0;
        if(Array.isArray(data.routines)){
          const haveR = new Set(routines.map(x=>x.id));
          data.routines.forEach(x=>{
            if(!x || typeof x !== 'object' || routines.length >= RT_LIM.routines) return;
            const name = typeof x.name === 'string' ? x.name.trim().slice(0, RT_LIM.name) : '';
            const items = cleanRtItems(x.items, false);
            if(!name || !items.length) return;
            let id = typeof x.id === 'string' && /^[\w-]{1,40}$/.test(x.id) ? x.id : '';
            if(id && haveR.has(id)) return;
            if(!id) do { id = 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); } while(haveR.has(id));
            const c = Object.assign({id, name, items}, cleanRtMeta(x));
            if(typeof x.created === 'string') c.created = x.created.slice(0, 40);
            routines.push(c); haveR.add(id); nuevasRt++;
          });
          if(nuevasRt) saveRoutines();
        }
        // entrenos por intervalos guardados (copias nuevas): se limpian y se agregan los que no estén (por id)
        let nuevosIvl = 0;
        if(Array.isArray(data.intervals)){
          cleanIvlPlans(data.intervals).forEach(p=>{ if(ivlPlans.length < 30 && !ivlPlans.some(x=>x.id === p.id)){ ivlPlans.push(p); nuevosIvl++; } });
          if(nuevosIvl) saveIvlPlans();
        }
        // semana (copias nuevas): solo días 0 a 6 con rutinas que existen; completa días vacíos, no pisa
        if(data.weekplan && typeof data.weekplan === 'object' && !Array.isArray(data.weekplan)){
          const plan = weekPlan(); let ch = false;
          Object.keys(data.weekplan).forEach(k=>{ const v = data.weekplan[k];
            if(/^[0-6]$/.test(k) && typeof v === 'string' && routines.some(x=>x.id === v) && !plan[k]){ plan[k] = v; ch = true; } });
          if(ch) LS.set('mirun_weekplan', plan);
        }
        // perfil, metas y foto (copias de v5 en adelante): solo campos conocidos y valores válidos
        let perfil = false;
        const take = (dst, src)=>{ Object.keys(src).forEach(k=>{
          if(fresh || dst[k] === undefined || dst[k] === null || dst[k] === ''){ dst[k] = src[k]; perfil = true; } }); };
        if(data.profile && typeof data.profile === 'object'){
          const p = data.profile, ok = {};
          if(typeof p.name === 'string') ok.name = p.name.slice(0, 30);
          [['weight',20,400],['age',5,120],['height',100,250]].forEach(([k,a,b])=>{ const v = Number(p[k]); if(v >= a && v <= b) ok[k] = v; });
          if(['m','f','x'].includes(p.sex)) ok.sex = p.sex;
          if(GOAL_TYPES.includes(p.goalType)) ok.goalType = p.goalType;
          if(p.level in LEVEL_WEEK) ok.level = p.level;
          if(Array.isArray(p.measures)) ok.measures = MEASURES.map(m=>m.k).filter(k=>p.measures.includes(k));
          if(typeof p.voice === 'boolean') ok.voice = p.voice;
          if(typeof p.sounds === 'boolean') ok.sounds = p.sounds; // v5: sonidos de celebración
          if(typeof p.faith === 'boolean') ok.faith = p.faith; // incluir frases de fe
          if(typeof p.autoPause === 'boolean') ok.autoPause = p.autoPause; // pausa automática en GPS
          if(typeof p.voiceName === 'string') ok.voiceName = p.voiceName.slice(0, 100); // voz elegida ('' = automática)
          if(typeof p.character === 'string' && Object.prototype.hasOwnProperty.call(CHARACTERS, p.character)) ok.character = p.character; // compañero elegido
          if(p.mapMode === 'linea' || p.mapMode === 'calles') ok.mapMode = p.mapMode;
          if(p.units === 'metric' || p.units === 'imperial') ok.units = p.units; // v5: unidades (sin campo = métrico)
          take(profile, ok); LS.set('mirun_profile', profile);
          // el compañero de la copia (si se tomó) se aplica enseguida
          if(Object.prototype.hasOwnProperty.call(CHARACTERS, profile.character) && profile.character !== charKey){
            charKey = profile.character; refreshPoseImgs(); renderCharPick(); renderHome(); syncCharacterCache();
          }
        }
        if(data.goal && typeof data.goal === 'object'){
          const g = data.goal, ok = {}, num = (v, a, b)=>{ v = Number(v); return v >= a && v <= b ? v : undefined; };
          [['dist',0.1,500],['time',1,1440],['paceMin',1,30],['paceSec',0,59],['dailyMin',10,60],['weekMin',10,3000]]
            .forEach(([k,a,b])=>{ const v = num(g[k], a, b); if(v !== undefined) ok[k] = v; });
          if(Array.isArray(g.restPlan)) ok.restPlan = g.restPlan
            .filter(x=>x && /^\d{4}-\d{2}-\d{2}$/.test(x.from) && Array.isArray(x.days))
            .map(x=>({from: x.from, days: x.days.map(Number).filter(d=>d >= 0 && d <= 6).slice(0, 3)}));
          // zona de ritmo: segundos por km, el rápido antes que el lento
          if(g.zone && typeof g.zone === 'object'){ const lo = num(g.zone.lo, 120, 1200), hi = num(g.zone.hi, 120, 1200);
            if(lo !== undefined && hi !== undefined && hi - lo >= 5) ok.zone = {lo: Math.round(lo * 10) / 10, hi: Math.round(hi * 10) / 10}; }
          take(goal, ok); LS.set('mirun_goal', goal);
        }
        if(typeof data.photo === 'string' && data.photo.length < 400000 &&
           /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data.photo) && (fresh || !LS.get('mirun_photo', null))){
          LS.set('mirun_photo', data.photo); perfil = true;
        }
        fillProfileForm(); loadGoalForm(); loadStreakForm(); refreshGoalLabels(); buildBodyForm();
        renderHistory(); checkAchievements(true);
        if(LS.fails !== importFails0){ backupNote(NOT_SAVED); backupMsg.style.color = 'var(--amber)'; fileInput.value = ''; return; }
        backupNote('Listo: se recuperaron ' + nuevas.length + ' actividades' + (nuevasRt ? ', ' : ' y ') + nuevasMed + ' mediciones' +
                   (nuevasRt ? ' y ' + nuevasRt + (nuevasRt === 1 ? ' rutina' : ' rutinas') : '') + ' nuevas' +
                   (nuevosIvl ? ', ' + nuevosIvl + (nuevosIvl === 1 ? ' entreno' : ' entrenos') + ' por intervalos' : '') +
                   (perfil ? ', además de tu perfil y metas.' : '.'));
      }catch(e){
        backupNote('Ese archivo no es una copia de MiRun.');
      }
      fileInput.value = '';
    };
    r.readAsText(f);
  });

  // ---------- BIENVENIDA ----------
  // Pantalla #welcome SOLO la primera vez y SOLO si el teléfono no tiene datos de MiRun.
  // mirun_welcomed = true cuando ya se vio (o se saltó) o si al abrir ya había datos: nunca vuelve a salir.
  // Datos que cuentan: perfil, metas, foto, carrera en curso, historial o medidas (mirun_schema y
  // mirun_achSeen no cuentan: la app los crea sola al abrir).
  (function(){
    if(LS.get('mirun_welcomed', false)) return;
    const hasData = ['mirun_profile','mirun_goal','mirun_photo','mirun_current','mirun_routines'].some(k=>localStorage.getItem(k) !== null) ||
                    history.length > 0 || body.length > 0;
    if(hasData){ LS.set('mirun_welcomed', true, 'quiet'); return; }
    const wel = document.getElementById('welcome'), wUnits = document.getElementById('welUnits'), wSex = document.getElementById('welSex');
    wUnits.addEventListener('click', ev=>{
      pickOne(wUnits, ev);
      document.getElementById('welWU').textContent = wUnits.querySelector('.chip.on').dataset.u === 'imperial' ? 'lb' : 'kg';
    });
    wSex.addEventListener('click', ev=>{ // opcional: se puede dejar sin elegir o desmarcar
      const c = ev.target.closest('.chip'); if(!c) return;
      const was = c.classList.contains('on');
      wSex.querySelectorAll('.chip').forEach(x=>x.classList.remove('on'));
      if(!was) c.classList.add('on');
    });
    function close(){ LS.set('mirun_welcomed', true, 'quiet'); wel.classList.remove('show'); }
    document.getElementById('btnWelSkip').addEventListener('click', close); // Saltar: no guarda nada del perfil
    document.getElementById('btnWelGo').addEventListener('click', ()=>{
      const msg = document.getElementById('welMsg'), bad = t=>mascotMsg(msg, 'error', t, 'var(--danger)');
      const units = wUnits.querySelector('.chip.on').dataset.u;
      const name = document.getElementById('welName').value.trim().slice(0,30);
      const sexC = wSex.querySelector('.chip.on');
      const hTxt = document.getElementById('welHeight').value.trim(), wTxt = document.getElementById('welWeight').value.trim();
      const h = parseInt(hTxt), wIn = parseFloat(wTxt);
      if(hTxt && !(h >= 100 && h <= 250)) return bad('La estatura debe estar entre 100 y 250 cm.');
      const kg = units === 'imperial' ? wIn / KG_LB : wIn; // el peso se guarda en kg
      if(wTxt && !(kg >= 20 && kg <= 400)) return bad('Revisa el peso.');
      // solo se agrega lo que la persona escribió; lo demás queda como estaba
      const add = {units};
      if(name) add.name = name;
      if(sexC) add.sex = sexC.dataset.sex;
      if(hTxt) add.height = h;
      if(wTxt) add.weight = Math.round(kg * 100) / 100;
      // sin nada escrito y con las unidades por defecto no se guarda el perfil (no se fija un sexo que no se eligió)
      if(Object.keys(add).length === 1 && units === 'metric'){ close(); return; }
      profile = Object.assign(profile, add);
      LS.set('mirun_profile', profile);
      close();
      // lo mismo que al guardar el Perfil: las unidades cambian lo que se ve en varias pantallas
      fillProfileForm(); profUnits.dataset.prev = profUnits.value;
      loadGoalForm(); refreshGoalLabels(); buildBodyForm();
      renderHome(); renderHistory();
    });
    wel.classList.add('show');
    mascotReact(wel.querySelector('.welImg'), 'mWave'); // la mascota saluda
  })();

})();

// Registrar Service Worker para que la app funcione sin internet
// de forma garantizada despues de la primera carga.
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
