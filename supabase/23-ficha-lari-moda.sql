-- Sur Exporta — 23 · Fichas de socios enriquecidas (sitio oficial larimoda.mx y catálogo de mayoreo, oct. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- LARI MODA
update empresas set marca = 'LARI MODA',
    municipio = null,
    resumen_es = 'Blusas, vestidos, huipiles y rebozos bordados y tejidos a mano por mujeres artesanas de Oaxaca, con más de 20 años de trayectoria y catálogo de mayoreo para boutiques y distribuidores.',
    resumen_en = 'Blouses, dresses, huipiles and rebozos hand-embroidered and hand-woven by women artisans in Oaxaca, with more than 20 years of experience and a wholesale catalogue for boutiques and distributors.',
    descripcion_es = 'Lari Moda colabora desde hace más de 20 años con mujeres artesanas de comunidades de Oaxaca para crear prendas únicas y atemporales, bordadas y tejidas a mano, respetando sus saberes, sus tiempos y la identidad de cada técnica. Su propuesta de moda consciente busca que el trabajo permanezca en las comunidades y que el oficio pase a nuevas generaciones: produce a escala humana, prefiere siluetas atemporales y cortes amplios para distintos cuerpos, y usa algodón, bambú y mezclas de lino con bambú en modelos seleccionados.

Su catálogo de mayoreo reúne más de 50 modelos: blusas bordadas y de telar, vestidos y minivestidos, vestidos de niña, huipiles hechos en telar de cintura, rebozos de telar de cintura o de pedal, faldas, caminos de mesa personalizables, monederos y bolsas bordadas. Atiende a boutiques, tiendas de diseño y distribuidores con pedidos por volumen —confirma tallas, colores y disponibilidad en cada pedido, porque cada pieza es irrepetible— y vende al menudeo en su tienda en línea.',
    descripcion_en = 'Lari Moda has worked for more than 20 years with women artisans from communities in Oaxaca to create unique, timeless garments, hand-embroidered and hand-woven, respecting their knowledge, their pace and the identity of each technique. Its mindful-fashion approach aims to keep the work in the communities and pass the craft on to new generations: it produces at a human scale, favours timeless silhouettes and relaxed cuts for different bodies, and uses cotton, bamboo and linen-bamboo blends in selected styles.

Its wholesale catalogue includes more than 50 styles: embroidered and loom-woven blouses, dresses and mini dresses, girls'' dresses, backstrap-loom huipiles, backstrap and treadle-loom rebozos, skirts, customisable table runners, coin purses and embroidered bags. It serves boutiques, design stores and distributors with volume orders — confirming sizes, colours and availability for each order, since every piece is one of a kind — and sells individual pieces in its online store.',
    destacado_es = 'Más de 20 años con artesanas de Oaxaca',
    destacado_en = '20+ years with Oaxacan women artisans',
    situacion = 'sin_dato',
    productos = array['Blusas bordadas a mano', 'Blusas de telar', 'Vestidos y minivestidos bordados', 'Vestidos de niña', 'Huipiles en telar de cintura', 'Rebozos de telar', 'Faldas', 'Bolsas y monederos bordados', 'Caminos de mesa personalizables', 'Mayoreo para boutiques y distribuidores']::text[],
    contacto_email = 'oly@larimoda.mx',
    contacto_tel = '+52 951 360 5209',
    actualizado_en = now()
where slug = 'lari-moda';
