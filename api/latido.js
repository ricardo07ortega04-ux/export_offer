/* Sur Exporta — latido diario de la base de datos
 * Vercel lo ejecuta una vez al día (ver «crons» en vercel.json). Hace una consulta
 * de solo lectura a Supabase para que el proyecto registre actividad: en el plan
 * gratuito, Supabase pausa los proyectos que pasan 7 días sin actividad.
 *
 * Variables de entorno (las mismas que usa /api/publicar):
 *   SUPABASE_URL       URL del proyecto
 *   SUPABASE_ANON_KEY  llave pública
 *   CRON_SECRET        opcional: si existe, solo Vercel Cron puede llamar a esta función
 */
'use strict';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // Vercel Cron manda «Authorization: Bearer <CRON_SECRET>» cuando la variable existe
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.authorization !== `Bearer ${secreto}`) {
    return res.status(401).json({ ok: false, error: 'sin_permiso' });
  }

  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const llave = process.env.SUPABASE_ANON_KEY;
  if (!url || !llave) {
    console.error('Faltan variables: SUPABASE_URL o SUPABASE_ANON_KEY');
    return res.status(500).json({ ok: false, error: 'config' });
  }

  try {
    // Lectura mínima de datos públicos: una sola empresa publicada
    const r = await fetch(`${url}/rest/v1/empresas?select=slug&limit=1`, {
      headers: { apikey: llave, Authorization: `Bearer ${llave}` }
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${await r.text()}`);
    const filas = await r.json();
    console.log(`Latido OK · ${new Date().toISOString()} · ${filas.length} fila`);
    return res.status(200).json({ ok: true, hora: new Date().toISOString() });
  } catch (err) {
    console.error('Latido fallido:', err.message);
    return res.status(502).json({ ok: false, error: 'supabase_no_responde' });
  }
};
