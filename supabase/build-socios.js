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
    sector: 'pagos-internacionales', email: 'ruth@cashabroad.one',
    destacado: ['Cuentas en EUA en 72 h', 'US accounts in 72 hours'],
    resumen: ['Pagos internacionales para empresas mexicanas con cuentas virtuales y dólares digitales.',
              'International payments for Mexican companies through virtual accounts and digital dollars.'],
    descripcion: ['CashAbroad es una startup que facilita los pagos internacionales de empresas mexicanas mediante tecnología blockchain. Su wallet empresarial admite varias stablecoins y permite transferencias empresa–proveedor y cliente–empresa con Estados Unidos, Canadá, Europa, China, Panamá, Colombia y República Dominicana. Abre cuentas virtuales en Estados Unidos en menos de 72 horas, ofrece pagos B2B en dólares digitales las 24 horas con liquidez inmediata en pesos, y opera bajo estándares de cumplimiento del SAT, la UIF, AML, OFAC y FATF.',
                  'CashAbroad is a start-up that uses blockchain technology to simplify international payments for Mexican companies. Its business wallet supports multiple stablecoins for company-to-supplier and customer-to-company transfers with the United States, Canada, Europe, China, Panama, Colombia and the Dominican Republic. It opens US virtual accounts in under 72 hours, offers 24/7 B2B payments in digital dollars with immediate liquidity in pesos, and operates under SAT, UIF, AML, OFAC and FATF compliance standards.'],
    oferta: ['Cuentas virtuales en Estados Unidos', 'Pagos B2B en dólares digitales', 'Conversión de divisas y activos digitales', 'Wallet empresarial multi-stablecoin']
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
    slug: 'amp-solutions', marca: 'AMP Solutions', estado: 'ciudad-de-mexico', municipio: null,
    sector: 'logistica-comercio-exterior', email: 'rcareaga@grupoamp.mx',
    destacado: ['Logística integral', 'End-to-end logistics'],
    resumen: ['Logística integral, segura y personalizada a lo largo de toda la cadena de suministro.',
              'Safe, tailored end-to-end logistics across the whole supply chain.'],
    descripcion: ['AMP Solutions ofrece soluciones logísticas integrales, seguras y personalizadas para toda la cadena de suministro. Apoya a empresas de distintos sectores en la coordinación, distribución y gestión logística, con atención cercana y operaciones adaptadas a cada cliente.',
                  'AMP Solutions provides safe, tailored end-to-end logistics solutions across the supply chain. It supports companies in different sectors with coordination, distribution and logistics management, with close attention and operations adapted to each client.'],
    oferta: ['Logística integral', 'Distribución', 'Gestión de cadena de suministro']
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
    slug: 'saeta', marca: 'Saeta Consulting', estado: 'puebla', municipio: 'Puebla',
    sector: 'consultoria', email: 'eduardo.lopez@saetaoc.com',
    destacado: ['Orientación corporativa', 'Corporate guidance'],
    resumen: ['Consultoría empresarial que simplifica los procesos corporativos.',
              'Business consulting that simplifies corporate processes.'],
    descripcion: ['Saeta es una firma de consultoría empresarial que ofrece soluciones estratégicas y personalizadas para el crecimiento de las organizaciones. Trabaja como un aliado cercano para facilitar la toma de decisiones y hacer los procesos corporativos más claros, eficientes y transparentes.',
                  'Saeta is a business consulting firm offering strategic, tailored solutions for organisational growth. It works as a close partner to support decision-making and make corporate processes clearer, more efficient and more transparent.'],
    oferta: ['Consultoría empresarial', 'Estrategia', 'Mejora de procesos']
  },
  {
    slug: 'solferino-native', marca: 'Solferino Native', estado: 'quintana-roo', municipio: 'Solferino',
    sector: 'bebidas-espirituosas', email: 'info@solferinogin.com',
    destacado: ['Destilados en lotes pequeños', 'Small-batch spirits'],
    resumen: ['Destilería artesanal de Quintana Roo: ginebra, ron, whisky y licores en lotes pequeños.',
              'Craft distillery in Quintana Roo: gin, rum, whisky and liqueurs in small batches.'],
    descripcion: ['Solferino Native es una destilería artesanal en el poblado de Solferino, Quintana Roo, que produce destilados y licores en lotes pequeños. Su portafolio incluye ginebra, ron, whisky y licores artesanales elaborados con ingredientes seleccionados que reflejan la identidad de la región.',
                  'Solferino Native is a craft distillery in the village of Solferino, Quintana Roo, producing spirits and liqueurs in small batches. Its range includes gin, rum, whisky and craft liqueurs made with selected ingredients that reflect the identity of the region.'],
    oferta: ['Ginebra', 'Ron', 'Whisky', 'Licores artesanales']
  },
  {
    slug: 'toke-innova', marca: 'Toke Innova', estado: 'puebla', municipio: 'Puebla',
    sector: 'alimentos-procesados', email: 'aortiz.ventas@tokeinnova.com', situacion: 'exportando',
    mercados: ['estados-unidos'],
    destacado: ['Exporta a Estados Unidos', 'Exports to the United States'],
    resumen: ['Salsas y condimentos artesanales mexicanos, con presencia en 12 estados y exportación a Estados Unidos.',
              'Artisanal Mexican sauces and condiments, sold in 12 Mexican states and exported to the United States.'],
    descripcion: ['Toke Innova, fundada en Puebla en 2017, produce y comercializa productos artesanales mexicanos. Empezó con su Salsa Macha y hoy tiene un portafolio de más de 30 productos bajo sus marcas La Artesanal Herencia ORZA® y Ay Buey®, con presencia en 12 estados del país y exportaciones a Estados Unidos.',
                  'Toke Innova, founded in Puebla in 2017, produces and sells artisanal Mexican products. It started with its Salsa Macha and now has more than 30 products under its La Artesanal Herencia ORZA® and Ay Buey® brands, sold in 12 Mexican states and exported to the United States.'],
    oferta: ['Salsa macha', 'Salsas', 'Condimentos']
  }
];

// ---------------------------------------------------------------

module.exports = { SOCIOS, ESTADOS, FUENTE };
if (require.main !== module) return;

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => (a && a.length ? `array[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`);

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
L.push(`-- ${SOCIOS.length} empresas`);
SOCIOS.forEach((s) => {
  L.push(`insert into empresas (slug, marca, razon_social, estado, municipio, sector, resumen_es, resumen_en, descripcion_es, descripcion_en, destacado_es, destacado_en, exporta_desde, situacion, maquila, productos, contacto_email, estatus, fuente)`);
  L.push(`values (${[
    q(s.slug), q(s.marca), q(s.razon || null), q(s.estado), q(s.municipio), q(s.sector),
    q(s.resumen[0]), q(s.resumen[1]), q(s.descripcion[0]), q(s.descripcion[1]),
    q(s.destacado[0]), q(s.destacado[1]), s.desde || 'null', `'${s.situacion || 'sin_dato'}'`,
    s.maquila === undefined ? 'null' : s.maquila, arr(s.oferta), q(s.email), `'borrador'`, q(FUENTE)
  ].join(', ')})`);
  L.push('on conflict (slug) do nothing;');
  (s.mercados || []).forEach((m) => {
    L.push(`insert into empresa_mercados (empresa_id, pais) select id, ${q(m)} from empresas where slug = ${q(s.slug)} on conflict do nothing;`);
  });
  L.push('');
});
L.push('-- Después de revisarlas en el panel, para publicar todas de una vez:');
L.push(`-- update empresas set estatus = 'publicado' where fuente = ${q(FUENTE)} and estatus = 'borrador';`);
L.push('');

fs.writeFileSync(path.join(__dirname, '06-socios.sql'), L.join('\n'), 'utf8');

// Revisión: cada socio debe tener su logotipo en el repositorio
const sinLogo = SOCIOS.filter((s) => !fs.existsSync(path.join(__dirname, '..', `logo-${s.slug}.webp`)));
console.log(`06-socios.sql generado: ${SOCIOS.length} empresas, ${ESTADOS.length} estados.`);
if (sinLogo.length) console.log('  Sin logotipo: ' + sinLogo.map((s) => s.slug).join(', '));
