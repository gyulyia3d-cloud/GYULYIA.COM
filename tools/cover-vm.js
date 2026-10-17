/* VIDEO MAPPING · OPÇÃO C — NOITE NA CIDADE: travelling pela rua até a fachada, feixe do projetor e público */
function VM_city(VJ){
const {scene,cam,edges,label,loop,hmat,gridPts,segs,beat}=VJ;
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
const root=new THREE.Group();scene.add(root);
const floor=new THREE.GridHelper(120,60,0x181818,0x0c0c0c);scene.add(floor);

// quarteirões em wireframe nos dois lados da rua (a rua corre em z, o alvo fica no fundo)
const blocks=[];
for(let side=-1;side<=1;side+=2)for(let k=0;k<9;k++){
  const w=3+rnd()*2.5,h=3+rnd()*9,d=4+rnd()*2;const x=side*(7.5+w/2),z=8-k*8;
  const e=edges(new THREE.BoxGeometry(w,h,d),.35);e.position.set(x,h/2,z);root.add(e);blocks.push(e);
}
// alvo: fachada com torre central, halftone
const FW=13,FH=10;
const target=new THREE.Group();target.position.set(0,0,-62);root.add(target);
const sil=[[-FW/2,0],[-FW/2,FH],[-2.4,FH],[-2.4,FH+3],[2.4,FH+3],[2.4,FH],[FW/2,FH],[FW/2,0],[-FW/2,0]];
const sg=[];for(let i=0;i<sil.length-1;i++)sg.push(sil[i][0],sil[i][1],0,sil[i+1][0],sil[i+1][1],0);
const tOut=segs(sg,.9);target.add(tOut);
const inSil=(x,y)=>y>=0&&y<=FH+(Math.abs(x)<2.4?3:0);
const hm=hmat(.1);
const tp=gridPts(FW,FH+3,150,125,hm,(x,y)=>inSil(x,y+(FH+3)/2)?1:0);tp.position.y=(FH+3)/2;target.add(tp);
// grid de módulos sobre a fachada
const gg=[];for(let x=-FW/2;x<=FW/2+.01;x+=1)gg.push(x,0,.02,x,FH,.02);for(let y=0;y<=FH+.01;y+=1)gg.push(-FW/2,y,.02,FW/2,y,.02);
const tGrid=segs(gg,0);target.add(tGrid);const gBase=Float32Array.from(tGrid.geometry.attributes.position.array);

// público: pontos no chão perto do alvo
const cn=360,cp=new Float32Array(cn*3),cb=[];
for(let i=0;i<cn;i++){const x=(rnd()-.5)*14,z=-40+rnd()*16;cp[i*3]=x;cp[i*3+1]=.06;cp[i*3+2]=z;cb.push(rnd()*6.28);}
const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.BufferAttribute(cp,3));
const crowd=new THREE.Points(cg,new THREE.PointsMaterial({color:0xffffff,size:3,sizeAttenuation:false,transparent:true,opacity:.0}));crowd.frustumCulled=false;root.add(crowd);

// projetor na rua + feixe até a fachada
const PR=V(0,3.2,-14),TG=V(0,FH/2,-62);const prj=edges(new THREE.BoxGeometry(1,.55,.8),.9);prj.position.copy(PR);root.add(prj);
const L=PR.distanceTo(TG);const cgm=new THREE.ConeGeometry(8,L,32,1,true);cgm.translate(0,-L/2,0);cgm.rotateX(-Math.PI/2);
const beam=new THREE.Mesh(cgm,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,depthWrite:false}));beam.position.copy(PR);beam.lookAt(TG);root.add(beam);

// onda de levantamento (drone): anéis expandindo no chão a partir do ponto de scan
const rings=[];for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.98,1,96),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));r.rotation.x=-Math.PI/2;r.position.set(0,.03,-36);root.add(r);rings.push(r);}

label('<b>LEVANTAMENTO</b>scan + medição do entorno',V(0,4,-36),0,0);
label('<b>GRID 1 m</b>módulos da fachada',V(-FW/2-.5,FH,-62),1,0);
label('<b>CONTEÚDO</b>halftone, alto contraste',V(0,FH+3.6,-62),2,0);
label('<b>WARP</b>ajuste fino na fachada',V(FW/2+.5,FH/2,-62),3,0);
label('<b>PROJEÇÃO</b>público a 48 m',V(0,1.4,-34),4,0);

const lerp=(a,b,k)=>a+(b-a)*k;
let cz=22,cx=0,cy=4,uo=0,go=0,wp=0,bo=0,co=0,lz=-30;
const CZ=[22,0,-16,-22,2],CY=[5,4,4,4,7],LZ=[-34,-62,-62,-62,-62];
loop((t,dt,st)=>{
  const i=st.idx,k=1-Math.exp(-dt*1.6);
  cz=lerp(cz,CZ[i],k);cy=lerp(cy,CY[i],k);lz=lerp(lz,LZ[i],k);cx=lerp(cx,Math.sin(t*.25)*(i===4?4:2.5),k);
  cam.position.set(cx,cy,cz);cam.lookAt(0,FH*.35,lz);
  uo=lerp(uo,[0,.08,1,1,1][i],k*1.6);hm.uniforms.uOp.value=uo;
  go=lerp(go,[0,.5,.12,.2,.08][i],k*1.6);tGrid.material.opacity=go;
  wp=lerp(wp,i===3?1:0,k*1.6);hm.uniforms.warp.value=wp*.7;
  const ga=tGrid.geometry.attributes.position.array;
  for(let j=0;j<ga.length;j+=3){const x=gBase[j],y=gBase[j+1];ga[j]=x+wp*.7*Math.sin(y*1.7+t*1.3)*.18;ga[j+1]=y+wp*.7*Math.cos(x*1.7+t*1.1)*.18;}
  tGrid.geometry.attributes.position.needsUpdate=true;
  bo=lerp(bo,i===4?1:0,k*1.6);beam.material.opacity=.05*bo*(.85+beat()*.3);
  co=lerp(co,i===4?1:0,k*1.6);crowd.material.opacity=co;
  for(let j=0;j<cn;j++)cp[j*3+1]=.06+Math.abs(Math.sin(t*2+cb[j]))*.12*co;cg.attributes.position.needsUpdate=true;
  rings.forEach((r,j)=>{const ph=((t*.5+j/3)%1);const s=2+ph*30;r.scale.set(s,s,1);r.material.opacity=(i===0?1:.0)*(1-ph)*.6;});
});
}

(function(){var h=document.getElementById('vm');if(!h)return;try{VM_city(VJCore(h,{names:['LEVANTAMENTO','GRID · MÁSCARA','CONTEÚDO','WARP · MAPEAMENTO','PROJEÇÃO'],onlyActive:true,shiftX:h.closest('.tool-hero')?0.16:0}));}catch(e){h.remove();}})();
