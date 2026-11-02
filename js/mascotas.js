/* =========================================================
   HOBBYMATCH · Mascotas
   Cada persona elige un compañero (oso, gato, ardilla o cotorra)
   que crece en 5 niveles según las quedadas que hace.
   Una quedada = un plan de la Cartelera al que te apuntas (planes.js).
   1. Datos de las mascotas y de los niveles
   2. Dibujos (SVG hechos con código, iguales que en el Figma)
   3. Elegir mascota (último paso al crear la cuenta)
   4. Tarjeta de la mascota en el perfil
   5. Aviso cuando la mascota sube de nivel
   6. Mascota de otras personas (ficha)
   Usa funciones de app.js ($, guardar, usuario...) y planes.js (misPlanes).
   ========================================================= */


/* ---------- 1. DATOS ---------- */
const MASCOTAS = {
  oso: { nombre: "Oso", lema: "El del escudo de Madrid", femenino: false },
  gato: { nombre: "Gato", lema: "Madrileño de toda la vida", femenino: false },
  ardilla: { nombre: "Ardilla", lema: "Vecina del Retiro", femenino: true },
  cotorra: { nombre: "Cotorra", lema: "La reina de los parques", femenino: true }
};

// Cada nivel empieza en un número de quedadas ("desde").
// "f" indica si el nombre de la mascota es femenino (la ardilla, la cotorra).
const NIVELES_MASCOTA = [
  { desde: 0, nombre: (m, f) => `${m} ${f ? "dormilona" : "dormilón"}`, texto: "Duerme la siesta hasta tu primera quedada." },
  { desde: 1, nombre: (m) => m, texto: "Abre los ojos y empieza a conocer Madrid." },
  { desde: 3, nombre: (m) => `${m} con bufanda`, texto: "Ya sale por el barrio y se apunta a todos los planes." },
  { desde: 6, nombre: (m, f) => `${m} ${f ? "castiza" : "castizo"}`, texto: "Gorra de chulapo y clavel: se conoce cada rincón." },
  { desde: 10, nombre: (m) => `${m} y el Madroño`, texto: "Nivel final: como en el escudo, ya alcanza su madroño." }
];

function miMascota() {
  return usuario && MASCOTAS[usuario.mascota] ? usuario.mascota : "oso";
}

function misQuedadas() {
  return misPlanes.length;
}

// Nivel (1 a 5) que corresponde a un número de quedadas
function nivelPorQuedadas(quedadas) {
  let nivel = 1;
  NIVELES_MASCOTA.forEach((n, i) => { if (quedadas >= n.desde) nivel = i + 1; });
  return nivel;
}

function nombreNivel(especie, nivel) {
  return NIVELES_MASCOTA[nivel - 1].nombre(MASCOTAS[especie].nombre, MASCOTAS[especie].femenino);
}

// "el Gato", "la Ardilla"
function conArticulo(especie) {
  return (MASCOTAS[especie].femenino ? "la " : "el ") + MASCOTAS[especie].nombre;
}


/* ---------- 2. DIBUJOS ----------
   Todas las mascotas comparten el mismo cuerpo redondo; cambian las orejas,
   la cara, la cola y los colores. Los accesorios (bufanda, gorra, clavel y madroño)
   se añaden según el nivel. Todo está en un cuadro de 200 × 200. */
const TINTA = "#151F36";
const COLORES_MASCOTA = {
  oso: { piel: "#B07A55", claro: "#F4E6CF" },
  gato: { piel: "#F5AE84", claro: "#FFF3E6", raya: "#BE7C56" },
  ardilla: { piel: "#C9713F", claro: "#F7E2C6" },
  cotorra: { piel: "#76CBA4", claro: "#C9F2DE", ala: "#55997A", pico: "#F2D879" }
};
const FONDOS_NIVEL = ["#E2FCFD", "#FAF9C8", "#F1C1D6", "#A2F3CE", "#F5F0A1"];
const MANCHA = "M104 8C160 8 196 46 194 102C192 158 154 194 98 194C42 194 6 156 6 100C6 44 48 8 104 8Z";

// Relleno + borde oscuro (el estilo de los emoticonos de la app)
const trazo = (relleno, grosor = 5) =>
  `fill="${relleno}" stroke="${TINTA}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round"`;
const linea = (d, grosor = 4, color = TINTA) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round" stroke-linejoin="round"/>`;

function partesDetras(especie) {
  const c = COLORES_MASCOTA[especie];
  if (especie === "ardilla") return `<path d="M128 168C170 170 186 128 172 92C162 64 132 62 128 86C150 88 156 112 146 128C138 140 124 146 128 168Z" ${trazo(c.piel)}/>` + linea("M150 92C160 104 162 122 154 138", 3.5, "#E89A6A");
  if (especie === "gato") return linea("M134 172C164 176 176 150 166 128", 14) + linea("M134 172C164 176 176 150 166 128", 6, c.piel);
  if (especie === "cotorra") return `<path d="M86 172L78 196L100 186L122 196L114 172Z" ${trazo(c.ala)}/>`;
  return "";
}

function partesCuerpo(especie, brazoArriba) {
  const c = COLORES_MASCOTA[especie];
  let svg = "";
  for (const x of [72, 128]) {
    svg += especie === "cotorra"
      ? linea(`M${x - 12} 182H${x + 12}M${x} 172V182M${x} 182L${x - 6} 188M${x} 182L${x + 6} 188`, 5)
      : `<ellipse cx="${x}" cy="180" rx="17" ry="11" ${trazo(c.piel)}/>`;
  }
  svg += `<ellipse cx="100" cy="142" rx="46" ry="42" ${trazo(c.piel)}/><ellipse cx="100" cy="150" rx="27" ry="23" fill="${c.claro}"/>`;
  const brazo = especie === "cotorra" ? c.ala : c.piel;
  svg += `<ellipse cx="58" cy="140" rx="12" ry="20" transform="rotate(20 58 140)" ${trazo(brazo)}/>`;
  svg += brazoArriba
    ? `<ellipse cx="146" cy="104" rx="12" ry="22" transform="rotate(-35 146 104)" ${trazo(brazo)}/>`
    : `<ellipse cx="142" cy="140" rx="12" ry="20" transform="rotate(-20 142 140)" ${trazo(brazo)}/>`;
  return svg;
}

function partesOrejas(especie) {
  const c = COLORES_MASCOTA[especie];
  if (especie === "oso") return [62, 138].map((x) => `<circle cx="${x}" cy="46" r="17" ${trazo(c.piel)}/><circle cx="${x}" cy="46" r="8" fill="#F0A1C3"/>`).join("");
  if (especie === "gato") return `<path d="M60 64L58 22L92 44Z" ${trazo(c.piel)}/><path d="M66 54L65 34L82 45Z" fill="#F0A1C3"/><path d="M140 64L142 22L108 44Z" ${trazo(c.piel)}/><path d="M134 54L135 34L118 45Z" fill="#F0A1C3"/>`;
  if (especie === "ardilla") return `<path d="M64 60C56 40 60 22 72 14C80 28 84 42 82 52Z" ${trazo(c.piel)}/><path d="M136 60C144 40 140 22 128 14C120 28 116 42 118 52Z" ${trazo(c.piel)}/>` + linea("M72 14L68 6M72 14L76 6", 3) + linea("M128 14L124 6M128 14L132 6", 3);
  return `<path d="M94 40C90 26 98 16 106 14C104 24 108 32 104 40Z" ${trazo(c.piel)}/>`; // cresta de la cotorra
}

function partesCara(especie, dormido) {
  const c = COLORES_MASCOTA[especie];
  let svg = `<circle cx="100" cy="82" r="45" ${trazo(c.piel)}/>`;
  if (especie === "oso") svg += `<ellipse cx="100" cy="98" rx="21" ry="16" ${trazo(c.claro)}/><ellipse cx="100" cy="90" rx="7.5" ry="5.5" fill="${TINTA}"/>` + linea("M92 100Q100 108 108 100");
  if (especie === "gato") svg += linea("M100 38V50", 4, c.raya) + linea("M88 40L90 50", 4, c.raya) + linea("M112 40L110 50", 4, c.raya) + `<path d="M94 90H106L100 97Z" fill="#F0A1C3" stroke="${TINTA}" stroke-width="3" stroke-linejoin="round"/>` + linea("M100 97Q94 104 89 100") + linea("M100 97Q106 104 111 100") + linea("M56 92L76 94M56 102L76 99", 3) + linea("M144 92L124 94M144 102L124 99", 3);
  if (especie === "ardilla") svg += `<ellipse cx="100" cy="98" rx="20" ry="15" fill="${c.claro}"/><ellipse cx="100" cy="91" rx="6" ry="4.5" fill="${TINTA}"/>` + linea("M93 98Q100 103 107 98") + `<path d="M96 101H104V109H96Z" fill="#FFF" stroke="${TINTA}" stroke-width="3" stroke-linejoin="round"/>` + linea("M100 101V109", 2.5);
  if (especie === "cotorra") svg += `<ellipse cx="100" cy="100" rx="30" ry="20" fill="${c.claro}"/><path d="M88 88C90 78 112 78 114 88C116 100 106 110 100 112C98 104 90 98 88 88Z" ${trazo(c.pico)}/>` + linea("M90 92C96 96 106 96 112 92", 3);
  const yOjos = especie === "cotorra" ? 72 : 76;
  for (const x of [81, 119]) {
    svg += dormido
      ? linea(`M${x - 7} ${yOjos}Q${x} ${yOjos + 6} ${x + 7} ${yOjos}`)
      : `<circle cx="${x}" cy="${yOjos}" r="6" fill="${TINTA}"/><circle cx="${x + 2}" cy="${yOjos - 2}" r="2" fill="#FFF"/>`;
  }
  svg += `<ellipse cx="70" cy="94" rx="7" ry="4.5" fill="#F0A1C3" opacity=".85"/><ellipse cx="130" cy="94" rx="7" ry="4.5" fill="#F0A1C3" opacity=".85"/>`;
  return svg;
}

// Accesorios
const BUFANDA = `<path d="M62 116Q100 134 138 116L140 128Q100 146 60 128Z" ${trazo("#42ECF1")}/><path d="M118 128L124 160L108 158L106 133Z" ${trazo("#42ECF1")}/>` + linea("M110 150H122M109 142H121", 3);
const CLAVEL = linea("M66 132L60 150", 4, "#55997A") + `<circle cx="68" cy="126" r="9" ${trazo("#E5484D")}/><path d="M62 124L68 130L74 123" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
const GORRA = `<path d="M58 60C58 34 80 22 102 22C126 22 144 34 144 58C130 52 116 50 100 50C84 50 70 54 58 60Z" ${trazo("#3B4860")}/><path d="M62 52C80 44 120 44 140 52" fill="none" stroke="#8290A6" stroke-width="3"/><path d="M86 26V48M104 23V48M122 27V49" stroke="#8290A6" stroke-width="3"/><path d="M54 60C66 52 88 50 100 52C88 58 72 64 56 66Z" ${trazo(TINTA)}/><circle cx="102" cy="22" r="5" ${trazo("#3B4860")}/>`;
const ZZZ = linea("M146 30H162L146 48H162") + linea("M168 12H178L168 24H178", 3.5);
const MADRONO = `<path d="M158 172V118" stroke="${TINTA}" stroke-width="14" stroke-linecap="round"/><path d="M158 172V118" stroke="#8E5E3F" stroke-width="6" stroke-linecap="round"/><path d="M128 92C126 70 142 56 160 57C180 56 192 72 190 92C191 110 176 120 160 118C142 120 129 110 128 92Z" ${trazo("#76CBA4")}/>` +
  [[146, 78], [168, 72], [178, 96], [156, 100], [140, 98], [164, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" ${trazo("#E5484D", 3)}/>`).join("");

// Devuelve el SVG completo (texto) de una mascota en un nivel
function svgMascota(especie, nivel) {
  const dormido = nivel === 1;
  const brazoArriba = nivel === 5;
  let dibujo = partesDetras(especie) + partesCuerpo(especie, brazoArriba) + partesOrejas(especie) + partesCara(especie, dormido);
  if (nivel >= 3) dibujo += BUFANDA;
  if (nivel >= 4) dibujo += CLAVEL + GORRA;

  // Tamaño y posición según el nivel: cuanto más nivel, más grande
  const escala = [0.72, 0.8, 0.86, 0.9, 0.78][nivel - 1];
  const moverX = nivel === 5 ? -30 : 0; // en el nivel 5 se aparta para dejar sitio al madroño
  const x = 100 + moverX - 100 * escala;
  const y = 196 - 196 * escala;

  return `<svg viewBox="0 0 200 200" aria-hidden="true"><path d="${MANCHA}" fill="${FONDOS_NIVEL[nivel - 1]}"/>` +
    (nivel === 5 ? MADRONO : "") +
    `<g transform="translate(${x} ${y}) scale(${escala})">${dibujo}</g>` +
    (dormido ? ZZZ : "") + "</svg>";
}

// Crea un <span> con el dibujo dentro (la clase decide el tamaño en el CSS)
function crearMascota(especie, nivel, clase = "") {
  const span = document.createElement("span");
  span.className = ("mascota " + clase).trim();
  span.innerHTML = svgMascota(especie, nivel);
  return span;
}


/* ---------- 3. ELEGIR MASCOTA ----------
   Opciones con radio buttons (como los barrios). Se usan en dos sitios:
   la pantalla "Elige tu compañero" y el formulario de Editar perfil. */
function pintarOpcionesMascota(contenedor, nombreGrupo) {
  contenedor.innerHTML = "";
  Object.entries(MASCOTAS).forEach(([clave, datos]) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = nombreGrupo;
    input.id = `${nombreGrupo}-${clave}`;
    input.value = clave;

    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.className = "opcion-mascota";
    const nombre = document.createElement("strong");
    nombre.className = "opcion-mascota__nombre";
    nombre.textContent = datos.nombre;
    const lema = document.createElement("small");
    lema.className = "opcion-mascota__lema";
    lema.textContent = datos.lema;
    label.append(crearMascota(clave, 2, "opcion-mascota__dibujo"), nombre, lema);

    contenedor.append(input, label);
  });
}

function prepararMascotas() {
  pintarOpcionesMascota($("opciones-mascota"), "mascota");
  pintarOpcionesMascota($("editar-mascota"), "mascota-perfil");

  // El botón dice el nombre de la mascota marcada
  $("opciones-mascota").addEventListener("change", (evento) => {
    $("guardar-mascota").textContent = `Quedarme con ${conArticulo(evento.target.value)}`;
  });
}

function pintarElegirMascota() {
  const marcada = $(`mascota-${miMascota()}`);
  marcada.checked = true;
  marcada.dispatchEvent(new Event("change", { bubbles: true }));
}

$("guardar-mascota").addEventListener("click", () => {
  const elegida = document.querySelector('input[name="mascota"]:checked');
  usuario.mascota = elegida ? elegida.value : "oso";
  usuario.nivelMascota = nivelPorQuedadas(misQuedadas());
  if (guardar(CLAVE_USUARIO, usuario)) mostrarAviso(`¡${MASCOTAS[usuario.mascota].nombre} se viene contigo!`);
  irA("inicio");
});


/* ---------- 4. TARJETA EN EL PERFIL ---------- */
function pintarTarjetaMascota() {
  const especie = miMascota();
  const quedadas = misQuedadas();
  const nivel = nivelPorQuedadas(quedadas);

  $("mascota-dibujo").replaceChildren(crearMascota(especie, nivel, "mascota--grande"));
  $("mascota-nivel").textContent = `Tu ${MASCOTAS[especie].nombre.toLowerCase()} · nivel ${nivel} de 5`;
  $("mascota-nombre").textContent = nombreNivel(especie, nivel);

  // Barra de progreso hasta el siguiente nivel
  const barra = $("mascota-progreso");
  if (nivel === 5) {
    barra.value = 1;
    barra.max = 1;
    $("mascota-texto").textContent = `${plural(quedadas, "quedada", "quedadas")} · ¡nivel máximo!`;
  } else {
    const desde = NIVELES_MASCOTA[nivel - 1].desde;
    const hasta = NIVELES_MASCOTA[nivel].desde;
    barra.max = hasta - desde;
    barra.value = quedadas - desde;
    const faltan = hasta - quedadas;
    $("mascota-texto").textContent =
      `${plural(quedadas, "quedada", "quedadas")} · ${faltan} más para ${nombreNivel(especie, nivel + 1)}`;
  }

  // Los 5 niveles en pequeño: los que aún no tienes salen apagados
  const fila = $("mascota-niveles");
  fila.innerHTML = "";
  for (let n = 1; n <= 5; n++) {
    const li = document.createElement("li");
    li.className = "mascota-niveles__item" + (n > nivel ? " mascota-niveles__item--bloqueado" : "") + (n === nivel ? " mascota-niveles__item--actual" : "");
    li.title = `Nivel ${n}: ${nombreNivel(especie, n)} (desde ${plural(NIVELES_MASCOTA[n - 1].desde, "quedada", "quedadas")})`;
    li.append(crearMascota(especie, n));
    fila.append(li);
  }

}


/* ---------- 5. AVISO AL SUBIR DE NIVEL ----------
   planes.js nos llama después de cada "Me apunto". Guardamos el último nivel visto
   para enseñar la celebración solo una vez por nivel. */
function comprobarNivelMascota() {
  if (!usuario) return;
  const nivel = nivelPorQuedadas(misQuedadas());
  const anterior = usuario.nivelMascota || 1;
  if (nivel !== anterior) {
    usuario.nivelMascota = nivel;
    guardar(CLAVE_USUARIO, usuario);
  }
  if (nivel > anterior) {
    const especie = miMascota();
    $("dialogo-mascota-nivel").textContent = `¡Nivel ${nivel}!`;
    $("dialogo-mascota-dibujo").replaceChildren(crearMascota(especie, nivel, "mascota--dialogo"));
    $("dialogo-mascota-titulo").textContent = `¡Tu ${MASCOTAS[especie].nombre.toLowerCase()} ha crecido!`;
    $("dialogo-mascota-texto").textContent =
      `Ya llevas ${plural(misQuedadas(), "quedada", "quedadas")} y ha pasado a ser «${nombreNivel(especie, nivel)}». ${NIVELES_MASCOTA[nivel - 1].texto}`;
    $("dialogo-mascota").showModal();
  }
}

$("cerrar-dialogo-mascota").addEventListener("click", () => $("dialogo-mascota").close());


/* ---------- 6. MASCOTA DE OTRAS PERSONAS ----------
   Las personas de ejemplo no tienen mascota guardada: se la damos a partir de su id
   para que siempre sea la misma. */
function mascotaDePersona(persona) {
  const numero = parseInt(String(persona.id).replace(/\D/g, ""), 10) || 0;
  const especies = Object.keys(MASCOTAS);
  return {
    especie: persona.mascota || especies[numero % especies.length],
    quedadas: persona.quedadas ?? (numero * 3) % 13
  };
}

function pintarMascotaPersona(persona) {
  const { especie, quedadas } = mascotaDePersona(persona);
  const nivel = nivelPorQuedadas(quedadas);
  const chip = $("persona-mascota");
  const textos = document.createElement("span");
  textos.className = "chip-mascota__textos";
  const nombre = document.createElement("strong");
  nombre.textContent = nombreNivel(especie, nivel);
  const detalle = document.createElement("small");
  detalle.textContent = `${plural(quedadas, "quedada", "quedadas")} en HobbyMatch`;
  textos.append(nombre, detalle);
  chip.replaceChildren(crearMascota(especie, nivel, "chip-mascota__dibujo"), textos);
}


/* Apuntamos qué función rellena cada pantalla (ver PINTORES en app.js) */
PINTORES.mascota = pintarElegirMascota;
PREPARAR.push(prepararMascotas);
