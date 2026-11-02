/* =========================================================
   HOBBYMATCH · Lógica principal de la app
   La lógica está repartida en 4 archivos (se cargan en este orden):
   - app.js    → lo común (datos, navegación, avisos) + registro, onboarding y "Mis aficiones"
   - social.js → Explorar, perfil de otras personas, amigos, gente afín y tendencias
   - perfil.js → mi perfil: ver, editar (foto, nombre, descripción, barrio, preferencias) y eliminar cuenta
   - listas.js → listas de personas: crear, ver, editar y eliminar
   Índice de este archivo:
   1. Guardar y leer datos (localStorage)
   2. Utilidades pequeñas
   3. Navegación entre pantallas
   4. Registro e inicio de sesión (validación)
   5. Onboarding: barrio y categorías
   6. Inicio
   7. Mis aficiones: listado, búsqueda y filtros (READ)
   8. Formulario: crear y editar (CREATE / UPDATE)
   9. Detalle y eliminar (DELETE)
   10. Avisos (toast) y botones "Próximamente"
   11. Arranque
   ========================================================= */


/* ---------- 1. GUARDAR Y LEER DATOS ----------
   localStorage guarda texto en el navegador y NO se borra al recargar.
   Como solo guarda texto, convertimos los objetos con JSON.stringify
   y los recuperamos con JSON.parse. */
const CLAVE_USUARIO = "hobbymatch-usuario";
const CLAVE_AFICIONES = "hobbymatch-aficiones";
const CLAVE_AMISTADES = "hobbymatch-amistades";
const CLAVE_LISTAS = "hobbymatch-listas";

// Si los datos guardados están dañados, lo apuntamos para enseñar el estado de error
let hayErrorDeLectura = false;

function leer(clave, valorPorDefecto) {
  try {
    const texto = localStorage.getItem(clave);
    if (texto === null) return valorPorDefecto; // todavía no hay nada guardado
    return JSON.parse(texto);
  } catch (error) {
    // JSON roto o navegador que bloquea localStorage
    console.warn("No se pudo leer", clave, error);
    hayErrorDeLectura = true;
    return valorPorDefecto;
  }
}

function guardar(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    // Por ejemplo, si el almacenamiento está lleno o en modo privado
    console.warn("No se pudo guardar", clave, error);
    mostrarAviso("No se han podido guardar los datos", true);
    return false;
  }
}

// Estado de la app en memoria (se carga al arrancar)
// usuario: { nombre, correo, barrio, categorias: [], descripcion, foto, alcance, mascota, nivelMascota, sesionCerrada }
let usuario = leer(CLAVE_USUARIO, null);
if (usuario && usuario.sesionCerrada) usuario = null; // cerró sesión: hay que volver a entrar

let aficiones = leer(CLAVE_AFICIONES, []);     // [{ id, nombre, categoria, nivel, frecuencia, descripcion, creada }]
if (!Array.isArray(aficiones)) {               // por si alguien ha guardado algo raro
  aficiones = [];
  hayErrorDeLectura = true;
}

// Borra todo lo que la app ha guardado del usuario (al eliminar la cuenta o registrar una nueva)
function borrarDatosDeUsuario() {
  [CLAVE_USUARIO, CLAVE_AFICIONES, CLAVE_AMISTADES, CLAVE_LISTAS, "hobbymatch-planes"].forEach((clave) => localStorage.removeItem(clave));
  sessionStorage.clear();
  aficiones = [];
}

/* Qué elemento estamos viendo ahora mismo (una afición, una persona o una lista).
   Lo guardamos en sessionStorage (dura mientras la pestaña está abierta),
   así si recargas en una pantalla de detalle sigue sabiendo qué enseñar. */
const seleccion = (() => {
  try { return JSON.parse(sessionStorage.getItem("hobbymatch-seleccion")) || {}; }
  catch { return {}; }
})();

function seleccionar(tipo, id) {
  seleccion[tipo] = id;
  sessionStorage.setItem("hobbymatch-seleccion", JSON.stringify(seleccion));
}

let idEditando = null;     // afición que se edita (null = estamos creando una nueva)


/* ---------- 2. UTILIDADES ---------- */

// Atajo para buscar un elemento por id
const $ = (id) => document.getElementById(id);

// Quita tildes y pasa a minúsculas: así "Música" y "musica" se consideran iguales
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Devuelve la categoría completa (con su "clave" de color) a partir del nombre
function buscarCategoria(nombre) {
  return CATEGORIAS.find((c) => c.nombre === nombre);
}

// Pone en un elemento las variables de color de su categoría (--cat-300, --cat-500, --cat-700)
function pintarColorCategoria(elemento, nombreCategoria) {
  const categoria = buscarCategoria(nombreCategoria);
  const clave = categoria ? categoria.clave : "cultura";
  ["300", "500", "700"].forEach((tono) => {
    elemento.style.setProperty(`--cat-${tono}`, `var(--${clave}-${tono})`);
  });
}

// Crea un id único sencillo (fecha + número aleatorio)
function crearId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// "1 afición" / "3 aficiones"
function plural(numero, singular, pluralTexto) {
  return `${numero} ${numero === 1 ? singular : pluralTexto}`;
}

/* EMOTICONOS PROPIOS
   Los dibujos están en el sprite de index.html con id "e-nombre" (e-barrio, e-deportes...).
   Para usarlos creamos un <svg><use href="#e-nombre"></svg>. Se crean con
   createElementNS porque los SVG necesitan su propio "espacio de nombres". */
const SVG_NS = "http://www.w3.org/2000/svg";

function emoticono(nombre, clase = "") {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", ("emoticono " + clase).trim());
  svg.setAttribute("aria-hidden", "true"); // es decorativo: el lector de pantalla lee el texto
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#e-${nombre}`);
  svg.append(use);
  return svg;
}

// Escribe en un elemento un emoticono seguido de un texto.
// Usamos replaceChildren (y no innerHTML) para que el texto nunca se interprete como HTML.
function textoConEmoticono(elemento, nombre, texto) {
  elemento.replaceChildren(emoticono(nombre), texto);
}

// Nombre del emoticono de cada categoría (es su "clave": deportes, musica...)
function emoticonoCategoria(nombreCategoria) {
  const categoria = buscarCategoria(nombreCategoria);
  return categoria ? categoria.clave : "cultura";
}

// Emoticono de cada nivel: del brote al madroño con frutos
const EMOTICONOS_NIVEL = { Principiante: "principiante", Intermedio: "intermedio", Avanzado: "avanzado" };


/* ---------- 3. NAVEGACIÓN ----------
   El CSS ya enseña la pantalla del # (:target). Aquí solo:
   - cambiamos el # desde el código (irA)
   - rellenamos la pantalla con datos cada vez que cambia el # (pintarPantalla)
   Cada archivo apunta en PINTORES qué función rellena cada pantalla. */
const PINTORES = {};
function irA(idPantalla) {
  if (location.hash === "#" + idPantalla) {
    pintarPantalla(); // ya estamos ahí: solo refrescamos los datos
  } else {
    location.hash = idPantalla; // esto dispara el evento "hashchange"
  }
}

// Pantallas que se pueden ver sin haber entrado; todas las demás necesitan usuario
const PANTALLAS_PUBLICAS = ["bienvenida", "crear-usuario", "iniciar-sesion"];

function pintarPantalla() {
  const pantalla = location.hash.slice(1) || "bienvenida";

  // Sin usuario no se puede entrar en la app: vuelta a la bienvenida
  if (!PANTALLAS_PUBLICAS.includes(pantalla) && !usuario) {
    irA("bienvenida");
    return;
  }

  // Si esa pantalla tiene función para rellenarse, la llamamos
  if (PINTORES[pantalla]) PINTORES[pantalla]();

  window.scrollTo(0, 0); // cada pantalla empieza arriba del todo
}

// Contamos los cambios de pantalla para saber si el botón "volver" puede usar el historial
let pasosDentroDeLaApp = 0;
window.addEventListener("hashchange", () => {
  pasosDentroDeLaApp++;
  pintarPantalla();
});

// Botones "volver" con data-atras: vuelven a la pantalla anterior (como la flecha del navegador).
// Si se abrió la app directamente en esa pantalla, usan su href.
document.querySelectorAll("[data-atras]").forEach((enlace) => {
  enlace.addEventListener("click", (evento) => {
    if (pasosDentroDeLaApp > 0) {
      evento.preventDefault();
      history.back();
    }
  });
});


/* ---------- 4. REGISTRO E INICIO DE SESIÓN ---------- */

// Marca un campo en rojo y escribe el mensaje debajo
function marcarError(input, mensaje) {
  const campo = input.closest(".campo");
  campo.classList.add("campo--error");
  input.setAttribute("aria-invalid", "true");

  const p = document.createElement("p");
  p.className = "mensaje-error";
  p.id = "error-" + input.form.id + "-" + input.name; // id único por formulario
  p.textContent = mensaje;
  input.setAttribute("aria-describedby", p.id); // el lector de pantalla lee el error
  campo.after(p);
}

// Quita todos los errores de un formulario antes de volver a validar
function limpiarErrores(formulario) {
  formulario.querySelectorAll(".mensaje-error").forEach((p) => p.remove());
  formulario.querySelectorAll(".campo--error").forEach((c) => c.classList.remove("campo--error"));
  formulario.querySelectorAll("[aria-invalid]").forEach((i) => {
    i.removeAttribute("aria-invalid");
    i.removeAttribute("aria-describedby");
  });
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

$("form-registro").addEventListener("submit", (evento) => {
  evento.preventDefault(); // evita que la página se recargue
  const form = evento.target;
  limpiarErrores(form);

  const nombre = form.nombre.value.trim();
  const correo = form.correo.value.trim().toLowerCase();
  const contrasena = form.contrasena.value;
  let valido = true;

  if (nombre.length < 2) { marcarError(form.nombre, "Escribe tu nombre (mínimo 2 letras)."); valido = false; }
  if (!CORREO_VALIDO.test(correo)) { marcarError(form.correo, "Escribe un correo válido, por ejemplo nombre@correo.com."); valido = false; }
  if (contrasena.length < 6) { marcarError(form.contrasena, "La contraseña necesita al menos 6 caracteres."); valido = false; }

  if (!valido) {
    form.querySelector("[aria-invalid]").focus(); // llevamos al primer campo con error
    return;
  }

  // Una cuenta nueva empieza de cero (en este navegador solo cabe un usuario)
  borrarDatosDeUsuario();

  // Ojo: la contraseña NO se guarda (en un MVP sin servidor no sería seguro)
  usuario = { nombre, correo, barrio: null, categorias: [], descripcion: "", foto: null, alcance: "madrid" };
  guardar(CLAVE_USUARIO, usuario);
  form.reset();
  irA("barrio");
});

$("form-login").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const form = evento.target;
  limpiarErrores(form);

  const guardado = leer(CLAVE_USUARIO, null);
  const correo = form.correo.value.trim().toLowerCase();
  let valido = true;

  if (!CORREO_VALIDO.test(correo)) {
    marcarError(form.correo, "Escribe un correo válido.");
    valido = false;
  } else if (!guardado || guardado.correo !== correo) {
    marcarError(form.correo, "No hay ninguna cuenta con este correo en este dispositivo.");
    valido = false;
  }
  if (form.contrasena.value === "") { marcarError(form.contrasena, "Escribe tu contraseña."); valido = false; }

  if (!valido) {
    form.querySelector("[aria-invalid]").focus();
    return;
  }

  usuario = guardado;
  usuario.sesionCerrada = false;
  guardar(CLAVE_USUARIO, usuario);
  form.reset();
  // Si no llegó a elegir barrio, terminamos el onboarding; si no, a Inicio
  irA(usuario.barrio ? "inicio" : "barrio");
});

// El icono de los "ojos" enseña u oculta la contraseña
document.querySelectorAll(".campo__icono--derecha").forEach((ojos) => {
  ojos.addEventListener("click", (evento) => {
    evento.preventDefault(); // que no ponga el foco en el input al pulsar el label
    const input = ojos.closest(".campo").querySelector("input");
    input.type = input.type === "password" ? "text" : "password";
  });
});


/* ---------- 5. ONBOARDING ---------- */

// Marca el barrio guardado (si lo hay)
function pintarBarrio() {
  if (usuario.barrio) {
    const radio = document.querySelector(`input[name="barrio"][value="${usuario.barrio}"]`);
    if (radio) radio.checked = true;
  }
}

// Buscador de barrios: oculta los chips que no coinciden
$("buscador-barrio").addEventListener("input", (evento) => {
  const texto = normalizar(evento.target.value);
  document.querySelectorAll('input[name="barrio"]').forEach((radio) => {
    const coincide = normalizar(radio.value).includes(texto);
    radio.nextElementSibling.hidden = !coincide; // el <label> va justo después del radio
  });
});

$("guardar-barrio").addEventListener("click", () => {
  const elegido = document.querySelector('input[name="barrio"]:checked');
  if (!elegido) {
    mostrarAviso("Elige un barrio para continuar", true);
    return;
  }
  usuario.barrio = elegido.value;
  guardar(CLAVE_USUARIO, usuario);
  irA("aficiones");
});

// Marca las categorías guardadas (si ya las eligió antes)
function pintarCategorias() {
  if (usuario.categorias.length > 0) {
    document.querySelectorAll('#lista-categorias input[name="categoria"]').forEach((check) => {
      check.checked = usuario.categorias.includes(check.value);
    });
  }
}

$("guardar-categorias").addEventListener("click", () => {
  const marcadas = [...document.querySelectorAll('#lista-categorias input:checked')].map((c) => c.value);
  if (marcadas.length === 0) {
    mostrarAviso("Elige al menos una categoría", true);
    return;
  }
  usuario.categorias = marcadas;
  guardar(CLAVE_USUARIO, usuario);
  irA("mascota"); // último paso: elegir compañero (js/mascotas.js)
});


/* ---------- 6. INICIO ---------- */

// Pinta un avatar: la foto si hay, si no la inicial sobre un color
function pintarAvatar(elemento, nombre, foto, color) {
  elemento.textContent = foto ? "" : nombre.charAt(0).toUpperCase();
  elemento.style.backgroundImage = foto ? `url(${foto})` : "";
  if (color) elemento.style.backgroundColor = color;
}

function pintarInicio() {
  $("titulo-inicio").textContent = `¡Hola, ${usuario.nombre}!`;
  textoConEmoticono($("inicio-ubicacion"), "barrio", `${usuario.barrio || "Madrid"}, Madrid`);
  pintarAvatar($("inicio-avatar"), usuario.nombre, usuario.foto);
  $("dato-aficiones").textContent = aficiones.length;
  pintarInicioSocial(); // amigos, gente afín y tendencias (social.js)
  pintarPlanes();       // cartelera y tus planes (planes.js)
}


/* ---------- 7. MIS AFICIONES: LISTADO (READ) ---------- */

// Filtro activo: "" significa "Todas"
let filtroCategoria = "";

// Crea los chips de filtro solo con las categorías que el usuario usa
function pintarFiltros() {
  const usadas = CATEGORIAS.filter((c) => aficiones.some((a) => a.categoria === c.nombre));

  // Si el filtro elegido ya no existe (p. ej. borraste la última afición de esa categoría), volvemos a "Todas"
  if (filtroCategoria && !usadas.some((c) => c.nombre === filtroCategoria)) filtroCategoria = "";

  const opciones = [{ nombre: "Todas", valor: "" }, ...usadas.map((c) => ({ nombre: c.nombre, valor: c.nombre }))];

  $("filtros").innerHTML = '<legend class="sr-only">Filtrar por categoría</legend>';
  opciones.forEach((opcion, i) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "filtro";
    input.id = "filtro-" + i;
    input.value = opcion.valor;
    input.checked = opcion.valor === filtroCategoria;
    input.addEventListener("change", () => {
      filtroCategoria = input.value;
      pintarResultados();
    });

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.className = "chip chip--filtro";
    label.textContent = opcion.nombre;
    if (opcion.valor) pintarColorCategoria(label, opcion.valor);

    $("filtros").append(input, label);
  });
}

// Devuelve las aficiones que cumplen la búsqueda Y el filtro
function aficionesFiltradas() {
  const texto = normalizar($("buscador").value);
  return aficiones.filter((a) => {
    const cumpleFiltro = !filtroCategoria || a.categoria === filtroCategoria;
    const dondeBuscar = normalizar(`${a.nombre} ${a.categoria} ${a.descripcion}`);
    return cumpleFiltro && dondeBuscar.includes(texto);
  });
}

// Pinta las tarjetas y decide qué estado se ve: error, vacío, sin resultados o lista
function pintarResultados() {
  const lista = $("lista-aficiones");
  const visibles = aficionesFiltradas();
  const total = aficiones.length;

  // Ocultamos todos los estados y luego enseñamos solo el que toca
  $("estado-error").hidden = true;
  $("estado-vacio").hidden = true;
  $("estado-sin-resultados").hidden = true;

  if (hayErrorDeLectura) {
    $("estado-error").hidden = false;
  } else if (total === 0) {
    $("estado-vacio").hidden = false;
  } else if (visibles.length === 0) {
    const busqueda = $("buscador").value.trim();
    $("texto-sin-resultados").textContent = busqueda
      ? `No hay aficiones que coincidan con "${busqueda}"${filtroCategoria ? " en " + filtroCategoria : ""}.`
      : `No tienes aficiones de ${filtroCategoria}.`;
    $("estado-sin-resultados").hidden = false;
  }

  // Buscador y filtros solo tienen sentido si hay algo que buscar
  $("herramientas").hidden = total === 0 || hayErrorDeLectura;

  // El botón "Quitar filtros" solo se ve si hay búsqueda o categoría elegida
  $("quitar-filtros").hidden = !$("buscador").value.trim() && !filtroCategoria;

  // Contador de arriba
  const hayFiltros = visibles.length !== total;
  $("contador-aficiones").textContent = hayFiltros
    ? `${visibles.length} de ${plural(total, "afición", "aficiones")}`
    : plural(total, "afición", "aficiones");

  // Tarjetas (la más reciente primero)
  lista.innerHTML = "";
  [...visibles].reverse().forEach((aficion) => {
    const li = document.createElement("li");
    const enlace = document.createElement("a");
    enlace.className = "tarjeta-aficion";
    enlace.href = "#detalle";
    pintarColorCategoria(enlace, aficion.categoria);

    // textContent (y no innerHTML) para que lo que escribe el usuario no se interprete como HTML
    // El emoticono de su categoría (antes era un punto de color)
    const punto = emoticono(emoticonoCategoria(aficion.categoria), "tarjeta-aficion__emoticono");
    const textos = document.createElement("span");
    textos.className = "tarjeta-aficion__textos";
    const nombre = document.createElement("strong");
    nombre.className = "tarjeta-aficion__nombre";
    nombre.textContent = aficion.nombre;
    const meta = document.createElement("small");
    meta.className = "tarjeta-aficion__meta";
    meta.textContent = [aficion.categoria, aficion.nivel, aficion.frecuencia].filter(Boolean).join(" · ");
    const flecha = document.createElement("span");
    flecha.className = "tarjeta-aficion__flecha";
    flecha.setAttribute("aria-hidden", "true");
    flecha.textContent = "›";

    textos.append(nombre, meta);
    enlace.append(punto, textos, flecha);
    enlace.addEventListener("click", () => seleccionar("aficion", aficion.id));

    li.append(enlace);
    lista.append(li);
  });
}

function pintarLista() {
  pintarFiltros();
  pintarResultados();
}

// Buscar mientras se escribe
$("buscador").addEventListener("input", pintarResultados);

// "Limpiar filtros" / "Quitar filtros" dejan búsqueda y categoría como al principio (reset)
function quitarFiltros() {
  $("buscador").value = "";
  filtroCategoria = "";
  pintarLista();
  $("buscador").focus();
}
$("limpiar-filtros").addEventListener("click", quitarFiltros);
$("quitar-filtros").addEventListener("click", quitarFiltros);

// Estado de error: borra los datos dañados y empieza de cero
$("reiniciar-datos").addEventListener("click", () => {
  aficiones = [];
  hayErrorDeLectura = false;
  guardar(CLAVE_AFICIONES, aficiones);
  pintarLista();
  mostrarAviso("Datos reiniciados");
});

// Todos los botones "+ Añadir afición" abren el formulario vacío
document.querySelectorAll("[data-nueva-aficion]").forEach((boton) => {
  boton.addEventListener("click", () => { idEditando = null; });
});


/* ---------- 8. FORMULARIO: CREAR Y EDITAR (CREATE / UPDATE) ---------- */
const form = $("form-aficion");

// Se rellena una sola vez: categorías del select, niveles, frecuencias y sugerencias
function prepararFormulario() {
  CATEGORIAS.forEach((c) => {
    form.categoria.add(new Option(c.nombre, c.nombre));
    c.aficiones.forEach((a) => $("sugerencias-aficiones").append(new Option(a)));
  });

  NIVELES.forEach((nivel, i) => {
    $("opciones-nivel").insertAdjacentHTML("beforeend",
      `<input type="radio" name="nivel" id="nivel-${i}" value="${nivel}"><label for="nivel-${i}">` +
      `<svg class="emoticono" aria-hidden="true"><use href="#e-${EMOTICONOS_NIVEL[nivel]}"/></svg>${nivel}</label>`);
  });

  FRECUENCIAS.forEach((frecuencia, i) => {
    $("opciones-frecuencia").insertAdjacentHTML("beforeend",
      `<input type="radio" name="frecuencia" id="frecuencia-${i}" value="${frecuencia}"><label for="frecuencia-${i}" class="chip">${frecuencia}</label>`);
  });
}

// Si escribe una afición conocida (p. ej. "Pádel"), elegimos su categoría automáticamente
form.nombre.addEventListener("input", () => {
  const texto = normalizar(form.nombre.value);
  const categoria = CATEGORIAS.find((c) => c.aficiones.some((a) => normalizar(a) === texto));
  if (categoria && !form.categoria.value) form.categoria.value = categoria.nombre;
});

// Prepara el formulario en modo "nueva" o en modo "editar"
function pintarFormulario() {
  limpiarErrores(form);
  const aficion = aficiones.find((a) => a.id === idEditando);

  if (aficion) {
    // MODO EDICIÓN: rellenamos con los datos guardados
    $("titulo-formulario").textContent = "Editar afición";
    $("boton-guardar").textContent = "Guardar cambios";
    form.nombre.value = aficion.nombre;
    form.categoria.value = aficion.categoria;
    form.descripcion.value = aficion.descripcion;
    form.querySelectorAll('input[name="nivel"], input[name="frecuencia"]').forEach((r) => {
      r.checked = r.value === aficion.nivel || r.value === aficion.frecuencia;
    });
    // Volver y cancelar llevan de nuevo al detalle
    $("volver-formulario").href = "#detalle";
    $("cancelar-formulario").href = "#detalle";
  } else {
    // MODO NUEVA: formulario vacío (con valores por defecto en nivel y frecuencia)
    idEditando = null;
    $("titulo-formulario").textContent = "Nueva afición";
    $("boton-guardar").textContent = "Guardar afición";
    form.reset();
    form.querySelector('input[name="nivel"]').checked = true;
    form.querySelector('input[name="frecuencia"][value="Semanal"]').checked = true;
    $("volver-formulario").href = "#mis-aficiones";
    $("cancelar-formulario").href = "#mis-aficiones";
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarErrores(form);

  const datos = {
    nombre: form.nombre.value.trim(),
    categoria: form.categoria.value,
    nivel: form.nivel.value,
    frecuencia: form.frecuencia.value,
    descripcion: form.descripcion.value.trim()
  };

  // Validación
  let valido = true;
  const repetida = aficiones.some((a) => a.id !== idEditando && normalizar(a.nombre) === normalizar(datos.nombre));

  if (datos.nombre.length < 2) {
    marcarError(form.nombre, "Escribe el nombre de la afición (mínimo 2 letras).");
    valido = false;
  } else if (repetida) {
    marcarError(form.nombre, "Ya tienes una afición con este nombre.");
    valido = false;
  }
  if (!datos.categoria) {
    marcarError(form.categoria, "Elige una categoría.");
    valido = false;
  }
  if (!valido) {
    form.querySelector("[aria-invalid]").focus();
    return;
  }

  if (idEditando) {
    // UPDATE: sustituimos los datos de la afición que estamos editando
    const aficion = aficiones.find((a) => a.id === idEditando);
    Object.assign(aficion, datos);
    if (guardar(CLAVE_AFICIONES, aficiones)) mostrarAviso("Cambios guardados");
    seleccionar("aficion", idEditando);
    idEditando = null;
    irA("detalle");
  } else {
    // CREATE: añadimos una nueva al final del array
    aficiones.push({ id: crearId(), ...datos, creada: new Date().toISOString() });
    if (guardar(CLAVE_AFICIONES, aficiones)) mostrarAviso("Afición guardada");
    irA("mis-aficiones");
  }
});


/* ---------- 9. DETALLE Y ELIMINAR (DELETE) ---------- */
function pintarDetalle() {
  const aficion = aficiones.find((a) => a.id === seleccion.aficion);
  if (!aficion) {
    irA("mis-aficiones"); // p. ej. si recargas estando en el detalle
    return;
  }

  pintarColorCategoria($("detalle"), aficion.categoria);
  textoConEmoticono($("detalle-categoria"), emoticonoCategoria(aficion.categoria), aficion.categoria);
  $("detalle-nombre").textContent = aficion.nombre;
  if (EMOTICONOS_NIVEL[aficion.nivel]) textoConEmoticono($("detalle-nivel"), EMOTICONOS_NIVEL[aficion.nivel], aficion.nivel);
  else $("detalle-nivel").textContent = aficion.nivel || "—";
  $("detalle-frecuencia").textContent = aficion.frecuencia || "—";
  $("detalle-fecha").textContent = new Date(aficion.creada)
    .toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
  $("detalle-descripcion").textContent = aficion.descripcion || "Sin descripción.";

  // Gente de ejemplo que comparte la categoría (en el futuro vendrá de un servidor)
  const afines = PERSONAS_EJEMPLO.filter((p) => p.categorias.includes(aficion.categoria)).length;
  textoConEmoticono($("detalle-afines"), "afinidad", `${plural(afines, "persona", "personas")} en Madrid comparten ${aficion.categoria}`);
}

$("editar-aficion").addEventListener("click", () => {
  idEditando = seleccion.aficion;
  irA("formulario-aficion");
});

/* Diálogo de confirmación reutilizable.
   <dialog> nativo: showModal() lo abre encima y bloquea el resto; Esc lo cierra.
   Uso: confirmar({ titulo, texto, boton }, () => { ...lo que pasa si dice que sí... }) */
const dialogo = $("dialogo-eliminar");
let alConfirmar = null; // función que se ejecuta al pulsar el botón rojo

function confirmar({ titulo, texto, boton = "Sí, eliminar" }, accion) {
  $("dialogo-titulo").textContent = titulo;
  $("dialogo-texto").textContent = texto;
  $("confirmar-eliminar").textContent = boton;
  alConfirmar = accion;
  dialogo.showModal();
  $("cancelar-eliminar").focus(); // el foco en la opción segura
}

$("cancelar-eliminar").addEventListener("click", () => dialogo.close());

$("confirmar-eliminar").addEventListener("click", () => {
  dialogo.close();
  if (alConfirmar) alConfirmar();
  alConfirmar = null;
});

$("eliminar-aficion").addEventListener("click", () => {
  const aficion = aficiones.find((a) => a.id === seleccion.aficion);
  confirmar({
    titulo: `¿Eliminar ${aficion.nombre}?`,
    texto: "Se borrará de tus aficiones y dejarás de ver gente afín por ella. No se puede deshacer."
  }, () => {
    aficiones = aficiones.filter((a) => a.id !== aficion.id); // DELETE
    seleccionar("aficion", null);
    if (guardar(CLAVE_AFICIONES, aficiones)) mostrarAviso("Afición eliminada");
    irA("mis-aficiones");
  });
});


/* ---------- 10. AVISOS Y "PRÓXIMAMENTE" ---------- */
let temporizadorAviso;

function mostrarAviso(texto, esError = false) {
  const aviso = $("aviso");
  $("aviso-texto").textContent = texto;
  aviso.classList.toggle("aviso--error", esError);
  aviso.querySelector(".aviso__icono").textContent = esError ? "!" : "✓";
  aviso.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, 2600);
}

// Enlaces de cosas que quedan fuera del MVP (si alguno lleva data-proximamente)
document.querySelectorAll("[data-proximamente]").forEach((enlace) => {
  enlace.addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarAviso("Próximamente");
  });
});


/* ---------- 11. ARRANQUE ----------
   Apuntamos qué función rellena cada pantalla de este archivo.
   Esperamos a DOMContentLoaded para que social.js, perfil.js y listas.js
   ya se hayan cargado y apuntado también las suyas. */
Object.assign(PINTORES, {
  barrio: pintarBarrio,
  aficiones: pintarCategorias,
  inicio: pintarInicio,
  "mis-aficiones": pintarLista,
  "formulario-aficion": pintarFormulario,
  detalle: pintarDetalle
});

// Funciones que preparan formularios una sola vez (los otros archivos añaden las suyas)
const PREPARAR = [prepararFormulario];

document.addEventListener("DOMContentLoaded", () => {
  PREPARAR.forEach((preparar) => preparar());
  pintarPantalla();
});
