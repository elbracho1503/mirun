// Corta una hoja de poses 4x4 (1254 px, fondo transparente) en 15 PNG de 256 px, con la tabla de Zafira, Rayo y Jade.
// Uso (desde la carpeta del proyecto):
//   node .claude/herramientas/cortar4x4.js "ruta/hoja.png" img/nuevo
// Antes: revisar que el fondo sea transparente de verdad (esquinas con alfa 0) y que la hoja tenga el mismo orden
// de poses; si no, cambiar NAMES. Después: mirar las 15 poses a ojo, guardar la hoja original en
// respaldo/personajes-original/ y agregar el personaje a CHARACTERS (js/app.js) y a CHAR_DIRS (sw.js).
// Cómo reparte: cada figura (pieza sólida grande, alfa>100) va a la celda de su centro; un adorno suelto que está
// junto a una línea de la cuadrícula va a la figura más cercana; el brillo tenue solo se guarda a <= 25 px de su figura.
const png = require('./png_lib.js'), fs = require('fs'), path = require('path');
const [src, out] = process.argv.slice(2); fs.mkdirSync(out, {recursive: true});
const {W, H, px} = png.read(src), A = (x, y) => px[(y * W + x) * 4 + 3], SOL = 100;
// celda (fila*4+col) -> archivo; la celda 14 (gateando) no se usa; 15 meditando = cansado
const NAMES = ['01_aprobacion','02_pesas','03_corriendo','05_decidido','04_carino','06_pensando','07_emocionado','08_agotado',
  '09_celebrando','11_frustrado','12_estudiando','13_tu_puedes','15_asomado',null,'10_cansado','14_durmiendo'];
const cen = [], cw = W / 4, ch = H / 4, lab = new Int32Array(W * H).fill(-1), owner = [], info = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (lab[y * W + x] >= 0 || A(x, y) <= SOL) continue;
  const L = owner.length, st = [y * W + x]; lab[y * W + x] = L; let sx = 0, sy = 0, n = 0, cells = new Set();
  while (st.length) { const i = st.pop(), ix = i % W, iy = (i / W) | 0; sx += ix; sy += iy; n++; cells.add(Math.min(3, (iy / ch) | 0) * 4 + Math.min(3, (ix / cw) | 0));
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = ix + dx, ny = iy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx; if (lab[j] < 0 && A(nx, ny) > SOL) { lab[j] = L; st.push(j); } } }
  const c = Math.min(3, (sy / n / ch) | 0) * 4 + Math.min(3, (sx / n / cw) | 0); owner.push(c); cen.push([sx / n, sy / n]);
  if (cells.size > 1 && n > 200) info.push({pieza: L, pixeles: n, celdas: [...cells], va: c});
}
// figuras = piezas grandes (por su centro); adornos sueltos = dueño de la figura más cercana; brillo tenue = solo si está a <= 25 px
const BIG = 5000, sizes = new Int32Array(owner.length); for (let i = 0; i < W * H; i++) if (lab[i] >= 0) sizes[lab[i]]++;
function bfs(seedOwner){ // devuelve [dueño, distancia] del sólido "semilla" más cercano (distancia de tablero)
  const own = new Int8Array(W * H).fill(-1), dist = new Uint16Array(W * H).fill(65535), q = new Int32Array(W * H); let h = 0, t = 0;
  for (let i = 0; i < W * H; i++) { const o = seedOwner(i); if (o >= 0) { own[i] = o; dist[i] = 0; q[t++] = i; } }
  while (h < t) { const i = q[h++], x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx; if (dist[j] === 65535) { dist[j] = dist[i] + 1; own[j] = own[i]; q[t++] = j; } } }
  return [own, dist]; }
const [o1] = bfs(i => lab[i] >= 0 && sizes[lab[i]] >= BIG ? owner[lab[i]] : -1);
const votes = owner.map(() => new Map());
for (let i = 0; i < W * H; i++) { const l = lab[i]; if (l >= 0 && sizes[l] < BIG) votes[l].set(o1[i], (votes[l].get(o1[i]) || 0) + 1); }
const moved = [];
// solo cambia de dueño un adorno cuyo centro está a menos de 45 px de una línea interna de la cuadrícula
const nearLine = ([x, y]) => [1, 2, 3].some(k => Math.abs(x - k * cw) < 45 || Math.abs(y - k * ch) < 45);
owner.forEach((c, l) => { if (sizes[l] >= BIG || !nearLine(cen[l])) return; let best = c, bn = -1; votes[l].forEach((n, k) => { if (n > bn) { bn = n; best = k; } });
  if (best !== c && sizes[l] > 150) moved.push({pixeles: sizes[l], de: c, a: best}); owner[l] = best; });
console.log('adornos reasignados a la figura más cercana:', JSON.stringify(moved));
const [o2, d2] = bfs(i => lab[i] >= 0 ? owner[lab[i]] : -1);
const cellOf = (x, y) => { const i = y * W + x, l = lab[i]; return l >= 0 ? owner[l] : (d2[i] <= 25 ? o2[i] : -1); };
console.log('piezas que cruzan la cuadrícula:', JSON.stringify(info));
NAMES.forEach((nm, c) => { if (!nm) return;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (A(x, y) > 40 && cellOf(x, y) === c) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const w = x1 - x0 + 1, h = y1 - y0 + 1, S = Math.round(Math.max(w, h) * 1.05), ox = (S - w) >> 1, oy = (S - h) >> 1, buf = Buffer.alloc(S * S * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const X = x0 + x, Y = y0 + y, si = (Y * W + X) * 4; if (px[si + 3] < 8 || cellOf(X, Y) !== c) continue; px.copy(buf, ((oy + y) * S + ox + x) * 4, si, si + 4); }
  const r = png.resize({W: S, H: S, px: buf}, 256, 256), f = path.join(out, nm + '.png'); png.write(f, 256, 256, r.px);
  console.log(nm, 'caja', w + 'x' + h, (fs.statSync(f).size / 1024 | 0) + 'KB'); });
