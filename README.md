# Invitación de boda · Santiago & Daniela

Sitio web tipo invitación digital para la boda del **4 de Julio de 2026**.

## Cómo verlo

Abre `index.html` directamente en tu navegador (doble clic). No necesita servidor.

## Placeholders por reemplazar

Busca estos textos entre corchetes y reemplázalos con la información real cuando la tengas:

### En `index.html`

| Placeholder | Línea aprox. | Qué reemplazar |
|---|---|---|
| `[HH:MM]` | sección "Detalles del evento" | Hora de la ceremonia, ej: `17:00` |
| `[NOMBRE DEL LUGAR]` | sección "Detalles del evento" | Ej: `Hacienda San José` |
| `[DIRECCIÓN COMPLETA]` | sección "Detalles del evento" | Calle, ciudad, etc. |
| `[DIRECCIÓN]` (en el href de "Ver en mapa") | sección "Detalles del evento" | La misma dirección, codificada para URL |
| `[CÓDIGO DE VESTIMENTA]` | sección "Código de vestimenta" | Ej: `Etiqueta rigurosa`, `Cocktail` |
| `[BANCO]`, `[CLABE / NÚMERO DE CUENTA]`, `[TITULAR]` | sección "Mesa de regalos" | Datos de cuenta para regalos |
| `[LINK_MESA_REGALOS]`, `[NOMBRE TIENDA]` | sección "Mesa de regalos" | Link a mesa de regalos en alguna tienda |
| `[FECHA LÍMITE RSVP]` | sección "RSVP" | Ej: `20 de Junio` |
| `[GOOGLE_FORM_EMBED_URL]` | sección "RSVP" (iframe) | URL de tu Google Form embebido |

### En `script.js`

La hora de la ceremonia también está en `script.js` (para la cuenta regresiva). Edita la línea:

```js
const WEDDING_DATE = new Date(2026, 6, 4, 17, 0, 0);
```

Los parámetros son: `(año, mes, día, hora, minutos, segundos)`. Importante: **los meses son 0-indexados**, así que julio = `6`.

## Cómo embeber tu Google Form (RSVP)

1. Ve a [forms.google.com](https://forms.google.com) y crea tu formulario con las preguntas que quieras (ej: nombre, número de personas, alergias).
2. Haz clic en **Enviar** (botón arriba a la derecha).
3. En la ventana, selecciona la pestaña con el ícono `< >` (Insertar HTML).
4. Copia **solo la URL** que aparece dentro de `src="..."`. Algo como:
   `https://docs.google.com/forms/d/e/1FAIpQLSe.../viewform?embedded=true`
5. Pégala en `index.html` reemplazando `[GOOGLE_FORM_EMBED_URL]`.

## Cómo publicarlo

### Opción 1: Netlify Drop (más fácil, 30 segundos)
1. Ve a [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arrastra la carpeta completa `Boda_garcia-lopez/` a la página
3. Te darán una URL pública (puedes cambiarla luego en la configuración)

### Opción 2: GitHub Pages
1. Crea un repo nuevo en GitHub
2. Sube los archivos
3. Settings → Pages → Source: "main branch"
4. Tu URL será `tuusuario.github.io/nombre-del-repo`

### Opción 3: Hosting compartido
Sube todos los archivos por FTP a la carpeta `public_html` de tu hosting.

## Estructura

```
Boda_garcia-lopez/
├── index.html          # Estructura de la invitación
├── styles.css          # Estilos: colores, fuentes, animaciones
├── script.js           # Cuenta regresiva, sobre, scroll reveal
├── assets/
│   └── favicon.svg     # Ícono que aparece en la pestaña del navegador
└── README.md           # Este archivo
```

## Personalización rápida

- **Cambiar colores**: edita las variables CSS al inicio de `styles.css` (sección `:root`).
- **Cambiar la frase romántica**: busca `<blockquote>` en `index.html`.
- **Agregar/quitar secciones**: cada sección está marcada con un comentario `<!-- ... -->` en `index.html`.
