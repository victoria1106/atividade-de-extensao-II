const WHATSAPP_DESTINO = "5516997200699";

const PRODUTOS = [
  {cat:"Doces e salgados", nome:"Venda seus doces e salgados"},
  {cat:"Artesanato",       nome:"Venda seu artesanato"},
  {cat:"Costura",          nome:"Venda suas peças de costura"}
];
const CATEGORIAS = ["Doces e salgados","Artesanato","Costura"];

/* ===== ilustrações em SVG ===== */
const ARTES = {
  bolo:{bg:"#f6c28b", svg:'<svg viewBox="0 0 130 100" aria-hidden="true"><ellipse cx="65" cy="88" rx="62" ry="8" fill="#fbe9d0"/><rect x="26" y="52" width="78" height="36" rx="4" fill="#8a4b2e"/><rect x="26" y="42" width="78" height="12" rx="3" fill="#fbe9d0"/><rect x="33" y="30" width="64" height="14" rx="4" fill="#cf3f24"/><circle cx="65" cy="25" r="7" fill="#cf3f24"/><path d="M65 18c1-8 5-10 8-12" stroke="#4a7a3a" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>'},
  cesta:{bg:"#c0d8cb", svg:'<svg viewBox="0 0 130 100" aria-hidden="true"><path d="M30 44c0-30 22-40 35-40s35 10 35 40" stroke="#7a4a22" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="48" cy="40" r="8" fill="#d6401f"/><circle cx="66" cy="34" r="8" fill="#f1b72b"/><circle cx="84" cy="42" r="8" fill="#2a8f86"/><path d="M14 46h102l-14 48H28z" fill="#c8884a"/><path d="M14 46h102M20 66h90M65 46v48M42 46l4 48M88 46l-4 48" stroke="#7a4a22" stroke-width="3" fill="none"/></svg>'},
  bolsa:{bg:"#f4b5a8", svg:'<svg viewBox="0 0 130 100" aria-hidden="true"><path d="M48 38V26c0-14 10-20 17-20s17 6 17 20v12" stroke="#17324a" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="30" y="36" width="70" height="58" rx="5" fill="#1f7b88"/><g fill="#fbe9d0"><circle cx="48" cy="54" r="4.5"/><circle cx="76" cy="50" r="4.5"/><circle cx="62" cy="68" r="4.5"/><circle cx="88" cy="72" r="4.5"/><circle cx="46" cy="80" r="4.5"/></g></svg>'}
};

/* ===== utilidades ===== */
const norm = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = id => document.getElementById(id);

let categoria = "Todas";
let busca = "";

/* ===== filtros ===== */
const chips = $("chips");
["Todas", ...CATEGORIAS].forEach(c => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "chip"; b.textContent = c;
  b.setAttribute("aria-pressed", c === categoria);
  b.addEventListener("click", () => {
    categoria = c;
    chips.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === b));
    render();
  });
  chips.appendChild(b);
});

$("q").addEventListener("input", e => { busca = norm(e.target.value.trim()); render(); });

/* ===== cards ===== */
function card(p){
  return '<li class="card">' +
    '<div class="art foto"><img src="imagens/card-trabalhe-conosco.svg" alt="Trabalhe conosco! Cadastre seu produto ou serviço."></div>' +
    '<div class="body"><p class="cat">' + esc(p.cat) + '</p><h2>' + esc(p.nome) + '</h2>' +
    '<p class="by">Cadastre-se e apareça na vitrine</p>' +
    '<a class="contact" href="#joinTitle">Se inscrever abaixo</a></div></li>';
}

function render(){
  const lista = PRODUTOS.filter(p =>
    (categoria === "Todas" || p.cat === categoria) &&
    (!busca || norm(p.nome + " " + p.cat).includes(busca))
  );
  $("grid").innerHTML = lista.map(card).join("");
  $("count").textContent = lista.length === 1 ? "1 resultado" : lista.length + " resultados";
  const vazio = $("empty");
  vazio.hidden = lista.length > 0;
  if(!lista.length){
    vazio.innerHTML = "<strong>Nada encontrado.</strong>Tente outra palavra ou escolha a categoria Todas.";
  }
}
render();

/* ===== formulário (validação no navegador; sem envio para servidor) ===== */
const form = $("form");
const sel = form.elements.cat;
sel.innerHTML = '<option value="">Escolha uma categoria</option>' + CATEGORIAS.map(c => '<option>' + esc(c) + '</option>').join("");

function erro(campo, msg){ form.querySelector('[data-for="' + campo + '"]').textContent = msg; return !msg; }

form.addEventListener("submit", e => {
  e.preventDefault();
  const f = form.elements;
  const digitos = f.tel.value.replace(/\D/g, "");
  const ok = [
    erro("nome",    f.nome.value.trim().length < 2 ? "Informe seu nome." : ""),
    erro("produto", f.produto.value.trim().length < 2 ? "Diga o que você oferece." : ""),
    erro("cat",     f.cat.value ? "" : "Escolha uma categoria."),
    erro("tel",     digitos.length < 10 || digitos.length > 11 ? "Digite o WhatsApp com DDD." : "")
  ].every(Boolean);
  if(!ok){ form.querySelector(".err:not(:empty)").closest("label").querySelector("input,select").focus(); return; }
    const texto =
    "Olá! Quero participar da vitrine.\n" +
    "Nome: " + f.nome.value.trim() + "\n" +
    "Oferece: " + f.produto.value.trim() + "\n" +
    "Categoria: " + f.cat.value + "\n" +
    "WhatsApp: " + f.tel.value.trim();
  const url = "https://wa.me/" + WHATSAPP_DESTINO + "?text=" + encodeURIComponent(texto);

  const done = $("done");
  done.innerHTML = "Quase lá, " + esc(f.nome.value.trim().split(" ")[0]) +
    '! Se o WhatsApp não abriu, <a href="' + url + '" target="_blank" rel="noopener">toque aqui para enviar sua inscrição</a>.';
  done.hidden = false;
  form.hidden = true;
  window.open(url, "_blank", "noopener");
});

const barra = $("sticky");
new IntersectionObserver(([e]) => barra.classList.toggle("off", e.isIntersecting))
  .observe(document.querySelector(".join"));

  $("ano").textContent = new Date().getFullYear();