(() => {
const C = window.CH_CONFIG, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }, set: (k, v) => localStorage.setItem(k, JSON.stringify(v)) };
const PROHIBIDO = /(sex|porn|desnud|nud[ei]|xxx|er[oó]tic|hentai|onlyfans|fetich|menor de edad|loli|pedof|violaci|nsfw)/i;
let cat = "Todos", actual = null, voz = ls.get("ch_voz", true), escuchando = null, llamada = false, editando = null, fotoNueva = null;
const propios = () => ls.get("ch_propios", []);
const todos = () => [...CH_BASE, ...propios()];
const buscarP = id => todos().find(p => p.id === id);
const grad = p => `linear-gradient(160deg,${p.colores[0]},${p.colores[1]})`;
const CON_FOTO = ["rey","luz","toro","leo","sam","dani","chela","nova","calma","sorjuana","juarez","rojas","goku","vegeta","gojo","levi","luffy","itachi","sparrow","vader","ironman","joker","batman","shrek","gandalf","walter","shelby","homero","rick","chapulin","mario","kratos"];
const fotoDe = p => p.foto || (CON_FOTO.includes(p.id) ? `img/${p.id}.jpg` : "");
const avatar = p => fotoDe(p) ? `<img src="${fotoDe(p)}" alt="" loading="lazy" decoding="async">` : esc(p.emoji);
const esPlus = () => ls.get("ch_plus", false);
const familiar = () => !!ls.get("ch_fam", null);
const romance = () => esPlus() && !familiar() && ls.get("ch_rom", false);
const favs = () => ls.get("ch_fav", []);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.remove("oculto"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.add("oculto"), 2600); };
const abrir = id => $(id).classList.remove("oculto"), cerrar = id => $(id).classList.add("oculto");
const wa = t => C.linkPago && /plus/i.test(t) ? C.linkPago : `https://wa.me/${C.contactoWhatsApp}?text=${encodeURIComponent(t)}`;
const conCuenta = () => { try { return !!(window.puter && puter.auth.isSignedIn()); } catch { return false; } };
function prefs() {
  document.body.classList.toggle("grande", ls.get("ch_letra", false));
  document.body.classList.toggle("claro", ls.get("ch_claro", false));
}

// ---------- inicio ----------
function catsVisibles() {
  let l = CH_CATS.filter(c => !(familiar() && c === "Romance"));
  if (favs().length) l = [l[0], "⭐ Favoritos", ...l.slice(1)];
  if (propios().some(p => p.grupo)) l.push("Grupos");
  if (propios().some(p => !p.grupo)) l.push("Míos");
  return l;
}
function pintarCats() {
  $("#cats").innerHTML = catsVisibles().map(c => `<button class="${c === cat ? "on" : ""}">${c}</button>`).join("");
  [...$("#cats").children].forEach(b => b.onclick = () => { cat = b.textContent; pintarCats(); pintar(); });
}
function card(p) {
  const f = fotoDe(p), fav = favs().includes(p.id);
  const tag = p.grupo ? "Grupo" : p.fan && p.propio ? "De fans" : p.propio ? "Tuyo" : p.cat;
  return `<div class="card${f ? " foto" : ""}" data-id="${p.id}" style="background:${f ? `url(${f}),` : ""}${grad(p)}"><span class="tag">${esc(tag)}</span>${fav ? `<span class="favm">⭐</span>` : ""}${f ? "" : `<span class="em">${esc(p.emoji)}</span>`}<b>${esc(p.nombre)}</b><p>${esc(p.desc)}</p></div>`;
}
function pasaFiltro(p) {
  if (familiar() && p.cat === "Romance") return false;
  if (cat === "Todos") return !p.grupo;
  if (cat === "⭐ Favoritos") return favs().includes(p.id);
  if (cat === "Míos") return p.propio && !p.grupo;
  if (cat === "Grupos") return !!p.grupo;
  return p.cat === cat;
}
function pintar() {
  const q = $("#q").value.trim().toLowerCase();
  let l = todos().filter(p => pasaFiltro(p) && (!q || (p.nombre + " " + p.desc + " " + p.cat).toLowerCase().includes(q)));
  if (cat === "Todos" && !q) l.sort((a, b) => favs().includes(b.id) - favs().includes(a.id));
  $("#tLista").textContent = q ? `Resultados para "${$("#q").value.trim()}"` : cat === "Todos" ? "Descubre" : cat;
  $("#lista").innerHTML = l.map(card).join("") + `<div class="card nueva" id="cNueva"><div><div style="font-size:40px">＋</div><b>${q && !l.length ? "No está. ¡Créalo tú!" : "Crea el tuyo"}</b></div></div>`;
  $("#lista").querySelectorAll(".card[data-id]").forEach(c => c.onclick = () => location.hash = "p=" + c.dataset.id);
  $("#cNueva").onclick = () => abrirCrear(q && !l.length ? $("#q").value.trim() : "");
  const rec = ls.get("ch_rec", []).map(buscarP).filter(Boolean);
  $("#recientes").classList.toggle("oculto", !rec.length);
  $("#lRec").innerHTML = rec.map(p => `<div class="r" data-id="${p.id}"><div class="av" style="background:${grad(p)}">${avatar(p)}</div>${esc(p.nombre)}</div>`).join("");
  $("#lRec").querySelectorAll(".r").forEach(c => c.onclick = () => location.hash = "p=" + c.dataset.id);
  $("#bEntrarTop").classList.toggle("oculto", conCuenta() || !!ls.get("ch_key", ""));
}
$("#q").oninput = pintar;

// ---------- chat ----------
const clave = id => "ch_chat_" + id;
function cargar(p) { return ls.get(clave(p.id), { msgs: [{ r: "assistant", t: p.saludo, de: p.grupo ? p.grupo[0] : undefined }], resumen: "" }); }
function guardar(p, d) { ls.set(clave(p.id), d); }
function abrirChat(p) {
  actual = p;
  $("#vInicio").classList.add("oculto"); $("#vChat").classList.remove("oculto");
  $("#cAv").style.background = grad(p); $("#cAv").innerHTML = avatar(p); $("#cNom").textContent = p.nombre;
  $("#cSub").textContent = p.grupo ? p.grupo.map(buscarP).filter(Boolean).map(x => x.nombre).join(", ") : p.fan ? "personaje de fan · IA" : "personaje de IA";
  $("#fan").classList.toggle("oculto", !p.fan && !(p.grupo || []).some(id => buscarP(id)?.fan));
  $("#mmBorrarP").classList.toggle("oculto", !p.propio);
  $("#mmEditar").classList.toggle("oculto", !p.propio || !!p.grupo);
  $("#bFav").textContent = favs().includes(p.id) ? "⭐" : "☆";
  const rec = ls.get("ch_rec", []).filter(x => x !== p.id); rec.unshift(p.id); ls.set("ch_rec", rec.slice(0, 12));
  pintarMsgs(); document.title = p.nombre + " · Charla"; window.scrollTo(0, 0);
}
function quien(m) { return actual.grupo && m.de ? buscarP(m.de) : null; }
function pintarMsgs() {
  const d = cargar(actual), box = $("#msgs");
  box.innerHTML = d.msgs.map((m, i) => {
    const q = quien(m);
    return `<div class="m ${m.r === "user" ? "yo" : "ia"}">${q ? `<b class="de">${esc(q.nombre)}</b>` : ""}${esc(m.t)}${m.r === "assistant" ? `<div class="acc"><button data-a="hablar" data-i="${i}" title="Escuchar">🔊</button><button data-a="guardar" data-i="${i}" title="Guardar frase">⭐</button><button data-a="imagen" data-i="${i}" title="Compartir como imagen">🖼️</button><button data-a="copiar" data-i="${i}" title="Copiar">📋</button>${i === d.msgs.length - 1 && i > 0 && !actual.grupo ? `<button data-a="otra">↻ Otra</button>` : ""}</div>` : ""}</div>`;
  }).join("");
  box.querySelectorAll("button[data-a]").forEach(b => b.onclick = () => {
    const a = b.dataset.a, m = d.msgs[b.dataset.i], q = m && (quien(m) || actual);
    if (a === "hablar") hablar(m.t, true, q);
    if (a === "copiar") navigator.clipboard?.writeText(m.t).then(() => toast("Copiado"));
    if (a === "guardar") { const g = ls.get("ch_guard", []); g.unshift({ id: q.id, n: q.nombre, t: m.t }); ls.set("ch_guard", g.slice(0, 200)); toast("Frase guardada en Ajustes ⭐"); }
    if (a === "imagen") tarjeta(q, m.t);
    if (a === "otra") { d.msgs.pop(); guardar(actual, d); responder(); }
  });
  const chips = (window.CH_CHIPS || {})[actual.id] || (d.msgs.length < 3 ? ["Cuéntame de ti", "Sorpréndeme", "¿Qué podemos hacer?"] : []);
  $("#chips").innerHTML = chips.map(c => `<button type="button">${esc(c)}</button>`).join("");
  $("#chips").querySelectorAll("button").forEach(b => b.onclick = () => { $("#txt").value = b.textContent; $("#fChat").requestSubmit(); });
  box.scrollTop = box.scrollHeight;
}
function sistema(p, d, grupo) {
  const yo = ls.get("ch_nombre", ""), largo = ls.get("ch_largo", "normal");
  let s = CH_REGLAS + "\n\n" + p.perso;
  if (p.fan && !p.propio) s += `\nEres una interpretación de fan de un personaje ficticio famoso: mantén su personalidad, frases y mundo con fidelidad, siempre adulto y apto para todo público.`;
  else if (p.fan) s += `\nEres una interpretación hecha por fans, inspirada en una persona real; NO eres esa persona. Habla de su trayectoria pública conocida en tono positivo, no inventes declaraciones polémicas, noticias, ni datos privados, y si te preguntan, aclara que eres un personaje de IA hecho por fans.`;
  if (grupo) s += `\nEstás en un chat grupal con el usuario y con ${grupo.filter(x => x.id !== p.id).map(x => x.nombre).join(" y ")}. Responde SOLO como ${p.nombre}, en 1 a 3 frases, sin poner tu nombre al inicio. Puedes reaccionar a lo que dijeron los demás, bromear con ellos o llevarles la contraria según tu personalidad.`;
  if (yo) s += `\nEl usuario se llama ${yo}.`;
  if (largo === "corto") s += `\nResponde muy corto, máximo 2 frases.`;
  if (largo === "largo") s += `\nPuedes extenderte más y dar detalles cuando la plática lo pida.`;
  if (esPlus()) s += `\nModo Plus: puedes dar respuestas más largas, profundas y creativas cuando la plática lo pida, con más personalidad y menos formalidad.`;
  if (familiar()) s += `\nModo familiar: el usuario puede ser menor de edad. Cero coqueteo o romance, lenguaje limpio, sin groserías, y si algo es delicado, sugiere hablar con un adulto de confianza.`;
  else if (romance()) s += `\nModo romance activado por un usuario adulto: si el usuario lo busca, puedes coquetear, echar piropos, ser romántico, celoso de broma y cariñoso, con tensión y química. Nunca describas actos sexuales, desnudos ni partes íntimas; si te lo piden, lo esquivas con coquetería y cambias de tema.`;
  if (d.resumen) s += `\nLo que recuerdas de pláticas anteriores con este usuario: ${d.resumen}`;
  return s;
}
const textoDe = r => { const c = r?.message?.content; return Array.isArray(c) ? c.filter(x => x.type === "text").map(x => x.text).join("") : (c ?? (typeof r === "string" ? r : "")); };
async function invitado(mensajes) {
  const r = await fetch("https://text.pollinations.ai/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "openai", messages: mensajes, temperature: 0.9, max_tokens: 300 }) });
  if (!r.ok) throw new Error("invitado " + r.status);
  return (await r.json()).choices[0].message.content.trim();
}
async function llamarIA(mensajes, alEscribir, interno) {
  if (C.proxyUrl) {
    const r = await fetch(C.proxyUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: mensajes }) });
    if (!r.ok) throw new Error("proxy " + r.status); return (await r.json()).texto;
  }
  const k = ls.get("ch_key", "");
  if (k) {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + k },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: mensajes, temperature: 0.9, max_tokens: esPlus() ? 500 : 300 }) });
    if (!r.ok) throw new Error("groq " + r.status);
    return (await r.json()).choices[0].message.content.trim();
  }
  if (conCuenta()) {
    const op = { model: esPlus() ? C.modeloPlus : C.modeloGratis, temperature: 0.9, max_tokens: esPlus() ? 600 : 300 };
    if (alEscribir) {
      try {
        const st = await puter.ai.chat(mensajes, { ...op, stream: true });
        if (st && st[Symbol.asyncIterator]) { let t = ""; for await (const part of st) { t += part?.text || ""; alEscribir(t); } if (t.trim()) return t.trim(); }
        else { const t = textoDe(st); if (t.trim()) return t.trim(); }
      } catch (e) { if (/auth|sign|401/i.test(String(e?.message || e))) throw new Error("sincuenta"); }
    }
    const t = textoDe(await puter.ai.chat(mensajes, op));
    if (!t.trim()) throw new Error("vacio"); return t.trim();
  }
  const n = ls.get("ch_inv", 0);
  if (interno || n < (C.invitadoGratis ?? 5)) { const t = await invitado(mensajes); if (!interno) ls.set("ch_inv", n + 1); return t; }
  throw new Error("sincuenta");
}
function cupo() {
  marcarRacha();
  if (esPlus()) return true;
  const hoy = new Date().toDateString(), c = ls.get("ch_cupo", { d: hoy, n: 0 });
  if (c.d !== hoy) { c.d = hoy; c.n = 0; }
  if (c.n >= C.mensajesGratisDia) return false;
  c.n++; ls.set("ch_cupo", c); return true;
}
const limpiar = (t, p) => t.replace(new RegExp("^\\s*\\**\\[?" + p.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\]?\\**\\s*:\\s*", "i"), "").trim();
async function unaRespuesta(p, d, grupo, box) {
  const e = document.createElement("div"); e.className = "m ia esc"; e.innerHTML = `${esc(p.nombre)} está escribiendo<i>.</i><i>.</i><i>.</i>`; box.appendChild(e); box.scrollTop = box.scrollHeight;
  const hist = d.msgs.slice(-20).map(m => ({ role: m.r, content: grupo && m.r === "assistant" && m.de ? `[${buscarP(m.de)?.nombre}]: ${m.t}` : m.t }));
  const msgs = [{ role: "system", content: sistema(p, d, grupo) }, ...hist];
  const escribir = t => { e.className = "m ia"; e.textContent = t; box.scrollTop = box.scrollHeight; };
  let ultimo;
  for (let intento = 0; intento < 2; intento++) {
    try { const t = await llamarIA(msgs, escribir); e.remove(); return limpiar(t, p); }
    catch (err) { ultimo = err; if (err.message === "sincuenta") break; await new Promise(r => setTimeout(r, 1500)); }
  }
  e.remove(); throw ultimo;
}
async function responder() {
  const p = actual, d = cargar(p), box = $("#msgs");
  $("#chips").innerHTML = "";
  try {
    if (p.grupo) {
      const miembros = p.grupo.map(buscarP).filter(Boolean);
      const orden = miembros.sort(() => Math.random() - .5).slice(0, Math.random() < .5 ? miembros.length : Math.max(2, miembros.length - 1));
      for (const m of orden) {
        const t = await unaRespuesta(m, d, miembros, box); if (actual !== p) return;
        d.msgs.push({ r: "assistant", t, de: m.id }); guardar(p, d); pintarMsgs(); hablar(t, false, m, true);
      }
    } else {
      const t = await unaRespuesta(p, d, null, box); if (actual !== p) return;
      d.msgs.push({ r: "assistant", t }); guardar(p, d); pintarMsgs(); hablar(t);
    }
    if (d.msgs.length % 8 < (p.grupo ? 3 : 1)) resumir(p, d);
  } catch (err) {
    if (err.message === "sincuenta") { pintarMsgs(); return abrir("#mEntrar"); }
    const e = document.createElement("div"); e.className = "m ia err";
    e.innerHTML = navigator.onLine === false ? "Parece que no tienes internet. " : "Se trabó la conexión con la IA. ";
    const b = document.createElement("button"); b.className = "btn sec mini"; b.textContent = "Reintentar"; b.onclick = () => { e.remove(); responder(); };
    e.appendChild(b); box.appendChild(e); box.scrollTop = box.scrollHeight;
  }
}
async function resumir(p, d) {
  try {
    const t = await llamarIA([{ role: "system", content: "Resume en máximo 80 palabras lo importante que el usuario ha contado de sí mismo (nombre, gustos, metas, problemas, promesas) para recordarlo después. Solo el resumen." },
      { role: "user", content: (d.resumen ? "Resumen previo: " + d.resumen + "\n\n" : "") + d.msgs.slice(-16).map(m => (m.r === "user" ? "Usuario: " : (buscarP(m.de) || p).nombre + ": ") + m.t).join("\n") }], null, true);
    const d2 = cargar(p); d2.resumen = t; guardar(p, d2);
  } catch {}
}
$("#fChat").onsubmit = ev => {
  ev.preventDefault(); const t = $("#txt").value.trim(); if (!t || !actual) return;
  if (!cupo()) { abrir("#mPago"); return; }
  const d = cargar(actual); d.msgs.push({ r: "user", t }); guardar(actual, d); $("#txt").value = ""; pintarMsgs(); responder();
};
$("#bFav").onclick = () => { const f = favs(), i = f.indexOf(actual.id); i < 0 ? f.unshift(actual.id) : f.splice(i, 1); ls.set("ch_fav", f); $("#bFav").textContent = i < 0 ? "⭐" : "☆"; toast(i < 0 ? "Agregado a favoritos" : "Quitado de favoritos"); };

// ---------- tarjeta para compartir ----------
async function tarjeta(p, texto) {
  const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1350; const x = cv.getContext("2d");
  const g = x.createLinearGradient(0, 0, 1080, 1350); g.addColorStop(0, p.colores[0]); g.addColorStop(1, p.colores[1]); x.fillStyle = g; x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = "#0008"; x.fillRect(0, 0, 1080, 1350);
  const f = fotoDe(p);
  if (f) { try { const im = new Image(); im.src = f; await im.decode(); x.save(); x.beginPath(); x.arc(540, 250, 140, 0, 7); x.clip(); x.drawImage(im, 400, 110, 280, 280 * im.height / im.width); x.restore(); } catch {} }
  else { x.font = "180px serif"; x.textAlign = "center"; x.fillText(p.emoji, 540, 320); }
  x.textAlign = "center"; x.fillStyle = "#fff"; x.font = "bold 64px system-ui,sans-serif"; x.fillText(p.nombre, 540, 470);
  x.font = "46px system-ui,sans-serif"; const pal = ("“" + texto.slice(0, 380) + "”").split(" "); let lin = "", y = 590, lineas = [];
  for (const w of pal) { if (x.measureText(lin + w).width > 900) { lineas.push(lin); lin = ""; } lin += w + " "; } lineas.push(lin);
  lineas.slice(0, 11).forEach(l => { x.fillText(l.trim(), 540, y); y += 62; });
  x.font = "bold 40px system-ui,sans-serif"; x.fillStyle = "#fbbf24"; x.fillText("Platica gratis en Charla", 540, 1250);
  x.font = "30px system-ui,sans-serif"; x.fillStyle = "#ffffffaa"; x.fillText(location.host + location.pathname.replace(/index\.html$/, ""), 540, 1300);
  cv.toBlob(async b => {
    const file = new File([b], "charla-" + p.id + ".png", { type: "image/png" });
    try { if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text: "Mira lo que me dijo " + p.nombre + " en Charla " + location.href.split("#")[0] + "#p=" + p.id }); } catch { return; }
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = file.name; a.click(); toast("Imagen descargada");
  }, "image/png");
}

// ---------- racha / cuenta / plus ----------
function marcarRacha() {
  const hoy = new Date().toDateString(), ayer = new Date(Date.now() - 864e5).toDateString(), r = ls.get("ch_racha", { d: "", n: 0 });
  if (r.d !== hoy) { r.n = r.d === ayer ? r.n + 1 : 1; r.d = hoy; ls.set("ch_racha", r); if (r.n > 1) toast(`🔥 ${r.n} días seguidos platicando`); }
  pintarTop();
}
function pintarTop() {
  const r = ls.get("ch_racha", { d: "", n: 0 }), viva = r.d === new Date().toDateString() || r.d === new Date(Date.now() - 864e5).toDateString();
  $("#racha").textContent = "🔥 " + r.n; $("#racha").title = r.n + " días seguidos"; $("#racha").classList.toggle("oculto", !viva || r.n < 1);
  $("#plusTag").classList.toggle("oculto", !esPlus());
}
async function entrar() {
  try { await puter.auth.signIn(); toast("Listo, ya puedes platicar"); pintar(); return true; } catch { toast("No se completó el registro. Intenta otra vez."); return false; }
}
async function pintarCuenta() {
  try { if (conCuenta()) { const u = await puter.auth.getUser(); $("#ajCuenta").textContent = "Entraste como " + (u.username || "usuario"); $("#ajEntrar").textContent = "Salir"; return; } } catch {}
  const quedan = Math.max(0, (C.invitadoGratis ?? 5) - ls.get("ch_inv", 0));
  $("#ajCuenta").textContent = quedan ? `Sin cuenta (te quedan ${quedan} mensajes de prueba)` : "Sin cuenta"; $("#ajEntrar").textContent = "Entrar con tu correo";
}
$("#ajEntrar").onclick = async () => { if (conCuenta()) puter.auth.signOut(); else await entrar(); pintarCuenta(); };
$("#bEntrarTop").onclick = () => abrir("#mEntrar");
$("#enNo").onclick = () => cerrar("#mEntrar");
$("#enOk").onclick = async () => { cerrar("#mEntrar"); if (!window.puter) return toast("No cargó el registro, revisa tu internet"); if (await entrar() && actual) { const d = cargar(actual); if (d.msgs.at(-1)?.r === "user") responder(); } };
const sha = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, "0")).join("");
$("#ajActivar").onclick = async () => {
  const c = $("#ajCod").value.trim().toUpperCase(); if (!c) return;
  if ((C.codigosPlus || []).includes(await sha(c))) { ls.set("ch_plus", true); ls.set("ch_plus_cod", c); toast("¡Charla Plus activado!"); abrirAjustes(); pintarTop(); }
  else toast("Ese código no es válido. Revisa que esté igual que en tu mensaje.");
};

// ---------- voz ----------
let voces = [];
const cargarVoces = () => voces = (speechSynthesis?.getVoices() || []).filter(v => /^es/i.test(v.lang));
if ("speechSynthesis" in window) { cargarVoces(); speechSynthesis.onvoiceschanged = cargarVoces; }
const mejorVoz = l => l.find(v => /natural|neural|online|premium|enhanced/i.test(v.name) && /mx|419|us/i.test(v.lang)) || l.find(v => /natural|neural|online|google/i.test(v.name)) || l.find(v => /mx|419|us/i.test(v.lang)) || l[0];
function hablar(t, forzar, p = actual, enCola) {
  if (!("speechSynthesis" in window) || (!voz && !forzar && !llamada)) { if (llamada) escuchar(); return; }
  if (!enCola) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF✏️*_#]/gu, ""));
  const ingles = p?.id === "sam";
  const lista = ingles ? speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)) : voces;
  if (lista.length) u.voice = mejorVoz(lista);
  u.lang = u.voice?.lang || (ingles ? "en-US" : "es-MX");
  u.pitch = p?.voz?.tono ?? 1; u.rate = (p?.voz?.vel ?? 1) * ls.get("ch_vel", 1);
  u.onend = () => { if (llamada && !speechSynthesis.pending) setTimeout(escuchar, 300); };
  speechSynthesis.speak(u);
}
const pintarVoz = () => $("#bVoz").classList.toggle("off", !voz);
$("#bVoz").onclick = () => { voz = !voz; ls.set("ch_voz", voz); pintarVoz(); if (!voz) speechSynthesis?.cancel(); toast(voz ? "Te va a hablar en voz alta" : "Voz apagada"); };
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function escuchar() {
  if (!SR || escuchando || !actual) return;
  const r = new SR(); r.lang = actual?.id === "sam" ? "en-US" : "es-MX"; r.interimResults = true;
  r.onresult = e => $("#txt").value = [...e.results].map(x => x[0].transcript).join("");
  r.onerror = e => { if (e.error === "not-allowed") { toast("Dale permiso al micrófono en tu navegador"); colgar(); } };
  r.onend = () => { escuchando = null; $("#bMic").classList.remove("on"); $("#llEstado").textContent = "Pensando…"; if ($("#txt").value.trim()) $("#fChat").requestSubmit(); else if (llamada) setTimeout(escuchar, 400); };
  escuchando = r; $("#bMic").classList.add("on"); $("#llEstado").textContent = "Te escucho…";
  try { r.start(); } catch { escuchando = null; }
}
$("#bMic").onclick = () => {
  if (!SR) return toast("Tu navegador no soporta dictado; prueba con Chrome");
  if (escuchando) { escuchando.stop(); return; }
  escuchar();
};
function colgar() { llamada = false; escuchando?.abort?.(); escuchando = null; speechSynthesis?.cancel(); cerrar("#llamada"); }
$("#bLlamar").onclick = () => {
  if (!SR) return toast("La llamada necesita Chrome o un navegador con dictado");
  llamada = true; $("#llNom").textContent = actual.nombre; $("#llAv").style.background = grad(actual); $("#llAv").innerHTML = avatar(actual); abrir("#llamada"); escuchar();
};
$("#llColgar").onclick = colgar;

// ---------- crear / editar ----------
const COLORES = [["#8b5cf6", "#1e1b4b"], ["#ec4899", "#4c0519"], ["#22c55e", "#052e16"], ["#f59e0b", "#451a03"], ["#06b6d4", "#083344"], ["#ef4444", "#450a0a"], ["#3b82f6", "#172554"]];
$("#crCat").innerHTML = CH_CATS.slice(1).map(c => `<option>${c}</option>`).join("");
function abrirCrear(nombre = "", p = null) {
  editando = p; fotoNueva = p?.foto || null;
  $("#crTit").textContent = p ? "Editar personaje" : "Crea tu personaje"; $("#crOk").textContent = p ? "Guardar cambios" : "Crear y platicar";
  $("#crNom").value = p?.nombre || nombre; $("#crEmo").value = p?.emoji || "✨"; $("#crCat").value = p?.cat || "Amigos"; $("#crDesc").value = p?.desc || "";
  $("#crPerso").value = p ? p.perso.replace(new RegExp("^Eres " + p.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\. "), "") : ""; $("#crSal").value = p?.saludo || "";
  $("#crTono").value = p?.voz?.tono ?? 1; $("#crVel").value = p?.voz?.vel ?? 1; $("#crFan").checked = !!p?.fan; $("#crFoto").value = ""; $("#crFotoOk").checked = false;
  $("#crPrev").innerHTML = fotoNueva ? `<img src="${fotoNueva}" alt="">` : ""; $("#crErr").textContent = ""; abrir("#mCrear"); $("#crNom").focus();
}
$("#bCrear").onclick = () => abrirCrear();
$("#crCancel").onclick = () => cerrar("#mCrear");
$("#crProbar").onclick = () => hablar($("#crSal").value || "Hola, así va a sonar mi voz.", true, { voz: { tono: +$("#crTono").value, vel: +$("#crVel").value } });
$("#crFoto").onchange = async () => {
  const f = $("#crFoto").files[0]; if (!f) return;
  try {
    const im = new Image(); im.src = URL.createObjectURL(f); await im.decode();
    const cv = document.createElement("canvas"); cv.width = 360; cv.height = 480; const x = cv.getContext("2d");
    const s = Math.max(360 / im.width, 480 / im.height); x.drawImage(im, (360 - im.width * s) / 2, (480 - im.height * s) / 2, im.width * s, im.height * s);
    fotoNueva = cv.toDataURL("image/jpeg", 0.75); $("#crPrev").innerHTML = `<img src="${fotoNueva}" alt="">`;
  } catch { toast("No pude leer esa imagen"); }
};
$("#crQuitarFoto").onclick = () => { fotoNueva = null; $("#crFoto").value = ""; $("#crPrev").innerHTML = ""; };
$("#crOk").onclick = () => {
  const nombre = $("#crNom").value.trim(), perso = $("#crPerso").value.trim(), desc = $("#crDesc").value.trim();
  const todo = [nombre, perso, desc, $("#crSal").value].join(" ");
  if (!nombre || perso.length < 20) return $("#crErr").textContent = "Ponle nombre y al menos una o dos frases de personalidad.";
  if (PROHIBIDO.test(todo)) return $("#crErr").textContent = "Charla es para todo público: sin contenido sexual ni nada con menores.";
  if (fotoNueva && fotoNueva !== editando?.foto && !$("#crFotoOk").checked) return $("#crErr").textContent = "Confirma que la imagen es un dibujo o imagen de IA y no la foto de una persona real.";
  const tope = esPlus() ? 50 : 10;
  if (!editando && propios().filter(p => !p.grupo).length >= tope) return $("#crErr").textContent = esPlus() ? "Llegaste al máximo de 50 personajes." : "En gratis puedes tener 10 personajes; con Plus, hasta 50.";
  const datos = { fan: $("#crFan").checked, nombre, emoji: $("#crEmo").value.trim() || "✨", cat: $("#crCat").value, foto: fotoNueva || undefined,
    desc: desc || "Creado por ti", saludo: $("#crSal").value.trim() || `¡Hola! Soy ${nombre}. ¿De qué platicamos?`, perso: `Eres ${nombre}. ${perso}`, voz: { tono: +$("#crTono").value, vel: +$("#crVel").value } };
  let p;
  try {
    if (editando) { p = { ...editando, ...datos }; ls.set("ch_propios", propios().map(x => x.id === p.id ? p : x)); }
    else { p = { id: "u" + Date.now().toString(36), propio: true, colores: COLORES[Math.floor(Math.random() * COLORES.length)], ...datos }; ls.set("ch_propios", [...propios(), p]); }
  } catch { return $("#crErr").textContent = "Ya no cabe en tu teléfono; prueba sin imagen o borra personajes viejos."; }
  cerrar("#mCrear");
  if (editando) { abrirChat(p); toast("Cambios guardados"); } else location.hash = "p=" + p.id;
};

// ---------- grupos ----------
$("#bGrupo").onclick = () => {
  $("#grLista").innerHTML = todos().filter(p => !p.grupo && !(familiar() && p.cat === "Romance")).map(p => `<label class="chk"><input type="checkbox" value="${p.id}"> ${esc(p.emoji)} ${esc(p.nombre)}</label>`).join("");
  $("#grErr").textContent = ""; $("#grNom").value = ""; abrir("#mGrupo");
};
$("#grCancel").onclick = () => cerrar("#mGrupo");
$("#grOk").onclick = () => {
  const ids = $$("#grLista input:checked").map(i => i.value);
  if (ids.length < 2 || ids.length > 3) return $("#grErr").textContent = "Escoge 2 o 3 personajes.";
  const m = ids.map(buscarP), nombre = $("#grNom").value.trim() || m.map(x => x.nombre.split(" ")[0]).join(", ");
  const p = { id: "g" + Date.now().toString(36), propio: true, grupo: ids, nombre, emoji: "👥", cat: "Grupos", colores: m[0].colores, desc: m.map(x => x.nombre).join(", "), saludo: m[0].saludo, perso: "" };
  ls.set("ch_propios", [...propios(), p]); cerrar("#mGrupo"); location.hash = "p=" + p.id;
};

// ---------- compartir ----------
const b64 = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64 = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));
$("#bCompartir").onclick = async () => {
  const p = actual; let url = location.href.split("#")[0];
  if (p.propio && !p.grupo) { const { nombre, emoji, cat, desc, saludo, perso, colores, voz, fan } = p; url += "#c=" + b64({ nombre, emoji, cat, desc, saludo, perso, colores, voz, fan }); }
  else if (!p.grupo) url += "#p=" + p.id;
  const texto = p.grupo ? "Estoy en un chat grupal con " + p.desc + " en Charla. Pruébalo:" : "Platica con " + p.nombre + " en Charla:";
  try { if (navigator.share) await navigator.share({ title: p.nombre + " en Charla", text: texto, url }); else { await navigator.clipboard.writeText(texto + " " + url); toast("Link copiado"); } } catch {}
};
function importar(s) {
  try {
    const o = deB64(s); if (!o.nombre || !o.perso || PROHIBIDO.test(o.nombre + o.perso + o.desc)) throw 0;
    const ya = propios().find(p => p.nombre === o.nombre && p.perso === o.perso);
    if (ya) return ya;
    const p = { ...o, id: "u" + Date.now().toString(36), propio: true, nombre: String(o.nombre).slice(0, 40), perso: String(o.perso).slice(0, 1600) };
    delete p.foto; delete p.grupo;
    ls.set("ch_propios", [...propios(), p]); toast("Personaje agregado a tus chats"); return p;
  } catch { toast("Ese link de personaje no sirve"); return null; }
}

// ---------- más ----------
$("#bMas").onclick = () => { $("#mmTit").textContent = actual.nombre; $("#mmMem").value = cargar(actual).resumen || ""; abrir("#mMas"); };
$("#mmCerrar").onclick = () => cerrar("#mMas");
$("#mmMemOk").onclick = () => { const d = cargar(actual); d.resumen = $("#mmMem").value.trim().slice(0, 800); guardar(actual, d); toast("Listo, eso es lo que recordará"); };
$("#mmEditar").onclick = () => { cerrar("#mMas"); abrirCrear("", actual); };
$("#mmReset").onclick = () => { if (confirm("¿Borrar esta plática y lo que recuerda de ti?")) { localStorage.removeItem(clave(actual.id)); pintarMsgs(); cerrar("#mMas"); } };
$("#mmBorrarP").onclick = () => { if (confirm("¿Borrar a " + actual.nombre + "?")) { ls.set("ch_propios", propios().filter(p => p.id !== actual.id)); localStorage.removeItem(clave(actual.id)); cerrar("#mMas"); location.hash = ""; } };
$("#mmReportar").onclick = () => {
  const ult = cargar(actual).msgs.filter(m => m.r === "assistant").at(-1)?.t || "";
  window.open(wa(`Reporte de Charla\nPersonaje: ${actual.nombre} (${actual.id})\nMotivo: \nÚltimo mensaje: ${ult.slice(0, 300)}`), "_blank");
};

// ---------- ajustes ----------
function abrirAjustes() {
  pintarCuenta();
  $("#ajRom").checked = romance(); $("#ajRom").disabled = !esPlus() || familiar(); $("#ajRomWrap").style.opacity = esPlus() && !familiar() ? 1 : .5;
  $("#ajNom").value = ls.get("ch_nombre", ""); $("#ajKey").value = ls.get("ch_key", ""); $("#ajVoz").checked = voz;
  $("#ajLetra").checked = ls.get("ch_letra", false); $("#ajClaro").checked = ls.get("ch_claro", false); $("#ajFam").checked = familiar();
  $("#ajLargo").value = ls.get("ch_largo", "normal"); $("#ajVel").value = ls.get("ch_vel", 1);
  $("#ajGuardN").textContent = ls.get("ch_guard", []).length;
  const c = ls.get("ch_cupo", { d: "", n: 0 });
  $("#ajCont").textContent = esPlus() ? "Tienes Charla Plus: mensajes ilimitados y la IA más lista." : `Mensajes gratis hoy: ${c.d === new Date().toDateString() ? c.n : 0} de ${C.mensajesGratisDia}. Con Plus son ilimitados.`;
  abrir("#mAjustes");
}
$("#bAjustes").onclick = abrirAjustes;
$("#ajRom").onchange = () => {
  if (!$("#ajRom").checked) return;
  const a = +prompt("Para el modo romance confirma tu año de nacimiento (ej. 1998):");
  if (!a || new Date().getFullYear() - a < 18 || a < 1900) { $("#ajRom").checked = false; toast("El modo romance es solo para mayores de 18"); }
};
$("#ajFam").onchange = () => {
  if ($("#ajFam").checked) {
    const pin = prompt("Pon un PIN de 4 números para que nadie quite el modo familiar:");
    if (!/^\d{4}$/.test(pin || "")) { $("#ajFam").checked = false; return toast("El PIN debe ser de 4 números"); }
    ls.set("ch_fam", { pin }); ls.set("ch_rom", false); toast("Modo familiar activado");
  } else {
    if (prompt("Escribe el PIN del modo familiar:") !== ls.get("ch_fam", {}).pin) { $("#ajFam").checked = true; return toast("PIN incorrecto"); }
    localStorage.removeItem("ch_fam"); toast("Modo familiar desactivado");
  }
  abrirAjustes();
};
$("#ajOk").onclick = () => {
  ls.set("ch_nombre", $("#ajNom").value.trim()); ls.set("ch_key", $("#ajKey").value.trim()); ls.set("ch_rom", esPlus() && !familiar() && $("#ajRom").checked);
  voz = $("#ajVoz").checked; ls.set("ch_voz", voz); ls.set("ch_letra", $("#ajLetra").checked); ls.set("ch_claro", $("#ajClaro").checked);
  ls.set("ch_largo", $("#ajLargo").value); ls.set("ch_vel", +$("#ajVel").value);
  prefs(); pintarVoz(); cerrar("#mAjustes"); if (!actual) { pintarCats(); pintar(); }
};
$("#ajBorrar").onclick = () => { if (confirm("¿Borrar todos tus chats y personajes?")) { Object.keys(localStorage).filter(k => k.startsWith("ch_chat_") || ["ch_propios", "ch_rec", "ch_fav", "ch_guard"].includes(k)).forEach(k => localStorage.removeItem(k)); cerrar("#mAjustes"); location.hash = ""; pintar(); } };
$("#ajExport").onclick = () => {
  const o = {}; Object.keys(localStorage).filter(k => k.startsWith("ch_") && !["ch_plus", "ch_plus_cod", "ch_key", "ch_fam", "ch_inv", "ch_cupo"].includes(k)).forEach(k => o[k] = localStorage.getItem(k));
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify({ charla: 1, fecha: new Date().toISOString(), datos: o })], { type: "application/json" }));
  a.download = "charla-respaldo-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); toast("Respaldo descargado");
};
$("#ajImport").onclick = () => $("#ajImportF").click();
$("#ajImportF").onchange = async () => {
  try { const o = JSON.parse(await $("#ajImportF").files[0].text()); if (!o.charla) throw 0;
    Object.entries(o.datos).forEach(([k, v]) => { if (k.startsWith("ch_") && !["ch_plus", "ch_plus_cod", "ch_fam"].includes(k)) localStorage.setItem(k, v); });
    toast("Respaldo cargado"); cerrar("#mAjustes"); location.hash = ""; ruta();
  } catch { toast("Ese archivo no es un respaldo de Charla"); }
};
$("#ajGuard").onclick = () => {
  const g = ls.get("ch_guard", []);
  $("#guLista").innerHTML = g.length ? g.map((x, i) => `<div class="gu"><b>${esc(x.n)}</b><p>${esc(x.t)}</p><div class="acc"><button data-i="${i}" data-a="img">🖼️</button><button data-i="${i}" data-a="del">🗑️</button></div></div>`).join("") : `<p class="nota">Aún no guardas frases. Toca ⭐ en cualquier respuesta.</p>`;
  $("#guLista").querySelectorAll("button").forEach(b => b.onclick = () => { const x = g[b.dataset.i]; if (b.dataset.a === "img") tarjeta(buscarP(x.id) || { ...CH_BASE[0], nombre: x.n, id: x.id }, x.t); else { g.splice(b.dataset.i, 1); ls.set("ch_guard", g); $("#ajGuard").onclick(); } });
  abrir("#mGuard");
};
$("#guCerrar").onclick = () => cerrar("#mGuard");
$$(".plusLink").forEach(e => e.href = wa("Hola, quiero Charla Plus"));
$$(".precioPlus").forEach(e => e.textContent = C.precioPlus || "");
$("#pgLink").href = wa("Hola, quiero Charla Plus");
$("#pgCerrar").onclick = () => cerrar("#mPago");
$("#lnkReporte").href = wa("Hola, quiero reportar algo en Charla:");
$$(".modal").forEach(m => m.onclick = e => { if (e.target === m) m.classList.add("oculto"); });

// ---------- rutas ----------
$("#bAtras").onclick = () => location.hash = "";
function ruta() {
  const h = location.hash.slice(1);
  if (h.startsWith("c=")) { const p = importar(h.slice(2)); history.replaceState(null, "", p ? "#p=" + p.id : "#"); if (p) return abrirChat(p); }
  const p = h.startsWith("p=") && buscarP(h.slice(2));
  if (p && !(familiar() && p.cat === "Romance")) return abrirChat(p);
  if (llamada) colgar();
  actual = null; speechSynthesis?.cancel(); document.title = "Charla · Platica con personajes de IA";
  $("#vChat").classList.add("oculto"); $("#vInicio").classList.remove("oculto"); pintarCats(); pintar();
}
window.onhashchange = ruta; prefs(); pintarVoz(); pintarTop(); ruta();
setTimeout(() => { if (!actual) pintar(); }, 2500);
})();
