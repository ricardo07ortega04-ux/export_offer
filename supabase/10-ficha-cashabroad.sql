-- Sur Exporta — 10 · Fichas de socios enriquecidas (sitio oficial cashabroad.one, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- CashAbroad
update empresas set marca = 'CashAbroad',
    municipio = null,
    resumen_es = 'Pagos a proveedores internacionales con dólares digitales (USDC) para exportadores e importadores que operan entre México, Estados Unidos y China.',
    resumen_en = 'Supplier payments abroad with digital dollars (USDC) for exporters and importers trading between Mexico, the United States and China.',
    descripcion_es = 'CashAbroad es una plataforma de tesorería empresarial para exportadores e importadores que operan entre México, Estados Unidos y China. Con una cuenta en dólares digitales (USDC, con paridad 1:1 con el dólar), las empresas pagan a proveedores y reciben cobros de clientes en el extranjero en unas cuatro horas —en lugar de los días que toma una transferencia tradicional—, deciden cuándo convertir y liquidan en moneda local mediante socios bancarios en más de ocho países.

La cuenta se activa en menos de 48 horas, no cobra anualidad y funciona junto a las cuentas bancarias que la empresa ya usa. Opera sobre las blockchains Stellar y Starknet, con procesos KYB/KYC, prevención de lavado de dinero y monitoreo de transacciones alineados con los requisitos del SAT para actividades vulnerables, y ofrece acompañamiento para configurar cada flujo (Business Concierge). Cuenta con el respaldo de Techstars y Draper University.',
    descripcion_en = 'CashAbroad is a corporate treasury platform for exporters and importers trading between Mexico, the United States and China. With an account in digital dollars (USDC, pegged 1:1 to the US dollar), companies pay suppliers and collect from customers abroad in about four hours — instead of the days a traditional wire takes — decide when to convert, and settle in local currency through banking partners in more than eight countries.

Accounts are activated in under 48 hours, with no annual fee, and work alongside the bank accounts a company already uses. It runs on the Stellar and Starknet blockchains, with KYB/KYC, anti-money-laundering and transaction-monitoring processes aligned with Mexican tax authority (SAT) requirements for vulnerable activities, and offers hands-on support to set up each flow (Business Concierge). It is backed by Techstars and Draper University.',
    destacado_es = 'Pagos internacionales en 4 horas',
    destacado_en = 'International payments in 4 hours',
    situacion = 'sin_dato',
    productos = array['Cuenta empresarial en dólares digitales (USDC)', 'Pagos a proveedores en México, Estados Unidos y China', 'Cobros de clientes en el extranjero', 'Conversión a moneda local y salida bancaria en más de 8 países', 'Tesorería con stablecoins', 'Business Concierge: configuración de flujos financieros']::text[],
    contacto_email = 'ruth@cashabroad.one',
    contacto_tel = '+52 55 8046 5994',
    actualizado_en = now()
where slug = 'cashabroad';
