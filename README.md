# Sur Exporta

Directorio de oferta exportable de la Región Sur de México. Iniciativa de COMCE Región Sur.

Repositorio: https://github.com/ricardo07ortega04-ux/export_offer

## Qué es

Sitio estático bilingüe (español / inglés) sin framework ni librerías. Primera carga de datos: 10 empresas del sector de destilados de agave de Oaxaca.

**Los datos provienen del Catálogo de Oferta Exportable de Mezcal de SEDECO Oaxaca y están en proceso de validación con cada empresa.** Uso interno del equipo COMCE. Antes de publicarlo de cara al exterior hace falta autorización escrita de SEDECO y de cada titular de marca.

## Estructura

Todos los archivos viven en la raíz (diseño plano, porque la subida se hace por la interfaz web de GitHub, que pierde las carpetas).

```
index.html                  Portada + directorio
empresa-<slug>.html         10 fichas estáticas, generadas
data.js                     ÚNICA FUENTE DE VERDAD (contenido ES/EN + cadenas de interfaz)
app.js                      Búsqueda facetada, idioma, animaciones, formularios
styles.css                  Sistema visual (hereda los tokens de COMCE Sur)
globe.js                    Globo de rutas del sitio principal, adaptado a Oaxaca
build-fichas.js             Generador de fichas (dev)
logo-<slug>.webp            10 logotipos
foto-<slug>.webp            10 fotografías de producto
comce-sur-logo.webp         Logotipo institucional
vercel.json                 cleanUrls + cache de imágenes
```

## Cómo cambiar contenido

1. Edita `data.js` — es el único lugar donde vive el contenido.
2. Ejecuta `node build-fichas.js` para regenerar las 10 fichas.
3. Sube los archivos modificados.

Para **agregar una empresa**: añade su objeto al arreglo `empresas` de `data.js`, coloca `logo-<slug>.webp` y `foto-<slug>.webp`, y vuelve a ejecutar el generador. El directorio, los filtros, las cifras y los contadores se actualizan solos.

Para **agregar un estado o sector**: basta con que las empresas nuevas traigan otro valor en `estado` o `sector`; el filtro correspondiente aparece automáticamente en cuanto hay más de un valor. Los sectores nuevos se declaran en `SE.sectores` con su nombre en ambos idiomas.

## Notas técnicas

- **Sin dependencias.** No hay build step salvo el generador de fichas.
- **Bilingüe.** Las cadenas de interfaz viven en `SE.i18n`; el contenido editorial usa `{es, en}`. Las fichas se sirven en español en el HTML (funcionan sin JavaScript) y `app.js` las cambia a inglés. La preferencia se guarda en `localStorage`.
- **Estado en la URL.** Los filtros, el orden y la vista se reflejan en la barra de direcciones, así que cualquier búsqueda se puede compartir por correo.
- **Accesibilidad.** Enlace de salto, foco visible de 3 px, conteo de resultados en `role="status"`, resumen de errores enfocable con enlaces a cada campo, y las fichas de más (`+n`) son botones, no tooltips.
- **Movimiento.** Todo respeta `prefers-reduced-motion`. El globo se dibuja estático cuando está activo.
- **Peso.** Alrededor de 1 MB el sitio completo, imágenes incluidas.

## Pendiente

- Conectar el formulario a un servicio de correo (hoy valida pero no envía).
- Sustituir el logotipo de Mezcal Lyobaá: el del PDF mide 76 × 76 px y la ficha muestra un monograma como respaldo. Lo mismo conviene para Casa Parada y Convite (150 px).
- Validar con cada empresa los datos señalados en `directorio-exportable/REVISION.md`.
