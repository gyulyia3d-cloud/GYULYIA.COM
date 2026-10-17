/* Cover core — three.js r128 (global THREE). VJCore(hostElement, cfg) -> api. Várias instâncias por página são permitidas. */
function VJCore(host,cfg){
  cfg=cfg||{};
  const NAMES=cfg.names||['CONTEÚDO','RESOLUME · LAYERS','ADVANCED OUTPUT','MAPEAMENTO','SAÍDA · LED / PROJEÇÃO'];
  const D=3.6,N=5;
  const qs=new URLSearchParams(location.search);
  let T=parseFloat(qs.get('t'))||0;const freeze=qs.has('freeze');
  const R=new THREE.WebGLRenderer({antialias:true});
  R.setPixelRatio(Math.min(window.devicePixelRatio||1,2));R.setClearColor(0x000000,1);R.localClippingEnabled=true;
  host.appendChild(R.domElement);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(36,16/9,.1,300);
  const fit=d=>d*Math.max(1,1.7/cam.aspect);
  if(cfg.onlyActive)host.classList.add('only');
  function resize(){const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;R.setSize(w,h);cam.aspect=w/h;if(cfg.shiftX)cam.setViewOffset(w,h,-w*cfg.shiftX,0,w,h);else cam.clearViewOffset();cam.updateProjectionMatrix();}
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


  /* halftone: quadrados fixos, só o tamanho ondula */
  const HVS=`
  attribute float aK;uniform float time,size,px,ph,warp;varying float vW;
  void main(){
    float t=time+ph;
    float a=sin(uv.x*8.+t*1.1)+sin(uv.y*6.-t*.9)+sin((uv.x+uv.y)*5.+t*.6)+sin(length(uv-.5)*12.-t*1.4);
    float w=smoothstep(-1.3,2.3,a);vW=w;
    vec3 p=position;p.xy+=warp*vec2(sin(p.y*1.7+time*1.3),cos(p.x*1.7+time*1.1))*.18;
    vec4 mv=modelViewMatrix*vec4(p,1.);
    gl_PointSize=max(1.,size*w*aK*px/-mv.z);
    gl_Position=projectionMatrix*mv;
  }`;
  const HFS=`uniform float uOp;varying float vW;void main(){if(vW<.07)discard;gl_FragColor=vec4(1.,1.,1.,uOp);}`;
  const hmats=[];
  function hmat(size,o){o=o||{};const m=new THREE.ShaderMaterial({uniforms:{time:{value:0},size:{value:size},px:{value:600},uOp:{value:1},ph:{value:o.ph==null?Math.random()*20:o.ph},warp:{value:0}},vertexShader:HVS,fragmentShader:HFS,transparent:true,depthWrite:false});hmats.push(m);return m;}
  function gridPts(w,h,nx,ny,mat,filter){
    const pos=[],uv=[],kk=[];
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const u=i/(nx-1),v=j/(ny-1),x=(u-.5)*w,y=(v-.5)*h;
      let k=1;if(filter){k=filter(x,y,u,v);if(!k)continue;}
      pos.push(x,y,0);uv.push(u,v);kk.push(k);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('aK',new THREE.Float32BufferAttribute(kk,1));
    const p=new THREE.Points(g,mat);p.frustumCulled=false;return p;}
  function segs(arr,op){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));
    const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:op==null?.5:op}));l.frustumCulled=false;return l;}

  /* labels + hud */
  const labels=[];const wp=new THREE.Vector3();
  function label(html,obj,stageIdx,dy){const el=document.createElement('div');el.className='lbl';el.innerHTML=html;host.appendChild(el);labels.push({el,obj,s:stageIdx,dy:dy||0});return el;}
  const hud=document.createElement('div');hud.className='hud';
  const hudItems=NAMES.map((n,i)=>{const d=document.createElement('div');d.innerHTML='0'+(i+1)+' '+n+'<i></i>';hud.appendChild(d);return d;});host.appendChild(hud);
  ['tl','tr','bl','br'].forEach(c=>{const d=document.createElement('div');d.className='cm '+c;host.appendChild(d);});
  const tag=document.createElement('div');tag.className='tag';tag.textContent=cfg.tag||'WORKFLOW VJ · DO CONTEÚDO À SAÍDA';host.appendChild(tag);

  function stage(){const idx=Math.floor(T/D)%N;return{idx,local:(T%D)/D};}
  let lastIdx=-1;const cbs=[];
  function onStage(cb){cbs.push(cb);}

  const h0=()=>host.clientHeight||innerHeight;
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
      {const px=h0()*Math.min(window.devicePixelRatio||1,2)/(2*Math.tan(cam.fov*Math.PI/360));hmats.forEach(m=>{m.uniforms.time.value=T;m.uniforms.px.value=px;});}
      const w=host.clientWidth,h=host.clientHeight;cam.updateMatrixWorld();
      labels.forEach(l=>{if(l.obj.getWorldPosition)l.obj.getWorldPosition(wp);else wp.copy(l.obj);wp.y+=l.dy;wp.project(cam);
        l.el.style.transform='translate('+((wp.x*.5+.5)*w).toFixed(1)+'px,'+((-wp.y*.5+.5)*h).toFixed(1)+'px) translate(-50%,-110%)';
        l.el.style.visibility=wp.z>1?'hidden':'visible';l.el.classList.toggle('on',l.s===st.idx||l.s<0);});
      R.render(scene,cam);
    })(performance.now());
  }
  return{fit,R,hmat,gridPts,segs,height:()=>host.clientHeight||innerHeight,scene,cam,edges,quad,wire,pulses,tex,label,loop,stage,onStage,beat,smooth,clamp,D,N,NAMES,setLedRes:v=>{ledRes=v;},get t(){return T;}};
}
