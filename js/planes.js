/* =========================================================
   HOBBYMATCH · Planes de los próximos 5 días (pantalla de Inicio)
   1. Planes a los que me apunto (localStorage)
   2. Fechas: "Hoy", "Mañana", "MIÉ 4"...
   3. Cartelera: carteles grandes con los planes de mis aficiones
   4. Tus planes: los planes a los que ya voy
   Usa funciones de app.js ($, leer, guardar, emoticono...) y social.js (misCategorias, buscarPersona).
   ========================================================= */


/* ---------- 1. PLANES A LOS QUE ME APUNTO ----------
   Guardamos solo la lista de ids de los planes: ["pl1", "pl5"] */
const CLAVE_PLANES = "hobbymatch-planes";

function leerMisPlanes() {
  const datos = leer(CLAVE_PLANES, []);
  return Array.isArray(datos) ? datos : [];
}

let misPlanes = leerMisPlanes();

function voyAlPlan(plan) {
  return misPlanes.includes(plan.id);
}

// Apuntarse o desapuntarse (el mismo botón hace las dos cosas)
function cambiarApuntado(plan) {
  if (voyAlPlan(plan)) {
    misPlanes = misPlanes.filter((id) => id !== plan.id);
    if (guardar(CLAVE_PLANES, misPlanes)) mostrarAviso("Te has desapuntado");
  } else {
    if (plazasLibres(plan) === 0) return;
    misPlanes.push(plan.id);
    if (guardar(CLAVE_PLANES, misPlanes)) mostrarAviso(`¡Te has apuntado a ${plan.nombre}!`);
  }
  pintarPlanes();
  comprobarNivelMascota(); // mascotas.js: si sube de nivel, sale la celebración
}

// Plazas que quedan contando a la gente de ejemplo y a ti
function plazasLibres(plan) {
  return plan.plazas - plan.apuntados.length - (voyAlPlan(plan) ? 1 : 0);
}


/* ---------- 2. FECHAS ----------
   "dia" es cuántos días faltan (0 = hoy). Con Date calculamos el día real. */
const DIAS_CORTOS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function fechaDelPlan(plan) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + plan.dia);
  return fecha;
}

// Para la etiqueta del cartel: { arriba: "HOY", numero: 2 }
function etiquetaFecha(plan) {
  const fecha = fechaDelPlan(plan);
  const arriba = plan.dia === 0 ? "HOY" : plan.dia === 1 ? "MAÑANA" : DIAS_CORTOS[fecha.getDay()];
  return { arriba, numero: fecha.getDate() };
}

// Para textos: "Hoy", "Mañana" o "Jueves 5"
function cuandoEs(plan) {
  if (plan.dia === 0) return "Hoy";
  if (plan.dia === 1) return "Mañana";
  const fecha = fechaDelPlan(plan);
  const nombre = DIAS_LARGOS[fecha.getDay()];
  return nombre.charAt(0).toUpperCase() + nombre.slice(1) + " " + fecha.getDate();
}

// Ordenados por día y luego por hora ("09:00" < "19:30" también funciona como texto)
function ordenarPlanes(lista) {
  return [...lista].sort((a, b) => a.dia - b.dia || a.hora.localeCompare(b.hora));
}


/* ---------- 3. CARTELERA ---------- */

// Planes que encajan contigo: los de tus categorías. Si no hay ninguno, todos.
function planesParaMi() {
  const categorias = misCategorias();
  const mios = PLANES_EJEMPLO.filter((p) => categorias.has(p.categoria));
  return ordenarPlanes(mios.length > 0 ? mios : PLANES_EJEMPLO);
}

// Fila de avatares pequeños con la gente que va
function crearApuntados(plan) {
  const fila = document.createElement("span");
  fila.className = "apuntados";
  plan.apuntados.slice(0, 3).map(buscarPersona).filter(Boolean).forEach((persona) => {
    const avatar = document.createElement("span");
    avatar.className = "avatar apuntados__avatar";
    pintarAvatar(avatar, persona.nombre, null, colorPersona(persona));
    fila.append(avatar);
  });
  return fila;
}

function crearCartel(plan) {
  const li = document.createElement("li");
  li.className = "cartel";
  pintarColorCategoria(li, plan.categoria);

  // Foto de la categoría debajo de una capa de su color (si existe la foto)
  const foto = FOTOS_CATEGORIAS[emoticonoCategoria(plan.categoria)];
  if (foto) {
    li.classList.add("cartel--foto");
    // Se pone directamente en el elemento para que la ruta sea relativa a index.html
    li.style.backgroundImage = `url("${foto}")`;
  }

  // Arriba: la fecha en una "entrada" blanca y el emoticono de la categoría
  const cabecera = document.createElement("div");
  cabecera.className = "cartel__cabecera";
  const fecha = document.createElement("span");
  fecha.className = "cartel__fecha";
  const { arriba, numero } = etiquetaFecha(plan);
  const dia = document.createElement("small");
  dia.textContent = arriba;
  const num = document.createElement("strong");
  num.textContent = numero;
  fecha.append(dia, num);
  cabecera.append(fecha, emoticono(emoticonoCategoria(plan.categoria), "cartel__emoticono"));

  const nombre = document.createElement("h4");
  nombre.className = "cartel__nombre";
  nombre.textContent = plan.nombre;

  const meta = document.createElement("p");
  meta.className = "cartel__meta";
  meta.textContent = `${plan.hora} · ${plan.lugar}`;

  const gente = document.createElement("p");
  gente.className = "cartel__gente";
  const libres = plazasLibres(plan);
  const textoPlazas = document.createElement("span");
  textoPlazas.textContent = libres === 0 ? "Completo" : plural(libres, "plaza libre", "plazas libres");
  gente.append(crearApuntados(plan), textoPlazas);

  const boton = document.createElement("button");
  boton.type = "button";
  const voy = voyAlPlan(plan);
  boton.className = "boton cartel__boton" + (voy ? " cartel__boton--voy" : "");
  boton.textContent = voy ? "¡Vas! · Desapuntarme" : libres === 0 ? "Completo" : "Me apunto";
  boton.disabled = !voy && libres === 0;
  boton.addEventListener("click", () => cambiarApuntado(plan));

  li.append(cabecera, nombre, meta, gente, boton);
  return li;
}

function pintarCartelera() {
  const lista = $("carteles");
  lista.innerHTML = "";
  planesParaMi().forEach((plan) => lista.append(crearCartel(plan)));
}


/* ---------- 4. TUS PLANES ---------- */
function pintarTusPlanes() {
  const lista = $("tus-planes");
  lista.innerHTML = "";
  const planes = ordenarPlanes(PLANES_EJEMPLO.filter(voyAlPlan));
  $("sin-planes").hidden = planes.length > 0;

  planes.forEach((plan) => {
    const li = document.createElement("li");
    li.className = "mi-plan";
    pintarColorCategoria(li, plan.categoria);

    const textos = document.createElement("span");
    textos.className = "mi-plan__textos";
    const nombre = document.createElement("strong");
    nombre.textContent = plan.nombre;
    const cuando = document.createElement("small");
    cuando.textContent = `${cuandoEs(plan)} · ${plan.hora} · ${plan.lugar}`;
    textos.append(nombre, cuando);

    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-mini mi-plan__boton";
    boton.textContent = "Voy";
    boton.title = "Pulsa para desapuntarte";
    boton.setAttribute("aria-label", `Desapuntarme de ${plan.nombre}`);
    boton.addEventListener("click", () => cambiarApuntado(plan));

    li.append(emoticono(emoticonoCategoria(plan.categoria), "mi-plan__emoticono"), textos, boton);
    lista.append(li);
  });
}

function pintarPlanes() {
  misPlanes = leerMisPlanes();
  pintarCartelera();
  pintarTusPlanes();
}
