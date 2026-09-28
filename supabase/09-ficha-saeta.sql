-- Sur Exporta — 09 · Fichas de socios enriquecidas (sitio oficial saetaoc.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- SAETA Orientación Corporativa
update empresas set marca = 'SAETA Orientación Corporativa',
    municipio = 'San Andrés Cholula',
    exporta_desde = 2022,
    resumen_es = 'Consultoría integral para empresas mexicanas y extranjeras: comercio exterior e IMMEX, contabilidad, legal, nómina y softlanding, en español, inglés y alemán.',
    resumen_en = 'All-in-one consulting for Mexican and foreign companies: foreign trade and IMMEX, accounting, legal, payroll and soft landing, in Spanish, English and German.',
    descripcion_es = 'SAETA Orientación Corporativa es una firma de consultoría que reúne bajo un mismo techo siete áreas de servicio —softlanding, legal, contabilidad, fiscal, nómina y tesorería, comercio exterior y auditoría— para descomplicar los procesos corporativos de sus clientes. Fundada en 2022, atiende a más de 60 empresas nacionales e internacionales desde sus oficinas en Puebla y en el German Centre de la Ciudad de México.

En comercio exterior acompaña a las empresas en el programa IMMEX, el cumplimiento de NOMs y permisos de COFEPRIS y SEDENA, auditorías con Data Stage y de los Anexos 24 y 30, reglas de origen, devolución de IVA y la coordinación de la logística y el despacho aduanal. Trabaja en español, inglés y alemán, y acompaña a empresas extranjeras, incluidas las de habla alemana, en su llegada a México.',
    descripcion_en = 'SAETA Orientación Corporativa is a consulting firm that brings seven service areas under one roof — soft landing, legal, accounting, tax, payroll and treasury, foreign trade and auditing — to simplify its clients'' corporate processes. Founded in 2022, it serves more than 60 Mexican and international companies from its offices in Puebla and at the German Centre in Mexico City.

In foreign trade, it supports companies with the IMMEX programme, compliance with Mexican Official Standards (NOMs) and COFEPRIS and SEDENA permits, Data Stage audits and Annex 24 and 30 reviews, rules of origin, VAT refunds, and coordination of logistics and customs clearance. It works in Spanish, English and German, and helps foreign companies, including German-speaking ones, set up in Mexico.',
    destacado_es = 'Atiende en español, inglés y alemán',
    destacado_en = 'Service in Spanish, English and German',
    situacion = 'sin_dato',
    productos = array['Softlanding para empresas extranjeras', 'Programa IMMEX', 'NOMs y permisos COFEPRIS y SEDENA', 'Auditoría de comercio exterior (Data Stage, Anexos 24 y 30)', 'Consultoría aduanera y reglas de origen', 'Coordinación logística y aduanal', 'Contabilidad, controlling y fiscal', 'Nómina y tesorería', 'Derecho corporativo, laboral y mercantil', 'Trámites migratorios', 'Registro de marcas']::text[],
    contacto_email = 'eduardo.lopez@saetaoc.com',
    contacto_tel = '+52 222 533 9586',
    actualizado_en = now()
where slug = 'saeta';
