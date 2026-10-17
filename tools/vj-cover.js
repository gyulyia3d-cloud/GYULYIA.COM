/* Capa animada: workflow VJ em three.js (r128 global). Host: #vj. Usado em tools/biblia-vj-operacional.html e na home. */
try{
/* VJ workflow core — three.js r128 (global THREE). Host element: #vj */
const VJ=(()=>{
  const NAMES=['CONTEÚDO','RESOLUME · LAYERS','ADVANCED OUTPUT','MAPEAMENTO','SAÍDA · LED / PROJEÇÃO'];
  const D=3.6,N=5;
  const qs=new URLSearchParams(location.search);
  let T=parseFloat(qs.get('t'))||0;const freeze=qs.has('freeze');
  const host=document.getElementById('vj');
  const R=new THREE.WebGLRenderer({antialias:true});
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.setClearColor(0x000000,1);
  host.appendChild(R.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(36,16/9,.1,300);
  function resize(){const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;R.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();}
  if(window.ResizeObserver)new ResizeObserver(resize).observe(host);addEventListener('resize',resize);resize();

  /* animated "content" canvas = the VJ clip that travels through the chain */
  const cc=document.createElement('canvas');cc.width=512;cc.height=288;const cx=cc.getContext('2d');
  const lc=document.createElement('canvas');lc.width=64;lc.height=36;const lx=lc.getContext('2d');
  const tc=document.createElement('canvas');const tx=tc.getContext('2d');
  let ledRes=64;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
  const beat=()=>Math.pow(Math.max(0,Math.sin(T*Math.PI*4)),6);
  function drawContent(t){
    const b=beat();
    cx.fillStyle='#050505';cx.fillRect(0,0,512,288);
    for(let i=0;i<7;i++){const r=((i*38+t*46)%266);cx.strokeStyle='rgba(255,255,255,'+((1-r/266)*.9).toFixed(3)+')';cx.lineWidth=2;cx.beginPath();cx.arc(256,144,r*(1+b*.12),0,6.2832);cx.stroke();}
    cx.save();cx.globalCompositeOperation='lighter';
    for(let i=-4;i<14;i++){const x=((i*48+t*60)%700)-100;cx.fillStyle='rgba(255,255,255,.11)';cx.beginPath();cx.moveTo(x,0);cx.lineTo(x+22,0);cx.lineTo(x-60,288);cx.lineTo(x-82,288);cx.fill();}
    cx.restore();
    cx.fillStyle='rgba(255,255,255,.55)';cx.fillRect(0,(t*90)%288,512,2);
    const bw=70+Math.sin(t*2)*50+b*40;cx.fillStyle='#fff';cx.fillRect(256-bw/2,141,bw,6);
    cx.font='12px monospace';cx.fillText('VJ / '+String(Math.floor(t*30)%1000).padStart(3,'0'),16,54);
    cx.strokeStyle='#fff';cx.lineWidth=2;cx.strokeRect(1,1,510,286);
    // LED copy, pixelated
    const w=Math.max(2,Math.round(ledRes)),h=Math.max(2,Math.round(ledRes*36/64));
    tc.width=w;tc.height=h;tx.drawImage(cc,0,0,w,h);
    lx.imageSmoothingEnabled=false;lx.clearRect(0,0,64,36);lx.drawImage(tc,0,0,w,h,0,0,64,36);
  }
  const texs=[];
  function tex(nearest){const t=new THREE.CanvasTexture(nearest?lc:cc);t.generateMipmaps=false;t.minFilter=t.magFilter=nearest?THREE.NearestFilter:THREE.LinearFilter;texs.push(t);return t;}

  /* helpers */
  function edges(geo,op){const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo,1),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:op==null?.9:op}));return e;}
  function quad(w,h,u,v,us,vs,o){o=o||{};const g=new THREE.PlaneGeometry(w,h);const uv=g.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,u+uv.getX(i)*us,v+uv.getY(i)*vs);
    const m=new THREE.MeshBasicMaterial({map:o.map,color:0xffffff,transparent:true,opacity:o.opacity==null?1:o.opacity,side:THREE.DoubleSide,depthWrite:false,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending});
    return new THREE.Mesh(g,m);}
  function wire(pts,op){const c=new THREE.CatmullRomCurve3(pts);const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(120)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:op==null?.35:op}));scene.add(l);c.line=l;return c;}
  function pulses(curve,n,speed,size){const g=new THREE.BufferGeometry();const pos=new Float32Array(n*3);g.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const p=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:size||.12,transparent:true,opacity:.95,depthWrite:false}));p.frustumCulled=false;scene.add(p);const v=new THREE.Vector3();
    const f=t=>{for(let i=0;i<n;i++){curve.getPoint((t*speed+i/n)%1,v);pos[i*3]=v.x;pos[i*3+1]=v.y;pos[i*3+2]=v.z;}g.attributes.position.needsUpdate=true;};f.points=p;return f;}

  /* labels + hud */
  const labels=[];const wp=new THREE.Vector3();
  function label(html,obj,stageIdx,dy){const el=document.createElement('div');el.className='lbl';el.innerHTML=html;host.appendChild(el);labels.push({el,obj,s:stageIdx,dy:dy||0});return el;}
  const hud=document.createElement('div');hud.className='hud';
  const hudItems=NAMES.map((n,i)=>{const d=document.createElement('div');d.innerHTML='0'+(i+1)+' '+n+'<i></i>';hud.appendChild(d);return d;});host.appendChild(hud);
  ['tl','tr','bl','br'].forEach(c=>{const d=document.createElement('div');d.className='cm '+c;host.appendChild(d);});
  const tag=document.createElement('div');tag.className='tag';tag.textContent='WORKFLOW VJ · DO CONTEÚDO À SAÍDA';host.appendChild(tag);

  function stage(){const idx=Math.floor(T/D)%N;return{idx,local:(T%D)/D};}
  let lastIdx=-1;const cbs=[];
  function onStage(cb){cbs.push(cb);}

  let vis=true;if(window.IntersectionObserver)new IntersectionObserver(e=>{vis=e[0].isIntersecting;}).observe(host);
  function loop(fn){
    let last=performance.now();
    (function f(now){requestAnimationFrame(f);
      if(!vis){last=now;return;}
      let dt=Math.min((now-last)/1000,.05);last=now;if(freeze)dt=0;T+=dt;
      drawContent(T);texs.forEach(t=>t.needsUpdate=true);
      const st=stage();
      if(st.idx!==lastIdx){lastIdx=st.idx;hudItems.forEach((d,i)=>d.classList.toggle('on',i===st.idx));cbs.forEach(cb=>cb(st.idx));}
      hudItems.forEach((d,i)=>{d.lastChild.style.width=(i===st.idx?st.local*100:0)+'%';});
      fn(T,freeze?10:dt,st);
      const w=host.clientWidth,h=host.clientHeight;cam.updateMatrixWorld();
      labels.forEach(l=>{if(l.obj.getWorldPosition)l.obj.getWorldPosition(wp);else wp.copy(l.obj);wp.y+=l.dy;wp.project(cam);
        l.el.style.transform='translate('+((wp.x*.5+.5)*w).toFixed(1)+'px,'+((-wp.y*.5+.5)*h).toFixed(1)+'px) translate(-50%,-110%)';
        l.el.style.display=wp.z>1?'none':'block';l.el.classList.toggle('on',l.s===st.idx||l.s<0);});
      R.render(scene,cam);
    })(performance.now());
  }
  return{height:()=>host.clientHeight||innerHeight,scene,cam,edges,quad,wire,pulses,tex,label,loop,stage,onStage,beat,smooth,clamp,D,N,NAMES,setLedRes:v=>{ledRes=v;},get t(){return T;}};
})();

/* OPÇÃO C v3 — STAGE 3D com projeção em grade de quadrados (halftone animado, sem displacement) */
(()=>{
const {scene,cam,edges,wire,pulses,tex,label,loop,beat}=VJ;
const map=tex();
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const E=[[],[],[],[],[]],P=[[],[],[],[],[]];
const reg=(s,e)=>{E[s].push(e);return e;};
const box=(w,h,d,x,y,z,s,op)=>{const e=reg(s,edges(new THREE.BoxGeometry(w,h,d),op));e.position.set(x,y,z);scene.add(e);return e;};

/* ── material de pontos: quadrados fixos, só o tamanho ondula (halftone) ── */
const VS=`
uniform float time,size,px,ph;varying float vW;
void main(){
  float t=time+ph;
  float a=sin(uv.x*8.+t*1.1)+sin(uv.y*6.-t*.9)+sin((uv.x+uv.y)*5.+t*.6)+sin(length(uv-.5)*12.-t*1.4);
  float w=smoothstep(-1.3,2.3,a);
  vW=w;
  vec4 mv=modelViewMatrix*vec4(position,1.);
  gl_PointSize=max(1.,size*w*px/-mv.z);
  gl_Position=projectionMatrix*mv;
}`;
const FS=`
uniform float uOp;varying float vW;
void main(){if(vW<.07)discard;gl_FragColor=vec4(1.,1.,1.,uOp);}`;
const mats=[];
function pmat(stage,amp,size){
  const m=new THREE.ShaderMaterial({uniforms:{time:{value:0},size:{value:size},px:{value:600},uOp:{value:1},ph:{value:Math.random()*20}},vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false});
  mats.push(m);P[stage].push(m);return m;
}
/* grade de pontos sobre um plano (w×h) */
function planePts(w,h,nx,ny,mat){
  const n=nx*ny,pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let k=0;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const u=i/(nx-1),v=j/(ny-1);
    pos.set([(u-.5)*w,(v-.5)*h,0],k*3);nor.set([0,0,1],k*3);uv.set([u,v],k*2);k++;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  const p=new THREE.Points(g,mat);p.frustumCulled=false;return p;
}
/* pontos sobre as 6 faces de um cubo */
function boxPts(s,n,mat){
  const faces=[[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
  const pos=[],nor=[],uv=[];
  faces.forEach(f=>{const nv=new THREE.Vector3(...f);const a=Math.abs(f[0])?new THREE.Vector3(0,0,1):new THREE.Vector3(1,0,0);const b=new THREE.Vector3().crossVectors(nv,a);
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const u=i/(n-1),v=j/(n-1);
      const p=nv.clone().multiplyScalar(s/2).addScaledVector(a,(u-.5)*s).addScaledVector(b,(v-.5)*s);
      pos.push(p.x,p.y,p.z);nor.push(f[0],f[1],f[2]);uv.push(u,v);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  const p=new THREE.Points(g,mat);p.frustumCulled=false;return p;
}

const grid=new THREE.GridHelper(90,90,0x1a1a1a,0x0d0d0d);grid.position.y=-.32;scene.add(grid);
const deck=edges(new THREE.BoxGeometry(18,.3,12),.45);deck.position.set(0,-.15,1.5);scene.add(deck);

// 01 laptop do operador: tela em pontos
box(3,.9,1.4,-6,.45,5.8,0);box(1.5,.08,1,-6,.94,5.8,0);
const scr=planePts(1.5,.85,44,25,pmat(0,0,.032));scr.position.set(-6,1.42,5.3);scr.rotation.x=-.3;scene.add(scr);

// 02 servidor de mídia: 3 layers em pontos empilhados
box(1.3,1.7,.9,-1.5,.85,5.5,1);
for(let i=0;i<3;i++){const p=planePts(1.05,.6,30,17,pmat(1,0,.033));p.position.set(-1.5,.85+(i-1)*.14,5.96+i*.05);scene.add(p);}

// 03 advanced output: splitter com 3 fatias em pontos
box(1.2,.5,.7,4.2,.4,4,2);
for(let i=0;i<3;i++){const p=planePts(.36,.5,12,16,pmat(2,0,.03));p.position.set(3.8+i*.4,1.05,4.1);scene.add(p);}

// 04 objetos mapeados: cubos em point cloud
const cubes=[[-2.4,.6,-.4,1.2],[0,1,-1.3,2],[2.5,.5,-.3,1]].map(([x,y,z,s])=>{
  const m=boxPts(s,26,pmat(3,0,s*.036));m.position.set(x,y,z);scene.add(m);
  const e=reg(3,edges(new THREE.BoxGeometry(s,s,s),.55));m.add(e);return m;});
box(1,.55,.8,0,6.2,7,3);box(9,.25,.25,0,6.9,7,3,.5);
const PR=V(0,6.2,7),TG=V(0,1,-1),L=PR.distanceTo(TG);
const cg=new THREE.ConeGeometry(3.4,L,28,1,true);cg.translate(0,-L/2,0);cg.rotateX(-Math.PI/2);
const beam=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.02,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));
const bw=edges(cg,.1);beam.position.copy(PR);bw.position.copy(PR);beam.lookAt(TG);bw.lookAt(TG);scene.add(beam,bw);

// 05 parede de LED: point cloud grande com relevo
const wall=planePts(9.6,5.4,150,84,pmat(4,0,.058));wall.position.set(0,3.4,-4.5);scene.add(wall);
const wallE=reg(4,edges(new THREE.PlaneGeometry(9.6,5.4),.5));wallE.position.copy(wall.position);scene.add(wallE);
box(10,.25,.25,0,6.4,-4.5,4,.4);

// cabos + sinal
const cab=[
 [V(-5.2,.9,5.8),V(-3.6,.15,6.3),V(-2.2,.8,5.6)],
 [V(-.8,.8,5.6),V(1.7,.1,5.3),V(3.5,.5,4.3)],
 [V(4.2,.7,4),V(4.9,3.6,5.5),V(.6,6,7)],
 [V(4.6,.3,3.6),V(4.2,.05,-1),V(3.6,.7,-4.4)]
];
const pls=cab.map(p=>pulses(wire(p,.4),10,.2,.1));

const lbs=[V(-6,1.4,5.8),V(-1.5,1.7,5.5),V(4.2,1.1,4),V(0,3.1,-1.3),V(0,6.3,-4.5)];
VJ.NAMES.forEach((n,i)=>label('<b>0'+(i+1)+'</b>'+n,lbs[i],i,.2));

const F=[V(-6,1.2,5.4),V(-1.5,1.2,5.5),V(4.2,1,4),V(0,1.6,-1),V(0,3.2,-4.5)];
const RD=[13,13,13,15.5,17],HT=[3.2,3.2,3.2,4,4.2],BI=[-.5,0,.5,0,0];
const foc=F[0].clone(),pos=V(0,3,14);let az=0;
const fovK=1/(2*Math.tan(cam.fov*Math.PI/360));
loop((t,dt,st)=>{
  const i=st.idx,k=1-Math.exp(-dt*2.4);
  foc.lerp(F[i],k);az+=((Math.sin(t*.22)*.4+BI[i])-az)*k;
  pos.lerp(V(foc.x+Math.sin(az)*RD[i],foc.y+HT[i],foc.z+Math.cos(az)*RD[i]),k);cam.position.copy(pos);cam.lookAt(foc);
  const px=VJ.height()*Math.min(devicePixelRatio||1,2)*fovK;
  mats.forEach(m=>{m.uniforms.time.value=t;m.uniforms.px.value=px;});
  P.forEach((arr,s)=>arr.forEach(m=>{m.uniforms.uOp.value+=((s===i?1:.3)-m.uniforms.uOp.value)*.12;}));
  E.forEach((arr,s)=>arr.forEach(e=>{e.material.opacity+=((s===i?.9:.25)-e.material.opacity)*.12;}));
  cubes.forEach((m,j)=>{m.rotation.y=Math.sin(t*.5+j)*.35+t*.12;});
  beam.material.opacity=.015+.04*(i>=3?1:0)*(.8+beat()*.4);
  pls.forEach((p,j)=>{p(t);p.points.material.opacity=(i>=j?1:.25);});
});
})();

}catch(e){var v=document.getElementById("vj");if(v)v.remove();}
