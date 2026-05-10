# CLAUDE.md — Sitio Web Boda García-López

## Proyecto
Sitio web de invitación digital para la boda de **Santiago García & Daniela López**, 
4 de Julio de 2026, Bogotá, Colombia.

Desarrollado por Federico y Miguel López (hermanos de la novia).

## Stack
- Vanilla HTML / CSS / JS (sin frameworks, sin bundlers)
- Supabase (base de datos y auth para RSVP + admin)
- Dependencias vía CDN únicamente
- Deploy: GitHub Pages (`fedelg16/boda-garcia-lopez`)

## Estructura actual
boda-garcia-lopez/
├── index.html       # Invitación principal
├── styles.css       # Todos los estilos
├── script.js        # Sobre, countdown, scroll reveal, parallax
├── assets/
│   └── favicon.svg
└── README.md
## Identidad visual
- **Fuentes:** Cormorant Garamond (serif elegante), Italiana (títulos), 
  Montserrat (body/overlines)
- **Paleta principal:**
  - `#6b7d3a` — verde oscuro (textos, bordes, íconos)
  - `#8aa370` — verde medio
  - `#b8d4b8` — verde claro
  - `#c2d1b0` — verde muy claro / mint
  - `#f9f7f4` — fondo crema / off-white
- **Estética:** botánica, elegante, minimalista — NO usar sombras fuertes, 
  colores saturados, ni estilos modernos/tech

## Reglas de desarrollo
1. **Todo el texto de UI en español**
2. No romper el diseño existente al agregar secciones nuevas
3. Cada sección nueva debe tener la clase `reveal` para el scroll animation
4. Mantener el sitio funcional sin servidor (excepto llamadas a Supabase)
5. Mobile-first, responsive
6. No usar npm ni bundlers — CDN only
7. Cambios quirúrgicos: no refactorizar lo que ya funciona

## Personas con acceso al admin
- **Daniela López** (novia) — acceso completo
- **Santiago García** (novio) — acceso completo  
- **Wedding planner** — solo lectura de RSVPs

## Secciones implementadas
- [x] Pantalla de sobre con animación de apertura
- [x] Hero (nombres, fecha, decoraciones botánicas SVG)
- [x] Cita romántica
- [x] Cuenta regresiva (4 Jul 2026, 3:45 PM)
- [x] Detalles del evento (lugar, hora, mapa)
- [x] Código de vestimenta (formal, paleta damas de honor)
- [x] Mesa de regalos (pendiente: datos bancarios reales)
- [x] Sección RSVP (pendiente: reemplazar iframe con form propio)
- [x] Footer con monograma

## Backlog de features
- [ ] **RSVP con Supabase** — form integrado + admin dashboard (`admin.html`)
- [ ] **Galería de fotos** — sección con fotos de la pareja
- [ ] **Itinerario del día** — ceremonia, cóctel, recepción con horarios
- [ ] **Info para viajeros** — hoteles recomendados en Bogotá

## Placeholders pendientes (en index.html)
- Datos bancarios transferencia: `[BANCO]`, `[CLABE / NÚMERO DE CUENTA]`, `[TITULAR]`
- Mesa de regalos: `[LINK_MESA_REGALOS]`, `[NOMBRE TIENDA]`
- Fecha límite RSVP: `[FECHA LÍMITE RSVP]`
