// Mini librería PNG (RGBA 8 bits) sin dependencias: leer, recortar, escribir.
const fs=require('fs'),zlib=require('zlib');
function read(file){const b=fs.readFileSync(file);let p=8,W,H,idat=[];while(p<b.length){const len=b.readUInt32BE(p),t=b.toString('ascii',p+4,p+8),d=b.slice(p+8,p+8+len);
if(t==='IHDR'){W=d.readUInt32BE(0);H=d.readUInt32BE(4);}if(t==='IDAT')idat.push(d);p+=12+len;}
const raw=zlib.inflateSync(Buffer.concat(idat)),bpp=4,st=W*bpp,px=Buffer.alloc(H*st);
for(let y=0;y<H;y++){const f=raw[y*(st+1)],r=raw.slice(y*(st+1)+1,(y+1)*(st+1));for(let x=0;x<st;x++){
const a=x>=bpp?px[y*st+x-bpp]:0,up=y?px[(y-1)*st+x]:0,c=(x>=bpp&&y)?px[(y-1)*st+x-bpp]:0;let v=r[x];
if(f===1)v+=a;else if(f===2)v+=up;else if(f===3)v+=(a+up)>>1;else if(f===4){const pp=a+up-c,pa=Math.abs(pp-a),pb=Math.abs(pp-up),pc=Math.abs(pp-c);v+=(pa<=pb&&pa<=pc)?a:(pb<=pc?up:c);}
px[y*st+x]=v&255;}}return {W,H,px};}
const crcT=new Int32Array(256).map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c;});
const crc=b=>{let c=-1;for(const x of b)c=crcT[(c^x)&255]^(c>>>8);return (c^-1)>>>0;};
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);}
function write(file,W,H,px){const st=W*4,raw=Buffer.alloc(H*(st+1));for(let y=0;y<H;y++){raw[y*(st+1)]=1;for(let x=0;x<st;x++){raw[y*(st+1)+1+x]=(px[y*st+x]-(x>=4?px[y*st+x-4]:0))&255;}}
const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]));}
module.exports={read,write};
