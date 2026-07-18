import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

BLACK="#000000"; WHITE="#ffffff"; GRAY="#aeaca8"; GRAY_DIM="#4a4a48"
plt.rcParams.update({
    "font.family":"monospace","text.color":WHITE,"axes.edgecolor":GRAY_DIM,
    "axes.labelcolor":WHITE,"xtick.color":GRAY,"ytick.color":WHITE,
    "figure.facecolor":BLACK,"axes.facecolor":BLACK,"savefig.facecolor":BLACK,
})

# ---------- Roadmap: renda R$/mes por estrategia ----------
years=[1,3,5,10]
conserv=[6,10,16,22]
balanc =[6,10,20,38]
ambic  =[6,11,40,65]
fig,ax=plt.subplots(figsize=(11,6.2))
ax.plot(years,conserv,"-o",color=GRAY_DIM,lw=2.5,ms=7,label="CONSERVADORA")
ax.plot(years,balanc,"-o",color=GRAY,lw=2.5,ms=7,label="BALANCEADA (recomendada)")
ax.plot(years,ambic,"-o",color=WHITE,lw=2.5,ms=8,label="AMBICIOSA")
for x,y in zip(years,ambic): ax.annotate(f"R${y}k",(x,y),textcoords="offset points",xytext=(0,10),fontsize=8,color=WHITE,ha="center")
for x,y in zip(years,balanc): ax.annotate(f"R${y}k",(x,y),textcoords="offset points",xytext=(0,-16),fontsize=8,color=GRAY,ha="center")
ax.axhline(8,color=GRAY_DIM,lw=0.8,ls="--")
ax.annotate("META INICIAL R$8k",(1,8),textcoords="offset points",xytext=(6,6),fontsize=8,color=GRAY_DIM)
ax.set_xticks(years); ax.set_xticklabels([f"ANO {y}" for y in years],fontsize=9)
ax.set_ylabel("RENDA ALVO (R$ mil/mes)")
ax.set_title("TRAJETORIA DE RENDA POR ESTRATEGIA — metas ilustrativas",fontsize=11,loc="left")
ax.legend(frameon=False,labelcolor=WHITE,fontsize=8,loc="upper left")
ax.grid(color=GRAY_DIM,lw=0.4,alpha=0.35)
for s in ax.spines.values(): s.set_visible(False)
plt.tight_layout(); plt.savefig("roadmap_renda.png",dpi=170); plt.close()

# ---------- Resistencia a automacao por IA (score 0-10) ----------
labels=["Joias (produto fisico)","Unreal Arch-Viz","Virtual Production","Creative Technologist",
        "Projection Mapping","DOOH","VJ","SaaS (nicho)","Mercado Intl (neutro)","Environment Artist",
        "Technical Artist","Cybersecurity (Tier1)","Motion p/ Agencias","Motion Design","Audiovisual IA iso","Dev Web IA"]
score=[9.0,8.5,8.5,8.0,7.5,7.0,6.5,5.0,5.5,5.0,4.5,4.0,3.5,3.0,2.5,1.5]
order=np.argsort(score)
labels=[labels[i] for i in order]; score=[score[i] for i in order]
fig,ax=plt.subplots(figsize=(11,7.5))
colors=[WHITE if s>=7 else (GRAY if s>=4.5 else GRAY_DIM) for s in score]
ax.barh(range(len(score)),score,color=colors,height=0.62)
ax.set_yticks(range(len(score))); ax.set_yticklabels([l.upper() for l in labels],fontsize=8)
ax.set_xlim(0,10); ax.set_xlabel("RESISTENCIA A AUTOMACAO POR IA  (0 = mais exposto  ·  10 = mais resistente)")
ax.set_title("RANKING DE RESISTENCIA A IA — perfil recalibrado",fontsize=11,loc="left")
for i,s in enumerate(score): ax.annotate(f"{s:.1f}",(s,i),textcoords="offset points",xytext=(5,-3),fontsize=7,color=GRAY)
ax.grid(axis="x",color=GRAY_DIM,lw=0.4,alpha=0.35)
for sp in ax.spines.values(): sp.set_visible(False)
plt.tight_layout(); plt.savefig("resistencia_ia.png",dpi=170); plt.close()

print("done")
