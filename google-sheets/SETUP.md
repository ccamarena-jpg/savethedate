# Conectar la hoja de Claudia y Jorge

1. Abre la hoja https://docs.google.com/spreadsheets/d/1T6LqoEhdsySHqyY9-JYW_fAFYp_k2-9ZvKGkJnrz7Ro/edit
2. Extensiones → Apps Script. Pega Code.gs y guarda.
3. Configuración del proyecto → Propiedades de la secuencia de comandos: añade RSVP_SHEETS_SECRET con una clave aleatoria larga (al menos 32 caracteres). Guárdala también para Vercel. No la pegues en el código ni en GitHub.
4. Implementar → Nueva implementación → Aplicación web. Ejecutar como: tú. Acceso: Cualquier persona. Autoriza tu propio script. La hoja conserva su privacidad; el endpoint exige la clave y no ofrece lectura pública.
5. Copia la URL que termina en /exec.
6. Vercel → proyecto → Settings → Environment Variables: GOOGLE_SCRIPT_URL = esa URL; RSVP_SHEETS_SECRET = exactamente la misma clave. Actívalas en Production (y Preview si quieres probar allí). No uses el prefijo NEXT_PUBLIC_.
7. Redeploy en Vercel. Envía una respuesta de prueba: debe aparecer en una pestaña nueva RSVP. No se modifica la pestaña original. El formulario solo confirma cuando Google verifica el guardado.

Los reintentos con el mismo ID no añaden filas duplicadas. Un nuevo envío desde otra sesión sí es otra respuesta.
Si cambias Code.gs, actualiza la implementación de Apps Script a una nueva versión conservando la URL.
No se necesita Neon ni DATABASE_URL. Las respuestas guardadas anteriormente en otras bases no se importan.

Referencia oficial: https://developers.google.com/apps-script/guides/web
