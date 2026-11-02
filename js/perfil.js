/* =========================================================
   HOBBYMATCH · Mi perfil
   1. Ver mi perfil (READ): foto, nombre, descripción, barrio, preferencias y listas
   2. Editar perfil (UPDATE): foto, nombre, descripción, barrio, mascota y preferencias
   3. Borrar preferencias (DELETE)
   4. Cerrar sesión y eliminar cuenta (DELETE usuario)
   Usa funciones y variables de app.js, social.js y listas.js.
   ========================================================= */


/* ---------- 1. VER MI PERFIL ---------- */
function pintarPerfil() {
  pintarAvatar($("perfil-foto"), usuario.nombre, usuario.foto);
  $("perfil-nombre").textContent = usuario.nombre;
  textoConEmoticono($("perfil-barrio"), "barrio", `${usuario.barrio || "Sin barrio"}, Madrid`);
  $("perfil-descripcion").textContent = usuario.descripcion || "Aún no has escrito nada sobre ti.";

  // Datos de resumen
  $("perfil-dato-aficiones").textContent = aficiones.length;
  $("perfil-dato-amigos").textContent = leerAmistades().amigos.length;
  $("perfil-dato-listas").textContent = leerListas().length;

  // PREFERENCIAS: categorías elegidas, cada una con su color
  const lista = $("perfil-preferencias");
  lista.innerHTML = "";
  (usuario.categorias || []).forEach((nombre) => {
    const li = document.createElement("li");
    li.className = "etiqueta-aficion";
    pintarColorCategoria(li, nombre);
    textoConEmoticono(li, emoticonoCategoria(nombre), nombre);
    lista.append(li);
  });
  if (!usuario.categorias || usuario.categorias.length === 0) {
    lista.innerHTML = '<li class="nota">No tienes preferencias. Pulsa "Editar" para elegir categorías.</li>';
  }
  textoConEmoticono($("perfil-alcance"), "alcance", usuario.alcance === "barrio"
    ? `Te enseñamos gente solo de ${usuario.barrio}.`
    : "Te enseñamos gente de toda Madrid.");

  pintarTarjetaMascota(); // mascotas.js
  pintarRejillaListas(); // listas.js
}


/* ---------- 2. EDITAR PERFIL ---------- */
const formPerfil = $("form-perfil");
let fotoNueva; // foto elegida en el formulario (undefined = no se ha tocado)

// Se rellena una sola vez: barrios (sacados de la pantalla "¿Dónde vives?") y categorías
function prepararFormPerfil() {
  document.querySelectorAll('input[name="barrio"]').forEach((radio) => {
    formPerfil.barrio.add(new Option(radio.value, radio.value));
  });

  CATEGORIAS.forEach((c, i) => {
    $("editar-preferencias").insertAdjacentHTML("beforeend",
      `<input type="checkbox" name="preferencia" id="pref-${i}" value="${c.nombre}"><label for="pref-${i}" class="chip">` +
      `<svg class="emoticono" aria-hidden="true"><use href="#e-${c.clave}"/></svg>${c.nombre}</label>`);
  });
}

function pintarEditarPerfil() {
  limpiarErrores(formPerfil);
  fotoNueva = undefined;
  pintarAvatar($("editar-foto-vista"), usuario.nombre, usuario.foto);
  $("quitar-foto").hidden = !usuario.foto;

  formPerfil.nombre.value = usuario.nombre;
  formPerfil.descripcion.value = usuario.descripcion || "";
  formPerfil.barrio.value = usuario.barrio || "";
  formPerfil.querySelectorAll('input[name="preferencia"]').forEach((check) => {
    check.checked = (usuario.categorias || []).includes(check.value);
  });
  formPerfil.alcance.value = usuario.alcance || "madrid";
  $(`mascota-perfil-${miMascota()}`).checked = true; // mascotas.js
}

/* FOTO: leemos la imagen con FileReader y la reducimos con un <canvas> a 240 × 240 px.
   Así ocupa poco (localStorage solo admite unos 5 MB) y se puede guardar como texto. */
$("input-foto").addEventListener("change", (evento) => {
  const archivo = evento.target.files[0];
  if (!archivo) return;
  if (!archivo.type.startsWith("image/")) {
    mostrarAviso("Ese archivo no es una imagen", true);
    return;
  }

  const lector = new FileReader();
  lector.addEventListener("load", () => {
    const imagen = new Image();
    imagen.addEventListener("load", () => {
      const lado = 240;
      const canvas = document.createElement("canvas");
      canvas.width = lado;
      canvas.height = lado;
      // Recortamos un cuadrado del centro de la foto
      const minimo = Math.min(imagen.width, imagen.height);
      const x = (imagen.width - minimo) / 2;
      const y = (imagen.height - minimo) / 2;
      canvas.getContext("2d").drawImage(imagen, x, y, minimo, minimo, 0, 0, lado, lado);

      fotoNueva = canvas.toDataURL("image/jpeg", 0.8); // la foto convertida en texto
      pintarAvatar($("editar-foto-vista"), formPerfil.nombre.value || usuario.nombre, fotoNueva);
      $("quitar-foto").hidden = false;
    });
    imagen.addEventListener("error", () => mostrarAviso("No se ha podido abrir la imagen", true));
    imagen.src = lector.result;
  });
  lector.readAsDataURL(archivo);
  evento.target.value = ""; // permite volver a elegir la misma foto
});

$("quitar-foto").addEventListener("click", () => {
  fotoNueva = null; // null = quitar la foto al guardar
  pintarAvatar($("editar-foto-vista"), formPerfil.nombre.value || usuario.nombre, null);
  $("quitar-foto").hidden = true;
});

formPerfil.addEventListener("submit", (evento) => {
  evento.preventDefault();
  limpiarErrores(formPerfil);

  const nombre = formPerfil.nombre.value.trim();
  if (nombre.length < 2) {
    marcarError(formPerfil.nombre, "Escribe tu nombre (mínimo 2 letras).");
    formPerfil.nombre.focus();
    return;
  }

  // UPDATE: cambiamos los datos del usuario y guardamos
  usuario.nombre = nombre;
  usuario.descripcion = formPerfil.descripcion.value.trim();
  usuario.barrio = formPerfil.barrio.value;
  usuario.categorias = [...formPerfil.querySelectorAll('input[name="preferencia"]:checked')].map((c) => c.value);
  usuario.alcance = formPerfil.alcance.value;
  usuario.mascota = formPerfil.querySelector('input[name="mascota-perfil"]:checked').value;
  if (fotoNueva !== undefined) usuario.foto = fotoNueva;

  if (guardar(CLAVE_USUARIO, usuario)) mostrarAviso("Perfil actualizado");
  irA("perfil");
});


/* ---------- 3. BORRAR PREFERENCIAS ---------- */
$("borrar-preferencias").addEventListener("click", () => {
  confirmar({
    titulo: "¿Borrar tus preferencias?",
    texto: "Se quitarán tus categorías favoritas y volverás a ver gente de toda Madrid. Tus aficiones no se tocan.",
    boton: "Sí, borrar"
  }, () => {
    usuario.categorias = [];
    usuario.alcance = "madrid";
    if (guardar(CLAVE_USUARIO, usuario)) mostrarAviso("Preferencias borradas");
    irA("perfil");
  });
});


/* ---------- 4. CERRAR SESIÓN Y ELIMINAR CUENTA ---------- */
$("cerrar-sesion").addEventListener("click", () => {
  usuario.sesionCerrada = true; // los datos se quedan, pero hay que volver a entrar
  guardar(CLAVE_USUARIO, usuario);
  usuario = null;
  mostrarAviso("Has cerrado sesión");
  irA("bienvenida");
});

$("eliminar-cuenta").addEventListener("click", () => {
  confirmar({
    titulo: "¿Eliminar tu cuenta?",
    texto: "Se borrarán tu perfil, tus aficiones, tus amistades y tus listas de este navegador. No se puede deshacer.",
    boton: "Sí, eliminar mi cuenta"
  }, () => {
    borrarDatosDeUsuario(); // DELETE de todo
    usuario = null;
    amistades = leerAmistades();
    mostrarAviso("Cuenta eliminada");
    irA("bienvenida");
  });
});


/* Apuntamos qué función rellena cada pantalla (ver PINTORES en app.js) */
Object.assign(PINTORES, {
  perfil: pintarPerfil,
  "editar-perfil": pintarEditarPerfil
});

PREPARAR.push(prepararFormPerfil);
