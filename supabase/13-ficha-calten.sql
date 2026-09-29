-- Sur Exporta — 13 · Fichas de socios enriquecidas (sitio oficial caltengroup.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Calten Group
update empresas set marca = 'Calten Group',
    municipio = 'San Pedro Cholula',
    resumen_es = 'Logística, comercio exterior e inspección en origen para pymes que no tienen un departamento de operaciones internacionales.',
    resumen_en = 'Logistics, foreign trade and inspection at origin for SMEs without an in-house international operations team.',
    descripcion_es = 'Calten Group acompaña a pequeñas y medianas empresas que importan o exportan sin tener un departamento de operaciones internacionales. Con más de 18 años de experiencia, integra logística internacional, gestión aduanera, transporte nacional y coordinación de embarques, ya sea por operación o como equipo in-house por contrato, y actúa también como comercializadora.

En comercio exterior arma y revisa expedientes, gestiona trámites ante la VUCEM, asesora en importación y exportación, en el cumplimiento de NOMs y en certificaciones IMMEX y PROSEC, y ayuda a calcular el costo y precio de productos internacionales. Además ofrece inspección en origen —auditoría de fábrica, control de calidad e inspección previa al embarque—, seguros de carga nacional e internacional y cursos de comercio exterior, básicos o a la medida.',
    descripcion_en = 'Calten Group supports small and medium-sized companies that import or export without an international operations department. With more than 18 years of experience, it combines international logistics, customs management, domestic transport and shipment coordination — per operation or as an in-house team on a time-based contract — and also acts as a trading company.

In foreign trade, it prepares and reviews compliance files, handles procedures on Mexico''s VUCEM single window, advises on imports and exports, Mexican Official Standards (NOMs) and IMMEX and PROSEC certification, and helps cost and price international products. It also offers inspection at origin — factory audits, quality control and pre-shipment inspection — domestic and international cargo insurance, and foreign trade courses, from basics to custom programmes.',
    destacado_es = 'Inspección de calidad en origen',
    destacado_en = 'Quality inspection at origin',
    situacion = 'sin_dato',
    productos = array['Logística internacional y transporte nacional', 'Gestión aduanera', 'Coordinación de embarques (por operación o in-house)', 'Expedientes de comercio exterior y trámites VUCEM', 'Certificaciones IMMEX y PROSEC', 'Asesoría en NOMs', 'Costeo y pricing de productos internacionales', 'Inspección en origen: auditoría de fábrica y control de calidad', 'Seguros de carga nacional e internacional', 'Cursos de comercio exterior']::text[],
    contacto_email = 'emma.perez@caltengroup.com',
    contacto_tel = '+52 222 455 3621',
    actualizado_en = now()
where slug = 'calten-group';
