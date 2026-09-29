-- Sur Exporta — 12 · Fichas de socios enriquecidas (sitio oficial recodding.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Recodding
update empresas set marca = 'Recodding',
    municipio = 'Puebla',
    resumen_es = 'Automatización con agentes de inteligencia artificial para los procesos operativos de las empresas: conciliación, aprobaciones, cotizaciones y reportes.',
    resumen_en = 'AI agent automation for companies'' operational processes: reconciliation, approvals, quotes and reporting.',
    descripcion_es = 'Recodding construye agentes de automatización a la medida que ejecutan los flujos de trabajo operativos de una empresa —aprobaciones, conciliación de facturas, reportes, cotizaciones, clasificación de solicitudes o el paso de pedidos entre sistemas—: el trabajo que antes se hacía a mano, para que se complete en minutos en lugar de días. Cada agente se diseña para un proceso específico y se conecta a los sistemas que la empresa ya usa.

Su método avanza por etapas: primero mapea el proceso tal como lo ejecuta el equipo; después construye el agente y lo pone a trabajar en paralelo con revisión humana en cada decisión, y solo cuando su precisión se comprueba con volumen real asume el proceso completo, con registro de auditoría y una persona que puede intervenir ante cualquier excepción. Atiende a empresas de servicios financieros, manufactura, logística y cadena de suministro, comercio electrónico, salud, seguros y servicios profesionales.',
    descripcion_en = 'Recodding builds custom automation agents that run a company''s operational workflows — approvals, invoice reconciliation, reporting, quotes, request triage or moving orders between systems: work that used to be done by hand, so it gets done in minutes instead of days. Each agent is designed for a specific process and connects to the systems the company already uses.

Its method works in stages: first it maps the process as the team actually runs it; then it builds the agent and runs it in parallel with human review of every decision, and only once its accuracy is proven on real volume does it take over the whole process, with a full audit trail and a person who can step in on any exception. It serves companies in financial services, manufacturing, logistics and supply chain, e-commerce, healthcare, insurance and professional services.',
    destacado_es = 'Agentes de IA con supervisión humana',
    destacado_en = 'AI agents with human oversight',
    situacion = 'sin_dato',
    productos = array['Agentes de automatización a la medida', 'Conciliación de facturas y cuentas por pagar', 'Flujo de pedidos entre sistemas', 'Cotizaciones y contratos desde el CRM', 'Clasificación y enrutamiento de solicitudes', 'Reportes y datos entre aplicaciones']::text[],
    contacto_email = 'eduardo@recodding.com',
    contacto_tel = null,
    actualizado_en = now()
where slug = 'recodding';
