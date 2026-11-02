/* =========================================================
   HOBBYMATCH · Parte social
   1. Amistades guardadas (localStorage)
   2. Utilidades: afinidad, avatar y tarjetas de personas
   3. Inicio: amigos, gente afín y tendencias
   4. Explorar: buscar personas (RESULTADO DE BÚSQUEDA) y tendencias
   5. Perfil de otra persona (READ) + solicitud de amistad (CREATE)
   6. Amigos: aceptar, rechazar, cancelar y eliminar (DELETE)
   Usa funciones y variables de app.js ($, leer, guardar, usuario...).
   ========================================================= */


/* ---------- 1. AMISTADES ----------
   Guardamos tres listas de ids de PERSONAS_EJEMPLO:
   - amigos:    amistades confirmadas
   - enviadas:  solicitudes que tú has enviado (pendientes)
   - recibidas: solicitudes que te han enviado a ti
   La primera vez empezamos con una solicitud recibida de ejemplo para poder probarlo. */
function leerAmistades() {
  const datos = leer(CLAVE_AMISTADES, null);
  if (datos && Array.isArray(datos.amigos)) return datos;
  return { amigos: [], enviadas: [], recibidas: ["p5"] };
}

let amistades = leerAmistades();

function guardarAmistades() {
  return guardar(CLAVE_AMISTADES, amistades);
}

// Qué relación tienes con una persona: "amigo", "enviada", "recibida" o "ninguna"
function relacionCon(idPersona) {
  if (amistades.amigos.includes(idPersona)) return "amigo";
  if (amistades.enviadas.includes(idPersona)) return "enviada";
  if (amistades.recibidas.includes(idPersona)) return "recibida";
  return "ninguna";
}

// Quita un id de una de las tres listas
function quitarDe(lista, idPersona) {
  amistades[lista] = amistades[lista].filter((id) => id !== idPersona);
}

function buscarPersona(id) {
  return PERSONAS_EJEMPLO.find((p) => p.id === id);
}


/* ---------- 2. UTILIDADES ---------- */

// Categorías que te interesan: las de tus preferencias + las de tus aficiones
function misCategorias() {
  return new Set([...(usuario.categorias || []), ...aficiones.map((a) => a.categoria)]);
}

// ¿Esta afición de otra persona es afín a ti? (misma afición o categoría que te interesa)
function esAfin(aficionPersona) {
  const misNombres = aficiones.map((a) => normalizar(a.nombre));
  return misNombres.includes(normalizar(aficionPersona.nombre)) || misCategorias().has(aficionPersona.categoria);
}

// Número de aficiones de la persona que son afines a ti
function afinidad(persona) {
  return persona.aficiones.filter(esAfin).length;
}

// Color del avatar: el de la primera categoría de la persona
function colorPersona(persona) {
  const categoria = buscarCategoria(persona.categorias[0]);
  return `var(--${categoria ? categoria.clave : "cultura"}-500)`;
}

// Gente que respeta la preferencia "Toda Madrid" / "Mi barrio"
function personasSegunAlcance() {
  if (usuario.alcance === "barrio") return PERSONAS_EJEMPLO.filter((p) => p.barrio === usuario.barrio);
  return PERSONAS_EJEMPLO;
}

// Crea la tarjeta de una persona (se usa en Inicio y en Explorar)
function crearTarjetaPersona(persona) {
  const li = document.createElement("li");
  li.className = "persona";

  const enlace = document.createElement("a");
  enlace.className = "persona__enlace";
  enlace.href = "#persona";
  enlace.addEventListener("click", () => seleccionar("persona", persona.id));

  const avatar = document.createElement("span");
  avatar.className = "avatar";
  pintarAvatar(avatar, persona.nombre, null, colorPersona(persona));

  const nombre = document.createElement("h4");
  nombre.className = "persona__nombre";
  nombre.textContent = `${persona.nombre}, ${persona.edad}`;

  const barrio = document.createElement("p");
  barrio.className = "persona__barrio";
  textoConEmoticono(barrio, "barrio", persona.barrio);

  const comun = afinidad(persona);
  const afin = document.createElement("p");
  afin.className = "persona__afinidad";
  if (comun > 0) textoConEmoticono(afin, "afinidad", plural(comun, "afición afín", "aficiones afines"));
  else afin.textContent = "Nuevas aficiones";

  const lista = document.createElement("p");
  lista.className = "persona__aficiones";
  lista.textContent = persona.aficiones.map((a) => a.nombre).join(" · ");

  enlace.append(avatar, nombre, barrio, afin, lista);

  // Marca si ya es tu amigo o tienes la solicitud pendiente
  const relacion = relacionCon(persona.id);
  if (relacion !== "ninguna") {
    const marca = document.createElement("span");
    marca.className = "persona__marca";
    marca.textContent = { amigo: "Amigo", enviada: "Pendiente", recibida: "Te ha escrito" }[relacion];
    enlace.append(marca);
  }

  li.append(enlace);
  return li;
}

// TENDENCIAS: contamos cuánta gente tiene cada afición y nos quedamos con las más repetidas
function calcularTendencias(cuantas) {
  const contador = {};
  PERSONAS_EJEMPLO.forEach((persona) => {
    persona.aficiones.forEach((a) => {
      if (!contador[a.nombre]) contador[a.nombre] = { nombre: a.nombre, categoria: a.categoria, personas: 0 };
      contador[a.nombre].personas++;
    });
  });
  return Object.values(contador)
    .sort((a, b) => b.personas - a.personas || a.nombre.localeCompare(b.nombre))
    .slice(0, cuantas);
}

// Pinta la lista de tendencias. Al pulsar una, busca esa afición en Explorar.
function pintarTendencias(contenedor, cuantas) {
  contenedor.innerHTML = "";
  calcularTendencias(cuantas).forEach((tendencia, i) => {
    const li = document.createElement("li");
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "tendencia";
    pintarColorCategoria(boton, tendencia.categoria);
    boton.innerHTML = `
      <span class="tendencia__puesto">${i + 1}</span>
      <span class="tendencia__texto"><strong></strong><small></small></span>
      <span class="tendencia__flecha" aria-hidden="true">↑</span>`;
    boton.querySelector("strong").textContent = tendencia.nombre;
    boton.querySelector("small").textContent = `${tendencia.categoria} · ${plural(tendencia.personas, "persona", "personas")}`;
    boton.addEventListener("click", () => {
      $("buscador-personas").value = tendencia.nombre;
      filtroPersonas = "";
      irA("explorar"); // Explorar se pinta solo y ya tiene el texto en el buscador
    });
    li.append(boton);
    contenedor.append(li);
  });
}


/* ---------- 3. INICIO ---------- */
function pintarInicioSocial() {
  amistades = leerAmistades();
  $("dato-amigos").textContent = amistades.amigos.length;
  $("dato-solicitudes").textContent = amistades.recibidas.length;
  $("texto-solicitudes").textContent = amistades.recibidas.length === 1 ? "Solicitud nueva" : "Solicitudes";

  // Gente afín: las 4 personas con más aficiones afines (sin contar a tus amigos)
  const afines = personasSegunAlcance()
    .filter((p) => relacionCon(p.id) !== "amigo")
    .sort((a, b) => afinidad(b) - afinidad(a))
    .slice(0, 4);

  const carrusel = $("carrusel-afines");
  carrusel.innerHTML = "";
  afines.forEach((p) => carrusel.append(crearTarjetaPersona(p)));
  if (afines.length === 0) {
    carrusel.innerHTML = '<li class="nota">No hay nadie nuevo en tu barrio. Prueba con "Toda Madrid" en tus preferencias.</li>';
  }

  pintarTendencias($("tendencias-inicio"), 3);
}


/* ---------- 4. EXPLORAR (RESULTADO DE BÚSQUEDA) ---------- */
let filtroPersonas = ""; // categoría elegida ("" = todas)

function pintarFiltrosPersonas() {
  const contenedor = $("filtros-personas");
  contenedor.innerHTML = '<legend class="sr-only">Filtrar personas por categoría</legend>';
  [{ nombre: "Todas", valor: "" }, ...CATEGORIAS.map((c) => ({ nombre: c.nombre, valor: c.nombre }))].forEach((opcion, i) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "filtro-personas";
    input.id = "filtro-personas-" + i;
    input.value = opcion.valor;
    input.checked = opcion.valor === filtroPersonas;
    input.addEventListener("change", () => {
      filtroPersonas = input.value;
      pintarResultadosPersonas();
    });

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.className = "chip chip--filtro";
    label.textContent = opcion.nombre;
    if (opcion.valor) pintarColorCategoria(label, opcion.valor);
    contenedor.append(input, label);
  });
}

function pintarResultadosPersonas() {
  const texto = normalizar($("buscador-personas").value);
  const soloBarrio = $("solo-mi-barrio").checked;

  // Filtramos por texto (nombre, barrio, aficiones y descripción), categoría y barrio
  const resultados = PERSONAS_EJEMPLO.filter((p) => {
    const dondeBuscar = normalizar(`${p.nombre} ${p.barrio} ${p.descripcion} ${p.aficiones.map((a) => a.nombre).join(" ")}`);
    return dondeBuscar.includes(texto)
      && (!filtroPersonas || p.categorias.includes(filtroPersonas))
      && (!soloBarrio || p.barrio === usuario.barrio);
  }).sort((a, b) => afinidad(b) - afinidad(a)); // las más afines primero

  const hayFiltros = Boolean(texto || filtroPersonas || soloBarrio);

  // Las tendencias solo se enseñan si no estás buscando nada
  $("bloque-tendencias").hidden = hayFiltros;
  $("quitar-filtros-personas").hidden = !hayFiltros;
  $("titulo-resultados").textContent = hayFiltros ? "Resultados" : "Personas afines";
  $("contador-personas").textContent = hayFiltros
    ? `${plural(resultados.length, "persona encontrada", "personas encontradas")}`
    : `${plural(PERSONAS_EJEMPLO.length, "persona", "personas")} en Madrid`;

  const lista = $("resultados-personas");
  lista.innerHTML = "";
  resultados.forEach((p) => lista.append(crearTarjetaPersona(p)));

  // Estado "sin resultados"
  $("estado-sin-personas").hidden = resultados.length > 0;
  if (resultados.length === 0) {
    const busqueda = $("buscador-personas").value.trim();
    $("texto-sin-personas").textContent = busqueda
      ? `No hay nadie que coincida con "${busqueda}". Prueba con otra afición o quita filtros.`
      : "No hay nadie con estos filtros todavía.";
  }
}

function pintarExplorar() {
  amistades = leerAmistades();
  $("texto-solo-barrio").textContent = `Solo ${usuario.barrio || "mi barrio"}`;
  pintarFiltrosPersonas();
  pintarTendencias($("tendencias-explorar"), 5);
  pintarResultadosPersonas();
}

function quitarFiltrosPersonas() {
  $("buscador-personas").value = "";
  $("solo-mi-barrio").checked = false;
  filtroPersonas = "";
  pintarFiltrosPersonas();
  pintarResultadosPersonas();
  $("buscador-personas").focus();
}

$("buscador-personas").addEventListener("input", pintarResultadosPersonas);
$("solo-mi-barrio").addEventListener("change", pintarResultadosPersonas);
$("quitar-filtros-personas").addEventListener("click", quitarFiltrosPersonas);
$("limpiar-filtros-personas").addEventListener("click", quitarFiltrosPersonas);


/* ---------- 5. PERFIL DE OTRA PERSONA ---------- */
function pintarPersona() {
  const persona = buscarPersona(seleccion.persona);
  if (!persona) {
    irA("explorar");
    return;
  }
  amistades = leerAmistades();

  pintarColorCategoria($("persona"), persona.categorias[0]);
  pintarAvatar($("persona-avatar"), persona.nombre, null, colorPersona(persona));
  $("persona-nombre").textContent = persona.nombre;
  $("persona-datos").replaceChildren(`${persona.edad} años · `, emoticono("barrio"), persona.barrio);
  const comun = afinidad(persona);
  if (comun > 0) textoConEmoticono($("persona-afinidad"), "afinidad", `${plural(comun, "afición afín", "aficiones afines")} contigo`);
  else $("persona-afinidad").textContent = "Aficiones nuevas para ti";
  $("persona-descripcion").textContent = persona.descripcion;

  // AFICIONES DE OTROS USUARIOS: etiquetas con el color de su categoría
  const lista = $("persona-aficiones");
  lista.innerHTML = "";
  persona.aficiones.forEach((a) => {
    const li = document.createElement("li");
    li.className = "etiqueta-aficion" + (esAfin(a) ? " etiqueta-aficion--afin" : "");
    pintarColorCategoria(li, a.categoria);
    // Cada etiqueta lleva el emoticono de su categoría
    textoConEmoticono(li, emoticonoCategoria(a.categoria), a.nombre);
    li.title = a.categoria;
    lista.append(li);
  });

  pintarMascotaPersona(persona); // mascotas.js
  pintarBotonAmistad(persona);
}

// El botón principal cambia según la relación que tengas con la persona
function pintarBotonAmistad(persona) {
  const boton = $("boton-amistad");
  const relacion = relacionCon(persona.id);
  const textos = {
    ninguna: "Enviar solicitud de amistad",
    enviada: "Solicitud enviada · Cancelar",
    recibida: `Aceptar solicitud de ${persona.nombre}`,
    amigo: "Sois amigos · Eliminar amistad"
  };
  if (relacion === "amigo") textoConEmoticono(boton, "amigos", textos[relacion]);
  else boton.textContent = textos[relacion];
  boton.className = "boton " + (relacion === "ninguna" || relacion === "recibida" ? "boton--principal" : "boton--secundario");
}

$("boton-amistad").addEventListener("click", () => {
  const persona = buscarPersona(seleccion.persona);
  const relacion = relacionCon(persona.id);

  if (relacion === "ninguna") {
    // CREATE: enviar solicitud de amistad
    amistades.enviadas.push(persona.id);
    if (guardarAmistades()) mostrarAviso(`Solicitud enviada a ${persona.nombre}`);
  } else if (relacion === "enviada") {
    quitarDe("enviadas", persona.id);
    if (guardarAmistades()) mostrarAviso("Solicitud cancelada");
  } else if (relacion === "recibida") {
    aceptarSolicitud(persona.id);
  } else {
    eliminarAmistad(persona);
  }
  pintarBotonAmistad(persona);
});


/* ---------- 6. AMIGOS ---------- */
function aceptarSolicitud(idPersona) {
  quitarDe("recibidas", idPersona);
  amistades.amigos.push(idPersona);
  if (guardarAmistades()) mostrarAviso(`¡Ahora eres amigo de ${buscarPersona(idPersona).nombre}!`);
}

// DELETE: eliminar una amistad (con confirmación)
function eliminarAmistad(persona) {
  confirmar({
    titulo: `¿Eliminar a ${persona.nombre}?`,
    texto: "Dejaréis de ser amigos. Podrás volver a enviarle una solicitud cuando quieras.",
    boton: "Sí, eliminar amistad"
  }, () => {
    quitarDe("amigos", persona.id);
    if (guardarAmistades()) mostrarAviso("Amistad eliminada");
    pintarPantalla(); // refresca la pantalla en la que estés (Amigos o el perfil)
  });
}

// Crea una fila de persona con botones de acción (se usa en Amigos y en Listas)
function crearFilaPersona(persona, acciones) {
  const li = document.createElement("li");
  li.className = "fila-persona";

  const enlace = document.createElement("a");
  enlace.className = "fila-persona__enlace";
  enlace.href = "#persona";
  enlace.addEventListener("click", () => seleccionar("persona", persona.id));

  const avatar = document.createElement("span");
  avatar.className = "avatar avatar--pequeno";
  pintarAvatar(avatar, persona.nombre, null, colorPersona(persona));

  const textos = document.createElement("span");
  textos.className = "fila-persona__textos";
  const nombre = document.createElement("strong");
  nombre.textContent = persona.nombre;
  const detalle = document.createElement("small");
  textoConEmoticono(detalle, "barrio", `${persona.barrio} · ${persona.aficiones.slice(0, 2).map((a) => a.nombre).join(", ")}`);
  textos.append(nombre, detalle);
  enlace.append(avatar, textos);

  const botones = document.createElement("div");
  botones.className = "fila-persona__acciones";
  acciones.forEach(({ texto, clase, etiqueta, alPulsar }) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton-mini " + (clase || "");
    boton.textContent = texto;
    if (etiqueta) boton.setAttribute("aria-label", etiqueta);
    boton.addEventListener("click", alPulsar);
    botones.append(boton);
  });

  li.append(enlace, botones);
  return li;
}

function pintarAmigos() {
  amistades = leerAmistades();
  $("contador-amigos").textContent = plural(amistades.amigos.length, "amigo", "amigos");

  // Solicitudes recibidas: aceptar o rechazar
  $("bloque-recibidas").hidden = amistades.recibidas.length === 0;
  $("lista-recibidas").innerHTML = "";
  amistades.recibidas.map(buscarPersona).filter(Boolean).forEach((p) => {
    $("lista-recibidas").append(crearFilaPersona(p, [
      { texto: "Aceptar", clase: "boton-mini--principal", alPulsar: () => { aceptarSolicitud(p.id); pintarAmigos(); } },
      { texto: "✕", etiqueta: `Rechazar a ${p.nombre}`, alPulsar: () => {
        quitarDe("recibidas", p.id);
        if (guardarAmistades()) mostrarAviso("Solicitud rechazada");
        pintarAmigos();
      } }
    ]));
  });

  // Amigos: eliminar amistad
  $("estado-sin-amigos").hidden = amistades.amigos.length > 0;
  $("lista-amigos").innerHTML = "";
  amistades.amigos.map(buscarPersona).filter(Boolean).forEach((p) => {
    $("lista-amigos").append(crearFilaPersona(p, [
      { texto: "Eliminar", clase: "boton-mini--peligro", etiqueta: `Eliminar a ${p.nombre} de tus amigos`, alPulsar: () => eliminarAmistad(p) }
    ]));
  });

  // Solicitudes enviadas: cancelar
  $("bloque-enviadas").hidden = amistades.enviadas.length === 0;
  $("lista-enviadas").innerHTML = "";
  amistades.enviadas.map(buscarPersona).filter(Boolean).forEach((p) => {
    $("lista-enviadas").append(crearFilaPersona(p, [
      { texto: "Cancelar", etiqueta: `Cancelar solicitud a ${p.nombre}`, alPulsar: () => {
        quitarDe("enviadas", p.id);
        if (guardarAmistades()) mostrarAviso("Solicitud cancelada");
        pintarAmigos();
      } }
    ]));
  });
}


/* Apuntamos qué función rellena cada pantalla (ver PINTORES en app.js) */
Object.assign(PINTORES, {
  explorar: pintarExplorar,
  persona: pintarPersona,
  amigos: pintarAmigos
});
