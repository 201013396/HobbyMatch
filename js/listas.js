/* =========================================================
   HOBBYMATCH · Listas de personas
   Una lista sirve para guardar gente, por ejemplo "Pádel los domingos".
   1. Guardar y leer listas (localStorage)
   2. Mis listas en el perfil (READ)
   3. Detalle de una lista (READ) y quitar personas (UPDATE)
   4. Formulario: crear y editar (CREATE / UPDATE)
   5. Eliminar lista (DELETE)
   6. Diálogo "Guardar en una lista" desde el perfil de otra persona
   ========================================================= */


/* ---------- 1. DATOS ----------
   Cada lista: { id, nombre, emoji, personas: [ids], creada } */
function leerListas() {
  const listas = leer(CLAVE_LISTAS, []);
  return Array.isArray(listas) ? listas : [];
}

let listas = leerListas();
let idListaEditando = null; // null = estamos creando una lista nueva

function guardarListas() {
  return guardar(CLAVE_LISTAS, listas);
}

function buscarLista(id) {
  return listas.find((l) => l.id === id);
}

// Comprueba el nombre de una lista. Devuelve el mensaje de error o "" si está bien.
function errorNombreLista(nombre, idPropio) {
  if (nombre.length < 2) return "Ponle un nombre a la lista (mínimo 2 letras).";
  const repetida = listas.some((l) => l.id !== idPropio && normalizar(l.nombre) === normalizar(nombre));
  return repetida ? "Ya tienes una lista con ese nombre." : "";
}

// CREATE: crea una lista nueva y la devuelve
// Devuelve el dibujo del icono de una lista (también entiende los emojis antiguos)
function iconoLista(lista, clase = "") {
  const nombre = EMOJI_A_ICONO[lista.emoji] || (ICONOS_LISTAS.includes(lista.emoji) ? lista.emoji : "guardado");
  return emoticono(nombre, clase);
}

function crearLista(nombre, emoji) {
  const lista = { id: crearId(), nombre, emoji, personas: [], creada: new Date().toISOString() };
  listas.push(lista);
  guardarListas();
  return lista;
}


/* ---------- 2. MIS LISTAS (en el perfil) ---------- */
function pintarRejillaListas() {
  listas = leerListas();
  const rejilla = $("rejilla-listas");
  rejilla.innerHTML = "";
  $("estado-sin-listas").hidden = listas.length > 0;

  listas.forEach((lista) => {
    const li = document.createElement("li");
    const enlace = document.createElement("a");
    enlace.className = "tarjeta-lista";
    enlace.href = "#lista";
    enlace.addEventListener("click", () => seleccionar("lista", lista.id));

    const emoji = iconoLista(lista, "tarjeta-lista__emoji");
    const nombre = document.createElement("strong");
    nombre.textContent = lista.nombre;
    const cuantas = document.createElement("small");
    cuantas.textContent = plural(lista.personas.length, "persona", "personas");

    enlace.append(emoji, nombre, cuantas);
    li.append(enlace);
    rejilla.append(li);
  });
}

// Los botones "+ Nueva lista" abren el formulario vacío
document.querySelectorAll("[data-nueva-lista]").forEach((boton) => {
  boton.addEventListener("click", () => { idListaEditando = null; });
});


/* ---------- 3. DETALLE DE UNA LISTA ---------- */
function pintarDetalleLista() {
  listas = leerListas();
  const lista = buscarLista(seleccion.lista);
  if (!lista) {
    irA("perfil");
    return;
  }

  $("lista-nombre").replaceChildren(iconoLista(lista), lista.nombre);
  $("lista-contador").textContent = plural(lista.personas.length, "persona", "personas");

  const ul = $("lista-personas");
  ul.innerHTML = "";
  lista.personas.map(buscarPersona).filter(Boolean).forEach((persona) => {
    ul.append(crearFilaPersona(persona, [{
      texto: "Quitar",
      etiqueta: `Quitar a ${persona.nombre} de la lista`,
      alPulsar: () => {
        // UPDATE: quitamos a la persona de la lista
        lista.personas = lista.personas.filter((id) => id !== persona.id);
        if (guardarListas()) mostrarAviso(`${persona.nombre} quitado de la lista`);
        pintarDetalleLista();
      }
    }]));
  });
  $("estado-lista-vacia").hidden = lista.personas.length > 0;
}

$("editar-lista").addEventListener("click", () => {
  idListaEditando = seleccion.lista;
  irA("formulario-lista");
});


/* ---------- 4. FORMULARIO DE LISTA ---------- */
const formLista = $("form-lista");

function prepararFormLista() {
  ICONOS_LISTAS.forEach((icono, i) => {
    $("opciones-emoji").insertAdjacentHTML("beforeend",
      `<input type="radio" name="emoji" id="emoji-${i}" value="${icono}">` +
      `<label for="emoji-${i}" class="chip" title="${icono}"><svg class="emoticono" aria-hidden="true"><use href="#e-${icono}"/></svg></label>`);
  });
}

function pintarFormLista() {
  listas = leerListas();
  limpiarErrores(formLista);
  const lista = buscarLista(idListaEditando);

  if (lista) {
    // MODO EDICIÓN
    $("titulo-form-lista").textContent = "Editar lista";
    $("boton-guardar-lista").textContent = "Guardar cambios";
    formLista.nombre.value = lista.nombre;
    formLista.emoji.value = EMOJI_A_ICONO[lista.emoji] || lista.emoji;
    $("volver-form-lista").href = "#lista";
    $("cancelar-form-lista").href = "#lista";
  } else {
    // MODO NUEVA
    idListaEditando = null;
    $("titulo-form-lista").textContent = "Nueva lista";
    $("boton-guardar-lista").textContent = "Crear lista";
    formLista.reset();
    formLista.emoji.value = ICONOS_LISTAS[0];
    $("volver-form-lista").href = "#perfil";
    $("cancelar-form-lista").href = "#perfil";
  }
}

formLista.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarErrores(formLista);

  const nombre = formLista.nombre.value.trim();
  const error = errorNombreLista(nombre, idListaEditando);
  if (error) {
    marcarError(formLista.nombre, error);
    formLista.nombre.focus();
    return;
  }

  if (idListaEditando) {
    // UPDATE: cambiamos nombre e icono
    const lista = buscarLista(idListaEditando);
    lista.nombre = nombre;
    lista.emoji = formLista.emoji.value;
    if (guardarListas()) mostrarAviso("Lista actualizada");
    seleccionar("lista", lista.id);
    idListaEditando = null;
    irA("lista");
  } else {
    // CREATE
    const lista = crearLista(nombre, formLista.emoji.value);
    mostrarAviso("Lista creada");
    seleccionar("lista", lista.id);
    irA("lista");
  }
});


/* ---------- 5. ELIMINAR LISTA ---------- */
$("eliminar-lista").addEventListener("click", () => {
  const lista = buscarLista(seleccion.lista);
  confirmar({
    titulo: `¿Eliminar "${lista.nombre}"?`,
    texto: "Se borrará la lista. Las personas que tenía no se borran de la app.",
    boton: "Sí, eliminar lista"
  }, () => {
    listas = listas.filter((l) => l.id !== lista.id); // DELETE
    seleccionar("lista", null);
    if (guardarListas()) mostrarAviso("Lista eliminada");
    irA("perfil");
  });
});


/* ---------- 6. DIÁLOGO "GUARDAR EN UNA LISTA" ---------- */
const dialogoListas = $("dialogo-listas");

// Pinta un checkbox por cada lista; marcado si la persona ya está dentro
function pintarOpcionesListas() {
  const persona = buscarPersona(seleccion.persona);
  const contenedor = $("opciones-listas");
  contenedor.innerHTML = '<legend class="sr-only">Tus listas</legend>';

  if (listas.length === 0) {
    contenedor.insertAdjacentHTML("beforeend", '<p class="nota">Todavía no tienes listas. Crea una aquí abajo.</p>');
  }

  listas.forEach((lista, i) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = "opcion-lista-" + i;
    input.checked = lista.personas.includes(persona.id);
    // UPDATE: al marcar o desmarcar se guarda al momento
    input.addEventListener("change", () => {
      if (input.checked) lista.personas.push(persona.id);
      else lista.personas = lista.personas.filter((id) => id !== persona.id);
      guardarListas();
      pintarBotonGuardarEnLista();
    });

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.className = "opcion-lista";
    label.replaceChildren(iconoLista(lista), lista.nombre);
    contenedor.append(input, label);
  });
}

// El botón del perfil indica si la persona ya está en alguna lista
function pintarBotonGuardarEnLista() {
  const persona = buscarPersona(seleccion.persona);
  if (!persona) return;
  const enCuantas = listas.filter((l) => l.personas.includes(persona.id)).length;
  textoConEmoticono($("guardar-en-lista"), "guardado", enCuantas > 0
    ? `Guardado en ${plural(enCuantas, "lista", "listas")}`
    : "Guardar en una lista");
}

$("guardar-en-lista").addEventListener("click", () => {
  listas = leerListas();
  const persona = buscarPersona(seleccion.persona);
  $("dialogo-listas-texto").textContent = `Marca las listas donde quieres guardar a ${persona.nombre}.`;
  pintarOpcionesListas();
  $("form-lista-rapida").reset();
  $("error-lista-rapida").hidden = true;
  dialogoListas.showModal();
});

// Crear una lista rápida desde el diálogo (y meter ya a la persona dentro)
$("form-lista-rapida").addEventListener("submit", (evento) => {
  evento.preventDefault();
  const input = $("nombre-lista-rapida");
  const nombre = input.value.trim();
  const error = errorNombreLista(nombre, null);
  // El aviso (toast) quedaría detrás del diálogo, así que el error se escribe dentro
  $("error-lista-rapida").textContent = error;
  $("error-lista-rapida").hidden = !error;
  if (error) {
    input.focus();
    return;
  }
  const lista = crearLista(nombre, ICONOS_LISTAS[0]);
  lista.personas.push(seleccion.persona);
  guardarListas();
  input.value = "";
  pintarOpcionesListas();
  pintarBotonGuardarEnLista();
});

$("cerrar-dialogo-listas").addEventListener("click", () => dialogoListas.close());


/* Apuntamos qué función rellena cada pantalla (ver PINTORES en app.js) */
Object.assign(PINTORES, {
  lista: pintarDetalleLista,
  "formulario-lista": pintarFormLista,
  // El perfil de una persona también necesita saber si está guardada en alguna lista
  persona: () => {
    pintarPersona();
    listas = leerListas();
    pintarBotonGuardarEnLista();
  }
});

PREPARAR.push(prepararFormLista);
