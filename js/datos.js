/* =========================================================
   HOBBYMATCH · Datos fijos de la app
   Aquí solo hay información que NO cambia mientras se usa la app
   (catálogo de categorías, opciones de los formularios y gente de ejemplo).
   Los datos del usuario se guardan en localStorage desde app.js.
   ========================================================= */

// Categorías: "clave" coincide con el nombre de las variables CSS (--deportes-500, etc.)
const CATEGORIAS = [
  { nombre: "Deportes", clave: "deportes", aficiones: ["Senderismo", "Fútbol", "Baloncesto", "Pádel", "Running", "Gimnasio", "Escalada", "Bolos"] },
  { nombre: "Videojuegos", clave: "videojuegos", aficiones: ["Videojuegos PC", "Videojuegos consola", "Realidad virtual", "Consolas retro"] },
  { nombre: "Gastronomía", clave: "gastronomia", aficiones: ["Repostería", "Catas gastronómicas", "Cocina internacional", "Cocina saludable"] },
  { nombre: "Arte", clave: "arte", aficiones: ["Dibujo", "Pintura", "Fotografía", "Diseño gráfico", "Cerámica"] },
  { nombre: "Música", clave: "musica", aficiones: ["Conciertos", "Festivales", "Karaoke", "Tocar instrumentos", "Salsa", "Bachata", "Hip-hop", "Flamenco"] },
  { nombre: "Cine", clave: "cine", aficiones: ["Terror", "Ciencia ficción", "Anime", "Comedia"] },
  { nombre: "Juegos de Mesa", clave: "juegos", aficiones: ["Juegos de mesa", "Escape rooms", "Figuras", "Cómics"] },
  { nombre: "Viajes", clave: "viajes", aficiones: ["Viajes", "Acampada"] },
  { nombre: "Cultura", clave: "cultura", aficiones: ["Museos", "Teatro", "Exposiciones"] },
  { nombre: "Animales", clave: "animales", aficiones: ["Perros", "Gatos", "Voluntariado animal"] },
  { nombre: "Moda", clave: "moda", aficiones: ["Streetwear", "Moda vintage", "Maquillaje", "Estilismo"] }
];

// Opciones de los formularios
const NIVELES = ["Principiante", "Intermedio", "Avanzado"];
const FRECUENCIAS = ["Ocasional", "Mensual", "Semanal", "Varias por semana"];

// Gente de ejemplo de Madrid (sustituye a una base de datos real en este MVP).
// Cada persona tiene un id para poder enlazarla (amistades, listas...).
const PERSONAS_EJEMPLO = [
  { id: "p1", nombre: "Marta", edad: 27, barrio: "Chamberí", descripcion: "Monte los findes y conciertos entre semana. Siempre con ganas de un plan nuevo.",
    aficiones: [{ nombre: "Senderismo", categoria: "Deportes" }, { nombre: "Escalada", categoria: "Deportes" }, { nombre: "Conciertos", categoria: "Música" }, { nombre: "Pádel", categoria: "Deportes" }] },
  { id: "p2", nombre: "Dani", edad: 31, barrio: "Tetuán", descripcion: "Gamer de consola y de festivales. Busco equipo para jugar online.",
    aficiones: [{ nombre: "Videojuegos consola", categoria: "Videojuegos" }, { nombre: "Conciertos", categoria: "Música" }, { nombre: "Festivales", categoria: "Música" }] },
  { id: "p3", nombre: "Irene", edad: 24, barrio: "Moncloa", descripcion: "Estudio Bellas Artes. Me encanta dibujar al aire libre y escalar.",
    aficiones: [{ nombre: "Dibujo", categoria: "Arte" }, { nombre: "Escalada", categoria: "Deportes" }, { nombre: "Senderismo", categoria: "Deportes" }] },
  { id: "p4", nombre: "Jorge", edad: 29, barrio: "Chamberí", descripcion: "Repostero aficionado. Si haces catas, avísame.",
    aficiones: [{ nombre: "Repostería", categoria: "Gastronomía" }, { nombre: "Catas gastronómicas", categoria: "Gastronomía" }, { nombre: "Festivales", categoria: "Música" }] },
  { id: "p5", nombre: "Lucía", edad: 26, barrio: "Retiro", descripcion: "Museos, teatro y cine de autor. Siempre llevo un libro encima.",
    aficiones: [{ nombre: "Museos", categoria: "Cultura" }, { nombre: "Teatro", categoria: "Cultura" }, { nombre: "Ciencia ficción", categoria: "Cine" }] },
  { id: "p6", nombre: "Sergio", edad: 33, barrio: "Usera", descripcion: "Organizo partidas de juegos de mesa los jueves. ¡Se busca gente!",
    aficiones: [{ nombre: "Juegos de mesa", categoria: "Juegos de Mesa" }, { nombre: "Pádel", categoria: "Deportes" }, { nombre: "Escape rooms", categoria: "Juegos de Mesa" }] },
  { id: "p7", nombre: "Ana", edad: 28, barrio: "Salamanca", descripcion: "Moda vintage y fotografía. Me paso el día en el Rastro.",
    aficiones: [{ nombre: "Moda vintage", categoria: "Moda" }, { nombre: "Fotografía", categoria: "Arte" }, { nombre: "Estilismo", categoria: "Moda" }] },
  { id: "p8", nombre: "Pablo", edad: 30, barrio: "Arganzuela", descripcion: "Tengo un perro que se llama Tofu. Viajo siempre que puedo.",
    aficiones: [{ nombre: "Perros", categoria: "Animales" }, { nombre: "Viajes", categoria: "Viajes" }, { nombre: "Acampada", categoria: "Viajes" }] },
  { id: "p9", nombre: "Nerea", edad: 25, barrio: "Latina", descripcion: "Cocina internacional y escapadas de fin de semana.",
    aficiones: [{ nombre: "Cocina internacional", categoria: "Gastronomía" }, { nombre: "Viajes", categoria: "Viajes" }, { nombre: "Juegos de mesa", categoria: "Juegos de Mesa" }] },
  { id: "p10", nombre: "Hugo", edad: 22, barrio: "Vallecas", descripcion: "Anime, PC y realidad virtual. Pregúntame por mis series.",
    aficiones: [{ nombre: "Videojuegos PC", categoria: "Videojuegos" }, { nombre: "Anime", categoria: "Cine" }, { nombre: "Realidad virtual", categoria: "Videojuegos" }] },
  { id: "p11", nombre: "Carla", edad: 27, barrio: "Centro", descripcion: "Canto en un coro y no me pierdo un concierto ni una expo.",
    aficiones: [{ nombre: "Conciertos", categoria: "Música" }, { nombre: "Exposiciones", categoria: "Cultura" }, { nombre: "Karaoke", categoria: "Música" }] },
  { id: "p12", nombre: "Álex", edad: 35, barrio: "Hortaleza", descripcion: "Voluntario en una protectora. Pádel los domingos.",
    aficiones: [{ nombre: "Voluntariado animal", categoria: "Animales" }, { nombre: "Pádel", categoria: "Deportes" }, { nombre: "Juegos de mesa", categoria: "Juegos de Mesa" }] }
];

// Añadimos a cada persona la lista de sus categorías (sin repetir) para poder filtrar fácilmente
PERSONAS_EJEMPLO.forEach((persona) => {
  persona.categorias = [...new Set(persona.aficiones.map((a) => a.categoria))];
});

// Iconos que se pueden elegir para una lista: son nombres de emoticonos propios (#e-...)
const ICONOS_LISTAS = ["guardado", "deportes", "plan", "gastronomia", "videojuegos", "arte", "musica", "animales", "viajes", "cultura"];

// Las listas creadas antes guardaban un emoji: así sabemos qué emoticono le toca a cada uno
const EMOJI_A_ICONO = { "⭐": "guardado", "🎾": "deportes", "🎉": "plan", "🍕": "gastronomia", "🎮": "videojuegos",
  "🎨": "arte", "🎵": "musica", "🐶": "animales", "✈️": "viajes", "📚": "cultura" };

/* Planes de ejemplo de los próximos 5 días (sustituyen a una base de datos real).
   - dia: 0 = hoy, 1 = mañana... así los planes siempre caen en los próximos días
   - plazas: cuántas personas pueden ir en total
   - apuntados: ids de PERSONAS_EJEMPLO que ya van */
const PLANES_EJEMPLO = [
  { id: "pl1", nombre: "Pádel en el Canal", categoria: "Deportes", dia: 0, hora: "19:30", lugar: "Chamberí", plazas: 4, apuntados: ["p1", "p6"] },
  { id: "pl2", nombre: "Karaoke en Malasaña", categoria: "Música", dia: 0, hora: "21:00", lugar: "Centro", plazas: 10, apuntados: ["p2", "p5", "p9"] },
  { id: "pl3", nombre: "Ruta de vermut", categoria: "Gastronomía", dia: 1, hora: "13:00", lugar: "La Latina", plazas: 8, apuntados: ["p4", "p9", "p3"] },
  { id: "pl4", nombre: "Torneo de Mario Kart", categoria: "Videojuegos", dia: 1, hora: "18:00", lugar: "Arganzuela", plazas: 8, apuntados: ["p2"] },
  { id: "pl5", nombre: "Noche de juegos de mesa", categoria: "Juegos de Mesa", dia: 2, hora: "20:00", lugar: "Lavapiés", plazas: 6, apuntados: ["p6", "p9"] },
  { id: "pl6", nombre: "Dibujo en el Retiro", categoria: "Arte", dia: 2, hora: "11:00", lugar: "Retiro", plazas: 10, apuntados: ["p3", "p7"] },
  { id: "pl7", nombre: "Expo en el Reina Sofía", categoria: "Cultura", dia: 3, hora: "19:00", lugar: "Atocha", plazas: 12, apuntados: ["p5"] },
  { id: "pl8", nombre: "Cine de terror en VOSE", categoria: "Cine", dia: 3, hora: "22:00", lugar: "Moncloa", plazas: 6, apuntados: ["p5", "p10"] },
  { id: "pl9", nombre: "Senderismo en Cercedilla", categoria: "Deportes", dia: 4, hora: "09:00", lugar: "Salida desde Moncloa", plazas: 12, apuntados: ["p1", "p3", "p11"] },
  { id: "pl10", nombre: "Concierto indie", categoria: "Música", dia: 4, hora: "22:00", lugar: "Malasaña", plazas: 15, apuntados: ["p1", "p2"] },
  { id: "pl11", nombre: "Paseo de perros por Madrid Río", categoria: "Animales", dia: 4, hora: "10:30", lugar: "Arganzuela", plazas: 10, apuntados: ["p8"] },
  { id: "pl12", nombre: "Mercadillo vintage", categoria: "Moda", dia: 4, hora: "12:00", lugar: "Centro", plazas: 10, apuntados: ["p7"] },
  { id: "pl13", nombre: "Cocina coreana", categoria: "Gastronomía", dia: 3, hora: "19:30", lugar: "Tetuán", plazas: 6, apuntados: ["p4"] },
  { id: "pl14", nombre: "Escapada a Segovia", categoria: "Viajes", dia: 2, hora: "08:30", lugar: "Salida desde Moncloa", plazas: 8, apuntados: ["p8", "p9"] }
];

/* Fotos de cada categoría para los carteles (carpeta img/fotos).
   Si una categoría no tiene foto, el cartel se ve con su color liso. */
const FOTOS_CATEGORIAS = {
  deportes: "img/fotos/deportes.jpg",
  videojuegos: "img/fotos/videojuegos.jpg",
  gastronomia: "img/fotos/gastronomia.jpg",
  arte: "img/fotos/arte.jpg",
  musica: "img/fotos/musica.jpg",
  cine: "img/fotos/cine.jpg",
  juegos: "img/fotos/juegos.jpg",
  viajes: "img/fotos/viajes.jpg",
  cultura: "img/fotos/cultura.jpg",
  animales: "img/fotos/animales.jpg",
  moda: "img/fotos/moda.jpg",
};
