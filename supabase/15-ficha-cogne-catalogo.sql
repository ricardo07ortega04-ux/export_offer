-- Sur Exporta — 15 · Fichas de socios enriquecidas (catálogo de productos de la empresa, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- COGNE México
update empresas set marca = 'COGNE México',
    municipio = 'Huamantla',
    resumen_es = 'Alambre y barras de acero inoxidable y aleaciones de níquel fabricados en Huamantla, Tlaxcala, por la planta mexicana del grupo italiano Cogne. Exporta a Estados Unidos y Europa.',
    resumen_en = 'Stainless steel and nickel alloy wire and bars made in Huamantla, Tlaxcala, by the Mexican plant of Italy''s Cogne Group. Exports to the United States and Europe.',
    descripcion_es = 'COGNE México —antes Trefilados Inoxidables de México (TIM)— es la planta mexicana del grupo Cogne Acciai Speciali, con sede en Aosta, Italia, y más de un siglo de historia, líder mundial en productos largos de acero inoxidable y aleaciones de níquel. Su planta en la Ciudad Industrial Xicohténcatl II de Huamantla, Tlaxcala, ocupa un terreno de 36,500 m² con 13,000 m² de naves, oficinas y laboratorios, y cuenta con certificaciones ISO 9001, IATF 16949 para la industria automotriz, ISO 14001 e Industria Limpia.

Fabrica alambre de acero inoxidable y de aleaciones de níquel de 0.15 a 10 mm —fino, para resortes, para forja en frío, planos y perfiles especiales— en rollos, botes y carretes; barras de acero inoxidable de 3 a 20 mm y barras rectificadas sin centros de 6 a 31.5 mm, con maquila de rectificado desde una tonelada e inspección por corrientes de Eddy y ultrasonido. También ofrece soldaduras especiales de acero inoxidable, níquel y aluminio, y acero para válvulas automotrices. Exporta a Estados Unidos, Europa y Centro y Sudamérica, y opera con los programas IMMEX, ALTEX y PROSEC y como Operador Económico Autorizado.',
    descripcion_en = 'COGNE México — formerly Trefilados Inoxidables de México (TIM) — is the Mexican plant of the Cogne Acciai Speciali group, headquartered in Aosta, Italy, with more than a century of history and a world leader in long stainless steel and nickel alloy products. Its plant in the Xicohténcatl II Industrial City in Huamantla, Tlaxcala, sits on a 36,500 m² site with 13,000 m² of production halls, offices and laboratories, and is certified to ISO 9001, IATF 16949 for the automotive industry, ISO 14001 and Mexico''s Clean Industry programme.

It makes stainless steel and nickel alloy wire from 0.15 to 10 mm — fine, spring, cold-heading, flat and special-profile wire — on coils, drums and spools; stainless steel bars from 3 to 20 mm and centreless-ground bars from 6 to 31.5 mm, with toll grinding from one tonne and eddy-current and ultrasonic inspection. It also supplies special stainless steel, nickel and aluminium welding wire, and automotive valve steel. It exports to the United States, Europe and Central and South America, and operates under Mexico''s IMMEX, ALTEX and PROSEC programmes and as an Authorised Economic Operator.',
    destacado_es = 'Planta del grupo italiano Cogne',
    destacado_en = 'Plant of Italy''s Cogne Group',
    situacion = 'exportando',
    productos = array['Alambre de acero inoxidable de 0.15 a 10 mm', 'Alambre de aleaciones de níquel', 'Alambre para resortes', 'Alambre para forja en frío', 'Alambres planos y perfiles especiales', 'Barras de acero inoxidable de 3 a 20 mm', 'Barras rectificadas sin centros (6 a 31.5 mm)', 'Maquila de rectificado desde 1 tonelada', 'Soldaduras especiales de inoxidable, níquel y aluminio', 'Acero para válvulas automotrices']::text[],
    contacto_email = 'mcastillo@cogne.com.mx',
    contacto_tel = null,
    actualizado_en = now()
where slug = 'cogne-mexico';
insert into empresa_mercados (empresa_id, pais) select id, 'estados-unidos' from empresas where slug = 'cogne-mexico' on conflict do nothing;
