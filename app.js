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

  function runCounters() {
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
    var scope = form.closest('.form-card') || document;
    var box = scope.querySelector('[data-form-errors]');
    var ok = scope.querySelector('[data-form-ok]');

    function checks() {
      return [
        { id: 'need', el: form.querySelector('[name="need"]'), key: 'formErrNeed', test: function (v) { return v.trim().length > 0; } },
        { id: 'name', el: form.querySelector('[name="name"]'), key: 'formErrName', test: function (v) { return v.trim().length > 0; } },
        { id: 'email', el: form.querySelector('[name="email"]'), key: 'formErrEmail', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } }
      ].filter(function (c) { return c.el; });
    }

    function mark(c, bad) {
      var field = c.el.closest('.field');
      if (field) field.classList.toggle('has-error', bad);
      c.el.setAttribute('aria-invalid', bad ? 'true' : 'false');
    }

    checks().forEach(function (c) {
      c.el.addEventListener('blur', function () {
        if (c.el.value.trim() !== '' || c.el.getAttribute('aria-invalid') === 'true') mark(c, !c.test(c.el.value));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [];
      checks().forEach(function (c) {
        var fail = !c.test(c.el.value);
        mark(c, fail);
        if (fail) bad.push(c);
      });

      if (bad.length) {
        if (ok) ok.hidden = true;
        if (box) {
          var list = box.querySelector('ul');
          list.innerHTML = bad.map(function (c) {
            return '<li><a href="#' + c.el.id + '">' + esc(t(c.key)) + '</a></li>';
          }).join('');
          box.hidden = false;
          box.focus();
        }
        return;
      }

      if (box) box.hidden = true;
      form.reset();
      if (ok) { ok.hidden = false; ok.focus(); }
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

    var state = { q: '', mercado: [], cert: [], sector: [], estado: [], maquila: false, sort: 'relevance', view: 'grid' };

    /* --- Estado en la URL --- */
    function readURL() {
      var p = new URLSearchParams(location.search);
      state.q = p.get('q') || '';
      ['mercado', 'cert', 'sector', 'estado'].forEach(function (k) {
        state[k] = (p.get(k) || '').split(',').filter(Boolean);
      });
      state.maquila = p.get('maquila') === '1';
      state.sort = p.get('sort') || 'relevance';
      state.view = p.get('view') === 'list' ? 'list' : (store.get('se-view') === 'list' ? 'list' : 'grid');
    }
    function writeURL() {
      var p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      ['mercado', 'cert', 'sector', 'estado'].forEach(function (k) {
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
        var hay = norm([c.marca, c.razonSocial, c.municipio, c.estado, loc(c.resumen), sector(c.sector),
          c.productos.join(' '), c.certs.join(' '), c.mercados.join(' '),
          c.mercados.map(country).join(' '), c.certs.map(cert).join(' ')].join(' '));
        var terms = norm(state.q).split(/\s+/).filter(Boolean);
        for (var i = 0; i < terms.length; i++) if (hay.indexOf(terms[i]) === -1) return false;
      }
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
      if (state.sort === 'capacity') l.sort(function (a, b) { return b.capacidad - a.capacidad; });
      else if (state.sort === 'markets') l.sort(function (a, b) { return b.mercados.length - a.mercados.length; });
      else if (state.sort === 'experience') l.sort(function (a, b) { return a.desde - b.desde; });
      else if (state.sort === 'name') l.sort(function (a, b) { return a.marca.localeCompare(b.marca, 'es'); });
      else l.sort(function (a, b) { return (b.capacidadExportada - a.capacidadExportada) || (b.mercados.length - a.mercados.length); });
      return l;
    }

    /* --- Panel de filtros --- */
    var FACETS = [
      { key: 'mercado', label: 'filterMercado', values: function () { var s = {}; SE.empresas.forEach(function (c) { c.mercados.forEach(function (m) { s[m] = 1; }); }); return Object.keys(s).sort(function (a, b) { return country(a).localeCompare(country(b), 'es'); }); }, text: country },
      { key: 'cert', label: 'filterCert', values: function () { var s = {}; SE.empresas.forEach(function (c) { c.certs.forEach(function (m) { s[m] = 1; }); }); return Object.keys(s).sort(function (a, b) { return cert(a).localeCompare(cert(b), 'es'); }); }, text: cert },
      { key: 'sector', label: 'filterSector', values: function () { var s = {}; SE.empresas.forEach(function (c) { s[c.sector] = 1; }); return Object.keys(s); }, text: sector },
      { key: 'estado', label: 'filterEstado', values: function () { var s = {}; SE.empresas.forEach(function (c) { s[c.estado] = 1; }); return Object.keys(s).sort(); }, text: function (v) { return v; } }
    ];

    buildFilters = function () {
      var html = '';
      FACETS.forEach(function (f) {
        var vals = f.values();
        if (vals.length < 2 && f.key !== 'mercado' && f.key !== 'cert') {
          // Con un solo valor el filtro no aporta: se muestra como dato, no como control.
          html += '<div class="filter-group"><h4>' + esc(t(f.label)) + '</h4>' +
            '<p style="font-size:var(--fs-sm);color:var(--pizarra);margin:0">' + esc(f.text(vals[0])) + '</p></div>';
          return;
        }
        var pool = SE.empresas.filter(function (c) { return matchesExcept(c, f.key); });
        html += '<div class="filter-group"><h4>' + esc(t(f.label)) + '</h4><div class="filter-opts">';
        vals.forEach(function (v) {
          var n = pool.filter(function (c) {
            return f.key === 'mercado' ? c.mercados.indexOf(v) > -1
              : f.key === 'cert' ? c.certs.indexOf(v) > -1
                : f.key === 'sector' ? c.sector === v : c.estado === v;
          }).length;
          var on = state[f.key].indexOf(v) > -1;
          html += '<label class="check' + (n === 0 && !on ? ' is-empty' : '') + '">' +
            '<input type="checkbox" data-facet="' + f.key + '" value="' + esc(v) + '"' + (on ? ' checked' : '') + '>' +
            '<span>' + esc(f.text(v)) + '</span><span class="count">' + n + '</span></label>';
        });
        html += '</div></div>';
      });

      html += '<div class="filter-group"><h4>' + esc(t('filterMaquila')) + '</h4><div class="filter-opts">' +
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

    function cardHTML(c, i) {
      var href = 'empresa-' + c.slug + '.html';
      var disponible = c.capacidad - c.capacidadExportada;
      var logo = 'logo-' + c.slug + '.webp';
      var lowRes = c.slug === 'mezcal-lyobaa';

      return '<article class="card' + (reduce.matches ? '' : ' card-enter') + '" style="--d:' + (i * 55) + 'ms">' +
        '<div class="card-top">' +
          (lowRes
            ? '<span class="card-mono" aria-hidden="true">' + esc(initials(c.marca)) + '</span>'
            : '<img src="' + logo + '" alt="' + esc(c.marca) + '" loading="lazy" decoding="async">') +
          '<span class="card-flag">' + svg('i-spark') + esc(loc(c.destacado)) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<p class="card-place">' + svg('i-pin') + esc(c.municipio) + ' · ' + esc(c.estado) + '</p>' +
          '<h3 class="card-title"><a href="' + href + '">' + esc(c.marca) + '</a></h3>' +
          '<p class="card-sum">' + esc(loc(c.resumen)) + '</p>' +
          '<div class="chips">' + chipRow(c.mercados, country, 'chip-market', c.slug + '-m') + '</div>' +
          '<div class="chips">' + chipRow(c.certs, cert, 'chip-cert', c.slug + '-c') + '</div>' +
          '<div class="card-metrics">' +
            '<div><p class="metric-l">' + esc(t('capacity')) + '</p><p class="metric-v">' + fmt(c.capacidad) + ' <small>L</small></p></div>' +
            '<div><p class="metric-l">' + esc(t('available')) + '</p><p class="metric-v">' + fmt(disponible) + ' <small>L</small></p></div>' +
            '<div><p class="metric-l">' + esc(t('since')) + '</p><p class="metric-v">' + c.desde + '</p></div>' +
          '</div>' +
        '</div>' +
        '<div class="card-foot">' +
          '<span class="card-note">' + svg('i-globe') + '<span>' + fmt(c.mercados.length) + ' ' + esc(t('markets').toLowerCase()) + '</span></span>' +
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
        state.q = ''; state.mercado = []; state.cert = []; state.sector = []; state.estado = []; state.maquila = false;
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
