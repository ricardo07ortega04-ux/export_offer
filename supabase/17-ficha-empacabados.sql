-- Sur Exporta — 17 · Fichas de socios enriquecidas (sitio oficial empacabados.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Certificaciones del catálogo
insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values ('c-tpat', 'C-TPAT', 'C-TPAT', 'Programa de seguridad de la cadena de suministro de la aduana de Estados Unidos (CBP).', 'US Customs and Border Protection (CBP) supply chain security programme.') on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;
insert into certificaciones (clave, nombre_es, nombre_en, descripcion_es, descripcion_en) values ('smeta', 'SMETA', 'SMETA', 'Auditoría de comercio ético de Sedex: condiciones laborales, salud y seguridad, medio ambiente y ética empresarial.', 'Sedex Members Ethical Trade Audit: labour standards, health and safety, environment and business ethics.') on conflict (clave) do update set nombre_es = excluded.nombre_es, nombre_en = excluded.nombre_en, descripcion_es = excluded.descripcion_es, descripcion_en = excluded.descripcion_en;

-- Empacabados
update empresas set marca = 'Empacabados',
    municipio = 'Puebla',
    resumen_es = 'Maquila de ropa deportiva y de punto desde 1986 para marcas de Estados Unidos y Canadá, con corte, confección, estampado, bordado y sublimación en Puebla.',
    resumen_en = 'Contract manufacturer of sportswear and knitwear since 1986 for US and Canadian brands, with cutting, sewing, printing, embroidery and sublimation in Puebla.',
    descripcion_es = 'Empacabados, fundada en Puebla en 1986, confecciona prendas de punto y de tejido plano —en especial ropa deportiva— para marcas de Estados Unidos y Canadá. Empezó como taller de corte y confección, servicio que mantiene, y hoy ofrece paquete completo junto con empresas aliadas: teñido de prendas, serigrafía, bordado, elástico fruncido (shirring), transfer y sublimación.

Ha sido evaluada y aprobada como proveedora de marcas internacionales como Under Armour, Adidas, Puma y McDavid, y fabrica marca propia para cadenas como Target, Macy''s, Kohl''s y Walmart, a través de proveedores verticalmente integrados de Estados Unidos y Canadá. Ha sido evaluada en C-TPAT, el programa de seguridad de la cadena de suministro de la aduana de Estados Unidos, cuenta con la auditoría ética SMETA y ha aprobado auditorías de cumplimiento social de Intertek, Bureau Veritas, Elevate y UL.',
    descripcion_en = 'Empacabados, founded in Puebla in 1986, makes knit and woven garments — especially sportswear — for US and Canadian brands. It started as a cut-and-sew workshop, a service it still provides, and today offers full-package production with partner companies: garment dyeing, screen printing, embroidery, elastic shirring, heat transfer and sublimation.

It has been evaluated and approved as a supplier for international brands such as Under Armour, Adidas, Puma and McDavid, and makes private labels for retailers such as Target, Macy''s, Kohl''s and Walmart through vertically integrated US and Canadian vendors. It has been assessed under C-TPAT, US Customs and Border Protection''s supply chain security programme, holds a SMETA ethical audit and has passed social compliance audits by Intertek, Bureau Veritas, Elevate and UL.',
    destacado_es = '40 años confeccionando para EUA y Canadá',
    destacado_en = '40 years making apparel for the US and Canada',
    situacion = 'exportando',
    productos = array['Corte y confección (cut & sew)', 'Ropa deportiva de punto y tejido plano', 'Marca propia (private label)', 'Paquete completo (full package)', 'Teñido de prendas', 'Serigrafía', 'Bordado', 'Elástico fruncido (shirring)', 'Transfer y sublimación']::text[],
    contacto_email = 'maru@empacabados.com',
    contacto_tel = '+52 222 232 7232',
    actualizado_en = now()
where slug = 'empacabados';
insert into empresa_mercados (empresa_id, pais) select id, 'estados-unidos' from empresas where slug = 'empacabados' on conflict do nothing;
insert into empresa_mercados (empresa_id, pais) select id, 'canada' from empresas where slug = 'empacabados' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'c-tpat' from empresas where slug = 'empacabados' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'smeta' from empresas where slug = 'empacabados' on conflict do nothing;
