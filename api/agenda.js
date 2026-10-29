/* Sur Exporta — agenda de reuniones
 * Función de Vercel.
 *   GET  /api/agenda   espacios libres de las próximas semanas
 *   POST /api/agenda   aparta un espacio: guarda la cita, crea el evento en Google
 *                      Calendar con enlace de Google Meet e invita a la persona
 *
 * Variables de entorno (se configuran en Vercel, nunca en el repositorio):
 *   GOOGLE_CLIENT_ID           cliente OAuth del proyecto de Google Cloud
 *   GOOGLE_CLIENT_SECRET       secreto de ese cliente
 *   GOOGLE_REFRESH_TOKEN       permiso permanente; se obtiene con «node agenda-autorizar.js»
 *   AGENDA_CALENDARIO          opcional: id del calendario; por defecto «primary»
 *   SUPABASE_URL               URL del proyecto
 *   SUPABASE_SERVICE_ROLE_KEY  llave secreta (service_role). Solo vive en Vercel.
 *   RESEND_API_KEY             opcional: aviso por correo de cada cita nueva
 *   AGENDA_TO                  opcional: quién recibe el aviso; si falta, se usa CONTACT_TO
 *   CONTACT_FROM               opcional: remitente del aviso
 */
'use strict';

const crypto = require('crypto');

/* ---------- Horario ---------- */

// Hora del centro de México: UTC−6 todo el año (sin horario de verano desde 2022)
const ZONA = 'America/Mexico_City';
const DESFASE_HORAS = -6;
const DIAS = [1, 2, 3, 5];                     // lunes, martes, miércoles y viernes
const HORAS = [10, 11, 12, 13, 14, 15, 16];    // inicios; la última reunión termina a las 17:00
const DURACION_MIN = 60;
const ANTICIPACION_HORAS = 24;
const VENTANA_DIAS = 28;                       // se puede agendar hasta cuatro semanas adelante
const POR_CORREO = 2;                          // citas futuras confirmadas por correo
// Días de descanso obligatorio (Ley Federal del Trabajo): no se ofrecen aunque caigan en día hábil.
// Para vacaciones u otros días, basta con marcarlos como ocupados en el calendario.
const INHABILES = ['2026-11-16', '2026-12-25', '2027-01-01', '2027-02-01', '2027-03-15', '2027-09-16', '2027-11-15', '2027-12-25'];

const HORA = 3600 * 1000;
const dos = (n) => String(n).padStart(2, '0');

// Instante (ms) de una hora local de México
function instante(y, m, d, h) {
  return Date.UTC(y, m, d, h - DESFASE_HORAS);
}

// Espacios del horario a partir de «ahora», sin los que choquen con «ocupados» [{inicio, fin}] en ms
function espacios(ahora, ocupados) {
  const hoy = new Date(ahora + DESFASE_HORAS * HORA);
  const dias = [];
  for (let k = 0; k <= VENTANA_DIAS; k++) {
    const f = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() + k));
    if (DIAS.indexOf(f.getUTCDay()) < 0) continue;
    const y = f.getUTCFullYear(), m = f.getUTCMonth(), d = f.getUTCDate();
    const fecha = `${y}-${dos(m + 1)}-${dos(d)}`;
    if (INHABILES.indexOf(fecha) > -1) continue;
    const horas = HORAS.filter((h) => {
      const ini = instante(y, m, d, h);
      const fin = ini + DURACION_MIN * 60 * 1000;
      if (ini - ahora < ANTICIPACION_HORAS * HORA) return false;
      return !ocupados.some((o) => o.inicio < fin && o.fin > ini);
    }).map((h) => `${dos(h)}:00`);
    dias.push({ fecha, horas });
  }
  return dias;
}

// Valida que fecha y hora caigan dentro del horario; devuelve el inicio en ms o null
function inicioValido(fecha, hora, ahora) {
  const mf = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || '');
  const mh = /^(\d{2}):00$/.exec(hora || '');
  if (!mf || !mh) return null;
  const y = Number(mf[1]), m = Number(mf[2]) - 1, d = Number(mf[3]), h = Number(mh[1]);
  const f = new Date(Date.UTC(y, m, d));
  if (f.getUTCMonth() !== m || f.getUTCDate() !== d) return null;
  if (DIAS.indexOf(f.getUTCDay()) < 0 || HORAS.indexOf(h) < 0) return null;
  if (INHABILES.indexOf(fecha) > -1) return null;
  const ini = instante(y, m, d, h);
  if (ini - ahora < ANTICIPACION_HORAS * HORA) return null;
  if (ini - ahora > (VENTANA_DIAS + 1) * 24 * HORA) return null;
  return ini;
}

/* ---------- Google Calendar ---------- */

let tokenCache = null;

async function tokenGoogle() {
  if (tokenCache && tokenCache.vence > Date.now() + 60000) return tokenCache.valor;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  const j = await r.json();
  tokenCache = { valor: j.access_token, vence: Date.now() + (j.expires_in || 3600) * 1000 };
  return tokenCache.valor;
}

const calendario = () => process.env.AGENDA_CALENDARIO || 'primary';

async function ocupadosGoogle(desde, hasta) {
  const token = await tokenGoogle();
  const r = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: new Date(desde).toISOString(),
      timeMax: new Date(hasta).toISOString(),
      timeZone: ZONA,
      items: [{ id: calendario() }]
    })
  });
  if (!r.ok) throw new Error(`freeBusy ${r.status}: ${await r.text()}`);
  const j = await r.json();
  const cal = j.calendars && j.calendars[calendario()];
  if (!cal || (cal.errors && cal.errors.length)) throw new Error(`freeBusy sin calendario: ${JSON.stringify(cal)}`);
  return (cal.busy || []).map((b) => ({ inicio: Date.parse(b.start), fin: Date.parse(b.end) }));
}

// ¿El evento sigue vigente en el calendario? (si se borró o canceló, la cita ya no aparta el horario)
async function eventoVigente(id) {
  const token = await tokenGoogle();
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendario())}/events/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (r.status === 404 || r.status === 410) return false;
  if (!r.ok) throw new Error(`events.get ${r.status}: ${await r.text()}`);
  return (await r.json()).status !== 'cancelled';
}

async function crearEvento(cita) {
  const token = await tokenGoogle();
  const t = TEXTOS[cita.idioma];
  const r = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendario())}/events?conferenceDataVersion=1&sendUpdates=all`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: t.titulo(cita.empresa || cita.nombre),
      description: [
        t.intro,
        '',
        `${t.nombre}: ${cita.nombre}`,
        cita.empresa && `${t.empresa}: ${cita.empresa}`,
        `${t.correo}: ${cita.email}`,
        cita.tema && `${t.tema}: ${cita.tema}`,
        cita.ref && `${t.ref}: ${cita.ref}`
      ].filter((x) => x !== null && x !== undefined && x !== false).join('\n'),
      start: { dateTime: new Date(cita.inicio).toISOString(), timeZone: ZONA },
      end: { dateTime: new Date(cita.fin).toISOString(), timeZone: ZONA },
      attendees: [{ email: cita.email, displayName: cita.nombre }],
      guestsCanModify: false,
      guestsCanInviteOthers: true,
      reminders: { useDefault: true },
      conferenceData: {
        createRequest: { requestId: cita.id, conferenceSolutionKey: { type: 'hangoutsMeet' } }
      }
    })
  });
  if (!r.ok) throw new Error(`events.insert ${r.status}: ${await r.text()}`);
  const ev = await r.json();
  const video = ((ev.conferenceData && ev.conferenceData.entryPoints) || []).filter((e) => e.entryPointType === 'video')[0];
  return { id: ev.id, meet: ev.hangoutLink || (video && video.uri) || null };
}

/* ---------- Textos ---------- */

const TEXTOS = {
  es: {
    titulo: (quien) => `Reunión Sur Exporta · ${quien}`,
    intro: 'Reunión agendada desde sur-exporta.com/agenda con COMCE Región Sur.',
    nombre: 'Nombre', empresa: 'Empresa', correo: 'Correo', tema: 'Tema', ref: 'Referencia'
  },
  en: {
    titulo: (quien) => `Sur Exporta meeting · ${quien}`,
    intro: 'Meeting booked at sur-exporta.com/agenda with COMCE Southern Region.',
    nombre: 'Name', empresa: 'Company', correo: 'Email', tema: 'Topic', ref: 'Reference'
  }
};

// Correo de confirmación para quien agenda
const CONFIRMACION = {
  es: {
    locale: 'es-MX',
    asunto: (fecha) => `Tu reunión con COMCE Región Sur quedó agendada · ${fecha}`,
    titulo: 'Tu reunión quedó agendada',
    saludo: (nombre) => `Hola ${nombre}:`,
    intro: 'Gracias por agendar una reunión con COMCE Región Sur para platicar de Sur Exporta. Estos son los datos:',
    fecha: 'Fecha', hora: 'Hora', horas: (a, b) => `De ${a} a ${b} (hora del centro de México)`,
    tema: 'Tema', boton: 'Entrar a Google Meet',
    calendario: 'También te llegará la invitación de Google Calendar para que la agregues a tu calendario.',
    cambios: 'Si necesitas cambiar la fecha o cancelar, responde a este correo y lo vemos.',
    firma: 'COMCE Región Sur · sur-exporta.com'
  },
  en: {
    locale: 'en-US',
    asunto: (fecha) => `Your meeting with COMCE Southern Region is booked · ${fecha}`,
    titulo: 'Your meeting is booked',
    saludo: (nombre) => `Hello ${nombre},`,
    intro: 'Thank you for booking a meeting with COMCE Southern Region to talk about Sur Exporta. Here are the details:',
    fecha: 'Date', hora: 'Time', horas: (a, b) => `${a}–${b} (Central Mexico time, UTC−6)`,
    tema: 'Topic', boton: 'Join Google Meet',
    calendario: 'You will also receive a Google Calendar invitation so you can add it to your calendar.',
    cambios: 'If you need to reschedule or cancel, just reply to this email.',
    firma: 'COMCE Southern Region · sur-exporta.com'
  }
};

function confirmacion(cita, meet) {
  const c = CONFIRMACION[cita.idioma];
  const fecha = new Date(cita.inicio).toLocaleDateString(c.locale, { timeZone: ZONA, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hora = (ms) => new Date(ms).toLocaleTimeString('es-MX', { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const Fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const fila = (etiqueta, valor) => `<tr>
    <td style="padding:10px 14px;border-bottom:1px solid #e7edf3;color:#4a5a6b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(etiqueta)}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #e7edf3;color:#0b1f33;font-size:15px;font-weight:bold">${esc(valor).replace(/\n/g, '<br>')}</td>
  </tr>`;
  return {
    to: [cita.email],
    reply_to: process.env.AGENDA_REPLY_TO || 'ricardo_ortega@sur-exporta.com',
    subject: c.asunto(Fecha),
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;color:#0b1f33;font-size:15px;line-height:1.6">
      <div style="background:#04162b;color:#fff;padding:22px 24px;border-radius:10px 10px 0 0">
        <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e0a63a">Sur Exporta · ${cita.idioma === 'en' ? 'Meeting' : 'Agenda'}</div>
        <div style="font-size:22px;font-weight:bold;margin-top:6px">${esc(c.titulo)}</div>
      </div>
      <div style="background:#ffffff;border:1px solid #e7edf3;border-top:0;border-radius:0 0 10px 10px;padding:22px 24px">
        <p style="margin:0 0 12px">${esc(c.saludo(cita.nombre))}</p>
        <p style="margin:0 0 16px">${esc(c.intro)}</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e7edf3;border-bottom:0">
          ${fila(c.fecha, Fecha)}
          ${fila(c.hora, c.horas(hora(cita.inicio), hora(cita.fin)))}
          ${cita.tema ? fila(c.tema, cita.tema) : ''}
        </table>
        ${meet ? `<p style="margin:22px 0"><a href="${esc(meet)}" style="display:inline-block;background:#e0a63a;color:#04162b;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${esc(c.boton)}</a></p>
        <p style="margin:0 0 16px;font-size:13px;color:#4a5a6b"><a href="${esc(meet)}" style="color:#014476">${esc(meet)}</a></p>` : ''}
        <p style="margin:0 0 8px">${esc(c.calendario)}</p>
        <p style="margin:0">${esc(c.cambios)}</p>
        <p style="margin:22px 0 0;font-size:12px;color:#4a5a6b">${esc(c.firma)}</p>
      </div>
    </div>`
  };
}

function linea(v, max) {
  return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
}
function parrafos(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const configGoogle = () => process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN;

/* ---------- Handler ---------- */

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configGoogle()) {
    console.error('Faltan variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN');
    return res.status(500).json({ ok: false, error: 'config' });
  }

  if (req.method === 'GET') {
    const ahora = Date.now();
    try {
      const ocupados = await ocupadosGoogle(ahora, ahora + (VENTANA_DIAS + 1) * 24 * HORA);
      return res.status(200).json({ ok: true, zona: ZONA, duracion: DURACION_MIN, dias: espacios(ahora, ocupados) });
    } catch (err) {
      console.error('No se pudo leer la disponibilidad:', err.message);
      return res.status(502).json({ ok: false, error: 'calendario' });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const url = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !llave) {
    console.error('Faltan variables: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ ok: false, error: 'config' });
  }
  const cabeceras = { apikey: llave, Authorization: `Bearer ${llave}`, 'Content-Type': 'application/json' };

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || typeof b !== 'object') return res.status(400).json({ ok: false, error: 'bad_request' });

  // Campo trampa y envío demasiado rápido: se responde bien y no se aparta nada
  if (linea(b.website, 100)) return res.status(200).json({ ok: true });
  const transcurrido = Number(b.elapsed);
  if (Number.isFinite(transcurrido) && transcurrido < 4000) return res.status(200).json({ ok: true });

  const ahora = Date.now();
  const cita = {
    id: crypto.randomUUID(),
    nombre: linea(b.nombre, 120),
    empresa: linea(b.empresa, 160) || null,
    email: linea(b.email, 160).toLowerCase(),
    tema: parrafos(b.tema, 1500) || null,
    idioma: b.lang === 'en' ? 'en' : 'es',
    ref: linea(b.ref, 60) || null,
    origen: linea(b.page, 200) || null,
    inicio: inicioValido(linea(b.fecha, 10), linea(b.hora, 5), ahora)
  };

  const faltan = [];
  if (cita.inicio === null) faltan.push('espacio');
  if (!cita.nombre) faltan.push('nombre');
  if (!EMAIL_RE.test(cita.email)) faltan.push('email');
  if (!b.consent) faltan.push('consent');
  if (faltan.length) return res.status(422).json({ ok: false, error: 'validation', fields: faltan });
  cita.fin = cita.inicio + DURACION_MIN * 60 * 1000;

  // Límite por correo: pocas citas futuras a la vez
  try {
    const r = await fetch(`${url}/rest/v1/citas?select=id&email=eq.${encodeURIComponent(cita.email)}&estatus=eq.confirmada&inicio=gte.${new Date(ahora).toISOString()}&limit=${POR_CORREO}`, { headers: cabeceras });
    const previas = r.ok ? await r.json() : [];
    if (Array.isArray(previas) && previas.length >= POR_CORREO) return res.status(429).json({ ok: false, error: 'demasiadas' });
  } catch (err) {
    console.error('No se pudo revisar el límite de citas:', err.message);
  }

  // El espacio sigue libre en el calendario (alguien pudo ocuparlo desde que se cargó la página)
  try {
    const ocupados = await ocupadosGoogle(cita.inicio, cita.fin);
    if (ocupados.some((o) => o.inicio < cita.fin && o.fin > cita.inicio)) return res.status(409).json({ ok: false, error: 'ocupado' });
  } catch (err) {
    console.error('No se pudo revisar el espacio:', err.message);
    return res.status(502).json({ ok: false, error: 'calendario' });
  }

  // Se guarda primero: el índice único por horario impide dos citas en el mismo espacio
  const fila = {
    id: cita.id, inicio: new Date(cita.inicio).toISOString(), fin: new Date(cita.fin).toISOString(),
    nombre: cita.nombre, empresa: cita.empresa, email: cita.email, tema: cita.tema,
    idioma: cita.idioma, ref: cita.ref, origen: cita.origen
  };
  const guardar = () => fetch(`${url}/rest/v1/citas`, {
    method: 'POST',
    headers: Object.assign({ Prefer: 'return=minimal' }, cabeceras),
    body: JSON.stringify(fila)
  });
  try {
    let r = await guardar();
    if (r.status === 409) {
      // El calendario dice que el espacio está libre pero hay una cita confirmada a esa hora:
      // si su evento se borró o canceló en Google Calendar, se marca cancelada y se libera
      const q = await fetch(`${url}/rest/v1/citas?select=id,evento_id&estatus=eq.confirmada&inicio=eq.${encodeURIComponent(fila.inicio)}`, { headers: cabeceras });
      const previa = q.ok ? (await q.json())[0] : null;
      // Sin evento_id puede ser una cita que se está creando en este momento: se respeta
      if (!previa || !previa.evento_id || await eventoVigente(previa.evento_id)) {
        return res.status(409).json({ ok: false, error: 'ocupado' });
      }
      await fetch(`${url}/rest/v1/citas?id=eq.${previa.id}`, {
        method: 'PATCH',
        headers: Object.assign({ Prefer: 'return=minimal' }, cabeceras),
        body: JSON.stringify({ estatus: 'cancelada', notas: 'Evento borrado o cancelado en Google Calendar' })
      });
      r = await guardar();
      if (r.status === 409) return res.status(409).json({ ok: false, error: 'ocupado' });
    }
    if (!r.ok) throw new Error(`rest ${r.status}: ${await r.text()}`);
  } catch (err) {
    console.error('No se pudo guardar la cita:', err.message);
    return res.status(502).json({ ok: false, error: 'guardado_fallido' });
  }

  let evento;
  try {
    evento = await crearEvento(cita);
  } catch (err) {
    console.error('No se pudo crear el evento:', err.message);
    // Sin evento no hay cita: se libera el espacio
    await fetch(`${url}/rest/v1/citas?id=eq.${cita.id}`, { method: 'DELETE', headers: cabeceras }).catch(() => {});
    return res.status(502).json({ ok: false, error: 'calendario' });
  }

  try {
    await fetch(`${url}/rest/v1/citas?id=eq.${cita.id}`, {
      method: 'PATCH',
      headers: Object.assign({ Prefer: 'return=minimal' }, cabeceras),
      body: JSON.stringify({ evento_id: evento.id, meet_url: evento.meet })
    });
  } catch (err) {
    console.error('No se pudo guardar el enlace de la cita:', err.message);
  }

  // Correos: si fallan, la cita ya está en el calendario
  const apiKey = process.env.RESEND_API_KEY;
  const remitente = process.env.CONTACT_FROM || 'Sur Exporta <no-responder@sur-exporta.com>';
  async function enviar(payload) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ from: remitente }, payload))
    });
    if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
  }

  // Confirmación a quien agendó, en el idioma en que lo hizo
  if (apiKey) {
    try {
      await enviar(confirmacion(cita, evento.meet));
    } catch (err) {
      console.error('No se pudo enviar la confirmación de la cita:', err.message);
    }
  }

  // Aviso interno a COMCE
  const destino = process.env.AGENDA_TO || process.env.CONTACT_TO;
  if (apiKey && destino) {
    const cuando = new Date(cita.inicio).toLocaleString('es-MX', { timeZone: ZONA, dateStyle: 'full', timeStyle: 'short' });
    const filas = [
      ['Cuándo', `${cuando} (hora del centro de México)`], ['Nombre', cita.nombre], ['Empresa', cita.empresa],
      ['Correo', cita.email], ['Tema', cita.tema], ['Referencia', cita.ref], ['Google Meet', evento.meet]
    ].filter((f) => f[1]).map((f) =>
      `<tr><td style="padding:8px 14px;border-bottom:1px solid #e7edf3;color:#4a5a6b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(f[0])}</td>` +
      `<td style="padding:8px 14px;border-bottom:1px solid #e7edf3;color:#0b1f33;font-size:14px">${esc(f[1]).replace(/\n/g, '<br>')}</td></tr>`).join('');
    try {
      await enviar({
        to: destino.split(',').map((x) => x.trim()).filter(Boolean),
        reply_to: cita.email,
        subject: `Nueva cita: ${cita.empresa || cita.nombre} · ${cuando}`,
        html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px">
          <div style="background:#04162b;color:#fff;padding:18px 20px;border-radius:10px 10px 0 0">
            <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#e0a63a">Sur Exporta · Agenda</div>
            <div style="font-size:19px;font-weight:bold;margin-top:4px">${esc(cita.empresa || cita.nombre)}</div>
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e7edf3;border-top:0">${filas}</table>
        </div>`
      });
    } catch (err) {
      console.error('No se pudo avisar de la cita:', err.message);
    }
  }

  return res.status(200).json({ ok: true, inicio: fila.inicio, fin: fila.fin, meet: evento.meet });
}

module.exports = handler;
// Para las pruebas locales
module.exports.espacios = espacios;
module.exports.inicioValido = inicioValido;
