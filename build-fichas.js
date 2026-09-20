/* Sur Exporta — generador de fichas de empresa
 * Uso: node build-fichas.js
 * Lee data.js (única fuente de verdad) y escribe empresa-<slug>.html.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
global.window = {};
new Function(fs.readFileSync(path.join(DIR, 'data.js'), 'utf8')).call(global);
const SE = global.window.SE;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const es = (k) => SE.i18n.es[k];
const en = (k) => SE.i18n.en[k];
const country = (v, l) => (l === 'en' ? SE.paises[v] || v : v);
const certName = (v, l) => (l === 'en' ? SE.certificaciones[v] || v : v);
const sectorName = (id, l) => SE.sectores[id][l];
const nfmt = (n, l) => Number(n).toLocaleString(l === 'en' ? 'en-US' : 'es-MX');

/* Etiqueta bilingüe: se pinta en español y app.js la cambia a inglés */
const bi = (tag, esTxt, enTxt, cls) =>
  `<${tag}${cls ? ` class="${cls}"` : ''} data-es="${esc(esTxt)}" data-en="${esc(enTxt)}">${esc(esTxt)}</${tag}>`;

const i18 = (tag, key, cls) =>
  `<${tag}${cls ? ` class="${cls}"` : ''} data-i18n="${key}">${esc(es(key))}</${tag}>`;

const icon = (id, cls) => `<svg${cls ? ` class="${cls}"` : ''} aria-hidden="true"><use href="#${id}"/></svg>`;

const SPRITE = fs.readFileSync(path.join(DIR, 'index.html'), 'utf8')
  .match(/<svg width="0"[\s\S]*?<\/defs><\/svg>/)[0];

function header() {
  return `<a class="skip-link" href="#main" data-i18n="skip">${esc(es('skip'))}</a>

<header class="header">
  <div class="wrap">
    <div class="header-inner">
      <a class="brand" href="index.html">
        <img src="comce-sur-logo.webp" width="286" height="131" alt="COMCE Región Sur">
        <span class="brand-divider" aria-hidden="true"></span>
        <span class="brand-text">
          <span class="brand-name">Sur Exporta</span>
          ${i18('span', 'brandSub', 'brand-sub')}
        </span>
      </a>
      <nav class="nav" aria-label="Principal">
        ${i18('a', 'navDirectorio').replace('<a ', '<a href="index.html#directorio" ')}
        ${i18('a', 'navComo').replace('<a ', '<a href="index.html#como" ')}
        ${i18('a', 'navPrograma').replace('<a ', '<a href="index.html#programa" ')}
        ${i18('a', 'navContacto').replace('<a ', '<a href="index.html#contacto" ')}
      </nav>
      <button class="lang-btn" type="button" data-lang-toggle aria-label="${esc(es('switchLabel'))}" data-i18n-attr="aria-label:switchLabel">
        ${icon('i-lang')}<span class="lang-long" data-i18n="switchTo">${esc(es('switchTo'))}</span>
        <span class="lang-short" data-i18n="switchCode">${esc(es('switchCode'))}</span>
      </button>
      <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="nav-mobile" aria-label="Menú">
        ${icon('i-menu')}
      </button>
    </div>
    <nav class="nav-mobile" id="nav-mobile" hidden aria-label="Principal (móvil)">
      ${i18('a', 'navDirectorio').replace('<a ', '<a href="index.html#directorio" ')}
      ${i18('a', 'navComo').replace('<a ', '<a href="index.html#como" ')}
      ${i18('a', 'navPrograma').replace('<a ', '<a href="index.html#programa" ')}
      ${i18('a', 'navContacto').replace('<a ', '<a href="index.html#contacto" ')}
    </nav>
  </div>
</header>`;
}

function footer() {
  return `<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <img src="comce-sur-logo.webp" width="286" height="131" alt="COMCE Región Sur">
        ${i18('p', 'footerRights')}
      </div>
      <div>
        ${i18('h4', 'footerNav')}
        <ul>
          <li>${i18('a', 'navDirectorio').replace('<a ', '<a href="index.html#directorio" ')}</li>
          <li>${i18('a', 'navComo').replace('<a ', '<a href="index.html#como" ')}</li>
          <li>${i18('a', 'navPrograma').replace('<a ', '<a href="index.html#programa" ')}</li>
          <li>${i18('a', 'navContacto').replace('<a ', '<a href="index.html#contacto" ')}</li>
        </ul>
      </div>
      <div>
        ${i18('h4', 'backToComce')}
        <ul>
          <li><a href="https://comce-sur.vercel.app/">comce-sur.vercel.app</a></li>
          <li><a href="https://comce-sur.odoo.com/">comce-sur.odoo.com</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">${i18('p', 'footerSource')}</div>
  </div>
</footer>`;
}

function tagList(values, fn, cls) {
  return `<div class="tag-list">` + values.map((v) =>
    `<span class="tag ${cls}" data-es="${esc(fn(v, 'es'))}" data-en="${esc(fn(v, 'en'))}">${esc(fn(v, 'es'))}</span>`
  ).join('') + `</div>`;
}

function otherCard(c) {
  const lowRes = c.slug === 'mezcal-lyobaa';
  return `<article class="card">
  <div class="card-top">
    ${lowRes
      ? `<span class="card-mono" aria-hidden="true">${esc(c.marca.replace(/^Mezcal\s+/i, '').charAt(0))}</span>`
      : `<img src="logo-${c.slug}.webp" alt="${esc(c.marca)}" loading="lazy" decoding="async">`}
  </div>
  <div class="card-body">
    <p class="card-place">${icon('i-pin')}${esc(c.municipio)}</p>
    <h3 class="card-title"><a href="empresa-${c.slug}.html">${esc(c.marca)}</a></h3>
    ${bi('p', c.destacado.es, c.destacado.en, 'card-sum')}
  </div>
</article>`;
}

function page(c) {
  const disponible = c.capacidad - c.capacidadExportada;
  const lowRes = c.slug === 'mezcal-lyobaa';
  const others = SE.empresas.filter((x) => x.slug !== c.slug).slice(0, 3);

  const titleEs = `${c.marca} — ${sectorName(c.sector, 'es')}, ${c.estado} | Sur Exporta`;
  const titleEn = `${c.marca} — ${sectorName(c.sector, 'en')}, ${c.estado} | Sur Exporta`;

  const dl = [
    [ 'registry', `<span data-i18n="registryOk">${esc(es('registryOk'))}</span>` ],
    [ 'capacity', `${nfmt(c.capacidad, 'es')} <small>L</small>` ],
    [ 'available', `${nfmt(disponible, 'es')} <small>L</small>` ],
    [ 'since', String(c.desde) ],
    [ 'abv', esc(c.abv) ],
    [ 'maquila', `<span data-i18n="${c.maquila ? 'yes' : 'no'}">${esc(es(c.maquila ? 'yes' : 'no'))}</span>` ]
  ].map(([k, v]) => `<div><dt data-i18n="${k}">${esc(es(k))}</dt><dd>${v}</dd></div>`).join('');

  return `<!DOCTYPE html>
<html lang="es" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title data-title-es="${esc(titleEs)}" data-title-en="${esc(titleEn)}">${esc(titleEs)}</title>
<meta name="description" content="${esc(c.resumen.es)}">
<meta name="theme-color" content="#04162b">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(c.marca)} | Sur Exporta">
<meta property="og:description" content="${esc(c.resumen.es)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600;6..96,700&family=Archivo:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="styles.css">
<link rel="icon" href="comce-sur-logo.webp" type="image/webp">
<script>(function(d){var h=d.documentElement;h.className=h.className.replace('no-js','js');
setTimeout(function(){if(!window.__seReady)h.classList.add('reveal-off');},2500);})(document);</script>
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: c.marca,
  legalName: c.razonSocial,
  description: c.resumen.es,
  address: { '@type': 'PostalAddress', addressLocality: c.municipio, addressRegion: c.estado, addressCountry: 'MX' },
  foundingLocation: c.municipio,
  makesOffer: c.productos.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'Product', name: p } }))
}, null, 2)}
</script>
</head>
<body>

${SPRITE}

${header()}

<main id="main">

  <section class="p-hero">
    <div class="wrap">
      <a class="p-back" href="index.html#directorio">${icon('i-back')}<span data-i18n="profileBack">${esc(es('profileBack'))}</span></a>

      <div class="p-head">
        <div>
          <h1>${esc(c.marca)}</h1>
          <p class="p-place">
            <span>${icon('i-pin')}${esc(c.municipio)}, ${esc(c.estado)}</span>
            <span>${icon('i-box')}<span data-es="${esc(sectorName(c.sector, 'es'))}" data-en="${esc(sectorName(c.sector, 'en'))}">${esc(sectorName(c.sector, 'es'))}</span></span>
            <span>${icon('i-globe')}${c.mercados.length} <span data-i18n="markets">${esc(es('markets'))}</span></span>
          </p>
          ${bi('p', c.resumen.es, c.resumen.en, 'p-lead')}
        </div>
        <div class="p-logo">
          ${lowRes
            ? `<span class="card-mono" style="width:110px;height:110px;font-size:2.5rem" aria-hidden="true">${esc(c.marca.replace(/^Mezcal\s+/i, '').charAt(0))}</span>`
            : `<img src="logo-${c.slug}.webp" alt="${esc(c.marca)}" width="240" height="160">`}
        </div>
      </div>
    </div>
  </section>

  <section class="p-body">
    <div class="wrap">
      <div class="p-grid">
        <div>

          <div class="panel" data-reveal>
            <div class="p-photo"><img src="foto-${c.slug}.webp" alt="${esc(c.marca)}" loading="lazy" decoding="async"></div>
            ${i18('h2', 'profileAbout')}
            ${bi('p', c.descripcion.es, c.descripcion.en)}
            <dl class="dl" style="margin-top:1.5rem">
              <div><dt data-i18n="profileLegal">${esc(es('profileLegal'))}</dt><dd style="font-weight:500">${esc(c.razonSocial)}</dd></div>
              <div><dt data-i18n="profileOrigin">${esc(es('profileOrigin'))}</dt><dd style="font-weight:500">${esc(c.municipio)}, ${esc(c.estado)}</dd></div>
            </dl>
          </div>

          <div class="panel" data-reveal style="--d:80ms">
            ${i18('h2', 'profileData')}
            <dl class="dl">${dl}</dl>
            <div style="margin-top:1.5rem">
              <div class="meter"><div class="meter-fill" data-meter="${c.pctExportado}"></div></div>
              <p class="meter-legend">
                <span data-i18n="exported">${esc(es('exported'))}</span>
                <strong>${c.pctExportado}% · ${nfmt(c.capacidadExportada, 'es')} L</strong>
              </p>
            </div>
          </div>

          <div class="panel" data-reveal style="--d:120ms">
            ${i18('h2', 'markets')}
            ${tagList(c.mercados, country, '')}
          </div>

          <div class="panel" data-reveal style="--d:160ms">
            ${i18('h2', 'certs')}
            ${tagList(c.certs, certName, 'tag-cert')}
          </div>

          <div class="panel" data-reveal style="--d:200ms">
            ${i18('h2', 'profileOffer')}
            <h3 style="font-family:var(--font-text);font-size:var(--fs-sm);text-transform:uppercase;letter-spacing:.06em;color:var(--pizarra);margin-bottom:.75rem" data-i18n="products">${esc(es('products'))}</h3>
            <div class="tag-list" style="margin-bottom:1.5rem">${c.productos.map((p) => `<span class="tag">${esc(p)}</span>`).join('')}</div>
            <h3 style="font-family:var(--font-text);font-size:var(--fs-sm);text-transform:uppercase;letter-spacing:.06em;color:var(--pizarra);margin-bottom:.75rem" data-i18n="formats">${esc(es('formats'))}</h3>
            <div class="tag-list">${c.presentaciones.map((m) => `<span class="tag">${m >= 1000 ? (m / 1000) + ' L' : m + ' ml'}</span>`).join('')}</div>
          </div>

        </div>

        <aside>
          <div class="panel p-form">
            ${i18('h2', 'profileContact')}
            ${i18('p', 'profileContactLead')}

            <div class="form-alert alert-error" role="alert" tabindex="-1" hidden data-form-errors style="margin-top:1rem">
              ${i18('h3', 'formErrTitle')}
              <ul></ul>
            </div>
            <div class="form-alert alert-ok" role="status" tabindex="-1" hidden data-form-ok style="margin-top:1rem">
              ${i18('h3', 'formOk')}
              ${i18('p', 'formOkBody')}
            </div>

            <form novalidate data-brief-form style="margin-top:1rem">
              <input type="hidden" name="company_slug" value="${esc(c.slug)}">
              <div class="field">
                <label for="p-need"><span data-i18n="formNeed">${esc(es('formNeed'))}</span><span class="req" aria-hidden="true">*</span></label>
                <p class="field-help" id="p-need-help" data-i18n="formNeedHelp">${esc(es('formNeedHelp'))}</p>
                <textarea id="p-need" name="need" required aria-describedby="p-need-help p-need-err" maxlength="3000"></textarea>
                <p class="field-error" id="p-need-err">${icon('i-alert')}<span data-i18n="formErrNeed">${esc(es('formErrNeed'))}</span></p>
              </div>
              <div class="field">
                <label for="p-name"><span data-i18n="formName">${esc(es('formName'))}</span><span class="req" aria-hidden="true">*</span></label>
                <input id="p-name" name="name" type="text" autocomplete="name" required aria-describedby="p-name-err">
                <p class="field-error" id="p-name-err">${icon('i-alert')}<span data-i18n="formErrName">${esc(es('formErrName'))}</span></p>
              </div>
              <div class="field">
                <label for="p-email"><span data-i18n="formEmail">${esc(es('formEmail'))}</span><span class="req" aria-hidden="true">*</span></label>
                <input id="p-email" name="email" type="email" autocomplete="email" required aria-describedby="p-email-err">
                <p class="field-error" id="p-email-err">${icon('i-alert')}<span data-i18n="formErrEmail">${esc(es('formErrEmail'))}</span></p>
              </div>
              <div class="field field-consent">
                <label class="consent" for="p-consent">
                  <input id="p-consent" name="consent" type="checkbox" required aria-describedby="p-consent-err">
                  <span data-i18n="formConsent">${esc(es('formConsent'))}</span>
                </label>
                <p class="field-error" id="p-consent-err">${icon('i-alert')}<span data-i18n="formErrConsent">${esc(es('formErrConsent'))}</span></p>
              </div>
              <div class="hp" aria-hidden="true">
                <label for="p-website">No llenar</label>
                <input id="p-website" name="website" type="text" tabindex="-1" autocomplete="off">
              </div>
              <button class="btn btn-gold btn-block" type="submit" data-i18n="formSubmit">${esc(es('formSubmit'))}</button>
              ${i18('p', 'formDemo', 'form-demo')}
            </form>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="section p-others">
    <div class="wrap">
      <div class="section-head" data-reveal>${i18('h2', 'profileOther')}</div>
      <div class="cards">${others.map(otherCard).join('')}</div>
    </div>
  </section>

</main>

${footer()}

<script src="data.js"></script>
<script src="app.js"></script>
</body>
</html>
`;
}

let n = 0;
SE.empresas.forEach((c) => {
  const file = path.join(DIR, `empresa-${c.slug}.html`);
  fs.writeFileSync(file, page(c), 'utf8');
  n++;
  console.log(`  escrito  empresa-${c.slug}.html  (${(fs.statSync(file).size / 1024).toFixed(1)} KB)`);
});
console.log(`\n${n} fichas generadas.`);
