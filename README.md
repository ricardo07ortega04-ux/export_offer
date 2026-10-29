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

## Agenda de reuniones

`sur-exporta.com/agenda` permite apartar una reunión de 1 hora por Google Meet (lunes, martes, miércoles y viernes de 10:00 a 17:00, hora del centro de México, con 24 horas de anticipación y hasta 4 semanas adelante). El horario se cambia al inicio de `api/agenda.js`.

Para los correos se puede usar una liga con la empresa ya escrita y la referencia del correo:
`https://www.sur-exporta.com/agenda?empresa=La%20Morena&ref=SE-2026-006`

Cómo funciona: `/api/agenda` consulta los espacios libres del calendario de Google, guarda la cita en la tabla `citas` de Supabase (que impide dos citas en el mismo horario) y crea el evento con enlace de Meet; Google envía la invitación a la persona. Además, con Resend se envían dos correos: la confirmación a quien agendó (en su idioma, con el enlace de Meet; sus respuestas llegan a `AGENDA_REPLY_TO`, por defecto ricardo_ortega@sur-exporta.com) y el aviso interno a `AGENDA_TO` (o `CONTACT_TO`). Para bloquear un día, basta con marcarlo como ocupado en el calendario; si se borra o cancela una cita en el calendario, su horario se libera.

Puesta en marcha (una sola vez, con la cuenta ricardo_ortega@sur-exporta.com):

1. En [Google Cloud Console](https://console.cloud.google.com/) crea un proyecto (p. ej. «Sur Exporta Agenda») y, en *APIs y servicios → Biblioteca*, habilita **Google Calendar API**.
2. En *Google Auth Platform* (pantalla de consentimiento) elige el público **Externo** y, en *Público*, pulsa **Publicar app** para dejarla **En producción** (en modo «Prueba» el permiso caduca a los 7 días). Al autorizar, Google avisa que la app no está verificada: *Configuración avanzada → Ir a la app*; solo lo ve quien autoriza, una vez. (El público «Interno» solo sirve si la cuenta pertenece a la organización de Google Workspace; con esta cuenta da el error `org_internal`.) Si la organización no deja crear proyectos, date el rol **Creador de proyectos** en *IAM* de la organización.
3. En *Clientes → Crear cliente* elige **App de escritorio** y copia el ID y el secreto.
4. En la carpeta del proyecto ejecuta `node agenda-autorizar.js <ID> <SECRETO>`, abre la liga, acepta y copia el valor que aparece.
5. En Vercel (*Settings → Environment Variables*) agrega `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REFRESH_TOKEN`. Opcional: `AGENDA_TO` para recibir un aviso por correo de cada cita (si falta, se usa `CONTACT_TO`).
6. En el editor SQL de Supabase ejecuta `supabase/25-citas.sql`.
7. Vuelve a desplegar el sitio.

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
