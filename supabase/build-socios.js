/* Sur Exporta — genera 06-socios.sql con los socios de COMCE Sur
 *
 * Fuente: Directorio de Socios de COMCE Sur (comce-sur.org.mx/directorio-de-socios),
 * ubicaciones confirmadas por COMCE (sept. 2026) y logotipos en logo-<slug>.webp.
 * Solo socios con alcance internacional; LET se excluyó a petición de COMCE.
 *
 * Uso:  node supabase/build-socios.js   → escribe supabase/06-socios.sql
 * Las empresas entran como BORRADOR: se revisan en el panel y luego se publican.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const FUENTE = 'Directorio de Socios COMCE Sur 2026';

const ESTADOS = [
  ['puebla', 'Puebla'], ['tlaxcala', 'Tlaxcala'], ['veracruz', 'Veracruz'],
  ['campeche', 'Campeche'], ['quintana-roo', 'Quintana Roo'],
  ['ciudad-de-mexico', 'Ciudad de México'], ['nuevo-leon', 'Nuevo León']
];

// Certificaciones nuevas del catálogo. «COFEPRIS» es distinta de «Libre Venta COFEPRIS»,
// que ya existía (certificado de libre venta de 4 mezcales).
const CERTIFICACIONES = [
  ['cofepris', 'COFEPRIS', 'COFEPRIS',
   'Cumplimiento sanitario ante la Comisión Federal para la Protección contra Riesgos Sanitarios.',
   'Health compliance with Mexico\'s Federal Commission for the Protection against Sanitary Risks.']
];

const SOCIOS = [
  {
    slug: 'calten-group', marca: 'Calten Group', estado: 'puebla', municipio: 'Puebla',
    sector: 'logistica-comercio-exterior', email: 'emma.perez@caltengroup.com',
    destacado: ['18 años de experiencia', '18 years of experience'],
    resumen: ['Logística y comercio exterior para pymes que no cuentan con un departamento de operaciones internacionales.',
              'Logistics and foreign trade services for SMEs without an in-house international operations team.'],
    descripcion: ['Calten Group integra servicios de logística y comercio exterior para pequeñas y medianas empresas. Con más de 18 años de experiencia, ofrece soluciones personalizadas en comercio internacional, transporte, comercialización y auditoría, y acompaña a sus clientes en importación y exportación, cumplimiento, certificaciones IMMEX y PROSEC, capacitación y desarrollo de proveeduría internacional.',
                  'Calten Group provides integrated logistics and foreign trade services for small and medium-sized companies. With more than 18 years of experience, it offers tailored solutions in international trade, transport, sales and auditing, and supports clients with imports and exports, compliance, IMMEX and PROSEC certification, training and international supplier development.'],
    oferta: ['Logística internacional', 'Gestión aduanera', 'Coordinación de embarques', 'Consultoría en comercio exterior', 'Certificaciones IMMEX y PROSEC', 'Capacitación', 'Desarrollo de proveeduría internacional']
  },
  {
    slug: 'cashabroad', marca: 'CashAbroad', estado: 'ciudad-de-mexico', municipio: null,
    sector: 'pagos-internacionales', email: 'ruth@cashabroad.one', tel: '+52 55 8046 5994',
    // Datos de su sitio oficial, cashabroad.one (sept. 2026). Sustituyen a los de la página
    // de socios: ahora se enfoca en México–EUA–China, activa cuentas en <48 h (antes 72 h)
    // y opera con USDC. El sitio no tiene fotos de producto: la ficha va sin foto.
    destacado: ['Pagos internacionales en 4 horas', 'International payments in 4 hours'],
    resumen: ['Pagos a proveedores internacionales con dólares digitales (USDC) para exportadores e importadores que operan entre México, Estados Unidos y China.',
              'Supplier payments abroad with digital dollars (USDC) for exporters and importers trading between Mexico, the United States and China.'],
    descripcion: ['CashAbroad es una plataforma de tesorería empresarial para exportadores e importadores que operan entre México, Estados Unidos y China. Con una cuenta en dólares digitales (USDC, con paridad 1:1 con el dólar), las empresas pagan a proveedores y reciben cobros de clientes en el extranjero en unas cuatro horas —en lugar de los días que toma una transferencia tradicional—, deciden cuándo convertir y liquidan en moneda local mediante socios bancarios en más de ocho países.\n\nLa cuenta se activa en menos de 48 horas, no cobra anualidad y funciona junto a las cuentas bancarias que la empresa ya usa. Opera sobre las blockchains Stellar y Starknet, con procesos KYB/KYC, prevención de lavado de dinero y monitoreo de transacciones alineados con los requisitos del SAT para actividades vulnerables, y ofrece acompañamiento para configurar cada flujo (Business Concierge). Cuenta con el respaldo de Techstars y Draper University.',
                  'CashAbroad is a corporate treasury platform for exporters and importers trading between Mexico, the United States and China. With an account in digital dollars (USDC, pegged 1:1 to the US dollar), companies pay suppliers and collect from customers abroad in about four hours — instead of the days a traditional wire takes — decide when to convert, and settle in local currency through banking partners in more than eight countries.\n\nAccounts are activated in under 48 hours, with no annual fee, and work alongside the bank accounts a company already uses. It runs on the Stellar and Starknet blockchains, with KYB/KYC, anti-money-laundering and transaction-monitoring processes aligned with Mexican tax authority (SAT) requirements for vulnerable activities, and offers hands-on support to set up each flow (Business Concierge). It is backed by Techstars and Draper University.'],
    oferta: [
      'Cuenta empresarial en dólares digitales (USDC)',
      'Pagos a proveedores en México, Estados Unidos y China',
      'Cobros de clientes en el extranjero',
      'Conversión a moneda local y salida bancaria en más de 8 países',
      'Tesorería con stablecoins',
      'Business Concierge: configuración de flujos financieros'
    ]
  },
  {
    slug: 'cogne-mexico', marca: 'COGNE México', estado: 'tlaxcala', municipio: 'Huamantla',
    sector: 'productos-metalicos', email: 'mcastillo@cogne.com.mx',
    destacado: ['Acero inoxidable de precisión', 'Precision stainless steel'],
    resumen: ['Barras y alambres de acero inoxidable y aleaciones especiales para aplicaciones industriales de alta exigencia.',
              'Stainless steel and special alloy bars and wire for demanding industrial applications.'],
    descripcion: ['COGNE México produce y transforma barras y alambres de acero inoxidable y aleaciones especiales. Sus procesos incluyen trefilado, fabricación de barras para válvulas de motores de combustión interna, enderezado y rectificado grueso y fino. Atiende a las industrias automotriz, aeroespacial, médica, petrolera, química, energética y de la construcción.',
                  'COGNE México produces and processes stainless steel and special alloy bars and wire. Its processes include drawing, manufacturing bars for internal combustion engine valves, straightening, and rough and fine grinding. It serves the automotive, aerospace, medical, oil, chemical, energy and construction industries.'],
    oferta: ['Barras de acero inoxidable', 'Barras para válvulas de motor', 'Alambre para resortes', 'Alambre para forja en frío', 'Perfiles especiales', 'Soldaduras de acero inoxidable']
  },
  {
    slug: 'cslogix', marca: 'CsLogix', estado: 'puebla', municipio: 'Puebla',
    sector: 'logistica-comercio-exterior', email: 'nohemi.camberos@cslogix.com',
    destacado: ['Logística nacional e internacional', 'Domestic and international logistics'],
    resumen: ['Estrategias y soluciones logísticas para comercio internacional y transporte nacional.',
              'Logistics strategies and solutions for international trade and domestic transport.'],
    descripcion: ['CsLogix diseña estrategias y soluciones para operaciones de comercio internacional y logística de transporte nacional. Su trabajo se centra en optimizar procesos, mejorar la coordinación de las cadenas de suministro y facilitar el movimiento eficiente de mercancías, con servicios adaptados a cada cliente.',
                  'CsLogix designs strategies and solutions for international trade operations and domestic transport logistics. Its work focuses on optimising processes, improving supply chain coordination and moving goods efficiently, with services tailored to each client.'],
    oferta: ['Logística internacional', 'Transporte nacional', 'Coordinación de cadena de suministro']
  },
  {
    slug: 'empacabados', marca: 'Empacabados', razon: 'Empacabados S.A. de C.V.', estado: 'puebla', municipio: 'Puebla',
    sector: 'textil-y-confeccion', email: 'maru@empacabados.com', maquila: true,
    destacado: ['20 años en maquila textil', '20 years in apparel manufacturing'],
    resumen: ['Maquila textil con más de 20 años de experiencia en la confección de prendas de vestir.',
              'Apparel contract manufacturer with more than 20 years of experience.'],
    descripcion: ['Empacabados es una maquiladora textil mexicana con más de 20 años confeccionando prendas de vestir para distintos sectores. Cubre el proceso completo —corte, transfer, sublimado, costura, revisión y empaque— y trabaja para marcas y empresas que buscan manufactura textil confiable.',
                  'Empacabados is a Mexican apparel contract manufacturer with more than 20 years of experience making garments for different sectors. It covers the whole process — cutting, heat transfer, sublimation, sewing, inspection and packing — for brands and companies looking for reliable textile manufacturing.'],
    oferta: ['Confección de prendas', 'Corte', 'Transfer y sublimado', 'Costura', 'Revisión y empaque']
  },
  {
    slug: 'impoexporta', marca: 'ImpoExporta', estado: 'quintana-roo', municipio: 'Benito Juárez',
    sector: 'logistica-comercio-exterior', email: 'admincun2@impoexporta.com',
    destacado: ['15 años en logística', '15 years in logistics'],
    resumen: ['Proveedor logístico y asesor en importación y exportación con más de 15 años de experiencia.',
              'Logistics provider and import-export adviser with more than 15 years of experience.'],
    descripcion: ['ImpoExporta (Empresa Importadora de Carga) es un proveedor logístico con más de 15 años de experiencia en operaciones de importación y exportación. Brinda asesoría, consultoría y acompañamiento entre importadores, exportadores y los demás actores de la cadena de comercio internacional, con un lenguaje práctico y soluciones a la medida.',
                  'ImpoExporta (Empresa Importadora de Carga) is a logistics provider with more than 15 years of experience in import and export operations. It offers advice, consulting and hands-on support between importers, exporters and the other players in the international trade chain, in plain language and with tailored solutions.'],
    oferta: ['Logística de importación y exportación', 'Asesoría en comercio exterior', 'Consultoría']
  },
  {
    slug: 'fairwind-group', marca: 'FairWind Group', estado: 'puebla', municipio: 'Puebla',
    sector: 'logistica-comercio-exterior', email: 'jesus.hernandez@fairwind.mx',
    destacado: ['Software para comercio exterior', 'Foreign trade software'],
    resumen: ['Soluciones de comercio exterior, logística internacional y gestión operativa para crecer en mercados globales.',
              'Foreign trade, international logistics and operations management solutions for growing in global markets.'],
    descripcion: ['FairWind integra servicios de comercio exterior, logística internacional y gestión operativa para empresas que buscan crecer en mercados globales. Con más de 10 años de experiencia, ofrece logística nacional e internacional, consultoría en exportación e importación, búsqueda de proveedores y clientes en el extranjero, gestión aduanera, capacitación y software para controlar operaciones de comercio exterior.',
                  'FairWind brings together foreign trade, international logistics and operations management services for companies looking to grow in global markets. With more than 10 years of experience, it offers domestic and international logistics, export and import consulting, sourcing of suppliers and customers abroad, customs management, training and software to manage foreign trade operations.'],
    oferta: ['Logística nacional e internacional', 'Consultoría en exportación e importación', 'Búsqueda de proveedores y clientes', 'Gestión aduanera', 'Capacitación', 'Software de comercio exterior']
  },
  {
    slug: 'geamex', marca: 'GEAMEX Comercializadora', estado: 'puebla', municipio: 'Puebla',
    sector: 'logistica-comercio-exterior', email: 'anaid@geamex.mx', desde: 2014,
    destacado: ['Comercialización internacional', 'International trading'],
    resumen: ['Comercializadora poblana que lleva productos mexicanos a mercados nacionales e internacionales.',
              'Puebla-based trading company that takes Mexican products to domestic and international markets.'],
    descripcion: ['GEAMEX Comercializadora, fundada en Puebla en 2014, comercializa productos mexicanos en México y el extranjero e impulsa a las pymes a abrir nuevos mercados. Ofrece asesoría y gestión de comercio exterior, logística internacional, despacho aduanal, planes de negocio y acompañamiento en procesos de internacionalización.',
                  'GEAMEX Comercializadora, founded in Puebla in 2014, sells Mexican products in Mexico and abroad and helps SMEs open new markets. It offers foreign trade advice and management, international logistics, customs clearance, business plans and support for internationalisation.'],
    oferta: ['Comercialización internacional', 'Asesoría en comercio exterior', 'Logística internacional', 'Despacho aduanal', 'Planes de negocio e internacionalización']
  },
  {
    // Datos de su sitio oficial, grupoamp.mx (sept. 2026). Oficina en Av. Insurgentes Centro,
    // alcaldía Cuauhtémoc. De sus cifras se usan 250 despachos/mes y 75,000 t/año; se omiten
    // «196 países atendidos» (no verificable) y «85 fletes» (sin periodo). Sus fotos son de
    // banco de imágenes, no de sus instalaciones: la ficha va sin foto.
    slug: 'amp-solutions', marca: 'Grupo AMP Solutions', estado: 'ciudad-de-mexico', municipio: 'Cuauhtémoc',
    sector: 'logistica-comercio-exterior', email: 'rcareaga@grupoamp.mx', tel: '+52 314 146 2708',
    destacado: ['250 despachos aduanales al mes', '250 customs clearances a month'],
    resumen: ['Logística integral y asesoría en comercio exterior: despacho aduanal, fletes marítimo y terrestre, almacenaje y Recinto Fiscalizado Estratégico (RFE).',
              'End-to-end logistics and foreign trade advice: customs clearance, sea and road freight, warehousing and Strategic Bonded Zone (RFE) services.'],
    descripcion: ['Grupo AMP Solutions integra en un solo servicio la cadena logística de importación y exportación: flete marítimo y terrestre, despacho aduanal, almacenaje, maniobras y seguro de mercancías. Trabaja con agentes aduanales aliados en las principales aduanas del país —Manzanillo, Lázaro Cárdenas, Veracruz, el AICM, Pantaco y el Aeropuerto de Guadalajara— y maneja alrededor de 250 despachos al mes y 75,000 toneladas de carga al año.\n\nMueve contenedor completo (FCL), carga consolidada (LCL), refrigerada, de proyecto, sobredimensionada y mercancía peligrosa, con unidades con rastreo GPS las 24 horas y custodia en carretera. Cuenta con 1,500 m² de almacén techado y 4,200 m² de bodega con vigilancia por circuito cerrado, y ofrece Recinto Fiscalizado Estratégico (RFE), depósito fiscal, oficina IMMEX, certificación de IVA e IEPS y clasificación arancelaria. Atiende sobre todo a las industrias de maquinaria pesada, acero, automotriz, equipo médico, química, calzado, textil y electrónica.',
                  'Grupo AMP Solutions brings the whole import and export logistics chain into a single service: sea and road freight, customs clearance, warehousing, cargo handling and cargo insurance. It works with partner customs brokers at Mexico\'s main customs points — Manzanillo, Lázaro Cárdenas, Veracruz, Mexico City International Airport, Pantaco and Guadalajara Airport — and handles around 250 customs clearances a month and 75,000 tonnes of cargo a year.\n\nIt moves full container loads (FCL), less-than-container loads (LCL), refrigerated, project, oversized and dangerous cargo, with 24/7 GPS-tracked trucks and road escort. It has 1,500 m² of covered warehouse and 4,200 m² of storage with CCTV surveillance, and offers Strategic Bonded Zone (RFE) and bonded warehouse services, an IMMEX office, VAT and IEPS certification, and tariff classification. It mainly serves the heavy machinery, steel, automotive, medical equipment, chemical, footwear, textile and electronics industries.'],
    oferta: [
      'Despacho aduanal de importación y exportación',
      'Flete marítimo: FCL, LCL, refrigerado y carga de proyecto',
      'Flete terrestre con rastreo GPS y custodia',
      'Almacenaje, consolidación y desconsolidación',
      'Recinto Fiscalizado Estratégico (RFE) y depósito fiscal',
      'Oficina IMMEX',
      'Certificación de IVA e IEPS',
      'Clasificación arancelaria y control de permisos',
      'Seguro de mercancías',
      'Mercancía peligrosa y carga sobredimensionada'
    ]
  },
  {
    slug: 'grupo-ravara', marca: 'Grupo RAVARA', estado: 'nuevo-leon', municipio: 'García',
    sector: 'cosmetica', email: 'alejandra@gruporavara.com',
    destacado: ['Ingredientes de origen natural', 'Naturally derived ingredients'],
    resumen: ['Centro tecnológico que diseña y fabrica ingredientes activos para cosmética y cuidado personal.',
              'Technology centre that designs and manufactures active ingredients for cosmetics and personal care.'],
    descripcion: ['Grupo RAVARA es un centro tecnológico mexicano que diseña y manufactura ingredientes activos para las industrias cosmética, de cuidado personal, del hogar y capilar. Combina ciencia y herbolaria tradicional para desarrollar extractos botánicos, proteínas, péptidos y complejos activos con funciones de hidratación, antienvejecimiento, protección capilar, regeneración celular, control antimicrobiano y protección contra la contaminación.',
                  'Grupo RAVARA is a Mexican technology centre that designs and manufactures active ingredients for the cosmetics, personal care, home care and hair care industries. It combines science with traditional herbal knowledge to develop botanical extracts, proteins, peptides and active complexes for hydration, anti-ageing, hair protection, cell renewal, antimicrobial control and protection against pollution.'],
    oferta: ['Extractos botánicos', 'Proteínas y péptidos', 'Complejos activos', 'Activos para cuidado capilar', 'Formulaciones a la medida']
  },
  {
    slug: 'lari-moda', marca: 'LARI MODA', estado: 'oaxaca', municipio: null,
    sector: 'textil-y-confeccion', email: 'oly@larimoda.mx',
    destacado: ['Bordado artesanal', 'Hand embroidery'],
    resumen: ['Prendas bordadas a mano por mujeres artesanas, con telas y procesos conscientes.',
              'Garments hand-embroidered by women artisans, using mindful fabrics and processes.'],
    descripcion: ['LARI MODA crea prendas bordadas a mano por mujeres artesanas en pequeños talleres comunitarios, con telas más amigables con la naturaleza. Su modelo impulsa el empoderamiento económico de las mujeres, preserva técnicas tradicionales de bordado y promueve una moda ética, con piezas atemporales pensadas para durar.',
                  'LARI MODA makes garments hand-embroidered by women artisans in small community workshops, using more environmentally friendly fabrics. Its model supports women\'s economic empowerment, preserves traditional embroidery techniques and promotes ethical fashion, with timeless pieces made to last.'],
    oferta: ['Prendas bordadas a mano', 'Moda sostenible']
  },
  {
    slug: 'licorera-del-sur', marca: 'Licorera del Sur', estado: 'oaxaca', municipio: 'Santiago Matatlán',
    sector: 'bebidas-espirituosas', email: 'jrodriguez@licoreradelsur.com',
    destacado: ['40 años de trayectoria', '40 years in business'],
    resumen: ['Productora y distribuidora de bebidas espirituosas de Santiago Matatlán, Oaxaca, con más de 40 años de experiencia.',
              'Spirits producer and distributor from Santiago Matatlán, Oaxaca, with more than 40 years of experience.'],
    descripcion: ['Licorera del Sur produce y distribuye bebidas espirituosas desde Santiago Matatlán, Oaxaca, una de las regiones con mayor tradición mezcalera del país. Con más de 40 años de experiencia y productos galardonados, cuenta con capacidad propia de fabricación, embotellado, etiquetado y distribución.',
                  'Licorera del Sur produces and distributes spirits from Santiago Matatlán, Oaxaca, one of Mexico\'s most traditional mezcal regions. With more than 40 years of experience and award-winning products, it has its own production, bottling, labelling and distribution capacity.'],
    oferta: ['Bebidas espirituosas']
  },
  {
    slug: 'mezcal-capotlan', marca: 'Mezcal Capotlán', estado: 'oaxaca', municipio: 'Las Razas',
    sector: 'destilados-de-agave', email: 'mezcalcapotlan@gmail.com',
    destacado: ['Mezcal artesanal', 'Artisanal mezcal'],
    resumen: ['Mezcal artesanal oaxaqueño de agaves Espadín, Tobalá y Tepeztate.',
              'Artisanal mezcal from Oaxaca made from Espadín, Tobalá and Tepeztate agaves.'],
    descripcion: ['Mezcal Capotlán elabora y promueve mezcal artesanal de alta calidad con métodos tradicionales de producción. Sus destilados expresan el carácter de cada variedad de agave —Espadín, Tobalá y Tepeztate— y la riqueza cultural, los aromas y sabores de Oaxaca.',
                  'Mezcal Capotlán makes and promotes high-quality artisanal mezcal using traditional production methods. Its spirits express the character of each agave variety — Espadín, Tobalá and Tepeztate — and the cultural richness, aromas and flavours of Oaxaca.'],
    oferta: ['Espadín', 'Tobalá', 'Tepeztate']
  },
  {
    slug: 'mezcal-dolores', marca: 'Mezcal Dolores', estado: 'oaxaca', municipio: 'Santiago Matatlán',
    sector: 'destilados-de-agave', email: 'marilyn.dolores30@gmail.com',
    destacado: ['Mezcal artesanal', 'Artisanal mezcal'],
    resumen: ['Mezcal artesanal de Santiago Matatlán elaborado con procesos tradicionales.',
              'Artisanal mezcal from Santiago Matatlán made with traditional processes.'],
    descripcion: ['Mezcal Dolores produce y comercializa mezcal artesanal cuidando cada etapa del proceso tradicional, para ofrecer destilados auténticos, con identidad y carácter propio, dirigidos al mercado nacional e internacional.',
                  'Mezcal Dolores produces and sells artisanal mezcal, taking care of every stage of the traditional process to offer authentic spirits with their own identity and character for domestic and international markets.'],
    oferta: ['Mezcal artesanal']
  },
  {
    slug: 'mezcal-la-entrega', marca: 'Mezcal La Entrega', estado: 'oaxaca', municipio: 'Oaxaca de Juárez',
    sector: 'destilados-de-agave', email: 'laentregamezcal@gmail.com',
    destacado: ['100% orgánico', '100% organic'],
    resumen: ['Mezcal artesanal 100% orgánico, destilado en alambique de cobre.',
              '100% organic artisanal mezcal distilled in copper stills.'],
    descripcion: ['Mezcal La Entrega produce mezcal artesanal 100% orgánico con procesos tradicionales: agaves maduros cocidos en hornos de piedra subterráneos, fermentación natural en tinas de madera y destilación en alambique de cobre. El resultado es un destilado puro, complejo y con el ahumado característico del mezcal.',
                  'Mezcal La Entrega produces 100% organic artisanal mezcal using traditional methods: mature agaves cooked in underground stone ovens, natural fermentation in wooden vats and distillation in copper stills. The result is a pure, complex spirit with mezcal\'s characteristic smokiness.'],
    oferta: ['Mezcal artesanal orgánico']
  },
  {
    slug: 'multilog-internacional', marca: 'Multilog Internacional', estado: 'ciudad-de-mexico', municipio: null,
    sector: 'logistica-comercio-exterior', email: 'orlando.vazquez@multilog.com.mx',
    destacado: ['16 años en logística', '16 years in logistics'],
    resumen: ['Logística y cadena de suministro: transporte terrestre, aéreo y marítimo, almacenaje y distribución.',
              'Logistics and supply chain: road, air and sea freight, warehousing and distribution.'],
    descripcion: ['Multilog Internacional ofrece desde hace más de 16 años soluciones integrales de logística y cadena de suministro para empresas de distintos sectores. Integra transporte terrestre, aéreo y marítimo, almacenamiento, distribución y operaciones in-house bajo un mismo esquema, con atención personalizada.',
                  'For more than 16 years, Multilog Internacional has provided end-to-end logistics and supply chain solutions for companies in different sectors. It combines road, air and sea freight, warehousing, distribution and in-house operations under a single scheme, with personalised service.'],
    oferta: ['Transporte terrestre', 'Transporte aéreo', 'Transporte marítimo', 'Almacenamiento', 'Distribución', 'Operaciones in-house']
  },
  {
    slug: 'oceamar', marca: 'Oceamar', estado: 'campeche', municipio: 'Ciudad del Carmen',
    sector: 'logistica-comercio-exterior', email: 'enrique.escobar@oceamar.com',
    destacado: ['Logística offshore', 'Offshore logistics'],
    resumen: ['Agencia de logística offshore para la industria marítima y petrolera.',
              'Offshore logistics agency for the maritime and oil industries.'],
    descripcion: ['Oceamar (Ocean Marine) es una agencia de logística integral offshore que atiende a la industria marítima y petrolera. Coordina soluciones logísticas, operativas y de soporte para operaciones costa afuera, con foco en eficiencia, seguridad y cumplimiento en proyectos del sector energético.',
                  'Oceamar (Ocean Marine) is an end-to-end offshore logistics agency serving the maritime and oil industries. It coordinates logistics, operational and support solutions for offshore operations, focusing on efficiency, safety and compliance in energy sector projects.'],
    oferta: ['Logística offshore', 'Soporte a operaciones costa afuera', 'Servicios a la industria marítima y petrolera']
  },
  {
    slug: 'pilu-uniformes', marca: 'Pilu Uniformes', estado: 'puebla', municipio: 'Puebla',
    sector: 'textil-y-confeccion', email: 'eduardosanchez@piluniformes.com.mx',
    destacado: ['Uniformes a la medida', 'Made-to-order uniforms'],
    resumen: ['Diseño y fabricación de uniformes industriales e institucionales.',
              'Design and manufacture of industrial and corporate uniforms.'],
    descripcion: ['Pilu Uniformes Industriales de México diseña, fabrica y comercializa uniformes industriales e institucionales adaptados a cada organización. Combina imagen corporativa, ergonomía y seguridad en prendas funcionales y de alta calidad.',
                  'Pilu Uniformes Industriales de México designs, manufactures and sells industrial and corporate uniforms tailored to each organisation. It combines corporate image, ergonomics and safety in functional, high-quality garments.'],
    oferta: ['Uniformes industriales', 'Uniformes institucionales']
  },
  {
    slug: 'las-vegas-premium-limes', marca: 'Las Vegas Premium Limes', razon: 'Productos Men-Frut S.A. de C.V.',
    estado: 'veracruz', municipio: 'Martínez de la Torre',
    sector: 'frutas-y-hortalizas', email: 'hugo.mendez@citru-mex.com.mx', situacion: 'exportando',
    destacado: ['Lima persa todo el año', 'Persian limes all year round'],
    resumen: ['Empaque y exportación de lima persa de alta calidad durante todo el año.',
              'Packing and export of high-quality Persian limes all year round.'],
    descripcion: ['Productos Men-Frut empaca y exporta lima persa bajo la marca Las Vegas Premium Limes desde Martínez de la Torre, Veracruz, una de las regiones citrícolas más importantes de México. Ofrece producto fresco todo el año y cumple estándares internacionales para abastecer mercados alrededor del mundo.',
                  'Productos Men-Frut packs and exports Persian limes under the Las Vegas Premium Limes brand from Martínez de la Torre, Veracruz, one of Mexico\'s leading citrus regions. It supplies fresh product all year round and meets international standards to serve markets around the world.'],
    oferta: ['Lima persa']
  },
  {
    slug: 'recodding', marca: 'Recodding', estado: 'puebla', municipio: 'Puebla',
    sector: 'tecnologia', email: 'eduardo@recodding.com',
    destacado: ['Implementación de Odoo', 'Odoo implementation'],
    resumen: ['Transformación digital: inteligencia de negocios, automatización y ERP Odoo.',
              'Digital transformation: business intelligence, automation and Odoo ERP.'],
    descripcion: ['Recodding acompaña a las empresas en su transformación digital para hacerlas más rentables y eficientes. Combina automatización, análisis de datos e integración tecnológica: Business Intelligence, automatización de procesos, implementación de ERP Odoo, arquitectura en la nube e integración de bases de datos.',
                  'Recodding supports companies through digital transformation to make them more profitable and efficient. It combines automation, data analysis and technology integration: business intelligence, process automation, Odoo ERP implementation, cloud architecture and database integration.'],
    oferta: ['Business Intelligence', 'Automatización de procesos', 'Implementación de ERP Odoo', 'Arquitectura en la nube', 'Integración de bases de datos']
  },
  {
    // Datos de su sitio oficial, saetaoc.com (sept. 2026). Oficina principal en
    // San Andrés Cholula (Corporativo Alsur); también tiene oficina en el German Centre, CDMX.
    // Fundada en 2022: celebra su 4.º aniversario el 25 de junio de 2026.
    slug: 'saeta', marca: 'SAETA Orientación Corporativa', estado: 'puebla', municipio: 'San Andrés Cholula',
    sector: 'consultoria', email: 'eduardo.lopez@saetaoc.com', tel: '+52 222 533 9586', desde: 2022,
    destacado: ['Atiende en español, inglés y alemán', 'Service in Spanish, English and German'],
    resumen: ['Consultoría integral para empresas mexicanas y extranjeras: comercio exterior e IMMEX, contabilidad, legal, nómina y softlanding, en español, inglés y alemán.',
              'All-in-one consulting for Mexican and foreign companies: foreign trade and IMMEX, accounting, legal, payroll and soft landing, in Spanish, English and German.'],
    descripcion: ['SAETA Orientación Corporativa es una firma de consultoría que reúne bajo un mismo techo siete áreas de servicio —softlanding, legal, contabilidad, fiscal, nómina y tesorería, comercio exterior y auditoría— para descomplicar los procesos corporativos de sus clientes. Fundada en 2022, atiende a más de 60 empresas nacionales e internacionales desde sus oficinas en Puebla y en el German Centre de la Ciudad de México.\n\nEn comercio exterior acompaña a las empresas en el programa IMMEX, el cumplimiento de NOMs y permisos de COFEPRIS y SEDENA, auditorías con Data Stage y de los Anexos 24 y 30, reglas de origen, devolución de IVA y la coordinación de la logística y el despacho aduanal. Trabaja en español, inglés y alemán, y acompaña a empresas extranjeras, incluidas las de habla alemana, en su llegada a México.',
                  'SAETA Orientación Corporativa is a consulting firm that brings seven service areas under one roof — soft landing, legal, accounting, tax, payroll and treasury, foreign trade and auditing — to simplify its clients\' corporate processes. Founded in 2022, it serves more than 60 Mexican and international companies from its offices in Puebla and at the German Centre in Mexico City.\n\nIn foreign trade, it supports companies with the IMMEX programme, compliance with Mexican Official Standards (NOMs) and COFEPRIS and SEDENA permits, Data Stage audits and Annex 24 and 30 reviews, rules of origin, VAT refunds, and coordination of logistics and customs clearance. It works in Spanish, English and German, and helps foreign companies, including German-speaking ones, set up in Mexico.'],
    oferta: [
      'Softlanding para empresas extranjeras',
      'Programa IMMEX',
      'NOMs y permisos COFEPRIS y SEDENA',
      'Auditoría de comercio exterior (Data Stage, Anexos 24 y 30)',
      'Consultoría aduanera y reglas de origen',
      'Coordinación logística y aduanal',
      'Contabilidad, controlling y fiscal',
      'Nómina y tesorería',
      'Derecho corporativo, laboral y mercantil',
      'Trámites migratorios',
      'Registro de marcas'
    ]
  },
  {
    slug: 'solferino-native', marca: 'Solferino Native', estado: 'quintana-roo', municipio: 'Solferino',
    sector: 'bebidas-espirituosas', email: 'info@solferinogin.com',
    // Datos de su sitio oficial, ginsolferino.com (sept. 2026). Ahí no aparecen el ron
    // ni el whisky que mencionaba la página de socios, así que se quitaron.
    abv: '30–55%', presentaciones: [750],
    destacado: ['Oro · World Gin Awards 2025', 'Gold · World Gin Awards 2025'],
    resumen: ['Primera destilería de Quintana Roo: gin artesanal con botánicos de la selva maya, medalla de oro como Mejor Gin de México en los World Gin Awards 2025.',
              'Quintana Roo\'s first distillery: craft gin with Mayan jungle botanicals, awarded gold as Best Mexican Gin at the World Gin Awards 2025.'],
    descripcion: ['Solferino Native es la primera destilería de Quintana Roo. Nació en 2020 en Solferino, un poblado de la selva maya camino a Holbox, y elabora gin y licores artesanales en alambique de cobre, en microlotes de máximo 120 botellas. Sus botánicos —zacate limón, hierbabuena, hoja santa, pimienta negra, romero y piel de toronja— se recolectan frescos con los vecinos del pueblo y se suman al enebro, el regaliz y la canela, sin químicos ni conservadores.\n\nSu Dry Gin ganó la medalla de oro como Mejor Gin de México en los World Gin Awards 2025, en Reino Unido, donde quedó entre los seis mejores del mundo en la categoría Contemporary Style, y volvió a ser reconocido en la edición 2026. Suma oro en Cata d\'Or World Spirits Awards (Chile, 2021 y 2025), plata en Las Vegas Global Spirit Awards 2025 y Gran Oro en el Concurso de Espirituosos de Guanajuato, y es miembro de The Gin Guild de Londres. Se vende en Quintana Roo, Ciudad de México, Estado de México, Querétaro y Baja California, en las tiendas La Europea de todo el país y en Amazon y Mercado Libre.',
                  'Solferino Native is Quintana Roo\'s first distillery. It was founded in 2020 in Solferino, a village in the Mayan jungle on the way to Holbox, and makes craft gin and liqueurs in copper stills, in micro-batches of no more than 120 bottles. Its botanicals — lemongrass, spearmint, hoja santa, black pepper, rosemary and grapefruit peel — are gathered fresh with local villagers and added to juniper, liquorice and cinnamon, with no chemicals or preservatives.\n\nIts Dry Gin won gold as Best Mexican Gin at the World Gin Awards 2025 in the United Kingdom, where it ranked among the world\'s top six in the Contemporary Style category, and was recognised again in the 2026 edition. It also holds gold at the Cata d\'Or World Spirits Awards (Chile, 2021 and 2025), silver at the Las Vegas Global Spirit Awards 2025 and Grand Gold at the Guanajuato Spirits Competition, and is a member of The Gin Guild in London. It is sold in Quintana Roo, Mexico City, the State of Mexico, Querétaro and Baja California, in La Europea stores nationwide, and on Amazon and Mercado Libre.'],
    oferta: [
      'Solferino Native Dry Gin · 40% Alc. · 750 ml',
      'Solferino Native Overproof Edition · gin 55% Alc.',
      'Solferino Native Flair Edition · gin para bartenders de flair',
      'Solferino Native Absenta · 55% Alc.',
      'Balam · licor cítrico de zacate limón, naranja y toronja',
      'Pancheel · licor de yaka · 30% Alc.'
    ]
  },
  {
    slug: 'toke-innova', marca: 'Toke Innova', estado: 'puebla', municipio: 'Puebla',
    sector: 'alimentos-procesados', email: 'aortiz.ventas@tokeinnova.com', situacion: 'exportando',
    mercados: ['estados-unidos'], certs: ['fda', 'cofepris'],   // confirmadas por COMCE
    tel: '+52 222 801 7636',
    // Datos del catálogo de la empresa (mayo 2024), entregado por COMCE
    destacado: ['Vende en 4 estados de EUA', 'Sold in 4 US states'],
    resumen: ['Salsa macha, chimichurri, especias y productos artesanales de Puebla, 100% naturales, con venta en 12 estados de México y cuatro de Estados Unidos.',
              'Artisanal salsa macha, chimichurri, spices and pantry products from Puebla — 100% natural, sold in 12 Mexican states and four US states.'],
    descripcion: ['Toke Innova, fundada en Puebla en 2017, elabora productos artesanales mexicanos 100% naturales bajo sus marcas La Artesanal Herencia Orza® y ¡Ay Buey!®. Empezó con su Salsa Macha y hoy su catálogo reúne 24 presentaciones: salsa macha en cuatro variedades, chimichurri, chiles y especias, miel, perlas de tapioca, crema de cacahuate y galletas.\n\nVende en 12 estados de México y en Estados Unidos, donde tiene presencia en California, Kansas, Oklahoma y Texas; sus etiquetas ya vienen en inglés y francés. Cuenta con registro ante COFEPRIS y la FDA. Sus productos tienen una vida de anaquel de 6 meses a 3 años y se surten en cajas de 8 a 52 piezas, según la presentación.',
                  'Toke Innova, founded in Puebla in 2017, makes 100% natural artisanal Mexican products under its La Artesanal Herencia Orza® and ¡Ay Buey!® brands. It started with its Salsa Macha and its catalogue now includes 24 products: salsa macha in four varieties, chimichurri, chillies and spices, honey, tapioca pearls, peanut butter and cookies.\n\nIt sells in 12 Mexican states and in the United States, with presence in California, Kansas, Oklahoma and Texas, and its labels are already in English and French. It is registered with COFEPRIS and the FDA. Shelf life ranges from 6 months to 3 years, and products ship in cases of 8 to 52 units depending on the item.'],
    oferta: [
      'Salsa Macha 4 chiles y 6 semillas · 200 g',
      'Salsa Macha 3 chiles y 3 semillas · 80 g',
      'Salsa Macha de cacahuate con chile morita · 200 g y 80 g',
      'Salsa Macha de miel de abeja y arándanos · 200 g y 80 g',
      'Salsa No Tan Macha · 200 g y 80 g',
      'Chimichurri · 200 g y 80 g',
      'Chimichurri picoso · 80 g',
      'Chile quebrado · 150 g',
      'Pimienta de cayena · 60 g',
      'Paprika · 60 g',
      'Ajonjolí negro · 75 g',
      'Miel pura de abeja · 100 g',
      'Perlas de miel con propóleo · 80 g',
      'Perlas de tapioca · 250 g y 500 g',
      'Crema de cacahuate · 340 g',
      'Galletas artesanales (nuez con amaranto, arándanos, avena, avellana) · 100 g'
    ]
  }
];

// ---------------------------------------------------------------

module.exports = { SOCIOS, ESTADOS, CERTIFICACIONES, FUENTE };
if (require.main !== module) return;

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => (a && a.length ? `array[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`);
const arrInt = (a) => (a && a.length ? `array[${a.map(Number).join(', ')}]::integer[]` : `'{}'::integer[]`);

// Mercados y certificaciones de un socio (no duplican si ya existen)
function relaciones(s) {
  return (s.mercados || []).map((m) =>
    `insert into empresa_mercados (empresa_id, pais) select id, ${q(m)} from empresas where slug = ${q(s.slug)} on conflict do nothing;`)
    .concat((s.certs || []).map((c) =>
    `insert into empresa_certificaciones (empresa_id, certificacion) select id, ${q(c)} from empresas where slug = ${q(s.slug)} on conflict do nothing;`));
}

const L = [];
L.push('-- Sur Exporta — 06 · Socios de COMCE Sur');
L.push('-- GENERADO por supabase/build-socios.js. No lo edites a mano: cambia el script y vuelve a generarlo.');
L.push('-- Requiere haber ejecutado antes 05-tipos-sectores.sql.');
L.push('-- Las empresas entran como BORRADOR. Si una ya existe (mismo identificador), no se toca.');
L.push('');
L.push('-- Estados nuevos');
ESTADOS.forEach(([clave, nombre]) => {
  L.push(`insert into estados (clave, nombre) values (${q(clave)}, ${q(nombre)}) on conflict (clave) do update set nombre = excluded.nombre;`);
});
L.push('');
L.push('-- Certificaciones nuevas');
CERTIFICACIONES.forEach(([clave, es, en, des, den]) => {
  L.push(`insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values (${[clave, es, en, des, den].map(q).join(', ')}) on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;`);
});
L.push('');
L.push(`-- ${SOCIOS.length} empresas`);
SOCIOS.forEach((s) => {
  L.push(`insert into empresas (slug, marca, razon_social, estado, municipio, sector, resumen_es, resumen_en, descripcion_es, descripcion_en, destacado_es, destacado_en, exporta_desde, situacion, maquila, abv, productos, presentaciones_ml, contacto_email, contacto_tel, estatus, fuente)`);
  L.push(`values (${[
    q(s.slug), q(s.marca), q(s.razon || null), q(s.estado), q(s.municipio), q(s.sector),
    q(s.resumen[0]), q(s.resumen[1]), q(s.descripcion[0]), q(s.descripcion[1]),
    q(s.destacado[0]), q(s.destacado[1]), s.desde || 'null', `'${s.situacion || 'sin_dato'}'`,
    s.maquila === undefined ? 'null' : s.maquila, q(s.abv || null), arr(s.oferta), arrInt(s.presentaciones),
    q(s.email), q(s.tel || null), `'borrador'`, q(FUENTE)
  ].join(', ')})`);
  L.push('on conflict (slug) do nothing;');
  L.push(...relaciones(s));
  L.push('');
});
L.push('-- Después de revisarlas en el panel, para publicar todas de una vez:');
L.push(`-- update empresas set estatus = 'publicado' where fuente = ${q(FUENTE)} and estatus = 'borrador';`);
L.push('');

fs.writeFileSync(path.join(__dirname, '06-socios.sql'), L.join('\n'), 'utf8');

// ---------------------------------------------------------------
// Fichas enriquecidas después de la carga inicial, un archivo por tanda.
// 06 no toca empresas que ya existen, así que los datos nuevos van como UPDATE.
// Ojo: sobrescribe los textos y la oferta de estas empresas aunque se hayan
// editado en el panel; el estatus (borrador/publicado) no se toca.
const ACTUALIZAR = [
  ['07-socios-fichas.sql', ['toke-innova'], 'catálogo de la empresa, mayo 2024'],
  ['08-ficha-solferino.sql', ['solferino-native'], 'sitio oficial ginsolferino.com, sept. 2026'],
  ['09-ficha-saeta.sql', ['saeta'], 'sitio oficial saetaoc.com, sept. 2026'],
  ['10-ficha-cashabroad.sql', ['cashabroad'], 'sitio oficial cashabroad.one, sept. 2026'],
  ['11-ficha-amp.sql', ['amp-solutions'], 'sitio oficial grupoamp.mx, sept. 2026']
];

ACTUALIZAR.forEach(([archivo, slugs, fuente]) => {
  const U = [];
  U.push(`-- Sur Exporta — ${archivo.slice(0, 2)} · Fichas de socios enriquecidas (${fuente})`);
  U.push('-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.');
  U.push('-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.');
  U.push('');
  SOCIOS.filter((s) => slugs.includes(s.slug)).forEach((s) => {
    U.push(`-- ${s.marca}`);
    U.push(`update empresas set ${[
      `marca = ${q(s.marca)}`, `municipio = ${q(s.municipio)}`,
      ...(s.desde ? [`exporta_desde = ${s.desde}`] : []),
      `resumen_es = ${q(s.resumen[0])}`, `resumen_en = ${q(s.resumen[1])}`,
      `descripcion_es = ${q(s.descripcion[0])}`, `descripcion_en = ${q(s.descripcion[1])}`,
      `destacado_es = ${q(s.destacado[0])}`, `destacado_en = ${q(s.destacado[1])}`,
      `situacion = '${s.situacion || 'sin_dato'}'`, `productos = ${arr(s.oferta)}`,
      ...(s.abv ? [`abv = ${q(s.abv)}`] : []),
      ...(s.presentaciones ? [`presentaciones_ml = ${arrInt(s.presentaciones)}`] : []),
      `contacto_email = ${q(s.email)}`, `contacto_tel = ${q(s.tel || null)}`,
      `actualizado_en = now()`
    ].join(',\n    ')}\nwhere slug = ${q(s.slug)};`);
    U.push(...relaciones(s));
    U.push('');
  });
  fs.writeFileSync(path.join(__dirname, archivo), U.join('\n'), 'utf8');
});

// Revisión: cada socio debe tener su logotipo en el repositorio
const sinLogo = SOCIOS.filter((s) => !fs.existsSync(path.join(__dirname, '..', `logo-${s.slug}.webp`)));
console.log(`06-socios.sql generado: ${SOCIOS.length} empresas, ${ESTADOS.length} estados.`);
if (sinLogo.length) console.log('  Sin logotipo: ' + sinLogo.map((s) => s.slug).join(', '));
