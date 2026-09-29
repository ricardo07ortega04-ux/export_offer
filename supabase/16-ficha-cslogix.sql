-- Sur Exporta — 16 · Fichas de socios enriquecidas (sitio oficial cslogix.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- CSLogix
update empresas set marca = 'CSLogix',
    municipio = 'Puebla',
    resumen_es = 'Logística internacional de principio a fin: transporte marítimo, aéreo y terrestre —incluido el cruce México–Estados Unidos—, despacho aduanal, almacenaje y seguro de mercancías, con un solo ejecutivo por operación.',
    resumen_en = 'End-to-end international logistics: sea, air and road freight — including Mexico–US cross-border — customs clearance, warehousing and cargo insurance, with a single account executive per shipment.',
    descripcion_es = 'CSLogix coordina de principio a fin las operaciones de comercio internacional de sus clientes: transporte marítimo, aéreo y terrestre, despacho aduanal, almacenaje, distribución y seguro de mercancías, con un solo ejecutivo que da seguimiento en tiempo real a cada envío. Con más de 15 años de experiencia, suma más de 8,500 operaciones y 1,200 clientes, y una red de socios en América, Europa y Asia que la conecta con más de 45 países.

En transporte terrestre ofrece servicio nacional e internacional —incluido el cruce fronterizo México–Estados Unidos—, carga completa (FTL) y consolidada (LTL), seca, refrigerada y sobredimensionada; en marítimo y aéreo mueve contenedor completo (FCL), carga consolidada (LCL), carga general, urgente y de proyecto, con servicio puerta a puerta. Su área de comercio exterior se encarga de la clasificación arancelaria, la documentación, los permisos y el cumplimiento regulatorio, y su sitio publica tarifas de referencia por ruta para cotizar rápido.',
    descripcion_en = 'CSLogix coordinates its clients'' international trade operations end to end: sea, air and road freight, customs clearance, warehousing, distribution and cargo insurance, with a single account executive tracking every shipment in real time. With more than 15 years of experience, it has completed more than 8,500 operations for over 1,200 clients, and a partner network across the Americas, Europe and Asia connects it with more than 45 countries.

By road it offers domestic and international service — including Mexico–US cross-border — full truckload (FTL) and less-than-truckload (LTL), dry, refrigerated and oversized cargo; by sea and air it handles full container loads (FCL), less-than-container loads (LCL), general, urgent and project cargo, with door-to-door service. Its foreign trade team handles tariff classification, documentation, permits and regulatory compliance, and its website publishes reference rates by route for quick quotes.',
    destacado_es = 'Cruce fronterizo México–EUA',
    destacado_en = 'Mexico–US cross-border',
    situacion = 'sin_dato',
    productos = array['Flete marítimo FCL y LCL', 'Carga aérea general, consolidada y urgente', 'Transporte terrestre FTL y LTL', 'Cruce fronterizo México–Estados Unidos', 'Carga refrigerada y sobredimensionada', 'Despacho aduanal y clasificación arancelaria', 'Documentación, permisos y cumplimiento', 'Almacenaje y distribución', 'Seguro de mercancías', 'Servicio puerta a puerta']::text[],
    contacto_email = 'nohemi.camberos@cslogix.com',
    contacto_tel = '+52 222 156 0064',
    actualizado_en = now()
where slug = 'cslogix';
