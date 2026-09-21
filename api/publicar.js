/* Sur Exporta — publicar el sitio
 * Reconstruye el sitio público a partir de los datos actuales de Supabase.
 *
 * Comprueba que quien llama tenga sesión válida y rol 'vinculacion' antes de
 * disparar el despliegue. El enlace de despliegue es secreto y nunca sale al
 * navegador.
 *
 * Variables de entorno (en Vercel):
 *   SUPABASE_URL             URL del proyecto
 *   SUPABASE_ANON_KEY        llave pública, para validar el token del usuario
 *   VERCEL_DEPLOY_HOOK_URL   enlace de despliegue del proyecto
 */
'use strict';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!url || !anon || !hook) {
    console.error('Faltan variables: SUPABASE_URL, SUPABASE_ANON_KEY o VERCEL_DEPLOY_HOOK_URL');
    return res.status(500).json({ ok: false, error: 'config' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ ok: false, error: 'sin_sesion' });

  // 1. ¿El token corresponde a un usuario real?
  let usuario;
  try {
    const r = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` }
    });
    if (!r.ok) return res.status(401).json({ ok: false, error: 'sesion_invalida' });
    usuario = await r.json();
  } catch (err) {
    console.error('No se pudo validar la sesión:', err.message);
    return res.status(502).json({ ok: false, error: 'auth_no_disponible' });
  }

  // 2. ¿Ese usuario es de Vinculación? Se consulta con su propio token,
  //    así las políticas de la base siguen aplicando.
  let rol = null;
  try {
    const r = await fetch(`${url}/rest/v1/personal?user_id=eq.${usuario.id}&select=rol,activo`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` }
    });
    const filas = await r.json();
    if (Array.isArray(filas) && filas.length && filas[0].activo) rol = filas[0].rol;
  } catch (err) {
    console.error('No se pudo leer el rol:', err.message);
    return res.status(502).json({ ok: false, error: 'rol_no_disponible' });
  }

  if (rol !== 'vinculacion') {
    return res.status(403).json({ ok: false, error: 'sin_permiso' });
  }

  // 3. Disparar la reconstrucción
  try {
    const r = await fetch(hook, { method: 'POST' });
    if (!r.ok) throw new Error(`hook ${r.status}`);
  } catch (err) {
    console.error('Falló el despliegue:', err.message);
    return res.status(502).json({ ok: false, error: 'despliegue_fallido' });
  }

  console.log(`Publicación solicitada por ${usuario.email}`);
  return res.status(200).json({ ok: true });
};
