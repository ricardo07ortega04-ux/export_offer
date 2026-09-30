/* Sur Exporta — recepción de solicitudes de registro de empresas
 * Función de Vercel. Valida el formulario de /registro, guarda las imágenes
 * en el bucket privado «solicitudes» y la solicitud en la tabla del mismo
 * nombre. Después avisa por correo a COMCE.
 *
 * Variables de entorno (se configuran en Vercel, nunca en el repositorio):
 *   SUPABASE_URL               URL del proyecto
 *   SUPABASE_SERVICE_ROLE_KEY  llave secreta (service_role). Solo vive en Vercel.
 *   RESEND_API_KEY             opcional: para el aviso por correo
 *   REGISTRO_TO                opcional: quién recibe el aviso; si falta, se usa CONTACT_TO
 *   CONTACT_FROM               opcional: remitente
 *   CONTACT_ACK                'on' para enviar acuse de recibo a la empresa
 */
'use strict';

const crypto = require('crypto');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_IMAGEN = 3 * 1024 * 1024;   // igual que el límite del bucket
const MAX_FOTOS = 3;
const POR_DIA = 3;                    // solicitudes por correo cada 24 h

const TIPOS_IMAGEN = {
  'image/webp': { ext: 'webp', firma: (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP' },
  'image/png':  { ext: 'png',  firma: (b) => b[0] === 0x89 && b.slice(1, 4).toString() === 'PNG' },
  'image/jpeg': { ext: 'jpg',  firma: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff }
};

// Una sola línea: sin saltos, recortada
function linea(v, max) {
  return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}
// Texto largo: conserva párrafos, normaliza saltos
function parrafos(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}
function nulo(v) { return v === '' ? null : v; }
function entero(v, min, max) {
  if (v === '' || v == null) return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}
function numero(v) {
  if (v === '' || v == null) return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) && n >= 0 && n < 1e12 ? n : null;
}
function lista(v, maxItems, maxLargo) {
  const arr = Array.isArray(v) ? v : String(v == null ? '' : v).split('\n');
  const vistos = new Set();
  return arr.map((s) => linea(s, maxLargo)).filter((s) => {
    if (!s || vistos.has(s.toLowerCase())) return false;
    vistos.add(s.toLowerCase());
    return true;
  }).slice(0, maxItems);
}
function opcion(v, validas) { return validas.indexOf(v) > -1 ? v : null; }
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function imagen(entrada) {
  if (!entrada || typeof entrada !== 'object') return null;
  const tipo = TIPOS_IMAGEN[entrada.type];
  if (!tipo || typeof entrada.data !== 'string') throw new Error('imagen_tipo');
  const buf = Buffer.from(entrada.data, 'base64');
  if (!buf.length || buf.length > MAX_IMAGEN) throw new Error('imagen_tamano');
  if (!tipo.firma(buf)) throw new Error('imagen_tipo');
  return { buf, type: entrada.type, ext: tipo.ext };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !llave) {
    console.error('Faltan variables: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ ok: false, error: 'config' });
  }
  const cabeceras = { apikey: llave, Authorization: `Bearer ${llave}` };

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'bad_request' });

  // Campo trampa y envío demasiado rápido: se responde bien y no se guarda nada
  if (linea(b.website, 100)) return res.status(200).json({ ok: true });
  const transcurrido = Number(b.elapsed);
  if (Number.isFinite(transcurrido) && transcurrido < 20000) return res.status(200).json({ ok: true });

  const tipo = opcion(b.tipo, ['producto', 'servicio']);
  const esProducto = tipo === 'producto';

  const s = {
    marca: linea(b.marca, 120),
    razon_social: nulo(linea(b.razon_social, 200)),
    rfc: nulo(linea(b.rfc, 13).toUpperCase()),
    estado: nulo(linea(b.estado, 60)),
    municipio: nulo(linea(b.municipio, 120)),
    sitio_web: nulo(linea(b.sitio_web, 200)),
    socio_comce: opcion(b.socio_comce, ['si', 'tramite', 'no']),

    tipo,
    sector: nulo(linea(b.sector, 60)),
    sector_otro: nulo(linea(b.sector_otro, 120)),
    productos: lista(b.productos, 40, 120),
    capacidad_mensual: esProducto ? numero(b.capacidad_mensual) : null,
    capacidad_unidad: esProducto ? nulo(linea(b.capacidad_unidad, 30)) : null,
    presentaciones: esProducto ? nulo(linea(b.presentaciones, 300)) : null,
    abv: esProducto ? nulo(linea(b.abv, 30)) : null,
    maquila: esProducto ? (b.maquila === 'si' ? true : b.maquila === 'no' ? false : null) : null,

    situacion: opcion(b.situacion, ['exportando', 'buscando_comprador', 'sin_exportar']),
    exporta_desde: entero(b.exporta_desde, 1800, new Date().getFullYear()),
    porcentaje_exportado: esProducto ? entero(b.porcentaje_exportado, 0, 100) : null,
    padron: esProducto ? opcion(b.padron, ['vigente', 'tramite', 'no', 'no_se']) : null,
    mercados: lista(b.mercados, 60, 80),
    mercados_otros: nulo(linea(b.mercados_otros, 300)),
    mercados_interes: nulo(linea(b.mercados_interes, 300)),

    certificaciones: lista(b.certificaciones, 40, 120),
    certificaciones_otras: nulo(linea(b.certificaciones_otras, 400)),

    resumen_es: nulo(linea(b.resumen_es, 220)),
    descripcion_es: nulo(parrafos(b.descripcion_es, 2500)),
    destacado_es: nulo(linea(b.destacado_es, 100)),
    resumen_en: nulo(linea(b.resumen_en, 220)),
    descripcion_en: nulo(parrafos(b.descripcion_en, 2500)),
    destacado_en: nulo(linea(b.destacado_en, 100)),

    contacto_nombre: linea(b.contacto_nombre, 120),
    contacto_cargo: nulo(linea(b.contacto_cargo, 120)),
    contacto_email: linea(b.contacto_email, 160).toLowerCase(),
    contacto_tel: nulo(linea(b.contacto_tel, 40)),
    comercial_email: nulo(linea(b.comercial_email, 160).toLowerCase()),
    comercial_tel: nulo(linea(b.comercial_tel, 40)),

    acepta_privacidad: b.acepta_privacidad === true,
    acepta_publicacion: b.acepta_publicacion === true,
    imagenes_propias: b.imagenes_propias === true,
    notas: nulo(parrafos(b.notas, 1500))
  };

  const faltan = [];
  if (!s.marca) faltan.push('marca');
  if (!s.estado) faltan.push('estado');
  if (!s.municipio) faltan.push('municipio');
  if (!s.tipo) faltan.push('tipo');
  if (!s.sector && !s.sector_otro) faltan.push('sector');
  if (!s.productos.length) faltan.push('productos');
  if (!s.situacion) faltan.push('situacion');
  if (!s.resumen_es) faltan.push('resumen_es');
  if (!s.descripcion_es) faltan.push('descripcion_es');
  if (!s.contacto_nombre) faltan.push('contacto_nombre');
  if (!EMAIL_RE.test(s.contacto_email)) faltan.push('contacto_email');
  if (!s.contacto_tel) faltan.push('contacto_tel');
  if (s.comercial_email && !EMAIL_RE.test(s.comercial_email)) faltan.push('comercial_email');
  if (!s.acepta_privacidad) faltan.push('acepta_privacidad');
  if (!s.acepta_publicacion) faltan.push('acepta_publicacion');

  let logo = null;
  let fotos = [];
  try {
    logo = imagen(b.logo);
    fotos = (Array.isArray(b.fotos) ? b.fotos : []).slice(0, MAX_FOTOS).map(imagen).filter(Boolean);
  } catch (err) {
    return res.status(422).json({ ok: false, error: 'validation', fields: ['imagenes'], motivo: err.message });
  }
  if (!logo) faltan.push('logo');
  if ((logo || fotos.length) && !s.imagenes_propias) faltan.push('imagenes_propias');

  if (faltan.length) return res.status(422).json({ ok: false, error: 'validation', fields: faltan });

  // Límite sencillo contra envíos repetidos
  try {
    const desde = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const r = await fetch(`${url}/rest/v1/solicitudes?select=id&contacto_email=eq.${encodeURIComponent(s.contacto_email)}&creada_en=gte.${desde}&limit=${POR_DIA}`, { headers: cabeceras });
    const previas = r.ok ? await r.json() : [];
    if (Array.isArray(previas) && previas.length >= POR_DIA) {
      return res.status(429).json({ ok: false, error: 'demasiadas' });
    }
  } catch (err) {
    console.error('No se pudo revisar el límite:', err.message);
  }

  // Imágenes primero, en una carpeta con el id de la solicitud
  const id = crypto.randomUUID();
  async function subir(img, nombre) {
    const ruta = `${id}/${nombre}.${img.ext}`;
    const r = await fetch(`${url}/storage/v1/object/solicitudes/${ruta}`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': img.type, 'x-upsert': 'false' }, cabeceras),
      body: img.buf
    });
    if (!r.ok) throw new Error(`storage ${r.status}: ${await r.text()}`);
    return ruta;
  }

  try {
    if (logo) s.logo_path = await subir(logo, 'logo');
    s.fotos_paths = [];
    for (let i = 0; i < fotos.length; i++) s.fotos_paths.push(await subir(fotos[i], `foto-${i + 1}`));
  } catch (err) {
    console.error('Falló la subida de imágenes:', err.message);
    return res.status(502).json({ ok: false, error: 'imagenes_fallidas' });
  }

  try {
    const r = await fetch(`${url}/rest/v1/solicitudes`, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }, cabeceras),
      body: JSON.stringify(Object.assign({ id }, s))
    });
    if (!r.ok) throw new Error(`rest ${r.status}: ${await r.text()}`);
  } catch (err) {
    console.error('No se pudo guardar la solicitud:', err.message);
    return res.status(502).json({ ok: false, error: 'guardado_fallido' });
  }

  // Aviso por correo: si falla, la solicitud ya quedó guardada
  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.REGISTRO_TO || process.env.CONTACT_TO;
  const remitente = process.env.CONTACT_FROM || 'Sur Exporta <no-responder@sur-exporta.com>';
  async function enviar(payload) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  }

  if (apiKey && destino) {
    const filas = [
      ['Empresa', s.marca], ['Razón social', s.razon_social], ['Ubicación', [s.municipio, s.estado].filter(Boolean).join(', ')],
      ['Oferta', s.tipo === 'servicio' ? 'Servicios' : 'Productos'], ['Sector', s.sector_otro || s.sector],
      ['Contacto', [s.contacto_nombre, s.contacto_cargo].filter(Boolean).join(' · ')],
      ['Correo', s.contacto_email], ['Teléfono', s.contacto_tel]
    ].filter((f) => f[1]).map((f) =>
      `<tr><td style="padding:8px 14px;border-bottom:1px solid #e7edf3;color:#4a5a6b;font-size:13px;white-space:nowrap">${esc(f[0])}</td>` +
      `<td style="padding:8px 14px;border-bottom:1px solid #e7edf3;color:#0b1f33;font-size:14px">${esc(f[1])}</td></tr>`).join('');
    try {
      await enviar({
        from: remitente,
        to: destino.split(',').map((x) => x.trim()).filter(Boolean),
        reply_to: s.contacto_email,
        subject: `Nueva solicitud de registro: ${s.marca}`,
        html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px">
          <div style="background:#04162b;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0">
            <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e0a63a">Sur Exporta · Registro</div>
            <div style="font-size:19px;font-weight:bold;margin-top:4px">${esc(s.marca)}</div>
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e7edf3;border-top:0">${filas}</table>
          <p style="font-size:14px;margin-top:16px">Revísala completa en el <a href="https://www.sur-exporta.com/admin.html#solicitudes">Panel de Vinculación → Solicitudes</a>.</p>
        </div>`
      });
    } catch (err) {
      console.error('No se pudo avisar de la solicitud:', err.message);
    }

    if (process.env.CONTACT_ACK === 'on') {
      try {
        await enviar({
          from: remitente,
          to: [s.contacto_email],
          subject: 'Recibimos tu solicitud de registro — Sur Exporta',
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#0b1f33;font-size:14px;line-height:1.6">
            Hola ${esc(s.contacto_nombre)}:<br><br>
            Recibimos la solicitud para incorporar a <strong>${esc(s.marca)}</strong> en Sur Exporta.
            El equipo de COMCE Región Sur revisará la información y te contactará si necesitamos algún dato adicional antes de publicar la ficha.<br><br>
            Este mensaje es automático, no es necesario responderlo.
            <p style="color:#4a5a6b;font-size:12px;margin-top:20px">COMCE Región Sur · sur-exporta.com</p>
          </div>`
        });
      } catch (err) {
        console.error('No se pudo enviar el acuse de registro:', err.message);
      }
    }
  }

  return res.status(200).json({ ok: true });
};
