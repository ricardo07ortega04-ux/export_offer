-- Sur Exporta — 08 · Fichas de socios enriquecidas (sitio oficial ginsolferino.com, sept. 2026)
-- GENERADO por supabase/build-socios.js. Ejecutar después de 06-socios.sql.
-- Actualiza textos, oferta y contacto interno; no cambia el estatus de publicación.

-- Solferino Native
update empresas set resumen_es = 'Primera destilería de Quintana Roo: gin artesanal con botánicos de la selva maya, medalla de oro como Mejor Gin de México en los World Gin Awards 2025.',
    resumen_en = 'Quintana Roo''s first distillery: craft gin with Mayan jungle botanicals, awarded gold as Best Mexican Gin at the World Gin Awards 2025.',
    descripcion_es = 'Solferino Native es la primera destilería de Quintana Roo. Nació en 2020 en Solferino, un poblado de la selva maya camino a Holbox, y elabora gin y licores artesanales en alambique de cobre, en microlotes de máximo 120 botellas. Sus botánicos —zacate limón, hierbabuena, hoja santa, pimienta negra, romero y piel de toronja— se recolectan frescos con los vecinos del pueblo y se suman al enebro, el regaliz y la canela, sin químicos ni conservadores.

Su Dry Gin ganó la medalla de oro como Mejor Gin de México en los World Gin Awards 2025, en Reino Unido, donde quedó entre los seis mejores del mundo en la categoría Contemporary Style, y volvió a ser reconocido en la edición 2026. Suma oro en Cata d''Or World Spirits Awards (Chile, 2021 y 2025), plata en Las Vegas Global Spirit Awards 2025 y Gran Oro en el Concurso de Espirituosos de Guanajuato, y es miembro de The Gin Guild de Londres. Se vende en Quintana Roo, Ciudad de México, Estado de México, Querétaro y Baja California, en las tiendas La Europea de todo el país y en Amazon y Mercado Libre.',
    descripcion_en = 'Solferino Native is Quintana Roo''s first distillery. It was founded in 2020 in Solferino, a village in the Mayan jungle on the way to Holbox, and makes craft gin and liqueurs in copper stills, in micro-batches of no more than 120 bottles. Its botanicals — lemongrass, spearmint, hoja santa, black pepper, rosemary and grapefruit peel — are gathered fresh with local villagers and added to juniper, liquorice and cinnamon, with no chemicals or preservatives.

Its Dry Gin won gold as Best Mexican Gin at the World Gin Awards 2025 in the United Kingdom, where it ranked among the world''s top six in the Contemporary Style category, and was recognised again in the 2026 edition. It also holds gold at the Cata d''Or World Spirits Awards (Chile, 2021 and 2025), silver at the Las Vegas Global Spirit Awards 2025 and Grand Gold at the Guanajuato Spirits Competition, and is a member of The Gin Guild in London. It is sold in Quintana Roo, Mexico City, the State of Mexico, Querétaro and Baja California, in La Europea stores nationwide, and on Amazon and Mercado Libre.',
    destacado_es = 'Oro · World Gin Awards 2025',
    destacado_en = 'Gold · World Gin Awards 2025',
    situacion = 'sin_dato',
    productos = array['Solferino Native Dry Gin · 40% Alc. · 750 ml', 'Solferino Native Overproof Edition · gin 55% Alc.', 'Solferino Native Flair Edition · gin para bartenders de flair', 'Solferino Native Absenta · 55% Alc.', 'Balam · licor cítrico de zacate limón, naranja y toronja', 'Pancheel · licor de yaka · 30% Alc.']::text[],
    abv = '30–55%',
    presentaciones_ml = array[750]::integer[],
    contacto_email = 'info@solferinogin.com',
    contacto_tel = null,
    actualizado_en = now()
where slug = 'solferino-native';
