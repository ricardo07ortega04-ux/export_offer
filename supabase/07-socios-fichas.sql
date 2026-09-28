-- Sur Exporta — 07 · Fichas de socios enriquecidas (catálogo de la empresa, mayo 2024)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Toke Innova
update empresas set resumen_es = 'Salsa macha, chimichurri, especias y productos artesanales de Puebla, 100% naturales, con venta en 12 estados de México y cuatro de Estados Unidos.',
    resumen_en = 'Artisanal salsa macha, chimichurri, spices and pantry products from Puebla — 100% natural, sold in 12 Mexican states and four US states.',
    descripcion_es = 'Toke Innova, fundada en Puebla en 2017, elabora productos artesanales mexicanos 100% naturales bajo sus marcas La Artesanal Herencia Orza® y ¡Ay Buey!®. Empezó con su Salsa Macha y hoy su catálogo reúne 24 presentaciones: salsa macha en cuatro variedades, chimichurri, chiles y especias, miel, perlas de tapioca, crema de cacahuate y galletas.

Vende en 12 estados de México y en Estados Unidos, donde tiene presencia en California, Kansas, Oklahoma y Texas; sus etiquetas ya vienen en inglés y francés. Cuenta con registro ante COFEPRIS y la FDA. Sus productos tienen una vida de anaquel de 6 meses a 3 años y se surten en cajas de 8 a 52 piezas, según la presentación.',
    descripcion_en = 'Toke Innova, founded in Puebla in 2017, makes 100% natural artisanal Mexican products under its La Artesanal Herencia Orza® and ¡Ay Buey!® brands. It started with its Salsa Macha and its catalogue now includes 24 products: salsa macha in four varieties, chimichurri, chillies and spices, honey, tapioca pearls, peanut butter and cookies.

It sells in 12 Mexican states and in the United States, with presence in California, Kansas, Oklahoma and Texas, and its labels are already in English and French. It is registered with COFEPRIS and the FDA. Shelf life ranges from 6 months to 3 years, and products ship in cases of 8 to 52 units depending on the item.',
    destacado_es = 'Vende en 4 estados de EUA',
    destacado_en = 'Sold in 4 US states',
    situacion = 'exportando',
    productos = array['Salsa Macha 4 chiles y 6 semillas · 200 g', 'Salsa Macha 3 chiles y 3 semillas · 80 g', 'Salsa Macha de cacahuate con chile morita · 200 g y 80 g', 'Salsa Macha de miel de abeja y arándanos · 200 g y 80 g', 'Salsa No Tan Macha · 200 g y 80 g', 'Chimichurri · 200 g y 80 g', 'Chimichurri picoso · 80 g', 'Chile quebrado · 150 g', 'Pimienta de cayena · 60 g', 'Paprika · 60 g', 'Ajonjolí negro · 75 g', 'Miel pura de abeja · 100 g', 'Perlas de miel con propóleo · 80 g', 'Perlas de tapioca · 250 g y 500 g', 'Crema de cacahuate · 340 g', 'Galletas artesanales (nuez con amaranto, arándanos, avena, avellana) · 100 g']::text[],
    contacto_email = 'aortiz.ventas@tokeinnova.com',
    contacto_tel = '+52 222 801 7636',
    actualizado_en = now()
where slug = 'toke-innova';
insert into empresa_mercados (empresa_id, pais) select id, 'estados-unidos' from empresas where slug = 'toke-innova' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'fda' from empresas where slug = 'toke-innova' on conflict do nothing;
insert into empresa_certificaciones (empresa_id, certificacion) select id, 'cofepris' from empresas where slug = 'toke-innova' on conflict do nothing;
