/* Sur Exporta — recepción de requerimientos
 * Función de Vercel. Recibe el formulario y envía el correo con Resend.
 *
 * Variables de entorno necesarias (se configuran en Vercel, nunca en el repositorio):
 *   RESEND_API_KEY   llave de Resend
 *   CONTACT_TO       correo que recibe los requerimientos (admite varios separados por coma)
 *   CONTACT_FROM     remitente; por defecto "Sur Exporta <no-responder@sur-exporta.com>"
 */
'use strict';

const LIMITES = { need: 3000, name: 120, company: 160, email: 160, country: 80 };

const TEXTOS = {
  es: {
    asunto: (empresa) => empresa ? `Requerimiento para ${empresa}` : 'Nuevo requerimiento — Sur Exporta',
    need: 'Requerimiento', name: 'Nombre', company: 'Empresa', email: 'Correo',
    country: 'País', timeline: 'Plazo', about: 'Sobre la empresa', origen: 'Origen',
    acuseAsunto: 'Recibimos tu requerimiento — Sur Exporta',
    acuseCuerpo: (nombre) => `Hola ${nombre}:<br><br>Recibimos tu requerimiento en Sur Exporta. El equipo de COMCE Región Sur lo revisará y te responderá en los próximos días hábiles.<br><br>Este mensaje es automático, no es necesario responderlo.`
  },
  en: {
    asunto: (empresa) => empresa ? `Sourcing brief for ${empresa}` : 'New sourcing brief — Sur Exporta',
    need: 'Brief', name: 'Name', company: 'Company', email: 'Email',
    country: 'Country', timeline: 'Timeline', about: 'About company', origen: 'Source',
    acuseAsunto: 'We received your brief — Sur Exporta',
    acuseCuerpo: (nombre) => `Hello ${nombre},<br><br>We received your brief on Sur Exporta. The COMCE Southern Region team will review it and reply within the next business days.<br><br>This is an automated message; there is no need to reply.`
  }
};

const PLAZOS = {
  asap: { es: 'Lo antes posible', en: 'As soon as possible' },
  '3m': { es: 'En los próximos 3 meses', en: 'Within 3 months' },
  '6m': { es: 'En los próximos 6 meses', en: 'Within 6 months' },
  explore: { es: 'Solo explorando', en: 'Just exploring' }
};

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function limpiar(v, max) {
  // Quita saltos de línea de los campos de una sola línea: evita inyección de cabeceras
  return String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').trim().slice(0, max);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function fila(etiqueta, valor) {
  if (!valor) return '';
  return `<tr>
    <td style="padding:8px 14px;border-bottom:1px solid #e7edf3;color:#4a5a6b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(etiqueta)}</td>
    <td style="padding:8px 14px;border-bottom:1px solid #e7edf3;color:#0b1f33;font-size:14px">${esc(valor).replace(/\n/g, '<br>')}</td>
  </tr>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const destino = process.env.CONTACT_TO;
  const remitente = process.env.CONTACT_FROM || 'Sur Exporta <no-responder@sur-exporta.com>';

  if (!apiKey || !destino) {
    console.error('Faltan variables de entorno: RESEND_API_KEY o CONTACT_TO');
    return res.status(500).json({ ok: false, error: 'config' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || typeof body !== 'object') return res.status(400).json({ ok: false, error: 'bad_request' });

  // Campo trampa: los robots lo llenan, las personas no lo ven
  if (limpiar(body.website, 100)) return res.status(200).json({ ok: true });

  // Envío sospechosamente rápido tras cargar el formulario
  const transcurrido = Number(body.elapsed);
  if (Number.isFinite(transcurrido) && transcurrido < 2500) {
    return res.status(200).json({ ok: true });
  }

  const lang = body.lang === 'en' ? 'en' : 'es';
  const t = TEXTOS[lang];

  const datos = {
    need: String(body.need == null ? '' : body.need).trim().slice(0, LIMITES.need),
    name: limpiar(body.name, LIMITES.name),
    company: limpiar(body.company, LIMITES.company),
    email: limpiar(body.email, LIMITES.email),
    country: limpiar(body.country, LIMITES.country),
    timeline: limpiar(body.timeline, 20),
    empresa: limpiar(body.company_slug, 80),
    origen: limpiar(body.page, 200)
  };

  const faltan = [];
  if (!datos.need) faltan.push('need');
  if (!datos.name) faltan.push('name');
  if (!EMAIL_RE.test(datos.email)) faltan.push('email');
  if (!body.consent) faltan.push('consent');
  if (faltan.length) return res.status(422).json({ ok: false, error: 'validation', fields: faltan });

  const plazo = PLAZOS[datos.timeline] ? PLAZOS[datos.timeline][lang] : datos.timeline;

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px">
  <div style="background:#04162b;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0">
    <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e0a63a">Sur Exporta</div>
    <div style="font-size:19px;font-weight:bold;margin-top:4px">${esc(t.asunto(datos.empresa))}</div>
  </div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e7edf3;border-top:0">
    ${fila(t.need, datos.need)}
    ${fila(t.name, datos.name)}
    ${fila(t.company, datos.company)}
    ${fila(t.email, datos.email)}
    ${fila(t.country, datos.country)}
    ${fila(t.timeline, plazo)}
    ${fila(t.about, datos.empresa)}
    ${fila(t.origen, datos.origen)}
  </table>
  <p style="color:#4a5a6b;font-size:12px;margin-top:12px">
    Enviado desde sur-exporta.com · ${esc(new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }))} (hora del centro de México)
  </p>
</div>`;

  async function enviar(payload) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
    return r.json();
  }

  try {
    await enviar({
      from: remitente,
      to: destino.split(',').map((s) => s.trim()).filter(Boolean),
      reply_to: datos.email,
      subject: t.asunto(datos.empresa),
      html
    });
  } catch (err) {
    console.error('Fallo al enviar el requerimiento:', err.message);
    return res.status(502).json({ ok: false, error: 'send_failed' });
  }

  // Acuse de recibo: si falla, el requerimiento ya llegó a COMCE, así que no se reporta error
  if (process.env.CONTACT_ACK === 'on') {
    try {
      await enviar({
        from: remitente,
        to: [datos.email],
        subject: t.acuseAsunto,
        html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#0b1f33;font-size:14px;line-height:1.6">
          ${t.acuseCuerpo(esc(datos.name))}
          <p style="color:#4a5a6b;font-size:12px;margin-top:20px">COMCE Región Sur · sur-exporta.com</p>
        </div>`
      });
    } catch (err) {
      console.error('No se pudo enviar el acuse:', err.message);
    }
  }

  return res.status(200).json({ ok: true });
};
