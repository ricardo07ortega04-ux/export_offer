/* Sur Exporta — genera supabase/seed.sql a partir de data.js
 * Uso: node supabase/build-seed.js
 * No usa red ni credenciales: produce un archivo SQL para pegar en Supabase.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
global.window = {};
new Function(fs.readFileSync(path.join(RAIZ, 'data.js'), 'utf8')).call(global);
const SE = global.window.SE;

const SITIO = 'https://www.sur-exporta.com';
const FUENTE = 'Catálogo de Oferta Exportable de Mezcal, SEDECO Oaxaca';

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const q = (v) => v === null || v === undefined || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const n = (v) => v === null || v === undefined || v === '' ? 'null' : Number(v);
const b = (v) => v === null || v === undefined ? 'null' : (v ? 'true' : 'false');
const arr = (a) => a && a.length ? `array[${a.map(q).join(', ')}]` : `'{}'`;
const arrN = (a) => a && a.length ? `array[${a.map(Number).join(', ')}]::integer[]` : `'{}'::integer[]`;

const L = [];
L.push('-- Sur Exporta — carga inicial de datos (generado por supabase/build-seed.js)');
L.push('-- Ejecutar en Supabase → SQL Editor. Es idempotente: se puede volver a correr.');
L.push('begin;');
L.push('');

// --- Estados ---
const estados = [...new Set(SE.empresas.map((e) => e.estado))];
L.push('-- Estados');
estados.forEach((e) => {
  L.push(`insert into estados (clave, nombre) values (${q(slug(e))}, ${q(e)}) on conflict (clave) do update set nombre = excluded.nombre;`);
});
L.push('');

// --- Sectores ---
L.push('-- Sectores');
Object.entries(SE.sectores).forEach(([clave, s]) => {
  L.push(`insert into sectores (clave, nombre_es, nombre_en, hs_partida, fraccion_mx, fraccion_validada) values (${q(clave)}, ${q(s.es)}, ${q(s.en)}, '22.08', '2208.90.03', false) on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en;`);
});
L.push('');

// --- Países ---
L.push('-- Países de destino');
Object.entries(SE.paises).forEach(([es, en]) => {
  L.push(`insert into paises (clave, nombre_es, nombre_en) values (${q(slug(es))}, ${q(es)}, ${q(en)}) on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en;`);
});
L.push('');

// --- Certificaciones ---
L.push('-- Certificaciones');
Object.entries(SE.certificaciones).forEach(([es, en]) => {
  L.push(`insert into certificaciones (clave, nombre_es, nombre_en) values (${q(slug(es))}, ${q(es)}, ${q(en)}) on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en;`);
});
L.push('');

// --- Empresas ---
L.push('-- Empresas');
SE.empresas.forEach((c) => {
  const cols = [
    ['slug', q(c.slug)],
    ['marca', q(c.marca)],
    ['razon_social', q(c.razonSocial)],
    ['estado', q(slug(c.estado))],
    ['municipio', q(c.municipio)],
    ['sector', q(c.sector)],
    ['resumen_es', q(c.resumen.es)],
    ['resumen_en', q(c.resumen.en)],
    ['descripcion_es', q(c.descripcion.es)],
    ['descripcion_en', q(c.descripcion.en)],
    ['destacado_es', q(c.destacado.es)],
    ['destacado_en', q(c.destacado.en)],
    ['capacidad_mensual_l', n(c.capacidad)],
    ['porcentaje_exportado', n(c.pctExportado)],
    ['capacidad_exportada_l', n(c.capacidadExportada)],
    ['exporta_desde', n(c.desde)],
    ['situacion', `'${c.situacion}'::situacion_exportadora`],
    ['padron', `'${c.padron}'::estatus_padron`],
    ['maquila', b(c.maquila)],
    ['abv', q(c.abv)],
    ['productos', arr(c.productos)],
    ['presentaciones_ml', arrN(c.presentaciones)],
    ['logo_url', q(`${SITIO}/logo-${c.slug}.webp`)],
    ['foto_url', q(`${SITIO}/foto-${c.slug}.webp`)],
    ['estatus', `'publicado'::estatus_publicacion`],
    ['fuente', q(FUENTE)]
  ];
  L.push(`insert into empresas (${cols.map((x) => x[0]).join(', ')})`);
  L.push(`values (${cols.map((x) => x[1]).join(', ')})`);
  L.push(`on conflict (slug) do update set ${cols.slice(1).map((x) => `${x[0]} = excluded.${x[0]}`).join(', ')};`);
  L.push('');
});

// --- Relaciones ---
L.push('-- Mercados de destino por empresa');
SE.empresas.forEach((c) => {
  c.mercados.forEach((m) => {
    L.push(`insert into empresa_mercados (empresa_id, pais) select id, ${q(slug(m))} from empresas where slug = ${q(c.slug)} on conflict do nothing;`);
  });
});
L.push('');

L.push('-- Certificaciones por empresa');
SE.empresas.forEach((c) => {
  c.certs.forEach((x) => {
    L.push(`insert into empresa_certificaciones (empresa_id, certificacion) select id, ${q(slug(x))} from empresas where slug = ${q(c.slug)} on conflict do nothing;`);
  });
});
L.push('');
L.push('commit;');
L.push('');
L.push('-- Comprobación');
L.push("select (select count(*) from empresas) as empresas,");
L.push("       (select count(*) from paises) as paises,");
L.push("       (select count(*) from certificaciones) as certificaciones,");
L.push("       (select count(*) from empresa_mercados) as relaciones_mercado,");
L.push("       (select count(*) from empresa_certificaciones) as relaciones_cert;");

const salida = path.join(__dirname, 'seed.sql');
fs.writeFileSync(salida, L.join('\n'), 'utf8');

console.log(`seed.sql generado (${(fs.statSync(salida).size / 1024).toFixed(1)} KB)`);
console.log(`  empresas: ${SE.empresas.length}`);
console.log(`  estados: ${estados.length} | sectores: ${Object.keys(SE.sectores).length}`);
console.log(`  países: ${Object.keys(SE.paises).length} | certificaciones: ${Object.keys(SE.certificaciones).length}`);
console.log(`  relaciones mercado: ${SE.empresas.reduce((s, c) => s + c.mercados.length, 0)}`);
console.log(`  relaciones certificación: ${SE.empresas.reduce((s, c) => s + c.certs.length, 0)}`);
