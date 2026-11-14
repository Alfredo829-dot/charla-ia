(() => {
const C = window.CH_CONFIG, $ = s => document.querySelector(s);
const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set: (k, v) => localStorage.setItem(k, JSON.stringify(v)) };
const PROHIBIDO = /(sex|porn|desnud|nud[ei]|xxx|er[oó]tic|hentai|onlyfans|fetich|menor de edad|loli|pedof|violaci|nsfw)/i;
let cat = "Todos", actual = null, voz = ls.get("ch_voz", true), escuchando = null;
const propios = () => ls.get("ch_propios", []);
const todos = () => [...CH_BASE, ...propios()];
const buscarP = id => todos().find(p => p.id === id);
const grad = p => `linear-gradient(160deg,${p.colores[0]},${p.colores[1]})`;
const fotoDe = p => p.foto || (CH_BASE.some(b => b.id === p.id) ? `img/${p.id}.jpg` : "");
const avatar = p => fotoDe(p) ? `<img src="${fotoDe(p)}" alt="">` : esc(p.emoji);
const esPlus = () => ls.get("ch_plus", false);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.remove("oculto"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.add("oculto"), 2200); };
const abrir = id => $(id).classList.remove("oculto"), cerrar = id => $(id).classList.add("oculto");

// ---------- inicio ----------
function pintarCats() {
  $("#cats").innerHTML = CH_CATS.concat(propios().length ? ["Míos"] : []).map(c => `<button class="${c === cat ? "on" : ""}">${c}</button>`).join("");
  [...$("#cats").children].forEach(b => b.onclick = () => { cat = b.textContent; pintarCats(); pintar(); });
}
function card(p) {
  const f = fotoDe(p);
  return `<div class="card${f ? " foto" : ""}" data-id="${p.id}" style="background:${f ? `url(${f}),` : ""}${grad(p)}"><span class="tag">${esc(p.fan ? "De fans" : p.cat)}</span>${f ? "" : `<span class="em">${esc(p.emoji)}</span>`}<b>${esc(p.nombre)}</b><p>${esc(p.desc)}</p></div>`;
}
function pintar() {
  const q = $("#q").value.trim().toLowerCase();
  let l = todos().filter(p => (cat === "Todos" || (cat === "Míos" ? p.propio : p.cat === cat)) && (!q || (p.nombre + " " + p.desc + " " + p.cat).toLowerCase().includes(q)));
  $("#tLista").textContent = q ? `Resultados para "${$("#q").value.trim()}"` : cat === "Todos" ? "Descubre" : cat;
  $("#lista").innerHTML = l.map(card).join("") + `<div class="card nueva" id="cNueva"><div><div style="font-size:40px">＋</div><b>${q && !l.length ? "No está. ¡Créalo tú!" : "Crea el tuyo"}</b></div></div>`;
  $("#lista").querySelectorAll(".card[data-id]").forEach(c => c.onclick = () => location.hash = "p=" + c.dataset.id);
  $("#cNueva").onclick = () => abrirCrear(q && !l.length ? $("#q").value.trim() : "");
  const rec = ls.get("ch_rec", []).map(buscarP).filter(Boolean);
  $("#recientes").classList.toggle("oculto", !rec.length);
  $("#lRec").innerHTML = rec.map(p => `<div class="r" data-id="${p.id}"><div class="av" style="background:${grad(p)}">${avatar(p)}</div>${esc(p.nombre)}</div>`).join("");
  $("#lRec").querySelectorAll(".r").forEach(c => c.onclick = () => location.hash = "p=" + c.dataset.id);
}
$("#q").oninput = pintar;

// ---------- chat ----------
const clave = id => "ch_chat_" + id;
function cargar(p) { return ls.get(clave(p.id), { msgs: [{ r: "assistant", t: p.saludo }], resumen: "" }); }
function guardar(p, d) { ls.set(clave(p.id), d); }
function abrirChat(p) {
  actual = p;
  $("#vInicio").classList.add("oculto"); $("#vChat").classList.remove("oculto");
  $("#cAv").style.background = grad(p); $("#cAv").innerHTML = avatar(p); $("#cNom").textContent = p.nombre;
  $("#cSub").textContent = p.fan ? "personaje de fan · IA" : "personaje de IA";
  $("#fan").classList.toggle("oculto", !p.fan);
  $("#mmBorrarP").classList.toggle("oculto", !p.propio);
  const rec = ls.get("ch_rec", []).filter(x => x !== p.id); rec.unshift(p.id); ls.set("ch_rec", rec.slice(0, 12));
  pintarMsgs(); document.title = p.nombre + " · Charla"; window.scrollTo(0, 0);
}
function pintarMsgs() {
  const d = cargar(actual), box = $("#msgs");
  box.innerHTML = d.msgs.map((m, i) => `<div class="m ${m.r === "user" ? "yo" : "ia"}">${esc(m.t)}${m.r === "assistant" ? `<div class="acc"><button data-a="hablar" data-i="${i}">🔊</button>${i === d.msgs.length - 1 && i > 0 ? `<button data-a="otra">↻ Otra</button>` : ""}<button data-a="copiar" data-i="${i}">Copiar</button></div>` : ""}</div>`).join("");
  box.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => {
    const a = b.dataset.a;
    if (a === "hablar") hablar(d.msgs[b.dataset.i].t, true);
    if (a === "copiar") navigator.clipboard?.writeText(d.msgs[b.dataset.i].t).then(() => toast("Copiado"));
    if (a === "otra") { d.msgs.pop(); guardar(actual, d); responder(); }
  });
  box.scrollTop = box.scrollHeight;
}
function sistema(p, d) {
  const yo = ls.get("ch_nombre", "");
  let s = CH_REGLAS + "\n\n" + p.perso;
  if (p.fan) s += `\nEres una interpretación hecha por fans, inspirada en una persona real; NO eres esa persona. Habla de su trayectoria pública conocida en tono positivo, no inventes declaraciones polémicas, noticias, ni datos privados, y si te preguntan, aclara que eres un personaje de IA hecho por fans.`;
  if (yo) s += `\nEl usuario se llama ${yo}.`;
  if (esPlus()) s += `\nModo Plus: puedes dar respuestas más largas, profundas y creativas cuando la plática lo pida, con más personalidad y menos formalidad.`;
  if (esPlus() && ls.get("ch_rom", false)) s += `\nModo romance activado por un usuario adulto: si el usuario lo busca, puedes coquetear, echar piropos, ser romántico, celoso de broma y cariñoso, con tensión y química. Nunca describas actos sexuales, desnudos ni partes íntimas; si te lo piden, lo esquivas con coquetería y cambias de tema.`;
  if (d.resumen) s += `\nLo que recuerdas de pláticas anteriores con este usuario: ${d.resumen}`;
  return s;
}
async function llamarIA(mensajes) {
  if (C.proxyUrl) {
    const r = await fetch(C.proxyUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: mensajes }) });
    if (!r.ok) throw new Error("proxy " + r.status); return (await r.json()).texto;
  }
  const k = ls.get("ch_key", "");
  if (!k) {
    if (!window.puter) throw new Error("sinputer");
    if (!puter.auth.isSignedIn()) throw new Error("sincuenta");
    const r = await puter.ai.chat(mensajes, { model: esPlus() ? C.modeloPlus : C.modeloGratis, temperature: 0.9, max_tokens: esPlus() ? 500 : 260 });
    const c = r?.message?.content;
    const t = Array.isArray(c) ? c.filter(x => x.type === "text").map(x => x.text).join("") : (c ?? String(r));
    if (!t.trim()) throw new Error("vacio"); return t.trim();
  }
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + k },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: mensajes, temperature: 0.9, max_tokens: 260 }) });
  if (!r.ok) throw new Error("groq " + r.status);
  return (await r.json()).choices[0].message.content.trim();
}
function cupo() {
  marcarRacha();
  if (esPlus()) return true;
  const hoy = new Date().toDateString(), c = ls.get("ch_cupo", { d: hoy, n: 0 });
  if (c.d !== hoy) { c.d = hoy; c.n = 0; }
  if (c.n >= C.mensajesGratisDia) return false;
  c.n++; ls.set("ch_cupo", c); return true;
}
async function responder() {
  const p = actual, d = cargar(p), box = $("#msgs");
  const e = document.createElement("div"); e.className = "m ia esc"; e.innerHTML = `${esc(p.nombre)} está escribiendo<i>.</i><i>.</i><i>.</i>`; box.appendChild(e); box.scrollTop = box.scrollHeight;
  try {
    const hist = d.msgs.slice(-20).map(m => ({ role: m.r, content: m.t }));
    const t = await llamarIA([{ role: "system", content: sistema(p, d) }, ...hist]);
    if (actual !== p) return;
    d.msgs.push({ r: "assistant", t }); guardar(p, d); pintarMsgs(); hablar(t);
    if (d.msgs.length % 8 === 0) resumir(p, d);
  } catch (err) {
    e.remove();
    if (err.message === "sincuenta") abrir("#mEntrar");
    else if (err.message === "sinputer") toast("No cargó la IA, revisa tu internet");
    else toast("No pude responder, intenta otra vez");
  }
}
async function resumir(p, d) {
  try {
    const t = await llamarIA([{ role: "system", content: "Resume en máximo 80 palabras lo importante que el usuario ha contado de sí mismo (nombre, gustos, metas, problemas, promesas) para recordarlo después. Solo el resumen." },
      { role: "user", content: (d.resumen ? "Resumen previo: " + d.resumen + "\n\n" : "") + d.msgs.slice(-16).map(m => (m.r === "user" ? "Usuario: " : p.nombre + ": ") + m.t).join("\n") }]);
    const d2 = cargar(p); d2.resumen = t; guardar(p, d2);
  } catch {}
}
$("#fChat").onsubmit = ev => {
  ev.preventDefault(); const t = $("#txt").value.trim(); if (!t || !actual) return;
  if (!cupo()) { abrir("#mPago"); return; }
  const d = cargar(actual); d.msgs.push({ r: "user", t }); guardar(actual, d); $("#txt").value = ""; pintarMsgs(); responder();
};

// ---------- racha / cuenta / plus ----------
function marcarRacha() {
  const hoy = new Date().toDateString(), ayer = new Date(Date.now() - 864e5).toDateString(), r = ls.get("ch_racha", { d: "", n: 0 });
  if (r.d !== hoy) { r.n = r.d === ayer ? r.n + 1 : 1; r.d = hoy; ls.set("ch_racha", r); if (r.n > 1) toast(`🔥 ${r.n} días seguidos platicando`); }
  pintarTop();
}
function pintarTop() {
  const r = ls.get("ch_racha", { d: "", n: 0 }), viva = r.d === new Date().toDateString() || r.d === new Date(Date.now() - 864e5).toDateString();
  $("#racha").textContent = "🔥 " + r.n; $("#racha").classList.toggle("oculto", !viva || r.n < 1);
  $("#plusTag").classList.toggle("oculto", !esPlus());
}
async function entrar() {
  try { await puter.auth.signIn(); toast("Listo, ya puedes platicar"); return true; } catch { toast("No se completó el registro"); return false; }
}
async function pintarCuenta() {
  try { if (window.puter && puter.auth.isSignedIn()) { const u = await puter.auth.getUser(); $("#ajCuenta").textContent = "Entraste como " + (u.username || "usuario"); $("#ajEntrar").textContent = "Salir"; return; } } catch {}
  $("#ajCuenta").textContent = "Sin cuenta"; $("#ajEntrar").textContent = "Entrar con tu correo";
}
$("#ajEntrar").onclick = async () => { if (window.puter && puter.auth.isSignedIn()) puter.auth.signOut(); else await entrar(); pintarCuenta(); };
$("#enNo").onclick = () => cerrar("#mEntrar");
$("#enOk").onclick = async () => { cerrar("#mEntrar"); if (await entrar() && actual) { const d = cargar(actual); if (d.msgs.at(-1)?.r === "user") responder(); } };
const sha = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, "0")).join("");
$("#ajActivar").onclick = async () => {
  const c = $("#ajCod").value.trim().toUpperCase(); if (!c) return;
  if ((C.codigosPlus || []).includes(await sha(c))) { ls.set("ch_plus", true); ls.set("ch_plus_cod", c); toast("¡Charla Plus activado!"); abrirAjustes(); pintarTop(); }
  else toast("Ese código no es válido");
};

// ---------- voz ----------
let voces = [];
const cargarVoces = () => voces = (speechSynthesis?.getVoices() || []).filter(v => /^es/i.test(v.lang));
if ("speechSynthesis" in window) { cargarVoces(); speechSynthesis.onvoiceschanged = cargarVoces; }
function hablar(t, forzar, p = actual) {
  if (!("speechSynthesis" in window) || (!voz && !forzar)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF✏️]/gu, ""));
  const ingles = p?.id === "sam";
  const lista = ingles ? speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)) : voces;
  if (lista.length) u.voice = lista.find(v => /mx|419|us/i.test(v.lang)) || lista[0];
  u.lang = u.voice?.lang || (ingles ? "en-US" : "es-MX");
  u.pitch = p?.voz?.tono ?? 1; u.rate = p?.voz?.vel ?? 1; speechSynthesis.speak(u);
}
const pintarVoz = () => $("#bVoz").classList.toggle("off", !voz);
$("#bVoz").onclick = () => { voz = !voz; ls.set("ch_voz", voz); pintarVoz(); if (!voz) speechSynthesis?.cancel(); toast(voz ? "Te va a hablar en voz alta" : "Voz apagada"); };
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
$("#bMic").onclick = () => {
  if (!SR) return toast("Tu navegador no soporta dictado; prueba con Chrome");
  if (escuchando) { escuchando.stop(); return; }
  const r = new SR(); r.lang = actual?.id === "sam" ? "en-US" : "es-MX"; r.interimResults = true;
  r.onresult = e => $("#txt").value = [...e.results].map(x => x[0].transcript).join("");
  r.onend = () => { escuchando = null; $("#bMic").classList.remove("on"); if ($("#txt").value.trim()) $("#fChat").requestSubmit(); };
  escuchando = r; $("#bMic").classList.add("on"); r.start();
};

// ---------- crear ----------
const COLORES = [["#8b5cf6", "#1e1b4b"], ["#ec4899", "#4c0519"], ["#22c55e", "#052e16"], ["#f59e0b", "#451a03"], ["#06b6d4", "#083344"], ["#ef4444", "#450a0a"], ["#3b82f6", "#172554"]];
$("#crCat").innerHTML = CH_CATS.slice(1).map(c => `<option>${c}</option>`).join("");
function abrirCrear(nombre = "") { $("#crNom").value = nombre; $("#crErr").textContent = ""; abrir("#mCrear"); $("#crNom").focus(); }
$("#bCrear").onclick = () => abrirCrear();
$("#crCancel").onclick = () => cerrar("#mCrear");
$("#crProbar").onclick = () => hablar($("#crSal").value || "Hola, así va a sonar mi voz.", true, { voz: { tono: +$("#crTono").value, vel: +$("#crVel").value } });
$("#crOk").onclick = () => {
  const nombre = $("#crNom").value.trim(), perso = $("#crPerso").value.trim(), desc = $("#crDesc").value.trim();
  const todo = [nombre, perso, desc, $("#crSal").value].join(" ");
  if (!nombre || perso.length < 20) return $("#crErr").textContent = "Ponle nombre y al menos una o dos frases de personalidad.";
  if (PROHIBIDO.test(todo)) return $("#crErr").textContent = "Charla es para todo público: sin contenido sexual ni nada con menores.";
  if (propios().length >= 30) return $("#crErr").textContent = "Llegaste al máximo de 30 personajes propios.";
  const p = { id: "u" + Date.now().toString(36), propio: true, fan: $("#crFan").checked, nombre, emoji: $("#crEmo").value.trim() || "✨", cat: $("#crCat").value,
    desc: desc || "Creado por ti", saludo: $("#crSal").value.trim() || `¡Hola! Soy ${nombre}. ¿De qué platicamos?`, perso: `Eres ${nombre}. ${perso}`,
    colores: COLORES[Math.floor(Math.random() * COLORES.length)], voz: { tono: +$("#crTono").value, vel: +$("#crVel").value } };
  ls.set("ch_propios", [...propios(), p]); cerrar("#mCrear"); ["#crNom", "#crDesc", "#crPerso", "#crSal"].forEach(s => $(s).value = ""); $("#crFan").checked = false;
  location.hash = "p=" + p.id;
};

// ---------- compartir ----------
const b64 = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64 = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));
$("#bCompartir").onclick = async () => {
  const p = actual; let url = location.href.split("#")[0];
  if (p.propio) { const { nombre, emoji, cat, desc, saludo, perso, colores, voz, fan } = p; url += "#c=" + b64({ nombre, emoji, cat, desc, saludo, perso, colores, voz, fan }); }
  else url += "#p=" + p.id;
  try { if (navigator.share) await navigator.share({ title: p.nombre + " en Charla", text: "Platica con " + p.nombre, url }); else { await navigator.clipboard.writeText(url); toast("Link copiado"); } } catch {}
};
function importar(s) {
  try {
    const o = deB64(s); if (!o.nombre || !o.perso || PROHIBIDO.test(o.nombre + o.perso + o.desc)) throw 0;
    const ya = propios().find(p => p.nombre === o.nombre && p.perso === o.perso);
    if (ya) return ya;
    const p = { ...o, id: "u" + Date.now().toString(36), propio: true, nombre: String(o.nombre).slice(0, 40), perso: String(o.perso).slice(0, 1600) };
    ls.set("ch_propios", [...propios(), p]); toast("Personaje agregado a tus chats"); return p;
  } catch { toast("Ese link de personaje no sirve"); return null; }
}

// ---------- más / ajustes / pago ----------
$("#bMas").onclick = () => { $("#mmTit").textContent = actual.nombre; abrir("#mMas"); };
$("#mmCerrar").onclick = () => cerrar("#mMas");
$("#mmReset").onclick = () => { if (confirm("¿Borrar esta plática y lo que recuerda de ti?")) { localStorage.removeItem(clave(actual.id)); pintarMsgs(); cerrar("#mMas"); } };
$("#mmBorrarP").onclick = () => { if (confirm("¿Borrar a " + actual.nombre + "?")) { ls.set("ch_propios", propios().filter(p => p.id !== actual.id)); localStorage.removeItem(clave(actual.id)); cerrar("#mMas"); location.hash = ""; } };
function abrirAjustes() {
  pintarCuenta(); $("#ajRom").checked = ls.get("ch_rom", false); $("#ajRom").disabled = !esPlus(); $("#ajRomWrap").style.opacity = esPlus() ? 1 : .5;
  $("#ajNom").value = ls.get("ch_nombre", ""); $("#ajKey").value = ls.get("ch_key", ""); $("#ajVoz").checked = voz;
  const c = ls.get("ch_cupo", { d: "", n: 0 });
  $("#ajCont").textContent = esPlus() ? "Tienes Charla Plus: mensajes ilimitados y la IA más lista." : `Mensajes gratis hoy: ${c.d === new Date().toDateString() ? c.n : 0} de ${C.mensajesGratisDia}.` + " Con Plus son ilimitados.";
  abrir("#mAjustes");
}
$("#bAjustes").onclick = abrirAjustes;
$("#ajOk").onclick = () => { ls.set("ch_nombre", $("#ajNom").value.trim()); ls.set("ch_key", $("#ajKey").value.trim()); ls.set("ch_rom", esPlus() && $("#ajRom").checked); voz = $("#ajVoz").checked; ls.set("ch_voz", voz); pintarVoz(); cerrar("#mAjustes"); };
$("#ajBorrar").onclick = () => { if (confirm("¿Borrar todos tus chats y personajes?")) { Object.keys(localStorage).filter(k => k.startsWith("ch_chat_") || k === "ch_propios" || k === "ch_rec").forEach(k => localStorage.removeItem(k)); cerrar("#mAjustes"); location.hash = ""; pintar(); } };
$("#pgLink").href = C.linkPago || `https://wa.me/${C.contactoWhatsApp}?text=${encodeURIComponent("Hola, quiero Charla Plus")}`;
$("#pgCerrar").onclick = () => cerrar("#mPago");
document.querySelectorAll(".modal").forEach(m => m.onclick = e => { if (e.target === m) m.classList.add("oculto"); });

// ---------- rutas ----------
$("#bAtras").onclick = () => location.hash = "";
function ruta() {
  const h = location.hash.slice(1);
  if (h.startsWith("c=")) { const p = importar(h.slice(2)); history.replaceState(null, "", p ? "#p=" + p.id : "#"); if (p) return abrirChat(p); }
  const p = h.startsWith("p=") && buscarP(h.slice(2));
  if (p) return abrirChat(p);
  actual = null; speechSynthesis?.cancel(); document.title = "Charla · Platica con personajes de IA";
  $("#vChat").classList.add("oculto"); $("#vInicio").classList.remove("oculto"); pintarCats(); pintar();
}
window.onhashchange = ruta; pintarVoz(); pintarTop(); ruta();
})();
