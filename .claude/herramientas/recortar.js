// Recorta la hoja en 15 poses. Cada "pieza" sólida (alpha>100, pixeles conectados) va entera
// al personaje más cercano; el brillo tenue (alpha<=100) se reparte por la línea de corte.
const {read,write}=require('./png_lib.js');const fs=require('fs');
const {W,H,px}=read('pegatinas/hoja.png');const A=(x,y)=>px[(y*W+x)*4+3];
const names=[['01_aprobacion','02_pesas','03_corriendo','04_carino','05_decidido'],
 ['06_pensando','07_emocionado','08_agotado','09_celebrando','10_cansado'],
 ['11_frustrado','12_estudiando','13_tu_puedes','14_durmiendo','15_asomado']];
const bands=[[0,342],[342,676],[676,1024]],SOL=100;
bands.forEach(([y0,y1],r)=>{
 const bh=y1-y0,col=[];for(let x=0;x<W;x++){let c=0;for(let y=y0;y<y1;y++)if(A(x,y)>200)c++;col.push(c);}
 const cuts=[0];for(let k=1;k<5;k++){const e=Math.round(W*k/5);let m=1e9,mi=e;for(let x=e-60;x<=e+60;x++)if(col[x]<m){m=col[x];mi=x;}cuts.push(mi);}cuts.push(W);
 // centro de masa sólida de cada celda (para decidir a quién pertenece cada pieza)
 const cx=[];for(let c=0;c<5;c++){let s=0,n=0;for(let x=cuts[c];x<cuts[c+1];x++){s+=x*col[x];n+=col[x];}cx.push(s/n);}
 const lab=new Int32Array(W*bh).fill(-1),owner=[];let L=0;
 for(let y=0;y<bh;y++)for(let x=0;x<W;x++){if(lab[y*W+x]>=0||A(x,y0+y)<=SOL)continue;
  const st=[y*W+x];lab[y*W+x]=L;let sx=0,n=0;
  while(st.length){const i=st.pop(),ix=i%W,iy=(i/W)|0;sx+=ix;n++;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=ix+dx,ny=iy+dy;if(nx<0||ny<0||nx>=W||ny>=bh)continue;const j=ny*W+nx;
    if(lab[j]<0&&A(nx,y0+ny)>SOL){lab[j]=L;st.push(j);}}}
  const m=sx/n;let best=0;cx.forEach((c,k)=>{if(Math.abs(c-m)<Math.abs(cx[best]-m))best=k;});owner.push(best);L++;}
 const cellOf=(x,y)=>{const l=lab[(y-y0)*W+x];if(l>=0)return owner[l];for(let c=0;c<5;c++)if(x<cuts[c+1])return c;return 4;};
 for(let c=0;c<5;c++){let bx0=1e9,by0=1e9,bx1=-1,by1=-1;
  for(let y=y0;y<y1;y++)for(let x=0;x<W;x++)if(A(x,y)>40&&cellOf(x,y)===c){if(x<bx0)bx0=x;if(x>bx1)bx1=x;if(y<by0)by0=y;if(y>by1)by1=y;}
  const w=bx1-bx0+1,h=by1-by0+1,S=Math.max(w,h)+24,ox=(S-w)>>1,oy=(S-h)>>1,out=Buffer.alloc(S*S*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const X=bx0+x,Y=by0+y,si=(Y*W+X)*4;if(px[si+3]<8||cellOf(X,Y)!==c)continue;px.copy(out,((oy+y)*S+ox+x)*4,si,si+4);}
  const f='poses/'+names[r][c]+'.png';write(f,S,S,out);console.log(f,S+'px',(fs.statSync(f).size/1024|0)+'KB');}
});
