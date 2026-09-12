# Jorge y Claudia — Vercel
## Ejecutar
Node.js 22. npm ci, npm run dev.
Producción: npm run build y npm run start.

## Vercel
Repositorio ccamarena-jpg/savethedate, rama main, directorio raíz del repositorio.
Framework Next.js. Build npm run build. Output .next. Node 22.x.
vercel.json incluye estos ajustes. Eliminar overrides antiguos de Vite/dist en Vercel.

## Activar las confirmaciones RSVP
1. Crear/conectar una base Neon desde Vercel Marketplace/Storage.
2. Añadir su conexión PostgreSQL como DATABASE_URL en las variables de entorno del proyecto (Production y Preview si corresponde). No usar NEXT_PUBLIC_.
3. En el editor SQL de Neon, ejecutar db/vercel-schema.sql.
4. Volver a desplegar.
Sin DATABASE_URL o sin tabla, la invitación abre pero RSVP devuelve error: nunca confirma un guardado inexistente.
Las respuestas anteriores de Cloudflare D1 NO se transfieren automáticamente. El sitio anterior continúa con su propia base.
No existe una ruta pública para listar respuestas.

## Recursos
public/media/photos/claudia-jorge.jpeg: fotografía.
public/media/video/pelicula.mp4: película completa.
public/media/stationery/envelope-jc.png: sobre J&C.
public/media/stationery/anthuriums.png: anturios.
public/fonts/pinyon-script.ttf: fuente de los nombres, licencia Pinyon-OFL.txt.
IMAGE-PROMPTS.txt: instrucciones de generación de imágenes.
app/countdown-time.ts: 12 diciembre 2026 a las 00:00 de Lima.
?guest=Daniela prellena el formulario.
La película avanza al cierre únicamente cuando termina.
