/* Sur Exporta — agenda de reuniones
 * Sin dependencias. Pide los espacios libres a /api/agenda y aparta el elegido.
 * Los horarios llegan en hora del centro de México; si la persona está en otra
 * zona, se le muestra también su hora local.
 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var raiz = $('[data-agenda]');
  if (!raiz) return;

  var DESFASE_HORAS = -6; // hora del centro de México, igual que en /api/agenda
  var cargado = Date.now();

  var T = {
    es: {
      cargando: 'Cargando horarios…',
      sinEspacios: 'Por ahora no hay espacios libres. Escríbenos desde la página de contacto y buscamos otro momento.',
      errorCarga: 'No pudimos cargar los horarios. Intenta de nuevo en unos minutos o escríbenos desde la página de contacto.',
      lleno: 'Sin espacios',
      notaHora: 'Hora del centro de México.',
      notaLocal: 'Entre paréntesis, la hora en tu zona.',
      tuHora: 'tu hora',
      resumen: function (dia, ini, fin) { return dia + ', de ' + ini + ' a ' + fin + ' (hora del centro de México)'; },
      enviando: 'Agendando…',
      enviar: 'Agendar reunión',
      errTitulo: 'Revisa estos campos',
      errNombre: 'Escribe tu nombre',
      errEmail: 'Escribe un correo electrónico válido',
      errConsent: 'Necesitamos tu autorización para tratar tus datos',
      ocupado: 'Ese horario se acaba de ocupar. Elige otro, por favor.',
      demasiadas: 'Ya tienes reuniones agendadas con este correo. Si necesitas otra, escríbenos desde la página de contacto.',
      fallo: 'No pudimos agendar la reunión. Intenta de nuevo en unos minutos o escríbenos desde la página de contacto.',
      noAlcanza: 'Este horario ya no está disponible. Elige otro, por favor.'
    },
    en: {
      cargando: 'Loading times…',
      sinEspacios: 'There are no open times right now. Write to us from the contact page and we will find another time.',
      errorCarga: 'We could not load the available times. Please try again in a few minutes or write to us from the contact page.',
      lleno: 'Fully booked',
      notaHora: 'Central Mexico time.',
      notaLocal: 'Your local time is shown in brackets.',
      tuHora: 'your time',
      resumen: function (dia, ini, fin) { return dia + ', ' + ini + '–' + fin + ' (Central Mexico time)'; },
      enviando: 'Booking…',
      enviar: 'Book meeting',
      errTitulo: 'Please check these fields',
      errNombre: 'Enter your name',
      errEmail: 'Enter a valid email address',
      errConsent: 'We need your consent to process your details',
      ocupado: 'That time was just taken. Please choose another one.',
      demasiadas: 'You already have meetings booked with this email. If you need another one, write to us from the contact page.',
      fallo: 'We could not book the meeting. Please try again in a few minutes or write to us from the contact page.',
      noAlcanza: 'This time is no longer available. Please choose another one.'
    }
  };

  var lang = function () { return document.documentElement.lang === 'en' ? 'en' : 'es'; };
  var t = function (k) { return T[lang()][k]; };
  var locale = function () { return lang() === 'en' ? 'en-US' : 'es-MX'; };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mayus(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  var estado = $('[data-ag-estado]');
  var cajaDias = $('[data-ag-dias]');
  var pasoHora = $('[data-ag-paso-hora]');
  var cajaHoras = $('[data-ag-horas]');
  var notaHora = $('[data-ag-nota-hora]');
  var pasoDatos = $('[data-ag-paso-datos]');
  var resumen = $('[data-ag-resumen]');
  var form = $('[data-ag-form]');
  var cajaErrores = $('[data-ag-errores]');
  var boton = $('[data-ag-enviar]');
  var listo = $('[data-ag-listo]');

  var dias = [];
  var elegido = { fecha: null, hora: null };
  var estadoClave = 'cargando';

  // Empresa y referencia pueden venir en la liga de los correos: /agenda?empresa=La%20Morena&ref=SE-2026-006
  var params = new URLSearchParams(location.search);
  var ref = (params.get('ref') || '').slice(0, 60);
  if (params.get('empresa')) $('#ag-empresa').value = params.get('empresa').slice(0, 160);

  /* ---------- Fechas ---------- */

  function partes(fecha) {
    var p = fecha.split('-').map(Number);
    return { y: p[0], m: p[1] - 1, d: p[2] };
  }
  // Mediodía UTC: el día de la semana no cambia con la zona al darle formato
  function diaUTC(fecha) { var p = partes(fecha); return new Date(Date.UTC(p.y, p.m, p.d, 12)); }
  function instante(fecha, hora) {
    var p = partes(fecha);
    return new Date(Date.UTC(p.y, p.m, p.d, Number(hora.slice(0, 2)) - DESFASE_HORAS));
  }
  function fmt(fecha, opciones) {
    return new Intl.DateTimeFormat(locale(), Object.assign({ timeZone: 'UTC' }, opciones)).format(diaUTC(fecha));
  }
  function diaLargo(fecha) { return mayus(fmt(fecha, { weekday: 'long', day: 'numeric', month: 'long' })); }
  function horaFin(hora) { return String(Number(hora.slice(0, 2)) + 1).padStart(2, '0') + ':00'; }

  // Hora local de la persona, solo si su zona no coincide con la del centro de México
  var zonaLocal = '';
  try { zonaLocal = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  function horaLocal(fecha, hora) {
    if (!zonaLocal) return '';
    var i = instante(fecha, hora);
    var opts = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
    var local = new Intl.DateTimeFormat(locale(), Object.assign({ timeZone: zonaLocal }, opts)).format(i);
    var mx = new Intl.DateTimeFormat(locale(), Object.assign({ timeZone: 'America/Mexico_City' }, opts)).format(i);
    return local === mx ? '' : local;
  }

  /* ---------- Pintado ---------- */

  function mostrarEstado(clave) {
    estadoClave = clave;
    estado.hidden = !clave;
    if (clave) estado.innerHTML = esc(t(clave)).replace(/(página de contacto|contact page)/, '<a href="/contacto">$1</a>');
  }

  function pintarDias() {
    cajaDias.innerHTML = dias.map(function (d) {
      var libre = d.horas.length > 0;
      var on = d.fecha === elegido.fecha;
      return '<button type="button" class="ag-dia" data-fecha="' + d.fecha + '" aria-pressed="' + on + '"' +
        (libre ? '' : ' disabled') + ' aria-label="' + esc(diaLargo(d.fecha) + (libre ? '' : ' · ' + t('lleno'))) + '">' +
        '<span class="ag-dia-sem">' + esc(fmt(d.fecha, { weekday: 'short' }).replace('.', '')) + '</span>' +
        '<span class="ag-dia-num">' + partes(d.fecha).d + '</span>' +
        '<span class="ag-dia-mes">' + esc(libre ? fmt(d.fecha, { month: 'short' }).replace('.', '') : t('lleno')) + '</span>' +
        '</button>';
    }).join('');
    cajaDias.hidden = !dias.length;
  }

  function pintarHoras() {
    var d = dias.filter(function (x) { return x.fecha === elegido.fecha; })[0];
    pasoHora.hidden = !d;
    if (!d) return;
    var hayLocal = false;
    cajaHoras.innerHTML = d.horas.map(function (h) {
      var local = horaLocal(d.fecha, h);
      if (local) hayLocal = true;
      return '<button type="button" class="ag-hora" data-hora="' + h + '" aria-pressed="' + (h === elegido.hora) + '">' +
        '<span>' + h + ' – ' + horaFin(h) + '</span>' +
        (local ? '<small>(' + esc(local) + ' ' + esc(t('tuHora')) + ')</small>' : '') + '</button>';
    }).join('');
    notaHora.textContent = diaLargo(d.fecha) + ' · ' + t('notaHora') + (hayLocal ? ' ' + t('notaLocal') : '');
  }

  function pintarResumen() {
    pasoDatos.hidden = !elegido.hora;
    if (!elegido.hora) return;
    var local = horaLocal(elegido.fecha, elegido.hora);
    $('span', resumen).textContent = t('resumen')(diaLargo(elegido.fecha), elegido.hora, horaFin(elegido.hora)) +
      (local ? ' · ' + local + ' ' + t('tuHora') : '');
  }

  function pintar() {
    if (estadoClave) mostrarEstado(estadoClave);
    pintarDias();
    pintarHoras();
    pintarResumen();
    if (!boton.disabled) boton.textContent = t('enviar');
  }

  /* ---------- Datos ---------- */

  function cargar() {
    mostrarEstado('cargando');
    return fetch('/api/agenda', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || r.status); return j; }); })
      .then(function (j) {
        dias = j.dias || [];
        var hay = dias.some(function (d) { return d.horas.length; });
        mostrarEstado(hay ? '' : 'sinEspacios');
        // Si el espacio elegido ya no está, se quita la selección
        var d = dias.filter(function (x) { return x.fecha === elegido.fecha; })[0];
        if (!d || !d.horas.length) elegido = { fecha: null, hora: null };
        else if (d.horas.indexOf(elegido.hora) < 0) elegido.hora = null;
        pintar();
      })
      .catch(function () {
        dias = [];
        mostrarEstado('errorCarga');
        pintar();
      });
  }

  cajaDias.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fecha]');
    if (!b || b.disabled) return;
    elegido = { fecha: b.getAttribute('data-fecha'), hora: null };
    pintar();
    var primera = $('[data-hora]', cajaHoras);
    if (primera) pasoHora.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  cajaHoras.addEventListener('click', function (e) {
    var b = e.target.closest('[data-hora]');
    if (!b) return;
    elegido.hora = b.getAttribute('data-hora');
    pintar();
    resumen.focus({ preventScroll: true });
    pasoDatos.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });

  /* ---------- Envío ---------- */

  var REGLAS = [
    { id: 'ag-nombre', msg: 'errNombre', ok: function (el) { return el.value.trim().length > 0; } },
    { id: 'ag-email', msg: 'errEmail', ok: function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()); } },
    { id: 'ag-consent', msg: 'errConsent', ok: function (el) { return el.checked; } }
  ];

  function marcar(regla, mal) {
    var el = document.getElementById(regla.id);
    el.closest('.field').classList.toggle('has-error', mal);
    el.setAttribute('aria-invalid', mal ? 'true' : 'false');
  }

  function mostrarErrores(items) {
    $('h3', cajaErrores).textContent = t('errTitulo');
    $('ul', cajaErrores).innerHTML = items.map(function (it) {
      return '<li>' + (it.id ? '<a href="#' + it.id + '">' + esc(it.msg) + '</a>' : esc(it.msg)) + '</li>';
    }).join('');
    cajaErrores.hidden = false;
    cajaErrores.focus();
  }

  form.addEventListener('input', function (e) {
    REGLAS.forEach(function (r) {
      var el = document.getElementById(r.id);
      if (el === e.target && el.closest('.field').classList.contains('has-error') && r.ok(el)) marcar(r, false);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    cajaErrores.hidden = true;
    var malas = REGLAS.filter(function (r) { var mal = !r.ok(document.getElementById(r.id)); marcar(r, mal); return mal; });
    if (malas.length) {
      mostrarErrores(malas.map(function (r) { return { id: r.id, msg: t(r.msg) }; }));
      return;
    }

    var datos = {
      fecha: elegido.fecha, hora: elegido.hora,
      nombre: form.nombre.value, empresa: form.empresa.value, email: form.email.value, tema: form.tema.value,
      consent: form.consent.checked, website: form.website.value,
      lang: lang(), ref: ref, page: location.pathname + location.search, elapsed: Date.now() - cargado
    };

    boton.disabled = true;
    boton.textContent = t('enviando');
    fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, j: j }; }); })
      .then(function (res) {
        if (res.status === 200 && res.j.ok) return terminar(res.j);
        var clave = res.j.error === 'ocupado' ? 'ocupado'
          : res.j.error === 'demasiadas' ? 'demasiadas'
          : (res.j.fields || []).indexOf('espacio') > -1 ? 'noAlcanza' : 'fallo';
        mostrarErrores([{ msg: t(clave) }]);
        if (clave === 'ocupado' || clave === 'noAlcanza') cargar();
      })
      .catch(function () { mostrarErrores([{ msg: t('fallo') }]); })
      .then(function () { boton.disabled = false; boton.textContent = t('enviar'); });
  });

  function terminar(j) {
    var cuando = t('resumen')(diaLargo(elegido.fecha), elegido.hora, horaFin(elegido.hora));
    $$('.ag-paso', raiz).forEach(function (p) { p.hidden = true; });
    $('[data-ag-listo-cuando]').textContent = cuando;
    var meet = $('[data-ag-meet]');
    if (j.meet) { meet.href = j.meet; meet.hidden = false; }
    listo.hidden = false;
    listo.focus();
    listo.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // Al cambiar de idioma, app.js traduce lo fijo; aquí se vuelve a pintar lo que se genera
  $$('[data-lang-toggle]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(pintar, 0); }); });

  cargar();
})();
