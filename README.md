# Claudia & Jorge — Una carta para ti

Micrositio mobile-first (390 × 844), React/Vinext y Cloudflare D1. Los nombres y la fecha no se anuncian en metadatos: la fecha aparece por primera vez dentro de la película.

## Abrir localmente
Necesitas Node.js 22.13 o superior.
1. Descomprime el ZIP y abre una terminal en esta carpeta.
2. Ejecuta: npm ci
3. Ejecuta: npm run build
4. Ejecuta: npx wrangler d1 execute DB --local --persist-to .wrangler/state --config dist/server/wrangler.json --file drizzle/0000_gorgeous_red_skull.sql
5. Ejecuta: npm run dev
6. Abre la dirección que imprime la terminal, normalmente http://localhost:3000/

Personalización: http://localhost:3000/?guest=Daniela
Sin el parámetro, muestra PARA TI. El nombre se representa como texto, nunca como HTML.
No se abre con doble clic en un HTML: el RSVP necesita el servidor y la base de datos.

## Reemplazar los archivos finales
- public/media/photos/01.jpg: foto principal, vertical o cuadrada; recomendación 1400 px o más.
- public/media/photos/02.jpg: segunda foto; recomendación 1200 px o más.
- Guarda el video real como public/media/video/pelicula.mp4.
- En app/media.ts cambia video: '' por video: '/media/video/pelicula.mp4'.
- Sustituye public/media/video/captions.vtt con subtítulos y tiempos del video final.
- Recomendación de video: MP4 H.264, audio AAC, fast-start, versión optimizada para móvil.
- El video debe contener el anuncio y la fecha, pues el sitio espera su final para mostrar RSVP.
- Mientras video esté vacío, se reproduce una película provisional de 17 segundos hecha con las dos fotos y textos animados, sin audio. No es un video final de los novios.
- Si falla la descarga del video final, el sitio ofrece automáticamente esta película provisional.
- Fotos de muestra: Jonathan Borba https://unsplash.com/ko/사진/해변에서-키스하는-커플의-흑백-사진-yP_lK6ouc7Y y Brittani Burns https://unsplash.com/photos/a-man-and-woman-walking-on-a-beach-IyU1W90ZRVY. Son personas de referencia, no Claudia y Jorge. Sustituir antes de enviar.
- Libre Bodoni está incluida localmente; licencia en public/fonts/OFL.txt.

## Publicar en Sites
El proyecto ya incluye su identificación en .openai/hosting.json y la migración D1.
La publicación inicial en Sites es privada; debe habilitarse acceso público antes de enviar el enlace a los invitados por WhatsApp.
Sites aplica las migraciones y conecta DB al publicar.

## Publicar por tu cuenta en Cloudflare Workers
1. Ejecuta npx wrangler login y npx wrangler d1 create claudia-jorge-rsvp.
2. Copia el database_id devuelto en wrangler.deploy.jsonc.
3. Ejecuta npm run build.
4. Ejecuta npx wrangler d1 migrations apply DB --remote --config wrangler.deploy.jsonc.
5. Ejecuta npx wrangler deploy --config wrangler.deploy.jsonc.
El proveedor devolverá la URL pública. El dominio personalizado es opcional.
No es un sitio estático para subir solo a GitHub Pages: requiere Workers y D1 para guardar RSVP.

## Consultar respuestas
En Sites, consulta la tabla rsvps desde la gestión de datos del sitio.
En Cloudflare, abre D1 → claudia-jorge-rsvp → Console:
SELECT name, attendance, message, created_at FROM rsvps ORDER BY created_at DESC;
yes = asistirá; no = no podrá asistir. No hay una ruta pública que liste respuestas.
Solo se muestra confirmación después de que el servidor guarda la respuesta.
Los reintentos del mismo envío no duplican la fila. Una visita nueva permite otro envío.
Para uso masivo, configura protección contra bots/rate limiting en el proveedor.

## Accesibilidad y comportamiento
Botones accesibles por teclado, foco al cambiar de sección, campos etiquetados, validación cliente/servidor, errores recuperables y reduced-motion.
La película de muestra se pausa al ocultar la pestaña; el video real usa controles discretos, reproducción inline y subtítulos.
Sin música automática en la entrada ni anuncios de fecha antes de la película.
La interfaz no incluye navbar, footer ni decoraciones culturales.

## Verificación
Compilación y TypeScript, prueba HTTP del guardado, validación e idempotencia.
No se ha realizado una inspección visual en navegadores o dispositivos reales.
La integración opcional WebMCP abre el mismo sobre. Se omite automáticamente en navegadores sin soporte; no se verificó en un contexto WebMCP compatible.
