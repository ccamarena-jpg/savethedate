# Claudia y Jorge — Tienes un mensaje de

Micrositio mobile-first, React/Vinext y Cloudflare D1.

## Abrir
Node.js 22.13 o superior:
1. npm ci
2. npm run build
3. npx wrangler d1 execute DB --local --persist-to .wrangler/state --config dist/server/wrangler.json --file drizzle/0000_gorgeous_red_skull.sql
4. npm run dev
5. Abre la URL impresa, normalmente http://localhost:3000/

?guest=Daniela sigue prellenando el nombre del formulario. El destinatario ya no se muestra en la portada.
El RSVP necesita el servidor y la base de datos; no se abre haciendo doble clic en un HTML.

## Diseño actual
Fondo vino profundo #310606, sobre ivory frontal de papel texturizado con encaje blanco antiguo y monograma C & J impreso. Dos calas a la derecha, sin sellos ni cintas.
Encabezado: «Tienes un mensaje de» y «Claudia / y Jorge».
Se quitaron las líneas, Para ti, con cariño C & J, el crédito de película y las sobreimpresiones Nos casamos/fecha.
El video real se reproduce completo. Solo su evento ended abre el cierre con foto, cuenta regresiva y RSVP.
No se corta la película por tiempo ni se añade texto sobre ella.

## Tipografía
Pinyon Script es la alternativa elegida a Bickham Script Pro 3 para los nombres y acentos caligráficos.
Se incluye localmente en public/fonts/pinyon-script.ttf, junto con su licencia abierta public/fonts/Pinyon-OFL.txt.
No necesita Adobe Fonts ni descargas desde Google Fonts al abrir la invitación.
Fuente oficial: https://github.com/google/fonts/tree/main/ofl/pinyonscript
Libre Bodoni sigue incluida localmente para el texto editorial.
## Archivos
- public/media/photos/claudia-jorge.jpeg: foto original de los novios.
- public/media/photos/pelicula-retrato.jpg: fotograma de su película.
- public/media/video/pelicula.mp4: video real optimizado a 1280 × 720, H.264/AAC y fast-start; 36.16 s, aproximadamente 11.3 MB. No se modifica el original de 323 MB.
- public/media/stationery/envelope-ivory.png: sobre generado con ImageGen integrado (modo built-in). El recorte CSS evita el margen exterior del archivo.
- public/media/stationery/callas.png: dos calas generadas con ImageGen integrado, con canal alfa.
- IMAGE-PROMPTS.txt: prompts exactos de ambos recursos.
- app/media.ts: rutas de foto y video.
- app/countdown-time.ts: objetivo del contador, 12/12/2026 a las 00:00 de Lima (UTC-5), hasta recibir la hora real.

## Publicación
Sites: reutiliza el project_id de .openai/hosting.json. No crea otro sitio.
Cloudflare por cuenta propia:
1. npx wrangler login
2. npx wrangler d1 create claudia-jorge-rsvp
3. Copia el database_id devuelto en wrangler.deploy.jsonc.
4. npm run build
5. npx wrangler d1 migrations apply DB --remote --config wrangler.deploy.jsonc
6. npx wrangler deploy --config wrangler.deploy.jsonc

## Respuestas
Consulta la tabla rsvps desde la gestión de datos privada de Sites o Cloudflare D1.
SELECT name, attendance, message, created_at FROM rsvps ORDER BY created_at DESC;
yes = asistirá, no = no podrá. No existe una ruta pública que liste respuestas.
La confirmación se muestra solo después de guardar correctamente; los reintentos de un mismo envío no duplican la fila.

## Validación
Compilación y TypeScript correctos. Ruta y nuevos recursos responden HTTP 200.
No se realizó inspección visual en navegador/dispositivo. Assets inspeccionados directamente.
La integración WebMCP opcional no se verificó en contexto compatible.
El backend RSVP y la cuenta regresiva conservan la implementación previamente verificada.

