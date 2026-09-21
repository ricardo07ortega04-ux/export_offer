-- Sur Exporta — corrección: la vista pública no exponía razon_social,
-- que las fichas de empresa sí muestran ("Razón social").
-- Ejecutar en Supabase → SQL Editor.

drop view if exists directorio_publico;

create view directorio_publico
with (security_invoker = true) as
select
  e.slug, e.marca, e.razon_social, e.estado, e.municipio, e.sector,
  e.resumen_es, e.resumen_en, e.descripcion_es, e.descripcion_en,
  e.destacado_es, e.destacado_en,
  e.capacidad_mensual_l, e.porcentaje_exportado, e.capacidad_exportada_l,
  e.exporta_desde, e.situacion, e.padron, e.maquila,
  e.abv, e.productos, e.presentaciones_ml, e.logo_url, e.foto_url,
  coalesce((select array_agg(m.pais order by m.pais) from empresa_mercados m where m.empresa_id = e.id), '{}') as mercados,
  coalesce((select array_agg(c.certificacion order by c.certificacion) from empresa_certificaciones c where c.empresa_id = e.id), '{}') as certificaciones
from empresas e
where e.estatus = 'publicado';

-- Comprobación: debe devolver las 10 empresas con su razón social
select slug, razon_social from directorio_publico order by slug;
