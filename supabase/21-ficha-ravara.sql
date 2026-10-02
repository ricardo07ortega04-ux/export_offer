-- Sur Exporta — 21 · Fichas de socios enriquecidas (sitio oficial gruporavara.com, oct. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Certificaciones del catálogo
insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values ('smeta', 'SMETA', 'SMETA', 'Auditoría de comercio ético de Sedex: condiciones laborales, salud y seguridad, medio ambiente y ética empresarial.', 'Sedex Members Ethical Trade Audit: labour standards, health and safety, environment and business ethics.') on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;

-- Grupo RAVARA
update empresas set marca = 'Grupo RAVARA',
    municipio = 'García',
    resumen_es = 'Ingredientes activos para cosmética, cuidado personal y mascotas, desarrollados con biotecnología a partir de botánicos de México y Latinoamérica. Opera desde Nuevo León y vende en Estados Unidos y Europa.',
    resumen_en = 'Active ingredients for cosmetics, personal care and pet care, developed with biotechnology from Mexican and Latin American botanicals. Based in Nuevo León, it sells in the United States and Europe.',
    descripcion_es = 'Grupo Ravara es una empresa mexicana que diseña, procesa y formula ingredientes activos para las industrias cosmética, de cuidado personal y de cuidado de mascotas. Se inspira en la herbolaria de las civilizaciones prehispánicas y la combina con biotecnología —fermentación, hidrólisis, biocatálisis, encapsulación y biomimética, entre diez plataformas tecnológicas propias— en su laboratorio de investigación. Trabaja directamente con agricultores y productores locales y aprovecha materias primas mexicanas como el agave, incluidos subproductos del tequila, y la miel de abeja melipona.

Su portafolio reúne 127 ingredientes —biofermentos, péptidos, proteínas, extractos estandarizados, antimicrobianos naturales, aceites funcionales y complejos activos— para cuidado capilar y de la piel, cuidado personal, cosmética de color y mascotas. También desarrolla activos a la medida, de la definición del proyecto al escalamiento, con estudios de eficacia y soporte técnico-regulatorio. Cuenta con la auditoría ética SMETA de cuatro pilares. Opera desde García, Nuevo León, donde construye una nueva planta, y tiene oficina en Austin, Texas. En Europa vende a través de distribuidores oficiales en 17 países, entre ellos España, Francia e Italia, y sus ingredientes están en las plataformas Prospector y SpecialChem.',
    descripcion_en = 'Grupo Ravara is a Mexican company that designs, processes and formulates active ingredients for the cosmetics, personal care and pet care industries. It draws on the herbal knowledge of pre-Hispanic civilisations and combines it with biotechnology — fermentation, hydrolysis, biocatalysis, encapsulation and biomimetics, among ten in-house technology platforms — in its research laboratory. It works directly with local farmers and producers and uses Mexican raw materials such as agave, including tequila by-products, and stingless Melipona bee honey.

Its portfolio includes 127 ingredients — biofermentates, peptides, proteins, standardised extracts, natural antimicrobials, functional oils and active complexes — for hair and skin care, personal care, colour cosmetics and pet care. It also develops custom actives, from project definition to scale-up, with efficacy studies and technical and regulatory support. It holds a SMETA 4-Pillar ethical audit. It operates from García, Nuevo León, where it is building a new plant, and has an office in Austin, Texas. In Europe it sells through official distributors in 17 countries, including Spain, France and Italy, and its ingredients are listed on the Prospector and SpecialChem platforms.',
    destacado_es = 'Distribuidores oficiales en 17 países de Europa',
    destacado_en = 'Official distributors in 17 European countries',
    situacion = 'exportando',
    productos = array['Activos para cuidado capilar', 'Activos para cuidado de la piel', 'Ingredientes para cuidado personal y cosmética de color', 'Activos para cuidado de mascotas', 'Biofermentos y péptidos', 'Extractos botánicos estandarizados', 'Antimicrobianos naturales y aceites funcionales', 'Ravaranto Peptim NP · péptidos de amaranto para reparación capilar', 'Dermaboost Honey · activo de miel melipona', 'Cencagrow Scalp-Pro · complejo para densidad capilar', 'Desarrollo de activos a la medida']::text[],
    contacto_email = 'alejandra@gruporavara.com',
    contacto_tel = '+52 81 2313 4017',
    actualizado_en = now()
where slug = 'grupo-ravara';
insert into empresa_mercados (empresa_id, pais) select id, 'estados-unidos' from empresas where slug = 'grupo-ravara' on conflict do nothing;
insert into empresa_mercados (empresa_id, pais) select id, 'espana' from empresas where slug = 'grupo-ravara' on conflict do nothing;
insert into empresa_mercados (empresa_id, pais) select id, 'francia' from empresas where slug = 'grupo-ravara' on conflict do nothing;
insert into empresa_mercados (empresa_id, pais) select id, 'italia' from empresas where slug = 'grupo-ravara' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'smeta' from empresas where slug = 'grupo-ravara' on conflict do nothing;
