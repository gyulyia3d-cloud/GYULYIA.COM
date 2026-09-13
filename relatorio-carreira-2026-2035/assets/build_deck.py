import base64, pathlib
d = pathlib.Path(__file__).parent
tpl = (d/"deck_template.html").read_text()

def b64img(name):
    return "data:image/png;base64," + base64.b64encode((d/name).read_bytes()).decode()

three = (d/"three.min.js").read_text()

out = (tpl
    .replace("__QUADRANTE__", b64img("quadrante_crescimento_fit.png"))
    .replace("__RESISTENCIA__", b64img("resistencia_ia.png"))
    .replace("__ROADMAP__", b64img("roadmap_renda.png"))
    .replace("__THREEJS__", three))

(d/"apresentacao.html").write_text(out)
kb = len((d/"apresentacao.html").read_text().encode())//1024
print(f"apresentacao.html written: {kb} KB")
