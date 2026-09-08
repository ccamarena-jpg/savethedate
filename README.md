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

## Archivos reales y edición vintage
- public/media/photos/claudia-jorge.jpeg: fotografía enviada por los novios, sin modificar sus colores. Los encuadres de las tarjetas se definen en CSS.
- public/media/video/pelicula.mp4: SaveTheDay.mp4 optimizado a 1280 × 720, H.264/AAC, fast-start; 36.16 segundos, aproximadamente 11.3 MB.
- El original de 323 MB se conserva intacto en la carpeta de origen del usuario.
- app/media.ts configura las rutas. Para reemplazar el video, conserva la ruta o actualízala aquí.
- Se anuncia «Nos casamos» a partir del segundo 30 y la fecha a partir del 33, sobre la película. Si cambias su duración, ajusta estos tiempos en app/page.tsx.
- Se conserva el audio original. Si el navegador bloquea la reproducción inicial, el invitado puede tocar VER NUESTRA PELÍCULA.
- Los subtítulos de muestra de la versión anterior no se usan con este video.
- Diseño inspirado en el moodboard: marfil cálido, tinta Burgundy, interior Powder Blue, líneas dobles, tipografía editorial, detalles de máquina de escribir y fotos cálidas.
- Libre Bodoni está incluida localmente; licencia en public/fonts/OFL.txt.

## Cuenta regresiva
La sección posterior a la película y la confirmación RSVP reemplazan 12 · 12 · 26 por días, horas, minutos y segundos.
El objetivo es el comienzo del 12 de diciembre de 2026, 00:00 en Lima (UTC-5); no se ha proporcionado hora de ceremonia.
Para cambiarlo, edita WEDDING_TIME en app/countdown-time.ts.
Se recalcula desde el reloj del dispositivo cada segundo y al regresar a la pestaña; funciona igual en otras zonas horarias. Al llegar a cero muestra «El gran día ha llegado».
La fecha escrita sigue disponible como información debajo del contador.
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
El video real usa controles discretos y reproducción inline, con reintento visible ante fallos de carga.
Sin música automática en la entrada ni anuncios de fecha antes de la película.
La interfaz no incluye navbar, footer ni decoraciones culturales.

## Verificación
Compilación y TypeScript. Cuenta regresiva verificada: zona horaria Lima, cambio de unidades y cero. Guardado, validación e idempotencia del RSVP comprobados en la versión anterior; su servidor se conserva.
No se ha realizado una inspección visual en navegadores o dispositivos reales.
La integración opcional WebMCP abre el mismo sobre. Se omite automáticamente en navegadores sin soporte; no se verificó en un contexto WebMCP compatible.

