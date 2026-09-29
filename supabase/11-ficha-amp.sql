-- Sur Exporta — 11 · Fichas de socios enriquecidas (sitio oficial grupoamp.mx, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Grupo AMP Solutions
update empresas set marca = 'Grupo AMP Solutions',
    municipio = 'Cuauhtémoc',
    resumen_es = 'Logística integral y asesoría en comercio exterior: despacho aduanal, fletes marítimo y terrestre, almacenaje y Recinto Fiscalizado Estratégico (RFE).',
    resumen_en = 'End-to-end logistics and foreign trade advice: customs clearance, sea and road freight, warehousing and Strategic Bonded Zone (RFE) services.',
    descripcion_es = 'Grupo AMP Solutions integra en un solo servicio la cadena logística de importación y exportación: flete marítimo y terrestre, despacho aduanal, almacenaje, maniobras y seguro de mercancías. Trabaja con agentes aduanales aliados en las principales aduanas del país —Manzanillo, Lázaro Cárdenas, Veracruz, el AICM, Pantaco y el Aeropuerto de Guadalajara— y maneja alrededor de 250 despachos al mes y 75,000 toneladas de carga al año.

Mueve contenedor completo (FCL), carga consolidada (LCL), refrigerada, de proyecto, sobredimensionada y mercancía peligrosa, con unidades con rastreo GPS las 24 horas y custodia en carretera. Cuenta con 1,500 m² de almacén techado y 4,200 m² de bodega con vigilancia por circuito cerrado, y ofrece Recinto Fiscalizado Estratégico (RFE), depósito fiscal, oficina IMMEX, certificación de IVA e IEPS y clasificación arancelaria. Atiende sobre todo a las industrias de maquinaria pesada, acero, automotriz, equipo médico, química, calzado, textil y electrónica.',
    descripcion_en = 'Grupo AMP Solutions brings the whole import and export logistics chain into a single service: sea and road freight, customs clearance, warehousing, cargo handling and cargo insurance. It works with partner customs brokers at Mexico''s main customs points — Manzanillo, Lázaro Cárdenas, Veracruz, Mexico City International Airport, Pantaco and Guadalajara Airport — and handles around 250 customs clearances a month and 75,000 tonnes of cargo a year.

It moves full container loads (FCL), less-than-container loads (LCL), refrigerated, project, oversized and dangerous cargo, with 24/7 GPS-tracked trucks and road escort. It has 1,500 m² of covered warehouse and 4,200 m² of storage with CCTV surveillance, and offers Strategic Bonded Zone (RFE) and bonded warehouse services, an IMMEX office, VAT and IEPS certification, and tariff classification. It mainly serves the heavy machinery, steel, automotive, medical equipment, chemical, footwear, textile and electronics industries.',
    destacado_es = '250 despachos aduanales al mes',
    destacado_en = '250 customs clearances a month',
    situacion = 'sin_dato',
    productos = array['Despacho aduanal de importación y exportación', 'Flete marítimo: FCL, LCL, refrigerado y carga de proyecto', 'Flete terrestre con rastreo GPS y custodia', 'Almacenaje, consolidación y desconsolidación', 'Recinto Fiscalizado Estratégico (RFE) y depósito fiscal', 'Oficina IMMEX', 'Certificación de IVA e IEPS', 'Clasificación arancelaria y control de permisos', 'Seguro de mercancías', 'Mercancía peligrosa y carga sobredimensionada']::text[],
    contacto_email = 'rcareaga@grupoamp.mx',
    contacto_tel = '+52 314 146 2708',
    actualizado_en = now()
where slug = 'amp-solutions';
