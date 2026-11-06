// MiRun — lógica de la app. Busca secciones por marcador "// ---------- NOMBRE" (mapa en CLAUDE.md)
(function(){
  "use strict";

  // ---------- STORAGE ----------
  const LS = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
    // devuelve true si se guardó; si el teléfono no tiene espacio avisa (una vez por sesión)
    set(k, v){
      try{ localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch(e){
        if(!LS.warned){ LS.warned = true;
          alert('No se pudo guardar: la memoria de la app está llena. Ve a Historial → "Guardar copia" para no perder tus datos.'); }
        return false;
      }
    }
  };

  // Versión del formato de datos. Las migraciones SOLO agregan campos, nunca borran.
  const SCHEMA = 5;
  if(LS.get('mirun_schema', 0) < SCHEMA) LS.set('mirun_schema', SCHEMA);

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
  // PERSONAJES: cada uno con su carpeta y sus poses (nombre de la pose -> archivo sin .png). Monster es el
  // principal y el que se usa por defecto. Agregar un personaje = sumar aquí su carpeta y sus poses
  // (y sus archivos a FILES_TO_CACHE en sw.js). Si a un personaje le falta una pose, se usa la de Monster.
  // Todavía no hay selector: siempre se usa DEFAULT_CHAR.
  const CHARACTERS = {
    monster: {name:'MIRUN Monster', dir:'img/mascota/', poses:{
      aprobacion:'01_aprobacion', pesas:'02_pesas', corriendo:'03_corriendo', carino:'04_carino',
      decidido:'05_decidido', pensando:'06_pensando', emocionado:'07_emocionado', agotado:'08_agotado',
      celebrando:'09_celebrando', cansado:'10_cansado', frustrado:'11_frustrado', estudiando:'12_estudiando',
      tu_puedes:'13_tu_puedes', durmiendo:'14_durmiendo', asomado:'15_asomado'}}
  };
  const DEFAULT_CHAR = 'monster';
  function character(){ return CHARACTERS[DEFAULT_CHAR]; } // con el selector: el personaje elegido
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
    toque:      'carino',      // al tocar la mascota
    mareado:    'frustrado'    // al tocarla muchas veces seguidas
  };
  function mascot(k){ return poseSrc(MASCOT[k]); }
  // cambia la pose de una imagen de mascota (si está en medio de una reacción al toque, la deja para después)
  function setMascot(img, k){ const s = mascot(k); if(img.dataset.base) img.dataset.base = s; else img.src = s; }
  // imágenes fijas del HTML con data-pose="..." (siguen al personaje)
  document.querySelectorAll('img[data-pose]').forEach(i=>{ i.src = poseSrc(i.dataset.pose); });
  // mensaje con la mascota pequeña al lado (formularios)
  function mascotMsg(el, k, text, color){
    el.innerHTML = `<span class="msgM"><img src="${mascot(k)}" alt=""><span></span></span>`;
    el.querySelector('span span').textContent = text;
    el.style.color = color;
  }
  // Movimiento (solo CSS, ver "MASCOTA: movimiento" en app.css): reposo = clase mIdle (respira);
  // reacción de una vez = mHop (salta), mCheer (celebra), mSad (se pone triste), mWave (saluda).
  // Con "reducir movimiento" del teléfono el CSS las apaga y solo cambia la pose.
  function mascotReact(img, cls){
    if(!img) return;
    img.classList.remove('mHop','mCheer','mSad','mWave');
    void img.offsetWidth; // reinicia la animación aunque sea la misma
    img.classList.add(cls);
  }
  document.addEventListener('animationend', ev=>{
    if(/^m(Hop|Cheer|Sad|Wave)$/.test(ev.animationName)) ev.target.classList.remove(ev.animationName);
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

  // ---------- TIPOS DE ACTIVIDAD ----------
  // k = valor guardado en history[].type (sin type = 'correr'). met = gasto [baja, media, alta].
  // gps:true = se registra con la pantalla GPS (su gasto sale de la velocidad, ver calcCalories)
  const ACTIVITIES = [
    {k:'correr',     n:'Correr',              e:'🏃', gps:true},
    {k:'caminar',    n:'Caminar',             e:'🚶', gps:true},
    {k:'bici',       n:'Bicicleta',           e:'🚴', gps:true},
    {k:'gimnasio',   n:'Gimnasio',            e:'🏋️', met:[3.5, 5.0, 6.0]},
    {k:'ejercicios', n:'Flexiones, abdominales, burpees', e:'💪', met:[3.8, 5.0, 8.0]},
    {k:'natacion',   n:'Natación',            e:'🏊', met:[5.8, 8.0, 10.0]},
    {k:'deportes',   n:'Deportes',            e:'⚽', met:[5.0, 7.0, 9.0]},
    {k:'baile',      n:'Baile',               e:'💃', met:[4.5, 5.5, 7.8]},
    {k:'yoga',       n:'Yoga / estiramiento', e:'🧘', met:[2.5, 3.0, 4.0]},
    {k:'otros',      n:'Otra actividad',      e:'✨', met:[3.0, 4.5, 6.0]}
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
    if(tab==='history') renderHistory();
    if(tab==='records'){ renderRecords(); renderAchievements(); }
    if(tab==='body') renderEvo();
  }
  document.querySelectorAll('.tabBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>showTab(btn.dataset.tab));
  });
  // botones con data-goto="pantalla" (o "actForm": historial y baja al formulario de actividad)
  document.addEventListener('click', (ev)=>{
    const b = ev.target.closest('[data-goto]');
    if(!b) return;
    if(b.dataset.goto === 'actForm'){
      showTab('history');
      document.getElementById('actForm').scrollIntoView({block:'start'});
    } else showTab(b.dataset.goto);
  });
  // botón "+": si hay una actividad GPS en curso va directo a ella; si no, abre el menú de opciones
  const plusSheet = document.getElementById('plusSheet');
  document.getElementById('plusBtn').addEventListener('click', ()=>{
    if(running){ showTab('run'); return; }
    plusSheet.classList.add('show');
  });
  plusSheet.addEventListener('click', (ev)=>{
    const o = ev.target.closest('[data-plus]');
    plusSheet.classList.remove('show'); // tocar fuera también cierra
    if(!o) return;
    if(o.dataset.plus === 'manual'){
      showTab('history');
      document.getElementById('actForm').scrollIntoView({block:'start'});
    } else {
      document.querySelectorAll('#gpsTypeRow .chip').forEach(c=>c.classList.toggle('on', c.dataset.gtype === o.dataset.plus));
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
    const bar = document.getElementById('savedBar');
    bar.classList.add('show');
    setTimeout(()=>bar.classList.remove('show'), 1500);
  }

  // ---------- PROFILE ----------
  // objetivo físico y nivel de actividad (v5). El nivel sugiere la meta semanal si no se eligió otra en Metas.
  const GOAL_TYPES = ['salud','bajar','musculo','mantener','resistencia'];
  const LEVEL_WEEK = {sedentario:90, ligero:150, moderado:200, activo:250, muy:300};
  if(profile.voice === undefined) profile.voice = true; // voz activada por defecto
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
    set('profVoice', profile.voice ? '1' : '0');
    set('profMap', profile.mapMode);
    refreshLevelHint(); refreshHello(); refreshAvatars(); refreshUnitLabels();
  }
  function refreshLevelHint(){
    const lv = document.getElementById('profLevel').value;
    document.getElementById('levelHint').textContent = 'Meta semanal sugerida: ' + LEVEL_WEEK[lv] + ' min' +
      (goal.weekMin ? '. Tú elegiste ' + goal.weekMin + ' min en Metas.' : ', se usa mientras no elijas otra en Metas.');
  }
  document.getElementById('profLevel').addEventListener('change', refreshLevelHint);
  // saludo en la cabecera: "Hola, Nombre" o la marca si no hay nombre
  function refreshHello(){
    const h = document.getElementById('hello');
    if(profile.name) h.textContent = 'Hola, ' + profile.name; else h.innerHTML = 'Mi<span>Run</span>';
  }

  // Foto de perfil: se recorta al centro, se reduce a 256 px (JPEG ~30 KB) y se guarda en mirun_photo.
  // Sin foto: círculo negro liso (decisión del usuario).
  function refreshAvatars(){
    const ph = LS.get('mirun_photo', null);
    ['hdrAvatar','profAvatar'].forEach(id=>{
      const el = document.getElementById(id);
      el.style.backgroundImage = ph ? 'url("' + ph + '")' : '';
      el.textContent = '';
    });
    document.getElementById('btnPhotoDel').style.display = ph ? '' : 'none';
  }
  const photoFile = document.getElementById('photoFile');
  document.getElementById('btnPhoto').addEventListener('click', ()=>photoFile.click());
  photoFile.addEventListener('change', ()=>{
    const f = photoFile.files && photoFile.files[0]; photoFile.value = '';
    if(!f || !/^image\//.test(f.type)) return;
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = ()=>{
      const S = 256, s = Math.min(img.width, img.height), c = document.createElement('canvas');
      c.width = c.height = S;
      c.getContext('2d').drawImage(img, (img.width - s)/2, (img.height - s)/2, s, s, 0, 0, S, S);
      URL.revokeObjectURL(url);
      if(LS.set('mirun_photo', c.toDataURL('image/jpeg', 0.82))){ refreshAvatars(); showSaved(); }
    };
    img.onerror = ()=>{ URL.revokeObjectURL(url); alert('No se pudo abrir esa imagen.'); };
    img.src = url;
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

  document.getElementById('btnSaveProfile').addEventListener('click', ()=>{
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
      voice: document.getElementById('profVoice').value === '1',
      mapMode: document.getElementById('profMap').value
    });
    if(typeof refreshLiveMap === 'function') refreshLiveMap();
    LS.set('mirun_profile', profile);
    refreshHello(); refreshAvatars();
    // las unidades cambian lo que se muestra en varias pantallas
    fillProfileForm(); profUnits.dataset.prev = profUnits.value;
    loadGoalForm(); refreshGoalLabels(); buildBodyForm();
    showSaved();
  });

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
  function streetsAvailable(mode){ // mode: vista pedida ('calles' o 'linea'); sin mode = la del Perfil
    return (mode || profile.mapMode) !== 'linea' && navigator.onLine && typeof window.L !== 'undefined';
  }
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
    showBigMap();
  }
  function closeBigMap(){
    bigMap.el.classList.remove('show');
    document.body.classList.remove('noScroll');
    bigMap.ptrs.clear();
  }
  function showBigMap(){
    bigMap.s = 1; bigMap.tx = 0; bigMap.ty = 0;
    resetStreetMap('big');
    try{ bigMap.shown = renderRoute('big', bigMap.canvas, bigMap.div, bigMap.pts, '#4d9bff', false, bigMap.mode); }
    catch(e){ bigMap.shown = 'linea'; bigMap.div.style.display = 'none'; bigMap.canvas.style.display = 'block'; }
    if(bigMap.shown === 'linea') drawBigLine();
    document.getElementById('bigMapMode').textContent = bigMap.mode === 'linea' ? 'Ver: calles' : 'Ver: solo línea';
    document.getElementById('bigMapNote').textContent =
      bigMap.mode !== 'linea' && bigMap.shown === 'linea' ? 'Sin internet: mostrando solo la línea' : '';
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
  // "Ver mapa" (o tocar la ruta pequeña) abre el mapa grande de esa actividad
  document.getElementById('histList').addEventListener('click', ev=>{
    const w = ev.target.closest('[data-map]'); if(!w) return;
    const h = history.find(x=>x.date === decodeURIComponent(w.dataset.map)); if(!h) return;
    const d = new Date(h.date);
    openBigMap(h.path, actInfo(h.type).n + ' · ' + d.toLocaleDateString('es-ES', {day:'numeric', month:'short'}));
  });
  function renderHistory(){
    const list = document.getElementById('histList');
    if(history.length===0){
      list.innerHTML = '<div class="empty"><img src="' + mascot('vacio') + '" alt="">Todavía no tienes actividades registradas.<br>¡Muévete hoy!</div>';
    } else {
      list.innerHTML = history.slice().reverse().map((h,ri)=>{
        const d = new Date(h.date);
        const fecha = d.toLocaleDateString('es-ES',{day:'2-digit',month:'short',year:'numeric'}) + ' · ' +
                      d.toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});
        const hasRoute = h.path && h.path.length > 1;
        const a = actInfo(h.type);
        const head = `<div class="top"><span>${a.e} <b style="color:var(--text);">${a.n}</b> · ${fecha}${h.manual && h.dist > 0 ? '<span class="tag">a mano</span>' : ''}${h.edited ? '<span class="tag">editada</span>' : ''}</span>
            <span class="histBtns"><button class="linkBtn" data-edit="${encodeURIComponent(h.date)}">Editar</button><button class="linkBtn" data-del="${encodeURIComponent(h.date)}">Borrar</button></span></div>`;
        if(!(h.dist > 0)){ // actividad sin distancia (gimnasio, natación, etc.)
          return `<div class="histItem">${head}<div class="stats">
            <div><div class="num">${Math.round(h.seconds/60)}</div><small>min</small></div>
            <div><div class="num">${h.intensity || '-'}</div><small>intensidad</small></div>
            <div><div class="num">${h.cal}</div><small>kcal</small></div></div></div>`;
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
          ${hasRoute ? `<div class="mini-route" data-map="${encodeURIComponent(h.date)}"><canvas id="hist-route-${ri}"></canvas>
            <button class="mapBigBtn" aria-label="Ver mapa a pantalla completa">Ver mapa</button></div>` : ''}
        </div>`;
      }).join('');
      // pasos: un solo aviso si falta la estatura y hay caminatas o carreras con distancia
      if(!(profile.height > 0) && history.some(h=>h.dist > 0 && (!h.type || h.type === 'correr' || h.type === 'caminar')))
        list.insertAdjacentHTML('afterbegin', '<div class="hint histStepsHint">Agrega tu estatura en Perfil para ver tus pasos</div>');

      history.slice().reverse().forEach((h,ri)=>{
        if(h.path && h.path.length > 1){
          const c = document.getElementById('hist-route-'+ri);
          if(c) drawRoute(c, h.path, '#7cc4ff');
        }
      });
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
  edChips.innerHTML = ACTIVITIES.map(a=>`<button class="chip" data-act="${a.k}"><span>${a.e}</span>${a.n}</button>`).join('');
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
    LS.set('mirun_history', history);
    closeEdit();
    renderHistory(); checkAchievements();
    showUndo(prev, n);
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
    LS.set('mirun_history', history);
    const news = newRecords(before, computeRecords(history));
    msg.style.color = 'var(--signal)';
    msg.textContent = 'Carrera agregada.' + (news.length ? ' ¡Nuevo récord en ' + news.map(n=>raceTxt(n.k)).join(', ') + '!' : '');
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
          <div class="l">MEJOR TIEMPO · ${paceTxt(r.best.sec, r.k)} /${dU()}<br>${fmtShortDate(r.best.date)}</div></div>
        <div class="recCol"><div class="v">${r.bestPace ? fmtPace(toPace(r.bestPace.p)) : '--'}</div>
          <div class="l">MEJOR RITMO PROM.<br>${r.count} ${r.count===1?'carrera':'carreras'}</div></div>
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

  function buildBodyForm(){
    document.getElementById('bodyInputs').innerHTML = MEASURES.filter(m=>tracked().includes(m.k)).map(m=>
      `<div class="measIn"><label>${m.n} (${mU(m)})</label>
        <input type="number" id="${m.id}" step="0.1" placeholder="${m.k === 'peso' && imp() ? 154 : m.ph}"><small>${m.h}</small></div>`).join('');
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
      liveMapNote.textContent = 'Sin internet: mostrando solo la línea';
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
    try{ if(navigator.vibrate) navigator.vibrate([200,100,200]); }catch(e){}
    const pm = Math.floor(splitTime/60), ps = Math.round(splitTime%60);
    say(name + ' ' + n + '. ' + that + ' en ' + pm + ' minutos ' +
        (ps ? 'y ' + ps + ' segundos' : '') + '. Tiempo total ' + spokenTime(sec) + '.');
  }

  // ---------- AVISO POR VOZ (funciona sin internet) ----------
  function say(text){
    if(!profile.voice || !('speechSynthesis' in window)) return;
    try{
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES'; u.rate = 1;
      window.speechSynthesis.speak(u);
    }catch(e){}
  }
  function spokenTime(sec){
    const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60);
    return (h ? h + (h===1?' hora ':' horas ') : '') + m + (m===1?' minuto':' minutos');
  }

  // ---------- CARRERA EN CURSO (se guarda por si se cierra la app) ----------
  let lastSaveAt = 0;
  function saveCurrentRun(force){
    if(!running) return;
    if(!force && Date.now() - lastSaveAt < 5000) return;
    lastSaveAt = Date.now();
    LS.set('mirun_current', {
      type: runType, startTime, elapsedBeforePause, paused, totalDist, path, splits,
      lastSplitDist, lastSplitTime, lastVoiceMi, lastVoiceTime, savedAt: Date.now()
    });
  }
  function clearCurrentRun(){ try{ localStorage.removeItem('mirun_current'); }catch(e){} }

  function updateDisplay(){
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
    running = true;
    paused = !!(state && state.paused);
    startTime = state ? state.startTime : Date.now();
    elapsedBeforePause = state ? state.elapsedBeforePause : 0;
    totalDist = state ? state.totalDist : 0;
    runType = (state && state.type) || selectedGpsType();
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
    runNote.style.display = 'none';
    resetStreetMap('live');
    document.getElementById('btnStart').style.display='none';
    document.getElementById('resumeBox').style.display='none';
    document.getElementById('activeBtns').style.display='flex';
    document.getElementById('btnPause').textContent = paused ? 'Reanudar' : 'Pausar';
    clearInterval(timerInterval);
    timerInterval = setInterval(updateDisplay, 1000);
    keepScreenOn();
    saveCurrentRun(true);
    updateDisplay();
  }

  document.getElementById('btnStart').addEventListener('click', ()=>{
    clearCurrentRun();
    // "Despierta" la voz con el toque del usuario (algunos telefonos lo exigen)
    if(profile.voice) say(typeName(selectedGpsType()) + '. Iniciado.');
    beginRun(null);
  });

  // Si quedo una carrera a medias (se cerro la app o se recargo), ofrecer seguirla
  const pending = LS.get('mirun_current', null);
  if(pending && pending.startTime && Date.now() - pending.savedAt < 6*3600*1000){
    showTab('run'); // la app abre en Inicio; si hay una actividad sin terminar, mostrarla
    const box = document.getElementById('resumeBox');
    document.getElementById('resumeInfo').textContent =
      'Tienes una actividad sin terminar: ' + fmtD(pending.totalDist||0) + '.';
    box.style.display = 'block';
    document.getElementById('btnResume').addEventListener('click', ()=>beginRun(pending));
    document.getElementById('btnResumeSave').addEventListener('click', ()=>{
      beginRun(pending); finishRun();
    });
    document.getElementById('btnResumeDiscard').addEventListener('click', ()=>{
      clearCurrentRun(); box.style.display = 'none';
    });
  } else if(pending){
    clearCurrentRun();
  }

  document.getElementById('btnPause').addEventListener('click', function(){
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

  document.getElementById('btnStop').addEventListener('click', ()=>{
    finishRun();
  });

  let sumPath = []; // ruta del último resumen, para el mapa grande
  document.getElementById('btnSumBigMap').addEventListener('click', ()=>openBigMap(sumPath, 'Tu ruta'));
  function finishRun(){
    if(!running) return;
    const sec = currentElapsedSec();
    running = false;
    clearInterval(timerInterval);
    releaseScreen();
    clearCurrentRun();
    runNote.style.display = 'none';
    const cal = calcCalories(totalDist, sec, runType);
    const paceMinPerKm = totalDist > 0.02 ? sec/60/totalDist : 0;
    const paceTotalSec = Math.round(paceMinPerKm*60);
    const paceStr = paceMinPerKm>0 ? pad(Math.floor(paceTotalSec/60))+':'+pad(paceTotalSec%60) : '--:--';

    if(totalDist > lastSplitDist){
      splits.push({km: Math.round((totalDist-lastSplitDist)*100)/100, seconds: sec-lastSplitTime, partial:true});
    }

    const recBefore = computeRecords(history);
    if(totalDist > 0.01){
      history.push({
        date: new Date().toISOString(),
        dist: totalDist,
        seconds: sec,
        pace: paceStr,
        cal: cal,
        path: path.map(p=>({lat:p.lat, lon:p.lon})),
        splits: splits,
        type: runType
      });
      LS.set('mirun_history', history);
    }

    document.querySelector('#summaryOverlay h2').textContent = typeName(runType) + ': guardado';
    document.getElementById('gpsTypeRow').style.display = 'flex';
    document.getElementById('btnStart').style.display='block';
    document.getElementById('activeBtns').style.display='none';
    document.getElementById('btnPause').textContent='Pausar';
    paused = false;

    document.getElementById('sumDist').textContent = fmtD(totalDist);
    document.getElementById('sumTime').textContent = fmtTime(sec);
    document.getElementById('sumPace').textContent = paceTxt(sec, totalDist) + ' ' + paceU(); // paceStr (min/km) es lo que se guarda
    document.getElementById('sumCal').textContent = cal;
    document.getElementById('sumSteps').textContent = stepsTxt({type: runType, dist: totalDist}); // pasos aproximados

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
    const bar = document.getElementById(id+'Bar');
    bar.style.width = Math.min(100, val/goalVal*100) + '%';
    bar.classList.toggle('full', val >= goalVal);
  }

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
    let html = ['L','M','X','J','V','S','D'].map(x=>`<div class="h">${x}</div>`).join('') + '<div class="d blank"></div>'.repeat(lead);
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
  function renderHome(){
    const mins = minutesByDay(), st = streakInfo(mins);
    document.getElementById('streakVal').textContent = st.cur;
    document.getElementById('streakLbl').textContent = st.cur === 1 ? 'día de racha' : 'días de racha';
    document.getElementById('streakRec').textContent = st.best
      ? 'Tu récord: ' + st.best + (st.best === 1 ? ' día' : ' días')
      : 'Haz ' + dailyMin() + ' min de actividad hoy para empezar tu racha';
    const today = new Date(); today.setHours(12,0,0,0);
    const tk = dayKey(today);
    // semana de lunes a domingo
    const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay()+6) % 7));
    let wMin = 0;
    for(let i=0; i<7; i++){ const d = new Date(monday); d.setDate(monday.getDate()+i); wMin += mins.get(dayKey(d)) || 0; }
    setBar('today', Math.round(mins.get(tk) || 0), dailyMin());
    setBar('week', Math.round(wMin), weekMin());
    // mascota: pose y mensaje según cómo va el día
    const tStat = dayStatus(mins, today), left = Math.max(0, Math.ceil(dailyMin() - (mins.get(tk) || 0)));
    const recent = [1,2,3].some(n=>{ const d = new Date(today); d.setDate(d.getDate()-n); return (mins.get(dayKey(d)) || 0) > 0; });
    let mk, msg;
    if(tStat === 'done'){ mk = 'cumplido'; msg = '¡Meta de hoy cumplida! Llevas ' + st.cur + (st.cur === 1 ? ' día' : ' días') + ' de racha.'; }
    else if(tStat === 'rest'){ mk = 'descanso'; msg = 'Hoy es tu día de descanso. Recupera energía, tu racha sigue a salvo.'; }
    else if(st.cur === 0 && st.best > 0 && recent){ mk = 'rota'; msg = 'Tu racha se reinició, pero hoy empieza otra. ¡Vamos!'; }
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
    document.getElementById('homeMsg').textContent = msg;
    renderCal(mins);
    const todays = history.filter(h=>dayKey(new Date(actRange(h)[0])) === tk);
    document.getElementById('todayList').innerHTML = todays.length ? todays.map(h=>{
      const a = actInfo(h.type);
      return `<div class="actRow"><div class="ic">${a.e}</div><div class="an">${a.n}
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
    `<button class="chip${i === 0 ? ' on' : ''}" data-act="${a.k}"><span>${a.e}</span>${a.n}</button>`).join('');
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
    LS.set('mirun_history', history);
    document.getElementById('actMin').value = '';
    const st = streakInfo(minutesByDay());
    mascotMsg(msg, mins >= 60 ? 'guardadoLargo' : 'guardado', typeName(type) + ' guardado. Racha: ' + st.cur + (st.cur === 1 ? ' día.' : ' días.'), 'var(--good)');
    renderHistory(); checkAchievements();
  });

  // ---------- LOGROS ----------
  // Se calculan desde el historial; solo se guarda cuáles ya se mostraron (mirun_achSeen).
  // v(s) = valor actual, g = meta, c = categoría (ACH_CATS), leg = legendario (insignia dorada especial).
  // Nombres y emojis propuestos por el diseñador. Para agregar un logro: una línea con id nuevo y único
  // (los id no se cambian: se usan en mirun_achSeen).
  const ACH_CATS = ['Actividades', 'Constancia y rachas', 'Metas semanales', 'Tiempo de entrenamiento',
                    'Distancia acumulada', 'Distancia en una carrera', 'Variedad'];
  const ACH = [
    {id:'first',   c:0, e:'🐣', n:'Primer paso',         d:'Completa 1 actividad',          g:1,   v:s=>s.count},
    {id:'act10',   c:0, e:'🥉', n:'Explorador',          d:'Completa 10 actividades',       g:10,  v:s=>s.count},
    {id:'act50',   c:0, e:'🥈', n:'Aventurero',          d:'Completa 50 actividades',       g:50,  v:s=>s.count},
    {id:'act100',  c:0, e:'🥇', n:'Veterano',            d:'Completa 100 actividades',      g:100, v:s=>s.count, leg:true},
    {id:'st3',     c:1, e:'🔥', n:'En llamas',           d:'3 días seguidos',               g:3,   v:s=>s.best},
    {id:'st7',     c:1, e:'⚡', n:'Semana eléctrica',    d:'7 días seguidos',               g:7,   v:s=>s.best},
    {id:'st15',    c:1, e:'💥', n:'Disciplina total',    d:'15 días seguidos',              g:15,  v:s=>s.best},
    {id:'st30',    c:1, e:'💎', n:'Diamante',            d:'30 días seguidos',              g:30,  v:s=>s.best},
    {id:'st60',    c:1, e:'🚀', n:'Imparable',           d:'60 días seguidos',              g:60,  v:s=>s.best},
    {id:'st100',   c:1, e:'👑', n:'Leyenda',             d:'100 días seguidos',             g:100, v:s=>s.best, leg:true},
    {id:'week',    c:2, e:'🎯', n:'Objetivo cumplido',   d:'Alcanza tu meta semanal',       g:1,   v:s=>s.bestWeek >= weekMin() ? 1 : 0},
    {id:'h10',     c:3, e:'⏳', n:'Tiempo inicial',      d:'10 horas acumuladas',           g:600, v:s=>s.totalMin},
    {id:'h50',     c:3, e:'⌛', n:'Maestro del tiempo',  d:'50 horas acumuladas',           g:3000,v:s=>s.totalMin, leg:true},
    {id:'km50',    c:4, e:'🛤️', n:'Primer recorrido',    get d(){ return fmtD(50, 0) + (imp() ? ' acumuladas' : ' acumulados'); }, g:50,  v:s=>s.totalKm},
    {id:'km250',   c:4, e:'🌍', n:'Conquistador',        get d(){ return fmtD(250, 0) + (imp() ? ' acumuladas' : ' acumulados'); }, g:250, v:s=>s.totalKm, leg:true},
    {id:'run5',    c:5, e:'🏃', n:'Primeros kilómetros', get d(){ return 'Corre ' + raceTxt(5) + ' de una vez'; }, g:5,   v:s=>s.longRun},
    {id:'run10',   c:5, e:'🏅', n:'Corredor de 10K',     get d(){ return 'Corre ' + raceTxt(10) + ' de una vez'; }, g:10,  v:s=>s.longRun},
    {id:'run21',   c:5, e:'🏆', n:'Media maratón',       get d(){ return 'Corre ' + raceTxt(21.1) + ' de una vez'; }, g:21.1,v:s=>s.longRun, leg:true},
    {id:'variety', c:6, e:'🚙', n:'Todoterreno',         d:'Prueba 4 tipos de actividad',   g:4,   v:s=>s.types}
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

  function renderAchievements(){
    const s = achStats();
    let on = 0;
    // tres estados: bloqueado (gris + candado), desbloqueado (azul), legendario (dorado)
    const card = a=>{
      const v = a.v(s), ok = v >= a.g; if(ok) on++;
      const pct = Math.min(100, v / a.g * 100);
      const st = !ok ? 'lock' : a.leg ? 'leg' : 'on';
      return `<div class="ach ${st}"><div class="medal">${a.e}${ok ? '' : '<i class="lk">🔒</i>'}</div>
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
    const s = achStats();
    const seen = LS.get('mirun_achSeen', null);
    const unlocked = ACH.filter(a=>a.v(s) >= a.g).map(a=>a.id);
    const fresh = seen ? unlocked.filter(id=>!seen.includes(id)) : [];
    if(!seen || fresh.length) LS.set('mirun_achSeen', [...new Set([...(seen || []), ...unlocked])]);
    if(silent || !seen || !fresh.length) return;
    achQueue = achQueue.concat(fresh);
    if(!document.getElementById('achOverlay').classList.contains('show')) showAchievement();
  }
  function showAchievement(){
    const id = achQueue.shift(); if(!id) return;
    const a = ACH.find(x=>x.id === id);
    document.getElementById('achMedal').textContent = a.e;
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
  function backupNote(t){ backupMsg.textContent = t; backupMsg.style.color = 'var(--signal)'; backupMsg.dataset.set = '1'; }

  document.getElementById('btnExport').addEventListener('click', ()=>{
    LS.set('mirun_lastBackup', new Date().toISOString());
    const data = JSON.stringify({app:'MiRun', version:4, exported:new Date().toISOString(), photo: LS.get('mirun_photo', null),
                                 profile, goal, history, body});
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    const d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = 'MiRun-copia-' + d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 5000);
    backupNote('Copia guardada en la carpeta Descargas del teléfono (' + history.length + ' actividades, ' + body.length + ' mediciones, tu perfil y metas).');
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
            splits: Array.isArray(h.splits) ? h.splits.filter(s=>s&&isFinite(s.km)&&isFinite(s.seconds))
                    .map(s=>({km:Number(s.km), seconds:Number(s.seconds), partial:!!s.partial})) : [],
            manual: !!h.manual,
            // campos de v5 (actividades): solo valores conocidos
            ...(ACTIVITIES.some(a=>a.k === h.type) ? {type: h.type} : {}),
            ...(INTENSITY.includes(h.intensity) ? {intensity: h.intensity} : {}),
            // campos de edición: identificador original y fecha de la edición (texto corto)
            ...(typeof h.origDate === 'string' ? {origDate: h.origDate.slice(0,40)} : {}),
            ...(typeof h.edited === 'string' ? {edited: h.edited.slice(0,40)} : {})
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
          if(p.mapMode === 'linea' || p.mapMode === 'calles') ok.mapMode = p.mapMode;
          if(p.units === 'metric' || p.units === 'imperial') ok.units = p.units; // v5: unidades (sin campo = métrico)
          take(profile, ok); LS.set('mirun_profile', profile);
        }
        if(data.goal && typeof data.goal === 'object'){
          const g = data.goal, ok = {}, num = (v, a, b)=>{ v = Number(v); return v >= a && v <= b ? v : undefined; };
          [['dist',0.1,500],['time',1,1440],['paceMin',1,30],['paceSec',0,59],['dailyMin',10,60],['weekMin',10,3000]]
            .forEach(([k,a,b])=>{ const v = num(g[k], a, b); if(v !== undefined) ok[k] = v; });
          if(Array.isArray(g.restPlan)) ok.restPlan = g.restPlan
            .filter(x=>x && /^\d{4}-\d{2}-\d{2}$/.test(x.from) && Array.isArray(x.days))
            .map(x=>({from: x.from, days: x.days.map(Number).filter(d=>d >= 0 && d <= 6).slice(0, 3)}));
          take(goal, ok); LS.set('mirun_goal', goal);
        }
        if(typeof data.photo === 'string' && data.photo.length < 400000 &&
           /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(data.photo) && (fresh || !LS.get('mirun_photo', null))){
          LS.set('mirun_photo', data.photo); perfil = true;
        }
        fillProfileForm(); loadGoalForm(); loadStreakForm(); refreshGoalLabels(); buildBodyForm();
        renderHistory(); checkAchievements(true);
        backupNote('Listo: se recuperaron ' + nuevas.length + ' actividades y ' + nuevasMed + ' mediciones nuevas' +
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
    const hasData = ['mirun_profile','mirun_goal','mirun_photo','mirun_current'].some(k=>localStorage.getItem(k) !== null) ||
                    history.length > 0 || body.length > 0;
    if(hasData){ LS.set('mirun_welcomed', true); return; }
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
    function close(){ LS.set('mirun_welcomed', true); wel.classList.remove('show'); }
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
