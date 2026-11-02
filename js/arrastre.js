/* =========================================================
   HOBBYMATCH · Simular el dedo en la vista móvil (movil.html)
   En un móvil la pantalla se mueve deslizando el dedo y no hay barra de scroll.
   En el ordenador, dentro del marco de movil.html, lo imitamos así:
   - escondemos las barras de scroll (clase "en-marco" + CSS)
   - al arrastrar con el ratón, la pantalla se mueve
   - al soltar, sigue moviéndose un poco y frena poco a poco (inercia)
   Solo se activa dentro del marco: en index.html normal no hace nada.
   ========================================================= */

(() => {
  // window.self !== window.top → la página está dentro de un <iframe>
  if (window.self === window.top) return;
  document.documentElement.classList.add("en-marco");

  const UMBRAL = 6;        // píxeles que hay que mover para que cuente como arrastre (y no como clic)
  const ROZAMIENTO = 0.94; // cuánto frena la inercia en cada fotograma (1 = nunca frena)

  let arrastre = null;     // datos del arrastre en curso
  let animacion = null;    // id de requestAnimationFrame de la inercia
  let anularClic = false;  // si has arrastrado, el clic del final no debe abrir nada

  // Elementos que se deslizan en horizontal (carruseles y filas de chips)
  function buscarHorizontal(elemento) {
    return elemento.closest(".carrusel, .filtros, .carteles");
  }

  // En estos elementos el ratón se usa normal (escribir, elegir texto, desplegables...)
  function esCampo(elemento) {
    return elemento.closest("input, textarea, select, dialog");
  }

  function pararInercia() {
    cancelAnimationFrame(animacion);
    animacion = null;
  }

  document.addEventListener("pointerdown", (evento) => {
    if (evento.pointerType !== "mouse" || evento.button !== 0 || esCampo(evento.target)) return;
    pararInercia();
    arrastre = {
      x: evento.clientX,
      y: evento.clientY,
      horizontal: buscarHorizontal(evento.target), // por si arrastra un carrusel
      direccion: null,   // "x" o "y": se decide al empezar a mover
      velocidad: 0,
      ultimaPos: 0,
      ultimoTiempo: 0
    };
    anularClic = false;
  });

  document.addEventListener("pointermove", (evento) => {
    if (!arrastre) return;
    const dx = evento.clientX - arrastre.x;
    const dy = evento.clientY - arrastre.y;

    // Todavía no sabemos si es un clic o un arrastre
    if (!arrastre.direccion) {
      if (Math.abs(dx) < UMBRAL && Math.abs(dy) < UMBRAL) return;
      arrastre.direccion = arrastre.horizontal && Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      arrastre.ultimaPos = arrastre.direccion === "x" ? evento.clientX : evento.clientY;
      arrastre.ultimoTiempo = performance.now();
      document.documentElement.classList.add("arrastrando");
      anularClic = true;
    }

    // Movemos la pantalla (o el carrusel) lo mismo que se ha movido el ratón, al revés
    const posicion = arrastre.direccion === "x" ? evento.clientX : evento.clientY;
    const paso = arrastre.ultimaPos - posicion;
    if (arrastre.direccion === "x") arrastre.horizontal.scrollLeft += paso;
    else window.scrollBy(0, paso);

    // Guardamos la velocidad para la inercia
    const ahora = performance.now();
    const tiempo = Math.max(ahora - arrastre.ultimoTiempo, 1);
    arrastre.velocidad = paso / tiempo * 16; // píxeles por fotograma (aprox. 60 fps)
    arrastre.ultimaPos = posicion;
    arrastre.ultimoTiempo = ahora;
  });

  function soltar() {
    if (!arrastre) return;
    const { direccion, horizontal } = arrastre;
    let velocidad = arrastre.velocidad;
    arrastre = null;
    document.documentElement.classList.remove("arrastrando");
    if (!direccion) return; // fue un clic normal

    // INERCIA: seguimos moviendo y cada fotograma vamos más despacio
    function frenar() {
      velocidad *= ROZAMIENTO;
      if (Math.abs(velocidad) < 0.5) return;
      if (direccion === "x") horizontal.scrollLeft += velocidad;
      else window.scrollBy(0, velocidad);
      animacion = requestAnimationFrame(frenar);
    }
    animacion = requestAnimationFrame(frenar);
  }

  document.addEventListener("pointerup", soltar);
  document.addEventListener("pointercancel", soltar);
  window.addEventListener("blur", soltar);

  // Si has arrastrado, anulamos el clic del final (si no, abriría la tarjeta donde soltaste)
  document.addEventListener("click", (evento) => {
    if (anularClic) {
      evento.preventDefault();
      evento.stopPropagation();
      anularClic = false;
    }
  }, true); // true = lo capturamos antes que nadie

  // Al arrastrar, el navegador intenta "coger" imágenes y enlaces: lo evitamos
  document.addEventListener("dragstart", (evento) => evento.preventDefault());
})();
