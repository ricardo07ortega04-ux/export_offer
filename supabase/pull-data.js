/* Sur Exporta — trae los datos de Supabase y regenera data.js
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... node supabase/pull-data.js
 *   o bien: node supabase/pull-data.js <url> <anon_key>
 *
 * Solo lee. Usa la llave anónima, que es pública por diseño: las políticas
 * de seguridad por fila son las que protegen los datos.
 *
 * Después de correrlo:  node build-fichas.js   y luego commit + push.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const URL_BASE = (process.argv[2] || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const LLAVE = process.argv[3] || process.env.SUPABASE_ANON_KEY || '';

if (!URL_BASE || !LLAVE) {
  console.error('Falta la URL del proyecto o la llave anónima.');
  console.error('Uso: node supabase/pull-data.js <url> <anon_key>');
  process.exit(1);
}

async function consultar(recurso, params) {
  const url = `${URL_BASE}/rest/v1/${recurso}?${params}`;
  const r = await fetch(url, {
    headers: { apikey: LLAVE, Authorization: `Bearer ${LLAVE}`, Accept: 'application/json' }
  });
  if (!r.ok) throw new Error(`${recurso} → HTTP ${r.status}: ${await r.text()}`);
  return r.json();
}

// El nombre en español es la clave que ya usan el sitio y los filtros
const porClave = (filas, campo) => filas.reduce((acc, f) => { acc[f[campo]] = f; return acc; }, {});

(async () => {
  const [paises, certs, sectores, empresas] = await Promise.all([
    consultar('paises', 'select=clave,nombre_es,nombre_en&order=nombre_es'),
    consultar('certificaciones', 'select=clave,nombre_es,nombre_en&order=nombre_es'),
    consultar('sectores', 'select=clave,nombre_es,nombre_en&activo=eq.true'),
    consultar('directorio_publico', 'select=*&order=capacidad_exportada_l.desc')
  ]);

  const paisPorClave = porClave(paises, 'clave');
  const certPorClave = porClave(certs, 'clave');

  const dicPaises = {};
  paises.forEach((p) => { dicPaises[p.nombre_es] = p.nombre_en; });
  const dicCerts = {};
  certs.forEach((c) => { dicCerts[c.nombre_es] = c.nombre_en; });
  const dicSectores = {};
  sectores.forEach((s) => { dicSectores[s.clave] = { es: s.nombre_es, en: s.nombre_en }; });

  const faltantes = [];
  const lista = empresas.map((e) => {
    const mercados = (e.mercados || []).map((clave) => {
      const p = paisPorClave[clave];
      if (!p) faltantes.push(`país '${clave}' de ${e.slug}`);
      return p ? p.nombre_es : clave;
    });
    const certificaciones = (e.certificaciones || []).map((clave) => {
      const c = certPorClave[clave];
      if (!c) faltantes.push(`certificación '${clave}' de ${e.slug}`);
      return c ? c.nombre_es : clave;
    });

    return {
      slug: e.slug,
      marca: e.marca,
      razonSocial: e.razon_social,
      estado: e.estado ? e.estado.replace(/(^|-)([a-z])/g, (m, a, b) => a.replace('-', ' ') + b.toUpperCase()) : '',
      municipio: e.municipio,
      sector: e.sector,
      resumen: { es: e.resumen_es, en: e.resumen_en },
      descripcion: { es: e.descripcion_es, en: e.descripcion_en },
      destacado: { es: e.destacado_es, en: e.destacado_en },
      capacidad: e.capacidad_mensual_l,
      pctExportado: e.porcentaje_exportado,
      capacidadExportada: e.capacidad_exportada_l,
      desde: e.exporta_desde,
      situacion: e.situacion,
      padron: e.padron,
      maquila: e.maquila,
      mercados,
      certs: certificaciones,
      productos: e.productos || [],
      abv: e.abv,
      presentaciones: e.presentaciones_ml || []
    };
  });

  // Conserva las cadenas de interfaz que se editan a mano
  global.window = {};
  new Function(fs.readFileSync(path.join(RAIZ, 'data.js'), 'utf8')).call(global);
  const i18n = global.window.SE.i18n;

  const salida = `/* Sur Exporta — datos del directorio
 * GENERADO por supabase/pull-data.js el ${new Date().toISOString().slice(0, 10)}.
 * No edites las empresas aquí: cámbialas en Supabase y vuelve a generar.
 * Las cadenas de interfaz (i18n) sí se editan en este archivo.
 */
window.SE = {

  paises: ${JSON.stringify(dicPaises, null, 4).replace(/\n/g, '\n  ')},

  certificaciones: ${JSON.stringify(dicCerts, null, 4).replace(/\n/g, '\n  ')},

  sectores: ${JSON.stringify(dicSectores, null, 4).replace(/\n/g, '\n  ')},

  i18n: ${JSON.stringify(i18n, null, 4).replace(/\n/g, '\n  ')},

  empresas: ${JSON.stringify(lista, null, 4).replace(/\n/g, '\n  ')}
};
`;

  fs.writeFileSync(path.join(RAIZ, 'data.js'), salida, 'utf8');

  console.log(`data.js regenerado desde Supabase`);
  console.log(`  empresas publicadas: ${lista.length}`);
  console.log(`  países: ${paises.length} | certificaciones: ${certs.length} | sectores: ${sectores.length}`);
  if (faltantes.length) {
    console.log(`\n  AVISO — referencias sin catálogo (${faltantes.length}):`);
    [...new Set(faltantes)].forEach((f) => console.log('   · ' + f));
  }
  console.log(`\nSiguiente: node build-fichas.js`);
})().catch((e) => { console.error('Error:', e.message); process.exit(1); });
