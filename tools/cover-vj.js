/* OPÇÃO C v3 — STAGE 3D com projeção em grade de quadrados (halftone animado, sem displacement) */
function VJ_stageScene(VJ){
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
}

(function(){var h=document.getElementById('vj');if(!h)return;try{VJ_stageScene(VJCore(h));}catch(e){h.remove();}})();
