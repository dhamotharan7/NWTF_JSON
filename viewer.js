'use strict';
const canvas=document.getElementById('plot'),ctx=canvas.getContext('2d');
const status=document.getElementById('status');let field=null;
const stops=[[49,54,149],[69,117,180],[116,173,209],[171,217,233],[224,243,248],[255,255,191],[254,224,144],[253,174,97],[244,109,67],[215,48,39],[165,0,38]];
function colour(t){t=Math.max(0,Math.min(1,t));const f=t*(stops.length-1),i=Math.min(stops.length-2,Math.floor(f)),w=f-i;return stops[i].map((v,k)=>Math.round(v*(1-w)+stops[i+1][k]*w));}
function parseCSV(text){
 const lines=text.trim().split(/\r?\n/);if(lines[5].trim()!=='x,y,U_mean')throw Error('Expected x,y,U_mean on line 6.');
 const rows=lines.slice(6).filter(l=>l.trim()).map(l=>l.split(',').map(s=>s.trim().toLowerCase()==='nan'?NaN:Number(s)));
 if(!rows.length||rows.some(r=>r.length!==3||!Number.isFinite(r[0])||!Number.isFinite(r[1])||(!Number.isFinite(r[2])&&!Number.isNaN(r[2]))))throw Error('Invalid numerical rows.');
 const xs=[...new Set(rows.map(r=>r[0]))].sort((a,b)=>a-b),ys=[...new Set(rows.map(r=>r[1]))].sort((a,b)=>a-b);
 if(rows.length!==xs.length*ys.length)throw Error('Expected a complete rectangular grid.');
 const xi=new Map(xs.map((v,i)=>[v,i])),yi=new Map(ys.map((v,i)=>[v,i])),values=new Float64Array(rows.length),seen=new Set();values.fill(NaN);
 for(const [x,y,z] of rows){const i=yi.get(y)*xs.length+xi.get(x);if(seen.has(i))throw Error('Duplicate coordinate.');seen.add(i);values[i]=z;}
 for(const arr of [xs,ys]){const d=arr[1]-arr[0];if(!(d>0)||arr.some((v,i)=>i>0&&Math.abs((v-arr[i-1])-d)>Math.abs(d)*1e-5))throw Error('Expected uniformly spaced coordinates.');}
 const finite=values.filter(Number.isFinite);if(!finite.length)throw Error('No finite measurements.');
 return {xs,ys,values,min:Math.min(...finite),max:Math.max(...finite),count:rows.length};
}
function draw(f){
 const {xs,ys,values,min,max}=f,nx=xs.length,ny=ys.length;
 const dx=xs[1]-xs[0],dy=ys[1]-ys[0],xmin=xs[0]-dx/2,xmax=xs[nx-1]+dx/2,ymin=ys[0]-dy/2,ymax=ys[ny-1]+dy/2;
 const scale=Math.min(790/(xmax-xmin),680/(ymax-ymin)),w=scale*(xmax-xmin),h=scale*(ymax-ymin),left=95,top=80;
 Object.assign(f,{left,top,w,h,xmin,xmax,ymin,ymax});ctx.fillStyle='white';ctx.fillRect(0,0,1000,850);
 const off=document.createElement('canvas');off.width=nx;off.height=ny;const c=off.getContext('2d'),im=c.createImageData(nx,ny);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const v=values[j*nx+i],k=((ny-1-j)*nx+i)*4,co=Number.isFinite(v)?colour((v-min)/(max-min||1)):[220,220,220];im.data.set([...co,255],k);}
 c.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,left,top,w,h);ctx.strokeStyle='#183247';ctx.strokeRect(left,top,w,h);ctx.fillStyle='#183247';ctx.font='20px sans-serif';ctx.fillText('Mean streamwise velocity | 15° | dimensional data',left,35);ctx.font='16px sans-serif';
 for(let i=0;i<=4;i++){let x=left+i*w/4,y=top+h-i*h/4;ctx.textAlign='center';ctx.fillText((xmin+(xmax-xmin)*i/4).toFixed(3),x,top+h+25);ctx.textAlign='right';ctx.fillText((ymin+(ymax-ymin)*i/4).toFixed(3),left-12,y+5);}
 ctx.textAlign='center';ctx.fillText('x [m]',left+w/2,top+h+55);ctx.save();ctx.translate(25,top+h/2);ctx.rotate(-Math.PI/2);ctx.fillText('y [m]',0,0);ctx.restore();
 const barX=left+w+25;for(let p=0;p<h;p++){ctx.fillStyle=`rgb(${colour(1-p/h).join(',')})`;ctx.fillRect(barX,top+p,18,1);}
 ctx.fillStyle='#183247';ctx.textAlign='left';for(let i=0;i<=4;i++)ctx.fillText((max-(max-min)*i/4).toFixed(3),barX+25,top+h*i/4+5);ctx.fillText('m/s',barX,top-15);ctx.font='13px sans-serif';ctx.fillText('NWTF-AI-TEST-001 / 15° • source values and coordinate orientation preserved',left,825);
}
function show(text){try{field=parseCSV(text);draw(field);status.textContent=`Plotted ${field.count.toLocaleString()} measurements: ${field.xs.length} × ${field.ys.length}. Range ${field.min.toFixed(4)} to ${field.max.toFixed(4)} m/s.`;document.getElementById('save').disabled=false;}catch(e){status.textContent=e.message;}}
document.getElementById('load').onclick=async()=>{status.textContent='Loading CSV…';try{const r=await fetch('U_mean_15AOA.csv');if(!r.ok)throw Error(`Download failed (${r.status}).`);show(await r.text());}catch(e){status.textContent=e.message+' If opened locally, select the CSV above.';}};
document.getElementById('file').onchange=async e=>{if(e.target.files[0])show(await e.target.files[0].text());};
document.getElementById('save').onclick=()=>{const a=document.createElement('a');a.download='NWTF_U_mean_15AOA.png';a.href=canvas.toDataURL('image/png');a.click();};
canvas.onmousemove=e=>{if(!field)return;const r=canvas.getBoundingClientRect(),px=(e.clientX-r.left)*canvas.width/r.width,py=(e.clientY-r.top)*canvas.height/r.height,f=field;if(px<f.left||px>=f.left+f.w||py<f.top||py>=f.top+f.h)return;const i=Math.floor((px-f.left)/f.w*f.xs.length),j=f.ys.length-1-Math.floor((py-f.top)/f.h*f.ys.length);document.getElementById('hover').textContent=`x = ${f.xs[i].toFixed(6)} m; y = ${f.ys[j].toFixed(6)} m; U_mean = ${f.values[j*f.xs.length+i].toFixed(6)} m/s`;};
