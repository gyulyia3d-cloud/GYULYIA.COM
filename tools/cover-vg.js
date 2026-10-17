/* VJ GENERATOR — o usuário digita /vj no Claude e o Motor Gráfico monta a animação.
   Duas janelas em wireframe (canvas 2D como textura), mesma estética das outras capas. Host: #vg */
function VG_scene(VJ){
const {scene,cam,edges,label,loop,fit,smooth,clamp,wire,pulses}=VJ;
const D=VJ.D;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const FONT='"Martian Mono",ui-monospace,monospace';
const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const chat=mkCanvas(896,576),cx=chat.getContext('2d');
const mot=mkCanvas(1280,720),mx=mot.getContext('2d');
const mkTex=c=>{const t=new THREE.CanvasTexture(c);t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.LinearFilter;return t;};
const ct=mkTex(chat),mt=mkTex(mot);
function win(w,h,tx){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,opacity:1,depthWrite:false}));
  const e=edges(m.geometry,.9);m.add(e);return m;}
const chatM=win(5.6,3.6,ct);chatM.position.set(-5.3,0,0);chatM.rotation.y=.3;scene.add(chatM);
const motM=win(9,5.0625,mt);motM.position.set(4.4,0,0);motM.rotation.y=-.22;scene.add(motM);
const grd=new THREE.GridHelper(90,45,0x181818,0x0c0c0c);grd.position.y=-3.4;scene.add(grd);

// fio de dados: chat -> motor (projeto.aivj.json)
const cv=wire([V(-2.7,.6,.5),V(-1.6,1.4,.9),V(-.4,.6,.3)],.5);
const pl=pulses(cv,9,.22,.12);

// ---------- utilidades ----------
const sm=(a,b,x)=>{x=clamp((x-a)/(b-a),0,1);return x*x*(3-2*x);};
const wave=(u,v,t)=>{const a=Math.sin(u*8+t*1.1)+Math.sin(v*6-t*.9)+Math.sin((u+v)*5+t*.6)+Math.sin(Math.hypot(u-.5,v-.5)*12-t*1.4);return sm(-1.3,2.3,a);};
const typed=(s,p)=>s.slice(0,Math.floor(clamp(p,0,1)*s.length));

// ---------- janela do chat ----------
const CMD='/vj fachada 24x12 m · techno 128 bpm';
const LINES=[[1.0,'Briefing: superfície, música, conceito. OK'],[2.0,'Lendo pixel map: fachada 24x12 m · 1920x1080. OK'],[3.0,'Bibliotecas: GLSL · ISF · FX · synth'],[3.5,'Princípios: antecipação, mola, loop fechado'],[4.0,'Gerando projeto.aivj.json > Motor Gráfico']];
function drawChat(tt){
  const W=896,H=576;
  cx.fillStyle='#050505';cx.fillRect(0,0,W,H);
  cx.strokeStyle='rgba(255,255,255,.9)';cx.lineWidth=2;cx.strokeRect(1,1,W-2,H-2);
  cx.fillStyle='#fff';cx.font='bold 24px '+FONT;cx.fillText('CLAUDE',28,46);
  cx.fillStyle='rgba(255,255,255,.45)';cx.font='16px '+FONT;cx.textAlign='right';cx.fillText('skill /vj · ai-vj-generator',W-28,44);cx.textAlign='left';
  cx.fillStyle='rgba(255,255,255,.3)';cx.fillRect(0,66,W,2);
  const sent=tt>=D*.92;
  let y=118;
  cx.font='20px '+FONT;
  if(sent){cx.fillStyle='rgba(255,255,255,.55)';cx.fillText('>',28,y);cx.fillStyle='#fff';cx.fillText(CMD,64,y);y+=54;}
  LINES.forEach(([t0,s],i)=>{
    if(tt<D*t0)return;
    const p=(tt-D*t0)/1.1;const shown=typed(s,p);
    cx.fillStyle=i===LINES.length-1?'#fff':'rgba(255,255,255,.78)';cx.fillText(shown,28,y);
    if(p<1){cx.fillRect(28+cx.measureText(shown).width+3,y-18,11,22);}
    y+=44;
  });
  // caixa de entrada
  const by=H-108;
  cx.strokeStyle='rgba(255,255,255,.75)';cx.lineWidth=2;cx.strokeRect(24,by,W-48,70);
  cx.font='22px '+FONT;
  if(!sent){
    const s=typed(CMD,tt/(D*.8));
    cx.fillStyle='#fff';cx.fillText('> '+s,44,by+44);
    if(Math.floor(tt*2.5)%2===0||s.length<CMD.length){cx.fillRect(44+cx.measureText('> '+s).width+4,by+18,12,28);}
  }else{
    cx.fillStyle='rgba(255,255,255,.3)';cx.fillText('Responder...',44,by+44);
  }
}

// ---------- janela do Motor Gráfico ----------
const LAYERS=['MATÉRIA','SHADER','FORMAS','ELEMENTOS 3D','TEXTO','FX'];
const TABS=['PARAMS','MEDIA','AUDIO','SURFACE'];
function box(x,y,w,h,fill,op){mx.strokeStyle='rgba(255,255,255,'+(op==null?.7:op)+')';mx.lineWidth=2;if(fill){mx.fillStyle='#fff';mx.fillRect(x,y,w,h);}else mx.strokeRect(x,y,w,h);}
function txt(s,x,y,size,col,bold,align){mx.font=(bold?'bold ':'')+size+'px '+FONT;mx.fillStyle=col||'#fff';mx.textAlign=align||'left';mx.fillText(s,x,y);mx.textAlign='left';}
// silhueta da fachada (pixel map) dentro de um retângulo
function facade(x,y,w,h,prog){
  const sx=w/24,sy=h/13;const P=[[0,12],[0,0],[24,0],[24,12],[24,12]];
  mx.strokeStyle='rgba(255,255,255,.9)';mx.lineWidth=2;mx.beginPath();
  const pts=[[1,12],[1,1.8],[6,1.8],[6,5],[18,5],[18,1.8],[23,1.8],[23,12],[1,12]];
  const total=pts.length-1;const lim=prog*total;
  mx.moveTo(x+pts[0][0]*sx,y+pts[0][1]*sy);
  for(let i=1;i<=total;i++){const f=clamp(lim-(i-1),0,1);if(f<=0)break;
    const a=pts[i-1],b=pts[i];mx.lineTo(x+(a[0]+(b[0]-a[0])*f)*sx,y+(a[1]+(b[1]-a[1])*f)*sy);}
  mx.stroke();
  mx.strokeStyle='rgba(255,255,255,.22)';mx.lineWidth=1;
  const gp=clamp(prog*1.4-.2,0,1);
  for(let i=0;i<=24;i++){const gx=x+i*sx;mx.beginPath();mx.moveTo(gx,y+1.8*sy);mx.lineTo(gx,y+(1.8+10.2*gp)*sy);mx.stroke();}
  for(let j=0;j<=13;j++){const gy=y+(1.8+j*.785)*sy;if(gy>y+12*sy)break;mx.beginPath();mx.moveTo(x+1*sx,gy);mx.lineTo(x+(1+22*gp)*sx,gy);mx.stroke();}
  // máscara: arcos
  if(prog>.6){mx.strokeStyle='#fff';mx.lineWidth=2;[[4,6.5],[9,6.5],[15,6.5],[20,6.5]].forEach(([ax,ay])=>{mx.beginPath();mx.rect(x+(ax-.9)*sx,y+ay*sy,1.8*sx,3.6*sy);mx.stroke();});}
}
function halftone(x,y,w,h,amp,t){
  const nx=52,ny=29,cw=w/nx,ch=h/ny;mx.fillStyle='#fff';
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const u=i/(nx-1),v=j/(ny-1);const wv=wave(u,v,t)*amp;if(wv<.07)continue;
    const s=cw*.9*wv;mx.fillRect(x+i*cw+(cw-s)/2,y+j*ch+(ch-s)/2,s,s*ch/cw);}
}
function drawMotor(tt,T){
  const W=1280,H=720,stg=Math.floor(tt/D)%5,loc=(tt%D)/D;
  mx.fillStyle='#050505';mx.fillRect(0,0,W,H);
  box(1,1,W-2,H-2,false,.9);
  // cabeçalho
  txt('AI VJ GENERATOR',24,48,28,'#fff',true);
  box(330,20,170,42,true);txt('STANDARD',345,48,20,'#000',true);box(500,20,150,42,false,.6);txt('BRIEFING',516,48,20,'#fff',false);
  box(900,20,170,42,false,.6);txt('LOAD BRIEFING',912,48,15,'#fff');box(1085,20,150,42,false,.6);txt('CREATIVE',1105,48,16,'#fff');
  txt('FIT   100%   -   +   GRID   SAFE',24,92,15,'rgba(255,255,255,.7)');txt('UNDO   REDO   HISTORY',420,92,15,'rgba(255,255,255,.45)');
  mx.fillStyle='rgba(255,255,255,.25)';mx.fillRect(0,106,W,2);
  // coluna de composições
  txt('COMPOSITIONS',24,140,16,'rgba(255,255,255,.7)',true);
  const comps=stg>=3?clamp(Math.floor((tt-D*3)/.55)+1,0,5):0;
  for(let i=0;i<5;i++){const cy=160+i*100;box(24,cy,200,88,false,i<comps?.9:.25);
    if(i<comps){halftone(28,cy+4,192,80,.55+.1*i,tt+i*3);txt('0'+(i+1),32,cy+22,15,'#fff',true);}}
  mx.fillStyle='rgba(255,255,255,.25)';mx.fillRect(240,108,2,H-140);mx.fillRect(820,108,2,H-140);
  // preview 16:9
  const px=262,py=150,pw=530,ph=298;
  box(px-2,py-2,pw+4,ph+4,false,.9);
  mx.fillStyle='#000';mx.fillRect(px,py,pw,ph);
  let status='NO PROJECT';
  if(stg===2){facade(px+20,py+14,pw-40,ph-28,smooth(loc*1.2));status='SURFACE · PIXEL MAP';}
  else if(stg===3){const a=.25+.75*smooth(loc*1.1);halftone(px,py,pw,ph,a,tt);status='LAYERS · '+Math.min(6,1+Math.floor(loc*6))+'/6';}
  else if(stg===4){halftone(px,py,pw,ph,1,tt);status='PLAY · LOOP FECHADO';}
  else if(stg===0||stg===1){txt('AGUARDANDO /VJ',px+pw/2,py+ph/2+6,18,'rgba(255,255,255,.35)',false,'center');
    mx.strokeStyle='rgba(255,255,255,.18)';mx.lineWidth=1;mx.beginPath();mx.moveTo(px+pw/2-30,py+ph/2-40);mx.lineTo(px+pw/2+30,py+ph/2-40);mx.stroke();}
  txt(status,px,py+ph+28,15,'rgba(255,255,255,.75)',true);
  // transporte
  const frame=stg===4?Math.floor((tt-D*4)*30)%450:0;
  txt('FRAME',px,py+ph+64,15,'rgba(255,255,255,.6)');box(px+78,py+ph+44,70,28,false,.6);txt(String(frame),px+88,py+ph+65,15,'#fff');
  txt(String(frame).padStart(4,'0')+'/0450',px+164,py+ph+65,15,'rgba(255,255,255,.6)');
  mx.fillStyle='rgba(255,255,255,.3)';mx.fillRect(px,py+ph+96,pw,3);mx.fillStyle='#fff';mx.fillRect(px+(pw-10)*(frame/450),py+ph+90,10,16);
  // exportar
  const ex=stg===4&&loc>.55;box(px,py+ph+120,150,36,ex,.8);txt('PNG SEQ',px+18,py+ph+144,16,ex?'#000':'#fff',true);
  box(px+164,py+ph+120,110,36,ex,.8);txt('MP4',px+198,py+ph+144,16,ex?'#000':'#fff',true);
  // painel direito: abas
  const act=stg===2?3:(stg===3?0:(stg===4?2:0));
  TABS.forEach((n,i)=>{const tx=838+i*105;box(tx,126,98,56,i===act,.8);txt(n,tx+49,160,13,i===act?'#000':'#fff',true,'center');});
  // camadas
  txt('CAMADAS · MOTOR 0-9 LIGA',838,222,15,'rgba(255,255,255,.7)',true);
  const on=stg===3?Math.min(6,1+Math.floor(loc*6)):(stg===4?6:0);
  LAYERS.forEach((n,i)=>{const ry=240+i*40;const lit=i<on;box(838,ry,430,32,lit,lit?.9:.3);txt('L'+(i+1)+'  '+n,852,ry+22,15,lit?'#000':'rgba(255,255,255,.55)',lit);txt(lit?'ON':'OFF',1240,ry+22,14,lit?'#000':'rgba(255,255,255,.4)',true,'right');});
  // sliders
  txt('PARAMS · L'+Math.max(1,on),838,520,15,'rgba(255,255,255,.7)',true);
  ['CENTRO X','CENTRO Y','ESCALA','VELOCIDADE'].forEach((n,i)=>{const sy=548+i*34;txt(n,838,sy+12,13,'rgba(255,255,255,.6)');
    mx.fillStyle='rgba(255,255,255,.28)';mx.fillRect(950,sy+5,300,3);
    const v=stg>=3?(.5+.45*Math.sin(tt*(1+i*.4)+i)):.5;mx.fillStyle='#fff';mx.fillRect(950+v*290,sy-3,10,18);});
  txt('AI VJ GENERATOR',24,H-14,12,'rgba(255,255,255,.4)');
}

// rótulos (um por estágio)
label('<b>/VJ</b>skill no chat do Claude',V(-5.3,1.85,.3),0,0);
label('<b>BRIEFING</b>superfície · música · conceito',V(-5.3,1.85,.3),1,0);
label('<b>PIXEL MAP</b>lê fachada, canvas e máscara',V(4.4,2.7,0),2,0);
label('<b>BIBLIOTECAS</b>GLSL · ISF · FX · princípios',V(4.4,2.7,0),3,0);
label('<b>MOTOR GRÁFICO</b>preview e export PNG / MP4',V(4.4,2.7,0),4,0);

let az=0,oc=1,om=.35;
loop((t,dt,st)=>{
  const i=st.idx,k=1-Math.exp(-dt*3);
  const tt=t%(D*5);
  drawChat(tt);drawMotor(tt,t);ct.needsUpdate=true;mt.needsUpdate=true;
  oc+=((i<=1?1:.4)-oc)*k;om+=((i<=1?.35:1)-om)*k;
  chatM.material.opacity=oc;chatM.children[0].material.opacity=.9*oc;
  motM.material.opacity=om;motM.children[0].material.opacity=.9*om;
  pl(t);pl.points.material.opacity=i>=1?1:.25;
  az+=((Math.sin(t*.22)*.2+(i>=2?.12:-.1))-az)*k*.6;
  cam.position.set(Math.sin(az)*fit(24),1.2,Math.cos(az)*fit(24));cam.lookAt(-.4,0,0);
});
}
(function(){var h=document.getElementById('vg');if(!h)return;try{VG_scene(VJCore(h,{names:['/VJ','BRIEFING','PIXEL MAP','BIBLIOTECAS','MOTOR GRÁFICO'],tag:'VJ GENERATOR · DO /VJ AO MOTOR',onlyActive:true,shiftX:h.closest('.tool-hero')?0.08:0}));}catch(e){h.remove();}})();
