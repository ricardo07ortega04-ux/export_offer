/* Sur Exporta — lógica del directorio
 * Sin dependencias. Requiere data.js cargado antes.
 */
(function () {
  'use strict';

  var SE = window.SE;
  if (!SE) return;

  // Le avisa al failsafe del <head> que app.js sí arrancó.
  window.__seReady = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Idioma ---------- */

  var lang = store.get('se-lang');
  if (lang !== 'es' && lang !== 'en') {
    lang = (navigator.language || 'es').toLowerCase().indexOf('en') === 0 ? 'en' : 'es';
  }
  function t(key) {
    var d = SE.i18n[lang];
    return (d && d[key] !== undefined) ? d[key] : key;
  }
  function tp(key, n) {
    return t(key).replace('{n}', fmt(n));
  }
  function fmt(n) {
    return Number(n).toLocaleString(lang === 'en' ? 'en-US' : 'es-MX');
  }
  function country(name) {
    return lang === 'en' ? (SE.paises[name] || name) : name;
  }
  function cert(name) {
    return lang === 'en' ? (SE.certificaciones[name] || name) : name;
  }
  function sector(id) {
    var s = SE.sectores[id];
    return s ? s[lang] : id;
  }
  // Tipo de oferta de una empresa: 'producto' o 'servicio', según su sector
  function tipoDe(c) {
    var s = SE.sectores[c.sector];
    return (s && s.tipo) || 'producto';
  }
  function tipoTexto(v) {
    return t(v === 'servicio' ? 'tipoServicio' : 'tipoProducto');
  }
  function loc(obj) {
    return obj && typeof obj === 'object' ? (obj[lang] || obj.es) : obj;
  }

  function applyI18n(root) {
    (root || document).querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    // Contenido editorial bilingüe presente en el HTML (fichas de empresa)
    (root || document).querySelectorAll('[data-es][data-en]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
    (root || document).querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length === 2) el.setAttribute(bits[0].trim(), t(bits[1].trim()));
      });
    });
    document.documentElement.lang = t('htmlLang');
    var title = document.querySelector('[data-title-es]');
    if (title) document.title = lang === 'en' ? title.getAttribute('data-title-en') : title.getAttribute('data-title-es');
  }

  function setLang(next) {
    lang = next;
    store.set('se-lang', next);
    applyI18n();
    if (typeof render === 'function') { buildFilters(); render(); }
    if (typeof renderProfile === 'function') renderProfile();
  }

  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLang(lang === 'es' ? 'en' : 'es'); });
  });

  /* ---------- Utilidades ---------- */

  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function svg(id, cls) {
    return '<svg class="' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function initials(name) {
    return name.replace(/^Mezcal\s+/i, '').trim().charAt(0).toUpperCase();
  }

  /* ---------- Encabezado ---------- */

  var menuBtn = document.querySelector('[data-menu-toggle]');
  var menuNav = document.getElementById('nav-mobile');
  if (menuBtn && menuNav) {
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      menuNav.hidden = open;
    });
    menuNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menuBtn.setAttribute('aria-expanded', 'false'); menuNav.hidden = true; }
    });
  }

  /* ---------- Revelado al hacer scroll ---------- */

  var revealIO = null;

  function observeReveals(root) {
    var items = (root || document).querySelectorAll('[data-reveal]:not(.is-in)');
    if (!items.length) return;

    if (reduce.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    // Pase sincrónico: lo que ya está a la vista (o por encima) se muestra de
    // inmediato. El observador no se ejecuta en pestañas en segundo plano, así
    // que sin esto el contenido del pliegue superior podría quedar invisible.
    var pending = [];
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('is-in');
      else pending.push(el);
    });
    if (!pending.length) return;

    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-in'); revealIO.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    pending.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Contadores ---------- */

  // Las cifras del inicio se calculan con los datos publicados
  function syncStats() {
    var unicos = function (campo) {
      var s = {};
      SE.empresas.forEach(function (c) { c[campo].forEach(function (v) { s[v] = 1; }); });
      return Object.keys(s).length;
    };
    var valores = {
      empresas: SE.empresas.length,
      mercados: unicos('mercados'),
      certs: unicos('certs'),
      capacidad: SE.empresas.reduce(function (a, c) { return a + (c.capacidad || 0); }, 0)
    };
    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var v = valores[el.getAttribute('data-stat')];
      if (v === undefined) return;
      el.setAttribute('data-count', v);
      el.textContent = fmt(v);
    });
  }

  function runCounters() {
    syncStats();
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;
    nodes.forEach(function (el) {
      var target = Number(el.getAttribute('data-count'));
      if (reduce.matches || !('IntersectionObserver' in window)) { el.textContent = fmt(target); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(el);
          var start = performance.now(), dur = 1100;
          (function tick(now) {
            var p = Math.min(1, (now - start) / dur);
            var e = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(Math.round(target * e));
            if (p < 1) requestAnimationFrame(tick);
          })(start);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------- Formulario de requerimiento ---------- */

  function wireBriefForm(form) {
    if (!form) return;
    var scope = form.closest('.form-card') || form.closest('.panel') || document;
    var box = scope.querySelector('[data-form-errors]');
    var ok = scope.querySelector('[data-form-ok]');
    var submit = form.querySelector('button[type="submit"]');
    var cargado = Date.now();

    function checks() {
      return [
        { el: form.querySelector('[name="need"]'), key: 'formErrNeed', test: function (el) { return el.value.trim().length > 0; } },
        { el: form.querySelector('[name="name"]'), key: 'formErrName', test: function (el) { return el.value.trim().length > 0; } },
        { el: form.querySelector('[name="email"]'), key: 'formErrEmail', test: function (el) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim()); } },
        { el: form.querySelector('[name="consent"]'), key: 'formErrConsent', test: function (el) { return el.checked; } }
      ].filter(function (c) { return c.el; });
    }

    function mark(c, bad) {
      var field = c.el.closest('.field');
      if (field) field.classList.toggle('has-error', bad);
      c.el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    }

    checks().forEach(function (c) {
      var evento = c.el.type === 'checkbox' ? 'change' : 'blur';
      c.el.addEventListener(evento, function () {
        if (c.el.type === 'checkbox' || c.el.value.trim() !== '' || c.el.getAttribute('aria-invalid') === 'true') {
          mark(c, !c.test(c.el));
        }
      });
    });

    function mostrarError(titulo, cuerpo) {
      if (!box) return;
      box.querySelector('h3').textContent = titulo;
      box.querySelector('ul').innerHTML = cuerpo ? '<li>' + esc(cuerpo) + '</li>' : '';
      box.hidden = false;
      box.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var bad = [];
      checks().forEach(function (c) {
        var fail = !c.test(c.el);
        mark(c, fail);
        if (fail) bad.push(c);
      });

      if (ok) ok.hidden = true;

      if (bad.length) {
        if (box) {
          box.querySelector('h3').textContent = t('formErrTitle');
          box.querySelector('ul').innerHTML = bad.map(function (c) {
            return '<li><a href="#' + c.el.id + '">' + esc(t(c.key)) + '</a></li>';
          }).join('');
          box.hidden = false;
          box.focus();
        }
        return;
      }

      if (box) box.hidden = true;

      var datos = {
        need: form.querySelector('[name="need"]').value,
        name: form.querySelector('[name="name"]').value,
        email: form.querySelector('[name="email"]').value,
        company: (form.querySelector('[name="company"]') || {}).value || '',
        country: (form.querySelector('[name="country"]') || {}).value || '',
        timeline: (form.querySelector('[name="timeline"]') || {}).value || '',
        company_slug: (form.querySelector('[name="company_slug"]') || {}).value || '',
        website: (form.querySelector('[name="website"]') || {}).value || '',
        consent: true,
        lang: lang,
        page: location.pathname,
        elapsed: Date.now() - cargado
      };

      var etiquetaOriginal = submit ? submit.textContent : '';
      if (submit) { submit.setAttribute('aria-busy', 'true'); submit.textContent = t('formSending'); }

      fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      }).then(function (r) {
        return r.json().catch(function () { return { ok: r.ok }; });
      }).then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.error) || 'error');
        form.reset();
        cargado = Date.now();
        form.querySelectorAll('.field.has-error').forEach(function (f) { f.classList.remove('has-error'); });
        if (ok) { ok.hidden = false; ok.focus(); }
      }).catch(function () {
        mostrarError(t('formFail'), t('formFailBody'));
      }).then(function () {
        if (submit) { submit.removeAttribute('aria-busy'); submit.textContent = etiquetaOriginal || t('formSubmit'); }
      });
    });
  }

  /* =========================================================
     Directorio (solo en index.html)
     ========================================================= */

  var cardsEl = document.querySelector('[data-cards]');
  var render, buildFilters;

  if (cardsEl) {
    var groupsEl = document.querySelector('[data-filter-groups]');
    var resultsEl = document.querySelector('[data-results]');
    var chipsEl = document.querySelector('[data-active-chips]');
    var sortEl = document.querySelector('[data-sort]');
    var clearAllBtn = document.querySelector('[data-clear-all]');
    var filtersForm = document.getElementById('filters');
    var filtersToggle = document.querySelector('[data-filters-toggle]');

    var LISTAS = ['tipo', 'mercado', 'cert', 'sector', 'estado'];
    var state = { q: '', tipo: [], mercado: [], cert: [], sector: [], estado: [], maquila: false, sort: 'relevance', view: 'grid' };

    /* --- Estado en la URL --- */
    function readURL() {
      var p = new URLSearchParams(location.search);
      state.q = p.get('q') || '';
      LISTAS.forEach(function (k) {
        state[k] = (p.get(k) || '').split(',').filter(Boolean);
      });
      state.maquila = p.get('maquila') === '1';
      state.sort = p.get('sort') || 'relevance';
      state.view = p.get('view') === 'list' ? 'list' : (store.get('se-view') === 'list' ? 'list' : 'grid');
    }
    function writeURL() {
      var p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      LISTAS.forEach(function (k) {
        if (state[k].length) p.set(k, state[k].join(','));
      });
      if (state.maquila) p.set('maquila', '1');
      if (state.sort !== 'relevance') p.set('sort', state.sort);
      if (state.view === 'list') p.set('view', 'list');
      var qs = p.toString();
      history.replaceState(null, '', qs ? '?' + qs + location.hash : location.pathname + location.hash);
    }

    /* --- Filtrado --- */
    function matchesExcept(c, skip) {
      if (state.q) {
        var hay = norm([c.marca, c.razonSocial, c.municipio, c.estado, loc(c.resumen), sector(c.sector), tipoTexto(tipoDe(c)),
          c.productos.join(' '), c.certs.join(' '), c.mercados.join(' '),
          c.mercados.map(country).join(' '), c.certs.map(cert).join(' ')].join(' '));
        var terms = norm(state.q).split(/\s+/).filter(Boolean);
        for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) === -1) return false;
      }
      if (skip !== 'tipo' && state.tipo.length && state.tipo.indexOf(tipoDe(c)) === -1) return false;
      if (skip !== 'mercado' && state.mercado.length && !state.mercado.every(function (m) { return c.mercados.indexOf(m) > -1; })) return false;
      if (skip !== 'cert' && state.cert.length && !state.cert.every(function (x) { return c.certs.indexOf(x) > -1; })) return false;
      if (skip !== 'sector' && state.sector.length && state.sector.indexOf(c.sector) === -1) return false;
      if (skip !== 'estado' && state.estado.length && state.estado.indexOf(c.estado) === -1) return false;
      if (skip !== 'maquila' && state.maquila && !c.maquila) return false;
      return true;
    }
    function filtered() { return SE.empresas.filter(function (c) { return matchesExcept(c, null); }); }

    function sorted(list) {
      var l = list.slice();
      // Las empresas de servicios no tienen litros ni año: sin dato cuentan como 0 / al final
      var n = function (v) { return v || 0; };
      var anio = function (v) { return v || 9999; };
      if (state.sort === 'capacity') l.sort(function (a, b) { return n(b.capacidad) - n(a.capacidad); });
      else if (state.sort === 'markets') l.sort(function (a, b) { return b.mercados.length - a.mercados.length; });
      else if (state.sort === 'experience') l.sort(function (a, b) { return anio(a.desde) - anio(b.desde); });
      else if (state.sort === 'name') l.sort(function (a, b) { return a.marca.localeCompare(b.marca, 'es'); });
      else l.sort(function (a, b) { return (n(b.capacidadExportada) - n(a.capacidadExportada)) || (b.mercados.length - a.mercados.length); });
      return l;
    }

    /* --- Panel de filtros --- */
    // Sectores presentes, ordenados por tipo (productos primero) y luego por nombre.
    // Si hay un tipo elegido, solo se ofrecen los sectores de ese tipo.
    function sectoresVisibles() {
      var s = {};
      SE.empresas.forEach(function (c) {
        if (!state.tipo.length || state.tipo.indexOf(tipoDe(c)) > -1) s[c.sector] = 1;
      });
      state.sector.forEach(function (v) { s[v] = 1; });   // lo ya marcado nunca desaparece
      return Object.keys(s).sort(function (a, b) {
        var ta = (SE.sectores[a] || {}).tipo === 'servicio' ? 1 : 0;
        var tb = (SE.sectores[b] || {}).tipo === 'servicio' ? 1 : 0;
        return (ta - tb) || sector(a).localeCompare(sector(b), 'es');
      });
    }

    var FACETS = [
      { key: 'tipo', label: 'filterTipo', values: function () {
          var s = {}; SE.empresas.forEach(function (c) { s[tipoDe(c)] = 1; });
          return ['producto', 'servicio'].filter(function (v) { return s[v]; });
        }, text: tipoTexto, test: function (c, v) { return tipoDe(c) === v; }, hideSingle: true },
      { key: 'mercado', label: 'filterMercado', values: function () { var s = {}; SE.empresas.forEach(function (c) { c.mercados.forEach(function (m) { s[m] = 1; }); }); return Object.keys(s).sort(function (a, b) { return country(a).localeCompare(country(b), 'es'); }); }, text: country },
      { key: 'cert', label: 'filterCert', values: function () { var s = {}; SE.empresas.forEach(function (c) { c.certs.forEach(function (m) { s[m] = 1; }); }); return Object.keys(s).sort(function (a, b) { return cert(a).localeCompare(cert(b), 'es'); }); }, text: cert },
      { key: 'sector', label: 'filterSector', values: sectoresVisibles, text: sector },
      { key: 'estado', label: 'filterEstado', values: function () { var s = {}; SE.empresas.forEach(function (c) { s[c.estado] = 1; }); return Object.keys(s).sort(); }, text: function (v) { return v; } }
    ];

    buildFilters = function () {
      var html = '';
      FACETS.forEach(function (f) {
        var vals = f.values();
        // Mientras todo el directorio sea de un solo tipo, el filtro de tipo no se muestra
        if (f.hideSingle && vals.length < 2 && !state[f.key].length) return;
        if (vals.length < 2 && f.key !== 'mercado' && f.key !== 'cert') {
          // Con un solo valor el filtro no aporta: se muestra como dato, no como control.
          html += '<div class="filter-group"><h4>' + esc(t(f.label)) + '</h4>' +
            '<p style="font-size:var(--fs-sm);color:var(--pizarra);margin:0">' + esc(f.text(vals[0])) + '</p></div>';
          return;
        }
        var pool = SE.empresas.filter(function (c) { return matchesExcept(c, f.key); });
        html += '<div class="filter-group"><h4>' + esc(t(f.label)) + '</h4><div class="filter-opts">';
        var tipoPrevio = null;
        vals.forEach(function (v) {
          var n = pool.filter(function (c) {
            return f.test ? f.test(c, v)
              : f.key === 'mercado' ? c.mercados.indexOf(v) > -1
              : f.key === 'cert' ? c.certs.indexOf(v) > -1
                : f.key === 'sector' ? c.sector === v : c.estado === v;
          }).length;
          var on = state[f.key].indexOf(v) > -1;
          // Con productos y servicios a la vez, los sectores llevan un subtítulo por tipo
          if (f.key === 'sector' && FACETS[0].values().length > 1 && !state.tipo.length) {
            var tipoV = (SE.sectores[v] || {}).tipo || 'producto';
            if (tipoV !== tipoPrevio) {
              html += '<p class="filter-sub">' + esc(tipoTexto(tipoV)) + '</p>';
              tipoPrevio = tipoV;
            }
          }
          html += '<label class="check' + (n === 0 && !on ? ' is-empty' : '') + '">' +
            '<input type="checkbox" data-facet="' + f.key + '" value="' + esc(v) + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + esc(f.text(v)) + '</span><span class="count">' + n + '</span></label>';
        });
        html += '</div></div>';
      });

      // La maquila solo aplica a productos
      var soloServicios = state.tipo.length === 1 && state.tipo[0] === 'servicio';
      if (!soloServicios) html += '<div class="filter-group"><h4>' + esc(t('filterMaquila')) + '</h4><div class="filter-opts">' +
        '<label class="check"><input type="checkbox" data-facet="maquila"' + (state.maquila ? ' checked' : '') + '>' +
        '<span>' + esc(t('filterMaquilaOn')) + '</span><span class="count">' +
        SE.empresas.filter(function (c) { return matchesExcept(c, 'maquila') && c.maquila; }).length +
        '</span></label></div></div>';

      groupsEl.innerHTML = html;
    };

    /* --- Fichas activas --- */
    function renderChips() {
      var out = [];
      function chip(key, value, label) {
        out.push('<button class="chip-remove" type="button" data-remove="' + key + '" data-value="' + esc(value) + '" ' +
          'aria-label="' + esc(t('clearOne') + ': ' + label) + '"><span class="txt">' + esc(label) + '</span>' + svg('i-x') + '</button>');
      }
      if (state.q) chip('q', '', '“' + state.q + '”');
      state.tipo.forEach(function (v) { chip('tipo', v, tipoTexto(v)); });
      state.mercado.forEach(function (v) { chip('mercado', v, country(v)); });
      state.cert.forEach(function (v) { chip('cert', v, cert(v)); });
      state.sector.forEach(function (v) { chip('sector', v, sector(v)); });
      state.estado.forEach(function (v) { chip('estado', v, v); });
      if (state.maquila) chip('maquila', '', t('filterMaquilaOn'));
      chipsEl.innerHTML = out.join('');
      if (clearAllBtn) clearAllBtn.hidden = out.length === 0;
    }

    /* --- Tarjetas --- */
    var CHIP_LIMIT = 3;

    function chipRow(values, textFn, cls, id) {
      var shown = values.slice(0, CHIP_LIMIT);
      var rest = values.slice(CHIP_LIMIT);
      var html = shown.map(function (v) { return '<span class="chip ' + cls + '">' + esc(textFn(v)) + '</span>'; }).join('');
      if (rest.length) {
        html += '<span class="chip ' + cls + '" hidden data-extra="' + id + '">' +
          rest.map(function (v) { return esc(textFn(v)); }).join('</span><span class="chip ' + cls + '" hidden data-extra="' + id + '">') + '</span>';
        html += '<button class="chip chip-more" type="button" data-more="' + id + '" ' +
          'aria-expanded="false" aria-label="' + esc(tp('moreLabel', rest.length)) + '">+' + rest.length + '</button>';
      }
      return html;
    }

    function metric(label, value) {
      return '<div><p class="metric-l">' + esc(label) + '</p><p class="metric-v">' + value + '</p></div>';
    }

    function cardHTML(c, i) {
      var href = 'empresa-' + c.slug + '.html';
      var servicio = tipoDe(c) === 'servicio';
      var logo = 'logo-' + c.slug + '.webp';
      var monograma = c.logo === false || c.slug === 'mezcal-lyobaa';
      var lugar = [c.municipio, c.estado].filter(Boolean).map(esc).join(' · ');

      // Productos con capacidad registrada: litros y año. Servicios, o productos
      // sin ese dato (socios de COMCE): sector y año.
      var metricas = servicio || !c.capacidad
        ? metric(t('filterSector'), '<span class="metric-txt">' + esc(sector(c.sector)) + '</span>') +
          (c.desde ? metric(t(servicio ? 'serviceSince' : 'since'), c.desde) : '')
        : metric(t('capacity'), fmt(c.capacidad || 0) + ' <small>L</small>') +
          metric(t('available'), fmt((c.capacidad || 0) - (c.capacidadExportada || 0)) + ' <small>L</small>') +
          (c.desde ? metric(t('since'), c.desde) : '');

      return '<article class="card' + (reduce.matches ? '' : ' card-enter') + '" style="--d:' + (i * 55) + 'ms">' +
        '<div class="card-top">' +
          (monograma
            ? '<span class="card-mono" aria-hidden="true">' + esc(initials(c.marca)) + '</span>'
            : '<img src="' + logo + '" alt="' + esc(c.marca) + '" loading="lazy" decoding="async">') +
          (loc(c.destacado) ? '<span class="card-flag">' + svg('i-spark') + esc(loc(c.destacado)) + '</span>' : '') +
        '</div>' +
        '<div class="card-body">' +
          '<p class="card-place">' + svg('i-pin') + lugar + '</p>' +
          '<h3 class="card-title"><a href="' + href + '">' + esc(c.marca) + '</a></h3>' +
          '<p class="card-sum">' + esc(loc(c.resumen) || '') + '</p>' +
          (servicio && c.productos.length ? '<div class="chips">' + chipRow(c.productos, function (v) { return v; }, 'chip-serv', c.slug + '-s') + '</div>' : '') +
          '<div class="chips">' + chipRow(c.mercados, country, 'chip-market', c.slug + '-m') + '</div>' +
          '<div class="chips">' + chipRow(c.certs, cert, 'chip-cert', c.slug + '-c') + '</div>' +
          '<div class="card-metrics">' + metricas + '</div>' +
        '</div>' +
        '<div class="card-foot">' +
          '<span class="card-note">' + svg('i-globe') + '<span>' +
            (c.mercados.length ? fmt(c.mercados.length) + ' ' + esc(t(c.mercados.length === 1 ? 'marketOne' : 'markets').toLowerCase()) : esc(tipoTexto(tipoDe(c)))) +
          '</span></span>' +
          '<a class="btn btn-outline btn-sm" href="' + href + '">' + esc(t('viewProfile')) + '</a>' +
        '</div>' +
      '</article>';
    }

    function emptyHTML() {
      return '<div class="empty">' + svg('i-empty') +
        '<h3>' + esc(t('emptyTitle')) + '</h3><p>' + esc(t('emptyBody')) + '</p>' +
        '<a class="btn btn-primary" href="#contacto">' + esc(t('emptyCta')) + '</a></div>';
    }

    render = function () {
      var list = sorted(filtered());

      cardsEl.classList.toggle('is-list', state.view === 'list');
      cardsEl.innerHTML = list.length ? list.map(cardHTML).join('') : emptyHTML();

      resultsEl.textContent = list.length === 0 ? t('resultsNone')
        : list.length === 1 ? t('resultsOne') : tp('resultsMany', list.length);

      renderChips();
      if (sortEl) sortEl.value = state.sort;
      document.querySelectorAll('[data-view]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === state.view));
      });
      writeURL();
    };

    /* --- Eventos --- */

    groupsEl.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-facet]');
      if (!input) return;
      var key = input.getAttribute('data-facet');
      if (key === 'maquila') {
        state.maquila = input.checked;
      } else {
        var v = input.value;
        var idx = state[key].indexOf(v);
        if (input.checked && idx === -1) state[key].push(v);
        if (!input.checked && idx > -1) state[key].splice(idx, 1);
        // Al elegir un tipo se sueltan los sectores del otro tipo, que ya no darían resultados
        if (key === 'tipo' && state.tipo.length) {
          state.sector = state.sector.filter(function (s) {
            return state.tipo.indexOf((SE.sectores[s] || {}).tipo || 'producto') > -1;
          });
          if (state.tipo.indexOf('producto') === -1) state.maquila = false;
        }
      }
      buildFilters();
      render();
    });

    chipsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove]');
      if (!btn) return;
      var key = btn.getAttribute('data-remove');
      if (key === 'q') { state.q = ''; syncSearchInputs(); }
      else if (key === 'maquila') state.maquila = false;
      else {
        var v = btn.getAttribute('data-value');
        state[key] = state[key].filter(function (x) { return x !== v; });
      }
      buildFilters();
      render();
    });

    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function () {
        state.q = ''; state.maquila = false;
        LISTAS.forEach(function (k) { state[k] = []; });
        syncSearchInputs();
        buildFilters();
        render();
      });
    }

    if (sortEl) sortEl.addEventListener('change', function () { state.sort = sortEl.value; render(); });

    document.querySelectorAll('[data-view]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.view = b.getAttribute('data-view');
        store.set('se-view', state.view);
        render();
      });
    });

    // Desplegar el resto de las fichas de un grupo
    cardsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-more]');
      if (!btn) return;
      var id = btn.getAttribute('data-more');
      btn.parentNode.querySelectorAll('[data-extra="' + id + '"]').forEach(function (n) { n.hidden = false; });
      btn.setAttribute('aria-expanded', 'true');
      btn.remove();
    });

    if (filtersToggle && filtersForm) {
      filtersToggle.addEventListener('click', function () {
        var open = filtersForm.classList.toggle('is-open');
        filtersToggle.setAttribute('aria-expanded', String(open));
        filtersToggle.querySelector('span').textContent = t(open ? 'filtersHide' : 'filtersShow');
      });
    }

    /* --- Buscador --- */
    var searchInputs = [];
    document.querySelectorAll('[data-hero-search] input[type="search"]').forEach(function (i) { searchInputs.push(i); });

    function syncSearchInputs() {
      searchInputs.forEach(function (i) { i.value = state.q; });
    }

    var debounce;
    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
          state.q = input.value;
          buildFilters();
          render();
        }, 220);
      });
    });
    document.querySelectorAll('[data-hero-search]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearTimeout(debounce);
        var input = form.querySelector('input[type="search"]');
        state.q = input ? input.value : '';
        buildFilters();
        render();
        document.getElementById('directorio').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
      });
    });

    /* --- Arranque --- */
    readURL();
    syncSearchInputs();
    applyI18n();
    buildFilters();
    render();
  } else {
    applyI18n();
  }

  /* =========================================================
     Ficha de empresa
     ========================================================= */

  var meter = document.querySelector('[data-meter]');
  if (meter) {
    var pct = Number(meter.getAttribute('data-meter'));
    if (reduce.matches || !('IntersectionObserver' in window) ||
        meter.getBoundingClientRect().top < window.innerHeight) {
      meter.style.width = pct + '%';
    } else {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { meter.style.width = pct + '%'; mio.unobserve(meter); }
        });
      }, { threshold: 0.5 });
      mio.observe(meter);
    }
  }

  /* =========================================================
     Aviso de privacidad: el índice marca la sección en pantalla
     ========================================================= */

  var tocLinks = document.querySelectorAll('.lg-toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var tocMap = {};
    tocLinks.forEach(function (a) { tocMap[a.getAttribute('href').slice(1)] = a; });
    var tocIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tocLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        var link = tocMap[en.target.id];
        if (link) link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(tocMap).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) tocIO.observe(sec);
    });
  }

  /* ---------- Arranque general ---------- */

  document.querySelectorAll('[data-brief-form]').forEach(wireBriefForm);
  observeReveals();
  runCounters();

  function ready() {
    document.documentElement.classList.add('is-ready');
    document.dispatchEvent(new CustomEvent('comce:ready'));
  }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);
})();
