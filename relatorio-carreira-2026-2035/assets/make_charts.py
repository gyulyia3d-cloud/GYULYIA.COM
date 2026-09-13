import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np

# Gyulyia design tokens: pure black/white, monospace, uppercase tight tracking
BLACK = "#000000"
WHITE = "#ffffff"
GRAY = "#aeaca8"
GRAY_DIM = "#4a4a48"

plt.rcParams.update({
    "font.family": "monospace",
    "text.color": WHITE,
    "axes.edgecolor": GRAY_DIM,
    "axes.labelcolor": WHITE,
    "xtick.color": GRAY,
    "ytick.color": WHITE,
    "figure.facecolor": BLACK,
    "axes.facecolor": BLACK,
    "savefig.facecolor": BLACK,
})

careers = [
    "01 Motion Design Publicidade", "02 DOOH", "03 Virtual Production",
    "04 Unreal Arch-Viz Cinematico", "05 Technical Artist", "06 Environment Artist",
    "07 Creative Technologist", "08 Audiovisual IA (isolada)", "09 VJ",
    "10 Projection Mapping", "11 Motion p/ Agencias", "12 Dev Web IA",
    "13 SaaS", "14 Cybersecurity", "15 Joias (marca propria)", "16 Mercado Intl Remoto*",
]
cagr_min = [9.8, 4.2, 15.9, 24, 6.6, 6.6, 23.4, 12.8, 5.9, 10.9, 8, 22.5, 11.1, 5.8, 1.8, None]
cagr_max = [12.5, 19.8, 33.1, 42, 12.7, 12.7, 31.4, 36.2, 18.9, 23, 12.5, 38, 30.9, 12.9, 10, None]
# Notas recalibradas ao perfil real: AE basico, Unreal so cinematico (Sequencer/MRQ),
# nao modela, nao texturiza. Career 4 = arch-viz cinematico (sobe), 5/6 fora, 1 cai no curto.
curto  = [5,5,4,5,1,1,5,4,6,5,6,3,2,1,1,4]
medio  = [6,6,7,8,2,3,8,3,4,6,5,3,5,3,4,7]
longo  = [4,6,7,9,3,3,9,3,3,6,4,3,7,4,6,9]

# ---------- Chart 1: CAGR range ----------
idx = [i for i in range(16) if cagr_min[i] is not None]
idx_sorted = sorted(idx, key=lambda i: cagr_max[i], reverse=True)
fig, ax = plt.subplots(figsize=(10, 8))
ys = np.arange(len(idx_sorted))
for row, i in enumerate(idx_sorted):
    ax.plot([cagr_min[i], cagr_max[i]], [row, row], color=WHITE, lw=3, solid_capstyle="round")
    ax.plot(cagr_min[i], row, "o", color=GRAY, ms=5)
    ax.plot(cagr_max[i], row, "o", color=WHITE, ms=5)
ax.set_yticks(ys)
ax.set_yticklabels([careers[i].upper() for i in idx_sorted], fontsize=8)
ax.invert_yaxis()
ax.set_xlabel("CAGR % (faixa min-max entre institutos)")
ax.set_title("CAGR POR CARREIRA — FAIXA ENTRE ESTIMATIVAS DE MERCADO", fontsize=10, loc="left", color=WHITE)
ax.grid(axis="x", color=GRAY_DIM, lw=0.5, alpha=0.4)
for spine in ax.spines.values():
    spine.set_visible(False)
plt.tight_layout()
plt.savefig("cagr_ranges.png", dpi=180)
plt.close()

# ---------- Chart 2: grouped bars curto/medio/longo ----------
order = sorted(range(16), key=lambda i: longo[i], reverse=True)
fig, ax = plt.subplots(figsize=(10, 8))
y = np.arange(16)
h = 0.25
ax.barh(y - h, [curto[i] for i in order], height=h, color=GRAY_DIM, label="Curto prazo")
ax.barh(y, [medio[i] for i in order], height=h, color=GRAY, label="Medio prazo")
ax.barh(y + h, [longo[i] for i in order], height=h, color=WHITE, label="Longo prazo")
ax.set_yticks(y)
ax.set_yticklabels([careers[i].upper() for i in order], fontsize=8)
ax.invert_yaxis()
ax.set_xlim(0, 10)
ax.set_xlabel("Nota (0-10, fit para este perfil)")
ax.set_title("NOTAS POR HORIZONTE DE TEMPO — ORDENADO POR LONGO PRAZO", fontsize=10, loc="left", color=WHITE)
ax.legend(frameon=False, labelcolor=WHITE, fontsize=8, loc="lower right")
ax.grid(axis="x", color=GRAY_DIM, lw=0.5, alpha=0.4)
for spine in ax.spines.values():
    spine.set_visible(False)
plt.tight_layout()
plt.savefig("notas_horizonte.png", dpi=180)
plt.close()

# ---------- Chart 3: quadrant scatter growth x longterm fit ----------
cagr_mid = [(a+b)/2 if a is not None else None for a, b in zip(cagr_min, cagr_max)]
cagr_mid[5] += 1.2  # jitter: Environment Artist overlaps Technical Artist (same proxy data)
fig, ax = plt.subplots(figsize=(9, 8))
for i in range(16):
    if cagr_mid[i] is None:
        continue
    size = 60 + curto[i] * 40
    ax.scatter(cagr_mid[i], longo[i], s=size, facecolor=WHITE if longo[i] >= 7 else GRAY,
               edgecolor=BLACK, linewidth=0.8, alpha=0.9, zorder=3)
    ax.annotate(careers[i][:2], (cagr_mid[i], longo[i]), fontsize=7, color=BLACK if longo[i] >= 7 else BLACK,
                ha="center", va="center", zorder=4)
ax.axhline(6.5, color=GRAY_DIM, lw=0.6, ls="--")
ax.axvline(18, color=GRAY_DIM, lw=0.6, ls="--")
ax.set_xlabel("CAGR medio de mercado (%)")
ax.set_ylabel("Nota de fit — longo prazo (0-10)")
ax.set_title("QUADRANTE: CRESCIMENTO DE MERCADO x FIT DE LONGO PRAZO\n(tamanho do ponto = velocidade de caixa no curto prazo)",
              fontsize=9, loc="left", color=WHITE)
ax.set_ylim(0, 10)
ax.grid(color=GRAY_DIM, lw=0.4, alpha=0.35)
for spine in ax.spines.values():
    spine.set_visible(False)
plt.tight_layout()
plt.savefig("quadrante_crescimento_fit.png", dpi=180)
plt.close()

print("done")
