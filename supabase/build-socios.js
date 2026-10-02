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
   'Health compliance with Mexico\'s Federal Commission for the Protection against Sanitary Risks.'],
  ['c-tpat', 'C-TPAT', 'C-TPAT',
   'Programa de seguridad de la cadena de suministro de la aduana de Estados Unidos (CBP).',
   'US Customs and Border Protection (CBP) supply chain security programme.'],
  ['smeta', 'SMETA', 'SMETA',
   'Auditoría de comercio ético de Sedex: condiciones laborales, salud y seguridad, medio ambiente y ética empresarial.',
   'Sedex Members Ethical Trade Audit: labour standards, health and safety, environment and business ethics.'],
  ['primus-gfs', 'PrimusGFS', 'PrimusGFS',
   'Certificación de inocuidad alimentaria para productos agrícolas, reconocida por la Iniciativa Global de Inocuidad Alimentaria (GFSI).',
   'Food safety certification for agricultural products, benchmarked by the Global Food Safety Initiative (GFSI).'],
  ['globalgap', 'GLOBALG.A.P.', 'GLOBALG.A.P.',
   'Norma internacional de buenas prácticas agrícolas en campo: inocuidad, trazabilidad, medio ambiente y bienestar de los trabajadores.',
   'International standard for good agricultural practice on the farm: food safety, traceability, environment and worker welfare.'],
  ['haccp', 'HACCP', 'HACCP',
   'Sistema de análisis de peligros y puntos críticos de control para la inocuidad de los alimentos.',
   'Hazard Analysis and Critical Control Points system for food safety.']
];

const SOCIOS = [
  {
    // Datos de su sitio oficial, caltengroup.com (sept. 2026), más lo que ya traía la página
    // de socios (IMMEX y PROSEC). Oficina en San Pedro Cholula. Su sitio (2023) dice «más de
    // 15 años»; la página de socios (2026) dice 18, que es coherente. Su única foto es de banco
    // de imágenes y de baja resolución: la ficha va sin foto.
    slug: 'calten-group', marca: 'Calten Group', estado: 'puebla', municipio: 'San Pedro Cholula',
    sector: 'logistica-comercio-exterior', email: 'emma.perez@caltengroup.com', tel: '+52 222 455 3621',
    destacado: ['Inspección de calidad en origen', 'Quality inspection at origin'],
    resumen: ['Logística, comercio exterior e inspección en origen para pymes que no tienen un departamento de operaciones internacionales.',
              'Logistics, foreign trade and inspection at origin for SMEs without an in-house international operations team.'],
    descripcion: ['Calten Group acompaña a pequeñas y medianas empresas que importan o exportan sin tener un departamento de operaciones internacionales. Con más de 18 años de experiencia, integra logística internacional, gestión aduanera, transporte nacional y coordinación de embarques, ya sea por operación o como equipo in-house por contrato, y actúa también como comercializadora.\n\nEn comercio exterior arma y revisa expedientes, gestiona trámites ante la VUCEM, asesora en importación y exportación, en el cumplimiento de NOMs y en certificaciones IMMEX y PROSEC, y ayuda a calcular el costo y precio de productos internacionales. Además ofrece inspección en origen —auditoría de fábrica, control de calidad e inspección previa al embarque—, seguros de carga nacional e internacional y cursos de comercio exterior, básicos o a la medida.',
                  'Calten Group supports small and medium-sized companies that import or export without an international operations department. With more than 18 years of experience, it combines international logistics, customs management, domestic transport and shipment coordination — per operation or as an in-house team on a time-based contract — and also acts as a trading company.\n\nIn foreign trade, it prepares and reviews compliance files, handles procedures on Mexico\'s VUCEM single window, advises on imports and exports, Mexican Official Standards (NOMs) and IMMEX and PROSEC certification, and helps cost and price international products. It also offers inspection at origin — factory audits, quality control and pre-shipment inspection — domestic and international cargo insurance, and foreign trade courses, from basics to custom programmes.'],
    oferta: [
      'Logística internacional y transporte nacional',
      'Gestión aduanera',
      'Coordinación de embarques (por operación o in-house)',
      'Expedientes de comercio exterior y trámites VUCEM',
      'Certificaciones IMMEX y PROSEC',
      'Asesoría en NOMs',
      'Costeo y pricing de productos internacionales',
      'Inspección en origen: auditoría de fábrica y control de calidad',
      'Seguros de carga nacional e internacional',
      'Cursos de comercio exterior'
    ]
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
    // Fuentes: catálogo de productos de la empresa (entregado por COMCE, sept. 2026; es de la
    // época en que la planta se llamaba Trefilados Inoxidables de México, TIM, del grupo
    // Novametal, hoy Cogne), el directorio de socios de COMCE y el sitio del grupo, cogne.com.
    // Las certificaciones citadas son las que el catálogo atribuye a la planta de Huamantla
    // (ISO 9001:2015, IATF 16949:2016, ISO 14001:2015, Industria Limpia); las EN 9100 / NADCAP
    // que cita metalica.com.mx son de Aosta y no se usan. Exporta a EUA (confirmado por COMCE).
    // Foto: interior de la planta, de la página «Nuestra planta» del catálogo.
    slug: 'cogne-mexico', marca: 'COGNE México', estado: 'tlaxcala', municipio: 'Huamantla',
    sector: 'productos-metalicos', email: 'mcastillo@cogne.com.mx', situacion: 'exportando',
    mercados: ['estados-unidos'],
    destacado: ['Planta del grupo italiano Cogne', 'Plant of Italy\'s Cogne Group'],
    resumen: ['Alambre y barras de acero inoxidable y aleaciones de níquel fabricados en Huamantla, Tlaxcala, por la planta mexicana del grupo italiano Cogne. Exporta a Estados Unidos y Europa.',
              'Stainless steel and nickel alloy wire and bars made in Huamantla, Tlaxcala, by the Mexican plant of Italy\'s Cogne Group. Exports to the United States and Europe.'],
    descripcion: ['COGNE México —antes Trefilados Inoxidables de México (TIM)— es la planta mexicana del grupo Cogne Acciai Speciali, con sede en Aosta, Italia, y más de un siglo de historia, líder mundial en productos largos de acero inoxidable y aleaciones de níquel. Su planta en la Ciudad Industrial Xicohténcatl II de Huamantla, Tlaxcala, ocupa un terreno de 36,500 m² con 13,000 m² de naves, oficinas y laboratorios, y cuenta con certificaciones ISO 9001, IATF 16949 para la industria automotriz, ISO 14001 e Industria Limpia.\n\nFabrica alambre de acero inoxidable y de aleaciones de níquel de 0.15 a 10 mm —fino, para resortes, para forja en frío, planos y perfiles especiales— en rollos, botes y carretes; barras de acero inoxidable de 3 a 20 mm y barras rectificadas sin centros de 6 a 31.5 mm, con maquila de rectificado desde una tonelada e inspección por corrientes de Eddy y ultrasonido. También ofrece soldaduras especiales de acero inoxidable, níquel y aluminio, y acero para válvulas automotrices. Exporta a Estados Unidos, Europa y Centro y Sudamérica, y opera con los programas IMMEX, ALTEX y PROSEC y como Operador Económico Autorizado.',
                  'COGNE México — formerly Trefilados Inoxidables de México (TIM) — is the Mexican plant of the Cogne Acciai Speciali group, headquartered in Aosta, Italy, with more than a century of history and a world leader in long stainless steel and nickel alloy products. Its plant in the Xicohténcatl II Industrial City in Huamantla, Tlaxcala, sits on a 36,500 m² site with 13,000 m² of production halls, offices and laboratories, and is certified to ISO 9001, IATF 16949 for the automotive industry, ISO 14001 and Mexico\'s Clean Industry programme.\n\nIt makes stainless steel and nickel alloy wire from 0.15 to 10 mm — fine, spring, cold-heading, flat and special-profile wire — on coils, drums and spools; stainless steel bars from 3 to 20 mm and centreless-ground bars from 6 to 31.5 mm, with toll grinding from one tonne and eddy-current and ultrasonic inspection. It also supplies special stainless steel, nickel and aluminium welding wire, and automotive valve steel. It exports to the United States, Europe and Central and South America, and operates under Mexico\'s IMMEX, ALTEX and PROSEC programmes and as an Authorised Economic Operator.'],
    oferta: [
      'Alambre de acero inoxidable de 0.15 a 10 mm',
      'Alambre de aleaciones de níquel',
      'Alambre para resortes',
      'Alambre para forja en frío',
      'Alambres planos y perfiles especiales',
      'Barras de acero inoxidable de 3 a 20 mm',
      'Barras rectificadas sin centros (6 a 31.5 mm)',
      'Maquila de rectificado desde 1 tonelada',
      'Soldaduras especiales de inoxidable, níquel y aluminio',
      'Acero para válvulas automotrices'
    ]
  },
  {
    // Datos de su sitio oficial, cslogix.com (sept. 2026). Cifras tomadas de su sitio
    // (+15 años, +8,500 operaciones, +1,200 clientes, +45 países). Sus fotos son de banco
    // de imágenes: la ficha va sin foto.
    slug: 'cslogix', marca: 'CSLogix', estado: 'puebla', municipio: 'Puebla',
    sector: 'logistica-comercio-exterior', email: 'nohemi.camberos@cslogix.com', tel: '+52 222 156 0064',
    destacado: ['Cruce fronterizo México–EUA', 'Mexico–US cross-border'],
    resumen: ['Logística internacional de principio a fin: transporte marítimo, aéreo y terrestre —incluido el cruce México–Estados Unidos—, despacho aduanal, almacenaje y seguro de mercancías, con un solo ejecutivo por operación.',
              'End-to-end international logistics: sea, air and road freight — including Mexico–US cross-border — customs clearance, warehousing and cargo insurance, with a single account executive per shipment.'],
    descripcion: ['CSLogix coordina de principio a fin las operaciones de comercio internacional de sus clientes: transporte marítimo, aéreo y terrestre, despacho aduanal, almacenaje, distribución y seguro de mercancías, con un solo ejecutivo que da seguimiento en tiempo real a cada envío. Con más de 15 años de experiencia, suma más de 8,500 operaciones y 1,200 clientes, y una red de socios en América, Europa y Asia que la conecta con más de 45 países.\n\nEn transporte terrestre ofrece servicio nacional e internacional —incluido el cruce fronterizo México–Estados Unidos—, carga completa (FTL) y consolidada (LTL), seca, refrigerada y sobredimensionada; en marítimo y aéreo mueve contenedor completo (FCL), carga consolidada (LCL), carga general, urgente y de proyecto, con servicio puerta a puerta. Su área de comercio exterior se encarga de la clasificación arancelaria, la documentación, los permisos y el cumplimiento regulatorio, y su sitio publica tarifas de referencia por ruta para cotizar rápido.',
                  'CSLogix coordinates its clients\' international trade operations end to end: sea, air and road freight, customs clearance, warehousing, distribution and cargo insurance, with a single account executive tracking every shipment in real time. With more than 15 years of experience, it has completed more than 8,500 operations for over 1,200 clients, and a partner network across the Americas, Europe and Asia connects it with more than 45 countries.\n\nBy road it offers domestic and international service — including Mexico–US cross-border — full truckload (FTL) and less-than-truckload (LTL), dry, refrigerated and oversized cargo; by sea and air it handles full container loads (FCL), less-than-container loads (LCL), general, urgent and project cargo, with door-to-door service. Its foreign trade team handles tariff classification, documentation, permits and regulatory compliance, and its website publishes reference rates by route for quick quotes.'],
    oferta: [
      'Flete marítimo FCL y LCL',
      'Carga aérea general, consolidada y urgente',
      'Transporte terrestre FTL y LTL',
      'Cruce fronterizo México–Estados Unidos',
      'Carga refrigerada y sobredimensionada',
      'Despacho aduanal y clasificación arancelaria',
      'Documentación, permisos y cumplimiento',
      'Almacenaje y distribución',
      'Seguro de mercancías',
      'Servicio puerta a puerta'
    ]
  },
  {
    // Datos de su sitio oficial, empacabados.com (sept. 2026): fundada en 1986 (la página de
    // socios decía «más de 20 años»), exporta a EUA y Canadá, evaluada en C-TPAT y SMETA.
    // Foto: sus líneas de costura (img-859 de su sitio, foto propia de la planta).
    slug: 'empacabados', marca: 'Empacabados', razon: 'Empacabados S.A. de C.V.', estado: 'puebla', municipio: 'Puebla',
    sector: 'textil-y-confeccion', email: 'maru@empacabados.com', tel: '+52 222 232 7232', maquila: true,
    situacion: 'exportando', mercados: ['estados-unidos', 'canada'], certs: ['c-tpat', 'smeta'],
    destacado: ['40 años confeccionando para EUA y Canadá', '40 years making apparel for the US and Canada'],
    resumen: ['Maquila de ropa deportiva y de punto desde 1986 para marcas de Estados Unidos y Canadá, con corte, confección, estampado, bordado y sublimación en Puebla.',
              'Contract manufacturer of sportswear and knitwear since 1986 for US and Canadian brands, with cutting, sewing, printing, embroidery and sublimation in Puebla.'],
    descripcion: ['Empacabados, fundada en Puebla en 1986, confecciona prendas de punto y de tejido plano —en especial ropa deportiva— para marcas de Estados Unidos y Canadá. Empezó como taller de corte y confección, servicio que mantiene, y hoy ofrece paquete completo junto con empresas aliadas: teñido de prendas, serigrafía, bordado, elástico fruncido (shirring), transfer y sublimación.\n\nHa sido evaluada y aprobada como proveedora de marcas internacionales como Under Armour, Adidas, Puma y McDavid, y fabrica marca propia para cadenas como Target, Macy\'s, Kohl\'s y Walmart, a través de proveedores verticalmente integrados de Estados Unidos y Canadá. Ha sido evaluada en C-TPAT, el programa de seguridad de la cadena de suministro de la aduana de Estados Unidos, cuenta con la auditoría ética SMETA y ha aprobado auditorías de cumplimiento social de Intertek, Bureau Veritas, Elevate y UL.',
                  'Empacabados, founded in Puebla in 1986, makes knit and woven garments — especially sportswear — for US and Canadian brands. It started as a cut-and-sew workshop, a service it still provides, and today offers full-package production with partner companies: garment dyeing, screen printing, embroidery, elastic shirring, heat transfer and sublimation.\n\nIt has been evaluated and approved as a supplier for international brands such as Under Armour, Adidas, Puma and McDavid, and makes private labels for retailers such as Target, Macy\'s, Kohl\'s and Walmart through vertically integrated US and Canadian vendors. It has been assessed under C-TPAT, US Customs and Border Protection\'s supply chain security programme, holds a SMETA ethical audit and has passed social compliance audits by Intertek, Bureau Veritas, Elevate and UL.'],
    oferta: [
      'Corte y confección (cut & sew)',
      'Ropa deportiva de punto y tejido plano',
      'Marca propia (private label)',
      'Paquete completo (full package)',
      'Teñido de prendas',
      'Serigrafía',
      'Bordado',
      'Elástico fruncido (shirring)',
      'Transfer y sublimación'
    ]
  },
  {
    // Datos de su sitio oficial, impoexporta.com (oct. 2026; el pie del sitio dice © 2020, así
    // que rutas y redes conviene confirmarlas). Teléfono: su WhatsApp, lada 998 de Cancún.
    // Su única foto es un fondo genérico: la ficha va sin foto.
    slug: 'impoexporta', marca: 'ImpoExporta', estado: 'quintana-roo', municipio: 'Benito Juárez',
    sector: 'logistica-comercio-exterior', email: 'admincun2@impoexporta.com', tel: '+52 998 260 5438',
    destacado: ['Consolidados desde China, España y Miami', 'Consolidated freight from China, Spain and Miami'],
    resumen: ['Logística de importación y exportación desde Cancún: despacho aduanal, carga consolidada desde China, España y Miami hacia Quintana Roo y Yucatán, permisos sanitarios e importaciones temporales con carnet ATA.',
              'Import and export logistics from Cancún: customs clearance, consolidated freight from China, Spain and Miami to Quintana Roo and Yucatán, health permits and temporary imports under ATA Carnet.'],
    descripcion: ['ImpoExporta (Empresa Importadora de Carga) es un proveedor logístico con base en Cancún y más de 15 años de experiencia, que acompaña a importadores y exportadores en todo el movimiento de comercio exterior y se los explica en un lenguaje práctico. Una sola empresa se hace responsable de todo el proceso: revisión previa de documentos y requisitos aduanales, cotización exacta sin cobros sorpresa, despacho aduanal con agentes aduanales nacionales e internacionales, clasificación arancelaria, cálculo de aranceles y cuotas compensatorias, y trámite de permisos sanitarios y fitosanitarios ante COFEPRIS, la Secretaría de Salud y la Secretaría de Agricultura en México, y ante la FDA en Estados Unidos. Reporta el estado de cada embarque tres veces por semana.\n\nMueve carga marítima, aérea, terrestre, ferroviaria y multimodal, incluida carga refrigerada y peligrosa, con rutas de carga consolidada desde China, Valencia (España) y Miami hacia Puerto Morelos, Quintana Roo, y Progreso, Yucatán, y desde y hacia Manzanillo y Veracruz. Recolecta mercancía en cualquier parte del mundo, ofrece almacenaje y distribución en México, Estados Unidos y otros países, y opera un centro de distribución en Miami. Con el carnet ATA realiza importaciones y exportaciones temporales para ferias, congresos y eventos; además busca y verifica proveedores en China —con visita física a sus instalaciones e inspección antes del embarque— y se especializa en la importación de textiles, calzado y accesorios. Forma parte de redes internacionales de agentes de carga como WCA y es miembro de COMCE.',
                  'ImpoExporta (Empresa Importadora de Carga) is a Cancún-based logistics provider with more than 15 years of experience that supports importers and exporters through every foreign trade shipment and explains it in plain language. A single company takes responsibility for the whole process: upfront review of documents and customs requirements, exact quotes with no surprise charges, customs clearance through Mexican and international customs brokers, tariff classification, calculation of duties and countervailing duties, and health and phytosanitary permits from COFEPRIS, the Ministry of Health and the Ministry of Agriculture in Mexico, and from the FDA in the United States. It reports the status of every shipment three times a week.\n\nIt moves sea, air, road, rail and multimodal freight, including refrigerated and dangerous goods, with consolidated freight routes from China, Valencia (Spain) and Miami to Puerto Morelos, Quintana Roo, and Progreso, Yucatán, and to and from Manzanillo and Veracruz. It collects goods anywhere in the world, offers warehousing and distribution in Mexico, the United States and other countries, and runs a distribution centre in Miami. With the ATA Carnet it handles temporary imports and exports for trade fairs, conferences and events; it also sources and vets suppliers in China — with on-site visits and pre-shipment inspection — and specialises in importing textiles, footwear and accessories. It belongs to international freight forwarder networks such as WCA and is a member of COMCE.'],
    oferta: [
      'Despacho aduanal de importación y exportación',
      'Carga consolidada China, España y Miami – Quintana Roo y Yucatán',
      'Transporte marítimo, aéreo, terrestre, ferroviario y multimodal',
      'Importación y exportación temporal con carnet ATA',
      'Permisos sanitarios y fitosanitarios (COFEPRIS, FDA)',
      'Clasificación arancelaria y cálculo de contribuciones',
      'Búsqueda y verificación de proveedores en China',
      'Importación de textiles y calzado',
      'Almacenaje y distribución, con CEDI en Miami',
      'Recolección de mercancía en cualquier parte del mundo'
    ]
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
    // Datos de su sitio oficial, geamex.mx, y de su catálogo de servicios (entregado por COMCE,
    // oct. 2026); ambos coinciden. Su sitio señala Latinoamérica, Norteamérica y Asia como
    // regiones, sin países concretos, así que no se marcan mercados. El catálogo trae precios
    // por servicio «sujetos a previo análisis»: no se publican. Todas sus imágenes son de banco
    // (barcos, trenes, aviones): la ficha va sin foto.
    slug: 'geamex', marca: 'GEAMEX Comercializadora', estado: 'puebla', municipio: 'Puebla',
    sector: 'logistica-comercio-exterior', email: 'anaid@geamex.mx', desde: 2014,
    destacado: ['Acompañamiento para exportar en 8 pasos', '8-step export support'],
    resumen: ['Comercializadora poblana que lleva productos de pymes mexicanas a mercados de Latinoamérica, Norteamérica y Asia, y las acompaña en todo el proceso de exportación, del estudio de mercado al despacho aduanal.',
              'Puebla-based trading company that takes products from Mexican SMEs to markets in Latin America, North America and Asia, and supports them through the whole export process, from market research to customs clearance.'],
    descripcion: ['GEAMEX Comercializadora nació en Puebla en 2014 para impulsar a los sectores en desarrollo y a cualquier pyme con producción mexicana, mediante la comercialización nacional e internacional de sus productos. Busca constantemente nuevos mercados para el producto mexicano —trabaja con Latinoamérica, Norteamérica y Asia— y aprovecha los tratados de libre comercio y acuerdos comerciales de México.\n\nSu proceso de internacionalización acompaña a la empresa en ocho pasos: investigación de mercados internacionales, detección de compradores potenciales, análisis de capacidad y viabilidad de exportación, identificación de barreras arancelarias y no arancelarias y su cumplimiento, contrato de compraventa internacional, despacho de la mercancía y seguimiento. Antes de iniciar cualquier servicio aplica un cuestionario para saber en qué etapa está la empresa y por dónde le conviene empezar. También ofrece asesoría y gestión de comercio exterior, operación logística internacional, planes de negocios internacionales, despacho aduanal, servicios de bróker y capacitación.',
                  'GEAMEX Comercializadora was founded in Puebla in 2014 to support developing sectors and any SME with Mexican production by selling its products in Mexico and abroad. It constantly looks for new markets for Mexican products — working with Latin America, North America and Asia — and makes the most of Mexico\'s free trade and commercial agreements.\n\nIts internationalisation process takes a company through eight steps: international market research, identifying potential buyers, export capacity and feasibility analysis, identifying tariff and non-tariff barriers and complying with them, the international sales contract, shipping the goods, and follow-up. Before starting any service, it uses a questionnaire to find out what stage the company is at and where it should begin. It also offers foreign trade advice and management, international logistics operations, international business plans, customs clearance, brokerage and training.'],
    oferta: [
      'Comercialización nacional e internacional de productos mexicanos',
      'Proceso de internacionalización en 8 etapas',
      'Investigación de mercados y detección de compradores',
      'Análisis de capacidad y viabilidad de exportación',
      'Barreras arancelarias y no arancelarias',
      'Contrato de compraventa internacional',
      'Operación logística internacional',
      'Despacho aduanal',
      'Planes de negocios internacionales',
      'Bróker',
      'Asesoría, gestión y capacitación en comercio exterior'
    ]
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
    // Datos de su sitio oficial, gruporavara.com (oct. 2026): portafolio de 127 ingredientes,
    // oficinas en García, N.L. y Austin, Texas, y distribuidores oficiales en 17 países de
    // Europa (Biesterfeld y ZnD Solutions), de los que solo España, Francia e Italia están en el
    // catálogo de países. Cuenta con SMETA 4-Pillar. No se usan sus notas de eventos (una
    // tiene «fecha por confirmar») ni las cifras de eficacia. Sus fotos parecen generadas con
    // IA (la del stand en París muestra otra marca): la ficha va sin foto.
    slug: 'grupo-ravara', marca: 'Grupo RAVARA', estado: 'nuevo-leon', municipio: 'García',
    sector: 'cosmetica', email: 'alejandra@gruporavara.com', tel: '+52 81 2313 4017',
    situacion: 'exportando', mercados: ['estados-unidos', 'espana', 'francia', 'italia'], certs: ['smeta'],
    destacado: ['Distribuidores oficiales en 17 países de Europa', 'Official distributors in 17 European countries'],
    resumen: ['Ingredientes activos para cosmética, cuidado personal y mascotas, desarrollados con biotecnología a partir de botánicos de México y Latinoamérica. Opera desde Nuevo León y vende en Estados Unidos y Europa.',
              'Active ingredients for cosmetics, personal care and pet care, developed with biotechnology from Mexican and Latin American botanicals. Based in Nuevo León, it sells in the United States and Europe.'],
    descripcion: ['Grupo Ravara es una empresa mexicana que diseña, procesa y formula ingredientes activos para las industrias cosmética, de cuidado personal y de cuidado de mascotas. Se inspira en la herbolaria de las civilizaciones prehispánicas y la combina con biotecnología —fermentación, hidrólisis, biocatálisis, encapsulación y biomimética, entre diez plataformas tecnológicas propias— en su laboratorio de investigación. Trabaja directamente con agricultores y productores locales y aprovecha materias primas mexicanas como el agave, incluidos subproductos del tequila, y la miel de abeja melipona.\n\nSu portafolio reúne 127 ingredientes —biofermentos, péptidos, proteínas, extractos estandarizados, antimicrobianos naturales, aceites funcionales y complejos activos— para cuidado capilar y de la piel, cuidado personal, cosmética de color y mascotas. También desarrolla activos a la medida, de la definición del proyecto al escalamiento, con estudios de eficacia y soporte técnico-regulatorio. Cuenta con la auditoría ética SMETA de cuatro pilares. Opera desde García, Nuevo León, donde construye una nueva planta, y tiene oficina en Austin, Texas. En Europa vende a través de distribuidores oficiales en 17 países, entre ellos España, Francia e Italia, y sus ingredientes están en las plataformas Prospector y SpecialChem.',
                  'Grupo Ravara is a Mexican company that designs, processes and formulates active ingredients for the cosmetics, personal care and pet care industries. It draws on the herbal knowledge of pre-Hispanic civilisations and combines it with biotechnology — fermentation, hydrolysis, biocatalysis, encapsulation and biomimetics, among ten in-house technology platforms — in its research laboratory. It works directly with local farmers and producers and uses Mexican raw materials such as agave, including tequila by-products, and stingless Melipona bee honey.\n\nIts portfolio includes 127 ingredients — biofermentates, peptides, proteins, standardised extracts, natural antimicrobials, functional oils and active complexes — for hair and skin care, personal care, colour cosmetics and pet care. It also develops custom actives, from project definition to scale-up, with efficacy studies and technical and regulatory support. It holds a SMETA 4-Pillar ethical audit. It operates from García, Nuevo León, where it is building a new plant, and has an office in Austin, Texas. In Europe it sells through official distributors in 17 countries, including Spain, France and Italy, and its ingredients are listed on the Prospector and SpecialChem platforms.'],
    oferta: [
      'Activos para cuidado capilar',
      'Activos para cuidado de la piel',
      'Ingredientes para cuidado personal y cosmética de color',
      'Activos para cuidado de mascotas',
      'Biofermentos y péptidos',
      'Extractos botánicos estandarizados',
      'Antimicrobianos naturales y aceites funcionales',
      'Ravaranto Peptim NP · péptidos de amaranto para reparación capilar',
      'Dermaboost Honey · activo de miel melipona',
      'Cencagrow Scalp-Pro · complejo para densidad capilar',
      'Desarrollo de activos a la medida'
    ]
  },
  {
    // Datos de su sitio oficial, larimoda.mx, y de su catálogo de mayoreo (flipbook de 56
    // páginas), oct. 2026. No menciona países de exportación concretos: no se marcan mercados.
    // Teléfono: su WhatsApp. Foto: artesana en telar de pedal, de su propio sitio.
    slug: 'lari-moda', marca: 'LARI MODA', estado: 'oaxaca', municipio: null,
    sector: 'textil-y-confeccion', email: 'oly@larimoda.mx', tel: '+52 951 360 5209',
    destacado: ['Más de 20 años con artesanas de Oaxaca', '20+ years with Oaxacan women artisans'],
    resumen: ['Blusas, vestidos, huipiles y rebozos bordados y tejidos a mano por mujeres artesanas de Oaxaca, con más de 20 años de trayectoria y catálogo de mayoreo para boutiques y distribuidores.',
              'Blouses, dresses, huipiles and rebozos hand-embroidered and hand-woven by women artisans in Oaxaca, with more than 20 years of experience and a wholesale catalogue for boutiques and distributors.'],
    descripcion: ['Lari Moda colabora desde hace más de 20 años con mujeres artesanas de comunidades de Oaxaca para crear prendas únicas y atemporales, bordadas y tejidas a mano, respetando sus saberes, sus tiempos y la identidad de cada técnica. Su propuesta de moda consciente busca que el trabajo permanezca en las comunidades y que el oficio pase a nuevas generaciones: produce a escala humana, prefiere siluetas atemporales y cortes amplios para distintos cuerpos, y usa algodón, bambú y mezclas de lino con bambú en modelos seleccionados.\n\nSu catálogo de mayoreo reúne más de 50 modelos: blusas bordadas y de telar, vestidos y minivestidos, vestidos de niña, huipiles hechos en telar de cintura, rebozos de telar de cintura o de pedal, faldas, caminos de mesa personalizables, monederos y bolsas bordadas. Atiende a boutiques, tiendas de diseño y distribuidores con pedidos por volumen —confirma tallas, colores y disponibilidad en cada pedido, porque cada pieza es irrepetible— y vende al menudeo en su tienda en línea.',
                  'Lari Moda has worked for more than 20 years with women artisans from communities in Oaxaca to create unique, timeless garments, hand-embroidered and hand-woven, respecting their knowledge, their pace and the identity of each technique. Its mindful-fashion approach aims to keep the work in the communities and pass the craft on to new generations: it produces at a human scale, favours timeless silhouettes and relaxed cuts for different bodies, and uses cotton, bamboo and linen-bamboo blends in selected styles.\n\nIts wholesale catalogue includes more than 50 styles: embroidered and loom-woven blouses, dresses and mini dresses, girls\' dresses, backstrap-loom huipiles, backstrap and treadle-loom rebozos, skirts, customisable table runners, coin purses and embroidered bags. It serves boutiques, design stores and distributors with volume orders — confirming sizes, colours and availability for each order, since every piece is one of a kind — and sells individual pieces in its online store.'],
    oferta: [
      'Blusas bordadas a mano',
      'Blusas de telar',
      'Vestidos y minivestidos bordados',
      'Vestidos de niña',
      'Huipiles en telar de cintura',
      'Rebozos de telar',
      'Faldas',
      'Bolsas y monederos bordados',
      'Caminos de mesa personalizables',
      'Mayoreo para boutiques y distribuidores'
    ]
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
    // Datos de su sitio oficial, lasvegaslimes.com, y de su presentación (entregada por COMCE),
    // oct. 2026. Mercados: el sitio nombra Estados Unidos, Canadá, Europa y Japón (Europa no es
    // un país del catálogo). La presentación dice que GLOBALG.A.P. es certificación de huertas.
    // Foto: su línea de empaque con cajas de 40 lb, de su propio sitio (740 px, no se amplía).
    slug: 'las-vegas-premium-limes', marca: 'Las Vegas Premium Limes', razon: 'Productos Men-Frut S.A. de C.V.',
    estado: 'veracruz', municipio: 'Martínez de la Torre',
    sector: 'frutas-y-hortalizas', email: 'hugo.mendez@citru-mex.com.mx', tel: '+52 232 324 5010', situacion: 'exportando',
    mercados: ['estados-unidos', 'canada', 'japon'], certs: ['primus-gfs', 'globalgap', 'haccp'],
    destacado: ['Lima persa todo el año, certificada PrimusGFS', 'Year-round Persian limes, PrimusGFS certified'],
    resumen: ['Empacadora de limón persa de Martínez de la Torre, Veracruz: abasto todo el año de más de 2,500 pequeños productores, clasificación computarizada y certificación PrimusGFS para Estados Unidos, Canadá, Europa y Japón.',
              'Persian lime packing house in Martínez de la Torre, Veracruz: year-round supply from more than 2,500 small growers, computerised grading and PrimusGFS certification for the United States, Canada, Europe and Japan.'],
    descripcion: ['Las Vegas Premium Limes es la línea empacadora de limón persa de Productos Men-Frut, del Grupo Murrieta, que trabaja con cítricos desde hace más de 35 años —producción en campo, pesado, selección, lavado y encerado de fruta para el mercado nacional y jugo concentrado— y sumó el empaque de exportación como complemento natural. Está en Martínez de la Torre, Veracruz, la principal región productora de limón persa del país, y tiene alianzas con más de 2,500 pequeños productores de la zona, lo que le permite empacar y exportar todo el año, con las variaciones propias de la temporada.\n\nSu línea, renovada para cumplir las normas de exportación, cuenta con una clasificadora computarizada que separa la fruta por tamaño, color y defectos, y con dosificadores automáticos que controlan con precisión la sanitización y el encerado. El proceso va de la recepción y selección al lavado, secado, encerado, clasificación, empaque, flejado y embarque. Empaca principalmente en cajas de 40 y 10 libras, y en otras presentaciones a pedido, con marcas propias como Fryda. Opera con un sistema de calidad certificado PrimusGFS, buenas prácticas de manufactura y HACCP, registros ante USDA y SENASICA y huertas certificadas GLOBALG.A.P., y exporta a Estados Unidos, Canadá, Europa y Japón.',
                  'Las Vegas Premium Limes is the Persian lime packing line of Productos Men-Frut, part of Grupo Murrieta, which has worked with citrus for more than 35 years — field production, fruit weighing, sorting, washing and waxing for the domestic market, and concentrated juice — and added export packing as a natural complement. It is located in Martínez de la Torre, Veracruz, Mexico\'s leading Persian lime region, and has partnerships with more than 2,500 small local growers, which allows it to pack and export all year round, with normal seasonal variation.\n\nIts line, refurbished to meet export standards, has a computerised grader that sorts fruit by size, colour and defects, and automatic dosing systems that precisely control sanitising and waxing. The process runs from receiving and sorting to washing, drying, waxing, grading, packing, strapping and shipping. It packs mainly in 40 and 10 lb cartons, and in other formats on request, under its own brands such as Fryda. It operates under a PrimusGFS-certified quality system, good manufacturing practices and HACCP, with USDA and SENASICA registrations and GLOBALG.A.P.-certified orchards, and exports to the United States, Canada, Europe and Japan.'],
    oferta: [
      'Limón persa (lima persa) fresco todo el año',
      'Caja de 40 libras',
      'Caja de 10 libras',
      'Empaques a la medida del cliente',
      'Marca Fryda',
      'Clasificación por tamaño, color y defectos'
    ]
  },
  {
    // Datos de su sitio oficial, recodding.com (sept. 2026): ahora se enfoca en agentes de
    // automatización con IA; ya no menciona Odoo ni BI. Sus cifras están marcadas como
    // «ejemplo ilustrativo» y su testimonio es un marcador de posición: no se usan.
    // No se citan clientes (su lista incluye a COMCE Sur). Sin foto: solo tiene su logotipo.
    slug: 'recodding', marca: 'Recodding', estado: 'puebla', municipio: 'Puebla',
    sector: 'tecnologia', email: 'eduardo@recodding.com',
    destacado: ['Agentes de IA con supervisión humana', 'AI agents with human oversight'],
    resumen: ['Automatización con agentes de inteligencia artificial para los procesos operativos de las empresas: conciliación, aprobaciones, cotizaciones y reportes.',
              'AI agent automation for companies\' operational processes: reconciliation, approvals, quotes and reporting.'],
    descripcion: ['Recodding construye agentes de automatización a la medida que ejecutan los flujos de trabajo operativos de una empresa —aprobaciones, conciliación de facturas, reportes, cotizaciones, clasificación de solicitudes o el paso de pedidos entre sistemas—: el trabajo que antes se hacía a mano, para que se complete en minutos en lugar de días. Cada agente se diseña para un proceso específico y se conecta a los sistemas que la empresa ya usa.\n\nSu método avanza por etapas: primero mapea el proceso tal como lo ejecuta el equipo; después construye el agente y lo pone a trabajar en paralelo con revisión humana en cada decisión, y solo cuando su precisión se comprueba con volumen real asume el proceso completo, con registro de auditoría y una persona que puede intervenir ante cualquier excepción. Atiende a empresas de servicios financieros, manufactura, logística y cadena de suministro, comercio electrónico, salud, seguros y servicios profesionales.',
                  'Recodding builds custom automation agents that run a company\'s operational workflows — approvals, invoice reconciliation, reporting, quotes, request triage or moving orders between systems: work that used to be done by hand, so it gets done in minutes instead of days. Each agent is designed for a specific process and connects to the systems the company already uses.\n\nIts method works in stages: first it maps the process as the team actually runs it; then it builds the agent and runs it in parallel with human review of every decision, and only once its accuracy is proven on real volume does it take over the whole process, with a full audit trail and a person who can step in on any exception. It serves companies in financial services, manufacturing, logistics and supply chain, e-commerce, healthcare, insurance and professional services.'],
    oferta: [
      'Agentes de automatización a la medida',
      'Conciliación de facturas y cuentas por pagar',
      'Flujo de pedidos entre sistemas',
      'Cotizaciones y contratos desde el CRM',
      'Clasificación y enrutamiento de solicitudes',
      'Reportes y datos entre aplicaciones'
    ]
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
  ['11-ficha-amp.sql', ['amp-solutions'], 'sitio oficial grupoamp.mx, sept. 2026'],
  ['12-ficha-recodding.sql', ['recodding'], 'sitio oficial recodding.com, sept. 2026'],
  ['13-ficha-calten.sql', ['calten-group'], 'sitio oficial caltengroup.com, sept. 2026'],
  // 14-ficha-cogne.sql ya se aplicó y queda como registro; la versión vigente de COGNE es la 15
  ['15-ficha-cogne-catalogo.sql', ['cogne-mexico'], 'catálogo de productos de la empresa, sept. 2026'],
  ['16-ficha-cslogix.sql', ['cslogix'], 'sitio oficial cslogix.com, sept. 2026'],
  ['17-ficha-empacabados.sql', ['empacabados'], 'sitio oficial empacabados.com, sept. 2026', { catalogo: true }],
  // 18 y 19 son del panel (personal y solicitudes)
  ['20-ficha-geamex.sql', ['geamex'], 'sitio oficial geamex.mx y catálogo de la empresa, oct. 2026'],
  ['21-ficha-ravara.sql', ['grupo-ravara'], 'sitio oficial gruporavara.com, oct. 2026', { catalogo: true }],
  ['22-ficha-impoexporta.sql', ['impoexporta'], 'sitio oficial impoexporta.com, oct. 2026'],
  ['23-ficha-lari-moda.sql', ['lari-moda'], 'sitio oficial larimoda.mx y catálogo de mayoreo, oct. 2026'],
  ['24-ficha-las-vegas.sql', ['las-vegas-premium-limes'], 'sitio oficial lasvegaslimes.com y presentación de la empresa, oct. 2026', { catalogo: true }]
];

// { catalogo: true }: el archivo también da de alta en el catálogo las certificaciones nuevas
// que usa. Los archivos anteriores ya se aplicaron y se dejan como estaban.
ACTUALIZAR.forEach(([archivo, slugs, fuente, opciones = {}]) => {
  const U = [];
  U.push(`-- Sur Exporta — ${archivo.slice(0, 2)} · Fichas de socios enriquecidas (${fuente})`);
  U.push('-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.');
  U.push('-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.');
  U.push('');
  // Certificaciones nuevas que usan estas empresas: se dan de alta antes de asignarlas
  const usadas = new Set(SOCIOS.filter((s) => slugs.includes(s.slug)).flatMap((s) => s.certs || []));
  const nuevas = opciones.catalogo ? CERTIFICACIONES.filter(([clave]) => usadas.has(clave)) : [];
  if (nuevas.length) {
    U.push('-- Certificaciones del catálogo');
    nuevas.forEach(([clave, es, en, des, den]) => {
      U.push(`insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values (${[clave, es, en, des, den].map(q).join(', ')}) on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;`);
    });
    U.push('');
  }
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
