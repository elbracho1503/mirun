// Mini librería PNG (8 bits, RGB o RGBA; siempre devuelve RGBA) sin dependencias: leer, escribir.
const fs=require('fs'),zlib=require('zlib');
function read(file){const b=fs.readFileSync(file);let p=8,W,H,CT,idat=[];while(p<b.length){const len=b.readUInt32BE(p),t=b.toString('ascii',p+4,p+8),d=b.slice(p+8,p+8+len);
if(t==='IHDR'){W=d.readUInt32BE(0);H=d.readUInt32BE(4);CT=d[9];}if(t==='IDAT')idat.push(d);p+=12+len;}
if(CT!==2&&CT!==6)throw new Error('solo PNG RGB o RGBA de 8 bits');
const raw=zlib.inflateSync(Buffer.concat(idat)),bpp=CT===6?4:3,st=W*bpp,px=Buffer.alloc(H*st);
for(let y=0;y<H;y++){const f=raw[y*(st+1)],r=raw.slice(y*(st+1)+1,(y+1)*(st+1));for(let x=0;x<st;x++){
const a=x>=bpp?px[y*st+x-bpp]:0,up=y?px[(y-1)*st+x]:0,c=(x>=bpp&&y)?px[(y-1)*st+x-bpp]:0;let v=r[x];
if(f===1)v+=a;else if(f===2)v+=up;else if(f===3)v+=(a+up)>>1;else if(f===4){const pp=a+up-c,pa=Math.abs(pp-a),pb=Math.abs(pp-up),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?up:c);}
px[y*st+x]=v&255;}}
if(bpp===4)return {W,H,px};const o=Buffer.alloc(W*H*4);for(let i=0,j=0;i<px.length;i+=3,j+=4){o[j]=px[i];o[j+1]=px[i+1];o[j+2]=px[i+2];o[j+3]=255;}return {W,H,px:o};}
const crcT=new Int32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c;});
const crc=b=>{let c=-1;for(const x of b)c=crcT[(c^x)&255]^(c>>>8);return (c^-1)>>>0;};
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);}
function write(file,W,H,px){const st=W*4,raw=Buffer.alloc(H*(st+1));for(let y=0;y<H;y++){raw[y*(st+1)]=1;for(let x=0;x<st;x++){raw[y*(st+1)+1+x]=(px[y*st+x]-(x>=4?px[y*st+x-4]:0))&255;}}
const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]));}
module.exports={read,write};
// Reduce una imagen RGBA a T×T (o TW×TH) promediando pixeles (respeta la transparencia).
function resize(src,TW,TH){const {W,H,px}=src,kx=W/TW,ky=H/TH,out=Buffer.alloc(TW*TH*4);
for(let y=0;y<TH;y++)for(let x=0;x<TW;x++){let r=0,g=0,b=0,a=0,n=0;const xa=Math.floor(x*kx),xb=Math.max(xa+1,Math.floor((x+1)*kx)),ya=Math.floor(y*ky),yb=Math.max(ya+1,Math.floor((y+1)*ky));
for(let yy=ya;yy<yb;yy++)for(let xx=xa;xx<xb;xx++){const i=(yy*W+xx)*4,al=px[i+3];r+=px[i]*al;g+=px[i+1]*al;b+=px[i+2]*al;a+=al;n++;}
const o=(y*TW+x)*4;if(a>0){out[o]=r/a;out[o+1]=g/a;out[o+2]=b/a;}out[o+3]=Math.round(a/n);}return {W:TW,H:TH,px:out};}
module.exports.resize=resize;
