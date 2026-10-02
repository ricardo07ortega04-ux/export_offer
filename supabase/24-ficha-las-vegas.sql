-- Sur Exporta — 24 · Fichas de socios enriquecidas (sitio oficial lasvegaslimes.com y presentación de la empresa, oct. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Certificaciones del catálogo
insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values ('primus-gfs', 'PrimusGFS', 'PrimusGFS', 'Certificación de inocuidad alimentaria para productos agrícolas, reconocida por la Iniciativa Global de Inocuidad Alimentaria (GFSI).', 'Food safety certification for agricultural products, benchmarked by the Global Food Safety Initiative (GFSI).') on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;
insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values ('globalgap', 'GLOBALG.A.P.', 'GLOBALG.A.P.', 'Norma internacional de buenas prácticas agrícolas en campo: inocuidad, trazabilidad, medio ambiente y bienestar de los trabajadores.', 'International standard for good agricultural practice on the farm: food safety, traceability, environment and worker welfare.') on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;
insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values ('haccp', 'HACCP', 'HACCP', 'Sistema de análisis de peligros y puntos críticos de control para la inocuidad de los alimentos.', 'Hazard Analysis and Critical Control Points system for food safety.') on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;

-- Las Vegas Premium Limes
update empresas set marca = 'Las Vegas Premium Limes',
    municipio = 'Martínez de la Torre',
    resumen_es = 'Empacadora de limón persa de Martínez de la Torre, Veracruz: abasto todo el año de más de 2,500 pequeños productores, clasificación computarizada y certificación PrimusGFS para Estados Unidos, Canadá, Europa y Japón.',
    resumen_en = 'Persian lime packing house in Martínez de la Torre, Veracruz: year-round supply from more than 2,500 small growers, computerised grading and PrimusGFS certification for the United States, Canada, Europe and Japan.',
    descripcion_es = 'Las Vegas Premium Limes es la línea empacadora de limón persa de Productos Men-Frut, del Grupo Murrieta, que trabaja con cítricos desde hace más de 35 años —producción en campo, pesado, selección, lavado y encerado de fruta para el mercado nacional y jugo concentrado— y sumó el empaque de exportación como complemento natural. Está en Martínez de la Torre, Veracruz, la principal región productora de limón persa del país, y tiene alianzas con más de 2,500 pequeños productores de la zona, lo que le permite empacar y exportar todo el año, con las variaciones propias de la temporada.

Su línea, renovada para cumplir las normas de exportación, cuenta con una clasificadora computarizada que separa la fruta por tamaño, color y defectos, y con dosificadores automáticos que controlan con precisión la sanitización y el encerado. El proceso va de la recepción y selección al lavado, secado, encerado, clasificación, empaque, flejado y embarque. Empaca principalmente en cajas de 40 y 10 libras, y en otras presentaciones a pedido, con marcas propias como Fryda. Opera con un sistema de calidad certificado PrimusGFS, buenas prácticas de manufactura y HACCP, registros ante USDA y SENASICA y huertas certificadas GLOBALG.A.P., y exporta a Estados Unidos, Canadá, Europa y Japón.',
    descripcion_en = 'Las Vegas Premium Limes is the Persian lime packing line of Productos Men-Frut, part of Grupo Murrieta, which has worked with citrus for more than 35 years — field production, fruit weighing, sorting, washing and waxing for the domestic market, and concentrated juice — and added export packing as a natural complement. It is located in Martínez de la Torre, Veracruz, Mexico''s leading Persian lime region, and has partnerships with more than 2,500 small local growers, which allows it to pack and export all year round, with normal seasonal variation.

Its line, refurbished to meet export standards, has a computerised grader that sorts fruit by size, colour and defects, and automatic dosing systems that precisely control sanitising and waxing. The process runs from receiving and sorting to washing, drying, waxing, grading, packing, strapping and shipping. It packs mainly in 40 and 10 lb cartons, and in other formats on request, under its own brands such as Fryda. It operates under a PrimusGFS-certified quality system, good manufacturing practices and HACCP, with USDA and SENASICA registrations and GLOBALG.A.P.-certified orchards, and exports to the United States, Canada, Europe and Japan.',
    destacado_es = 'Lima persa todo el año, certificada PrimusGFS',
    destacado_en = 'Year-round Persian limes, PrimusGFS certified',
    situacion = 'exportando',
    productos = array['Limón persa (lima persa) fresco todo el año', 'Caja de 40 libras', 'Caja de 10 libras', 'Empaques a la medida del cliente', 'Marca Fryda', 'Clasificación por tamaño, color y defectos']::text[],
    contacto_email = 'hugo.mendez@citru-mex.com.mx',
    contacto_tel = '+52 232 324 5010',
    actualizado_en = now()
where slug = 'las-vegas-premium-limes';
insert into empresa_mercados (empresa_id, pais) select id, 'estados-unidos' from empresas where slug = 'las-vegas-premium-limes' on conflict do nothing;
insert into empresa_mercados (empresa_id, pais) select id, 'canada' from empresas where slug = 'las-vegas-premium-limes' on conflict do nothing;
insert into empresa_mercados (empresa_id, pais) select id, 'japon' from empresas where slug = 'las-vegas-premium-limes' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'primus-gfs' from empresas where slug = 'las-vegas-premium-limes' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'globalgap' from empresas where slug = 'las-vegas-premium-limes' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'haccp' from empresas where slug = 'las-vegas-premium-limes' on conflict do nothing;
