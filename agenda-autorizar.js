/* Sur Exporta — autorización de Google Calendar para la agenda (se usa una sola vez)
 * Uso:
 *   node agenda-autorizar.js <GOOGLE_CLIENT_ID> <GOOGLE_CLIENT_SECRET>
 *
 * Abre la liga que aparece, entra con la cuenta cuyo calendario recibirá las
 * citas y acepta los permisos. El script imprime GOOGLE_REFRESH_TOKEN para
 * copiarlo a las variables de entorno de Vercel. No guarda nada en disco.
 */
'use strict';
const http = require('http');

const [clientId, clientSecret] = process.argv.slice(2);
if (!clientId || !clientSecret) {
  console.log('Uso: node agenda-autorizar.js <GOOGLE_CLIENT_ID> <GOOGLE_CLIENT_SECRET>');
  process.exit(1);
}

const PUERTO = 53682;
const REDIRECCION = `http://127.0.0.1:${PUERTO}`;
// Leer disponibilidad (libre/ocupado) y crear los eventos de las citas
const PERMISOS = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy'
].join(' ');

const liga = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECCION,
  response_type: 'code',
  scope: PERMISOS,
  access_type: 'offline',
  prompt: 'consent'
});

const servidor = http.createServer(async (req, res) => {
  const q = new URL(req.url, REDIRECCION).searchParams;
  if (!q.get('code') && !q.get('error')) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

  if (q.get('error')) {
    res.end('<p>No se concedió el permiso. Puedes cerrar esta ventana.</p>');
    console.error('\nGoogle respondió:', q.get('error'));
    servidor.close();
    return;
  }

  try {
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: q.get('code'), client_id: clientId, client_secret: clientSecret,
        redirect_uri: REDIRECCION, grant_type: 'authorization_code'
      })
    });
    const j = await r.json();
    if (!r.ok || !j.refresh_token) throw new Error(JSON.stringify(j));
    res.end('<p>Listo. Ya puedes cerrar esta ventana y volver a la terminal.</p>');
    console.log('\nCopia este valor en Vercel como GOOGLE_REFRESH_TOKEN:\n');
    console.log(j.refresh_token);
    console.log('\nNo lo compartas ni lo guardes en el repositorio.');
  } catch (err) {
    res.end('<p>Algo falló. Revisa la terminal.</p>');
    console.error('\nNo se obtuvo el permiso:', err.message);
  }
  servidor.close();
});

servidor.listen(PUERTO, '127.0.0.1', () => {
  console.log('Abre esta liga en el navegador y entra con ricardo_ortega@sur-exporta.com:\n');
  console.log(liga);
  console.log('\nEsperando la autorización…');
});
