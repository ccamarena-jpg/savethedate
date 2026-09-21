# Claudia y Jorge — Vercel
## Ejecutar
Node.js 22. npm ci, npm run dev.
Producción: npm run build y npm run start.

## Vercel
Repositorio ccamarena-jpg/savethedate, rama main, directorio raíz del repositorio.
Framework Next.js. Build npm run build. Output .next. Node 22.x.
vercel.json incluye estos ajustes. Eliminar overrides antiguos de Vite/dist en Vercel.

## Activar las confirmaciones RSVP
Google Sheets mediante Apps Script. Sigue google-sheets/SETUP.md y copia google-sheets/Code.gs en tu hoja.
Variables privadas de Vercel: GOOGLE_SCRIPT_URL y RSVP_SHEETS_SECRET.
No requiere Neon. Sin configurar la conexión, el RSVP devuelve error y no confirma un guardado inexistente.

## Recursos
public/media/photos/claudia-jorge.jpeg: fotografía.
public/media/video/pelicula.mp4: película completa.
public/media/stationery/envelope-ivory.png: sobre C&J.
public/media/stationery/anthuriums.png: anturios.
public/fonts/pinyon-script.ttf: fuente de los nombres, licencia Pinyon-OFL.txt.
IMAGE-PROMPTS.txt: instrucciones de generación de imágenes.
app/countdown-time.ts: 12 diciembre 2026 a las 00:00 de Lima.
?guest=Daniela prellena el formulario.
La película avanza al cierre únicamente cuando termina.
