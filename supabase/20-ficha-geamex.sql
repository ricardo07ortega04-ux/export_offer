-- Sur Exporta — 20 · Fichas de socios enriquecidas (sitio oficial geamex.mx y catálogo de la empresa, oct. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- GEAMEX Comercializadora
update empresas set marca = 'GEAMEX Comercializadora',
    municipio = 'Puebla',
    exporta_desde = 2014,
    resumen_es = 'Comercializadora poblana que lleva productos de pymes mexicanas a mercados de Latinoamérica, Norteamérica y Asia, y las acompaña en todo el proceso de exportación, del estudio de mercado al despacho aduanal.',
    resumen_en = 'Puebla-based trading company that takes products from Mexican SMEs to markets in Latin America, North America and Asia, and supports them through the whole export process, from market research to customs clearance.',
    descripcion_es = 'GEAMEX Comercializadora nació en Puebla en 2014 para impulsar a los sectores en desarrollo y a cualquier pyme con producción mexicana, mediante la comercialización nacional e internacional de sus productos. Busca constantemente nuevos mercados para el producto mexicano —trabaja con Latinoamérica, Norteamérica y Asia— y aprovecha los tratados de libre comercio y acuerdos comerciales de México.

Su proceso de internacionalización acompaña a la empresa en ocho pasos: investigación de mercados internacionales, detección de compradores potenciales, análisis de capacidad y viabilidad de exportación, identificación de barreras arancelarias y no arancelarias y su cumplimiento, contrato de compraventa internacional, despacho de la mercancía y seguimiento. Antes de iniciar cualquier servicio aplica un cuestionario para saber en qué etapa está la empresa y por dónde le conviene empezar. También ofrece asesoría y gestión de comercio exterior, operación logística internacional, planes de negocios internacionales, despacho aduanal, servicios de bróker y capacitación.',
    descripcion_en = 'GEAMEX Comercializadora was founded in Puebla in 2014 to support developing sectors and any SME with Mexican production by selling its products in Mexico and abroad. It constantly looks for new markets for Mexican products — working with Latin America, North America and Asia — and makes the most of Mexico''s free trade and commercial agreements.

Its internationalisation process takes a company through eight steps: international market research, identifying potential buyers, export capacity and feasibility analysis, identifying tariff and non-tariff barriers and complying with them, the international sales contract, shipping the goods, and follow-up. Before starting any service, it uses a questionnaire to find out what stage the company is at and where it should begin. It also offers foreign trade advice and management, international logistics operations, international business plans, customs clearance, brokerage and training.',
    destacado_es = 'Acompañamiento para exportar en 8 pasos',
    destacado_en = '8-step export support',
    situacion = 'sin_dato',
    productos = array['Comercialización nacional e internacional de productos mexicanos', 'Proceso de internacionalización en 8 etapas', 'Investigación de mercados y detección de compradores', 'Análisis de capacidad y viabilidad de exportación', 'Barreras arancelarias y no arancelarias', 'Contrato de compraventa internacional', 'Operación logística internacional', 'Despacho aduanal', 'Planes de negocios internacionales', 'Bróker', 'Asesoría, gestión y capacitación en comercio exterior']::text[],
    contacto_email = 'anaid@geamex.mx',
    contacto_tel = null,
    actualizado_en = now()
where slug = 'geamex';
