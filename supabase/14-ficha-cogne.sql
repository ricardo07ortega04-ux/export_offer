-- Sur Exporta — 14 · Fichas de socios enriquecidas (directorio de socios COMCE y sitio del grupo cogne.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- COGNE México
update empresas set marca = 'COGNE México',
    municipio = 'Huamantla',
    resumen_es = 'Barras y alambres de acero inoxidable y aleaciones especiales, producidos en Tlaxcala por la filial mexicana del grupo italiano Cogne Acciai Speciali.',
    resumen_en = 'Stainless steel and special alloy bars and wire, produced in Tlaxcala by the Mexican subsidiary of Italy''s Cogne Acciai Speciali group.',
    descripcion_es = 'COGNE México es la planta productiva en México del grupo Cogne Acciai Speciali, con sede en Aosta, Italia, y más de un siglo de historia, líder mundial en productos largos de acero inoxidable y aleaciones de níquel. Desde Huamantla, Tlaxcala, produce y transforma barras y alambres de acero inoxidable y aleaciones especiales para aplicaciones industriales de alta exigencia.

Sus procesos incluyen el trefilado de barras, la fabricación de barras para válvulas de motores de combustión interna, el enderezado y el rectificado grueso y fino, que dan precisión dimensional y buen acabado superficial. Ofrece alambre para resortes y para forja en frío, perfiles especiales y material de soldadura de acero inoxidable para las industrias automotriz, aeroespacial, médica, petrolera, química, energética y de la construcción.',
    descripcion_en = 'COGNE México is the Mexican production plant of the Cogne Acciai Speciali group, headquartered in Aosta, Italy, with more than a century of history and a world leader in long stainless steel and nickel alloy products. From Huamantla, Tlaxcala, it produces and processes stainless steel and special alloy bars and wire for demanding industrial applications.

Its processes include bar drawing, manufacturing bars for internal combustion engine valves, straightening, and rough and fine grinding, which provide dimensional precision and a good surface finish. It supplies spring wire and cold-heading wire, special profiles and stainless steel welding material to the automotive, aerospace, medical, oil, chemical, energy and construction industries.',
    destacado_es = 'Planta del grupo italiano Cogne',
    destacado_en = 'Plant of Italy''s Cogne Group',
    situacion = 'sin_dato',
    productos = array['Barras de acero inoxidable trefiladas', 'Barras para válvulas de motor', 'Barras enderezadas y rectificadas (grueso y fino)', 'Alambre para resortes', 'Alambre para forja en frío', 'Perfiles especiales', 'Material de soldadura de acero inoxidable']::text[],
    contacto_email = 'mcastillo@cogne.com.mx',
    contacto_tel = null,
    actualizado_en = now()
where slug = 'cogne-mexico';
