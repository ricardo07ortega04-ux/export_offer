-- Sur Exporta — 05 · Tipo de oferta (productos / servicios) y sectores nuevos
-- Ejecutar en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Cada sector pertenece a un tipo. El sitio arma con eso el filtro de dos niveles:
-- «Tipo de oferta: Productos / Servicios» y, dentro, los sectores de cada uno.
-- Un sector solo aparece en los filtros cuando tiene al menos una empresa publicada.

alter table sectores
  add column if not exists tipo text not null default 'producto'
  check (tipo in ('producto', 'servicio'));

insert into sectores (clave, nombre_es, nombre_en, hs_partida, tipo) values
  -- Productos
  ('bebidas-espirituosas', 'Bebidas espirituosas',             'Spirits',                        '22.08', 'producto'),
  ('alimentos-procesados', 'Alimentos procesados',             'Processed foods',                null,    'producto'),
  ('frutas-y-hortalizas',  'Frutas y hortalizas frescas',      'Fresh fruit and vegetables',     null,    'producto'),
  ('textil-y-confeccion',  'Textil y confección',              'Textiles and apparel',           null,    'producto'),
  ('productos-metalicos',  'Productos metálicos',              'Metal products',                 null,    'producto'),
  ('cosmetica',            'Cosmética y cuidado personal',     'Cosmetics and personal care',    null,    'producto'),
  -- Servicios
  ('logistica-comercio-exterior', 'Logística y comercio exterior',       'Logistics and foreign trade',          null, 'servicio'),
  ('consultoria',                 'Consultoría empresarial',             'Business consulting',                  null, 'servicio'),
  ('tecnologia',                  'Tecnología y digitalización',         'Technology and digitalisation',        null, 'servicio'),
  ('pagos-internacionales',       'Pagos internacionales',               'International payments',               null, 'servicio'),
  ('educacion-movilidad',         'Educación y movilidad internacional', 'Education and international mobility', null, 'servicio')
on conflict (clave) do update
  set nombre_es = excluded.nombre_es,
      nombre_en = excluded.nombre_en,
      tipo      = excluded.tipo;
