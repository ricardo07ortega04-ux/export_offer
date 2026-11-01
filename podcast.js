/* Sur Exporta Podcast — lista de episodios y logotipo animado de podcast.html
 * Requiere app.js (idioma, menú y animaciones de entrada).
 *
 * Para publicar un episodio, agrega un objeto al arreglo EPISODIOS (o cambia el
 * que está como «proximamente» a «publicado») con estos campos:
 *
 *   numero    1, 2, 3…
 *   estado    'publicado' o 'proximamente'
 *   titulo    { es: '…', en: '…' }
 *   resumen   { es: '…', en: '…' }
 *   fecha     'AAAA-MM-DD' (día de publicación)
 *   duracion  minutos, por ejemplo 25
 *   invitado  'Nombre Apellido' (opcional)
 *   cargo     { es: '…', en: '…' } (opcional)
 *   empresa   { nombre: '…', slug: 'las-vegas-premium-limes' } (opcional; el slug enlaza a su ficha)
 *   temas     [{ es: '…', en: '…' }, …] (opcional)
 *   youtube   identificador del video, por ejemplo 'dQw4w9WgXcQ' (opcional)
 *   spotify   enlace al episodio en Spotify (opcional)
 *   apple     enlace al episodio en Apple Podcasts (opcional)
 *
 * El video de YouTube no se carga hasta que la persona pulsa «reproducir», y se
 * usa youtube-nocookie.com: la página no deja cookies de Google antes de eso.
 */
(function () {
  'use strict';

  // Enlaces al programa completo en cada plataforma. Vacío = «Próximamente».
  var PLATAFORMAS = {
    youtube: 'https://www.youtube.com/@Sur-Exporta',
    spotify: '',
    apple: ''
  };

  var EPISODIOS = [
    {
      numero: 1,
      estado: 'proximamente',
      titulo: { es: 'Bienvenida', en: 'Welcome' },
      resumen: {
        es: 'El episodio que abre el podcast: qué es COMCE Región Sur, por qué nace Sur Exporta, cómo funciona el directorio y qué historias vienen.',
        en: 'The episode that opens the podcast: what COMCE Southern Region is, why Sur Exporta was created, how the directory works and the stories still to come.'
      },
      temas: [
        { es: 'COMCE Región Sur', en: 'COMCE Southern Region' },
        { es: 'Sur Exporta', en: 'Sur Exporta' },
        { es: 'Exportar desde el sur', en: 'Exporting from the south' }
      ]
    }
  ];

  var TEXTOS = {
    es: {
      episodio: 'Episodio', min: 'min', pronto: 'Próximamente',
      con: 'Con', de: 'de', reproducir: 'Reproducir',
      ficha: 'Ver la ficha de', buscar: 'Buscar por empresa, tema o invitado',
      conteo: function (n) { return n === 1 ? '1 episodio' : n + ' episodios'; },
      ninguno: 'Ningún episodio coincide con tu búsqueda.',
      enProduccion: 'El primer episodio está en producción. Mientras tanto, ',
      enProduccionLiga: 'conoce a las empresas del directorio',
      logo: 'Logotipo de Sur Exporta Podcast. Repetir la animación.'
    },
    en: {
      episodio: 'Episode', min: 'min', pronto: 'Coming soon',
      con: 'With', de: 'at', reproducir: 'Play',
      ficha: 'See the profile of', buscar: 'Search by company, topic or guest',
      conteo: function (n) { return n === 1 ? '1 episode' : n + ' episodes'; },
      ninguno: 'No episode matches your search.',
      enProduccion: 'The first episode is in production. In the meantime, ',
      enProduccionLiga: 'meet the companies in the directory',
      logo: 'Sur Exporta Podcast logo. Replay the animation.'
    }
  };

  var PLAT = [
    ['youtube', 'YouTube', 'i-video'],
    ['spotify', 'Spotify', 'i-onda'],
    ['apple', 'Apple Podcasts', 'i-mic']
  ];

  var lista = document.querySelector('[data-pc-lista]');
  if (!lista) return;
  var plataformas = document.querySelector('[data-pc-plataformas]');
  var herramientas = document.querySelector('[data-pc-herramientas]');
  var buscar = document.querySelector('[data-pc-buscar]');
  var conteo = document.querySelector('[data-pc-conteo]');
  var logo = document.querySelector('[data-pc-logo]');

  // Mismo criterio que app.js: lo guardado, o el idioma del navegador
  function idioma() {
    var l = null;
    try { l = localStorage.getItem('se-lang'); } catch (e) {}
    if (l !== 'es' && l !== 'en') l = (navigator.language || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
    return l;
  }
  function loc(o, l) { return o && typeof o === 'object' ? (o[l] || o.es) : (o || ''); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function icono(id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function fecha(iso, l) {
    if (!iso) return '';
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString(l === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  var PORTADA = '<div class="pc-ep-portada" aria-hidden="true">' +
    '<svg viewBox="0 0 300 120"><line class="frontera" x1="168" y1="8" x2="168" y2="112"/>' +
    '<path class="trayecto" d="M40 95 Q150 -10 254.7 64.8"/><circle class="origen" cx="40" cy="95" r="6"/>' +
    '<circle class="destino" cx="262" cy="70" r="9"/><circle class="centro" cx="262" cy="70" r="3.5"/></svg>' +
    '<b>SUR <span style="color:var(--ocre)">—</span> EXPORTA</b></div>';

  function tarjeta(ep, l, destacado) {
    var T = TEXTOS[l];
    var titulo = loc(ep.titulo, l);
    var pronto = ep.estado !== 'publicado';
    var media = ep.youtube && !pronto
      ? '<button class="pc-play" type="button" data-yt="' + esc(ep.youtube) + '" data-titulo="' + esc(titulo) + '">' +
          '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(ep.youtube) + '/hqdefault.jpg" alt="" loading="lazy">' +
          '<span class="pc-play-icono">' + icono('i-play') + '</span>' +
          '<span class="u-sr">' + esc(T.reproducir + ': ' + titulo) + '</span></button>'
      : PORTADA + (pronto ? '<span class="pc-sello">' + esc(T.pronto) + '</span>' : '');

    var meta = [T.episodio + ' ' + ep.numero];
    if (ep.fecha && !pronto) meta.push(fecha(ep.fecha, l));
    if (ep.duracion) meta.push(ep.duracion + ' ' + T.min);

    var invitado = '';
    if (ep.invitado) {
      invitado = T.con + ' ' + ep.invitado;
      if (ep.cargo) invitado += ', ' + loc(ep.cargo, l);
      if (ep.empresa) invitado += ' ' + T.de + ' ' + ep.empresa.nombre;
    }

    var temas = (ep.temas || []).map(function (t) { return '<li>' + esc(loc(t, l)) + '</li>'; }).join('');

    var links = '';
    if (ep.spotify) links += '<a class="btn btn-sm btn-outline" href="' + esc(ep.spotify) + '" target="_blank" rel="noopener">' + icono('i-onda') + 'Spotify</a>';
    if (ep.apple) links += '<a class="btn btn-sm btn-outline" href="' + esc(ep.apple) + '" target="_blank" rel="noopener">' + icono('i-mic') + 'Apple Podcasts</a>';
    if (ep.empresa && ep.empresa.slug) {
      links += '<a class="btn btn-sm btn-primary" href="/empresa-' + esc(ep.empresa.slug) + '">' + icono('i-ficha') +
        esc(T.ficha + ' ' + ep.empresa.nombre) + '</a>';
    }

    return '<article class="pc-ep' + (destacado ? ' pc-ep--destacado' : '') + '" id="ep-' + ep.numero + '">' +
      '<div class="pc-ep-media">' + media + '</div>' +
      '<div class="pc-ep-cuerpo">' +
        '<p class="pc-ep-meta">' + esc(meta.join(' · ')) + '</p>' +
        '<h3>' + esc(titulo) + '</h3>' +
        (invitado ? '<p class="pc-ep-invitado">' + esc(invitado) + '</p>' : '') +
        '<p class="pc-ep-resumen">' + esc(loc(ep.resumen, l)) + '</p>' +
        (temas ? '<ul class="pc-ep-temas">' + temas + '</ul>' : '') +
        (links ? '<div class="pc-ep-links">' + links + '</div>' : '') +
      '</div></article>';
  }

  function coincide(ep, q, l) {
    if (!q) return true;
    var texto = [loc(ep.titulo, l), loc(ep.resumen, l), ep.invitado, ep.empresa && ep.empresa.nombre]
      .concat((ep.temas || []).map(function (t) { return loc(t, l); })).join(' ');
    return norm(texto).indexOf(q) !== -1;
  }

  function render() {
    var l = idioma();
    var T = TEXTOS[l];

    plataformas.innerHTML = PLAT.map(function (p) {
      var url = PLATAFORMAS[p[0]];
      return url
        ? '<a class="pc-plat" href="' + esc(url) + '" target="_blank" rel="noopener">' + icono(p[2]) + esc(p[1]) + '</a>'
        : '<span class="pc-plat is-pronto">' + icono(p[2]) + esc(p[1]) + ' <small>' + esc(T.pronto) + '</small></span>';
    }).join('');

    var publicados = EPISODIOS.filter(function (e) { return e.estado === 'publicado'; })
      .sort(function (a, b) { return b.numero - a.numero; });
    var proximos = EPISODIOS.filter(function (e) { return e.estado !== 'publicado'; })
      .sort(function (a, b) { return a.numero - b.numero; });

    // El buscador solo tiene sentido cuando ya hay varios episodios
    herramientas.hidden = publicados.length < 4;
    buscar.placeholder = T.buscar;
    var q = herramientas.hidden ? '' : norm(buscar.value.trim());
    var visibles = publicados.filter(function (e) { return coincide(e, q, l); });
    if (!herramientas.hidden) conteo.textContent = T.conteo(visibles.length);

    var html = visibles.map(function (e, i) { return tarjeta(e, l, i === 0 && !q); }).join('');
    if (!q) html += proximos.map(function (e, i) { return tarjeta(e, l, !publicados.length && i === 0); }).join('');
    if (!html) html = '<p class="pc-vacio">' + esc(T.ninguno) + '</p>';
    if (!publicados.length) {
      html += '<p class="pc-vacio" style="grid-column:1/-1">' + esc(T.enProduccion) +
        '<a href="/#directorio">' + esc(T.enProduccionLiga) + '</a>.</p>';
    }
    lista.innerHTML = html;
    if (logo) logo.setAttribute('aria-label', T.logo);
  }

  // Reproductor: el iframe de YouTube se crea solo al pulsar
  lista.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-yt]');
    if (!btn) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(btn.getAttribute('data-yt')) + '?autoplay=1&rel=0';
    f.title = btn.getAttribute('data-titulo');
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    btn.replaceWith(f);
  });

  buscar.addEventListener('input', render);

  // app.js cambia el idioma en su propio clic; se vuelve a dibujar justo después
  document.querySelectorAll('[data-lang-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { setTimeout(render, 0); });
  });

  // Logotipo: la animación corre cuando entra en pantalla (en celular queda
  // debajo del texto) y se repite al tocarlo
  if (logo) {
    var reproducir = function () {
      logo.classList.remove('is-playing');
      void logo.offsetWidth;
      logo.classList.add('is-playing');
    };
    var r = logo.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.75 || !('IntersectionObserver' in window)) {
      reproducir();
    } else {
      logo.classList.add('is-waiting');
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { io.disconnect(); logo.classList.remove('is-waiting'); reproducir(); }
      }, { threshold: 0.35 });
      io.observe(logo);
    }
    logo.addEventListener('click', reproducir);
  }

  render();
})();
