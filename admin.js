/* Panel de Vinculación — Sur Exporta
 * Acceso por enlace de correo (sin contraseñas) y edición de empresas.
 * Toda la seguridad real vive en las políticas de Supabase: este archivo
 * solo ordena la interfaz.
 */
(function () {
  'use strict';

  var sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var catalogos = { estados: [], sectores: [], paises: [], certificaciones: [] };
  var empresas = [];
  var actual = null;          // empresa en edición
  var quien = null;           // fila de personal
  var solicitudes = [];
  var solActual = null;       // solicitud abierta en el detalle
  var origenSolicitud = null; // solicitud que se está convirtiendo en empresa

  var ETIQUETAS = {
    borrador: 'Borrador', en_revision: 'En revisión',
    publicado: 'Publicado', suspendido: 'Suspendido'
  };

  /* ---------- utilidades ---------- */

  function vista(nombre) {
    $$('[data-vista]').forEach(function (s) { s.hidden = s.getAttribute('data-vista') !== nombre; });
    // Pestañas: visibles con sesión; la del detalle de solicitud cuenta como «Solicitudes»
    var tab = { lista: 'lista', editor: 'lista', solicitudes: 'solicitudes', solicitud: 'solicitudes' }[nombre];
    $('[data-tabs]').hidden = !tab;
    $$('[data-tab]').forEach(function (b) {
      if (b.getAttribute('data-tab') === tab) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    window.scrollTo(0, 0);
  }

  function aviso(texto, esError) {
    var t = $('[data-toast]');
    t.textContent = texto;
    t.classList.toggle('error', !!esError);
    t.hidden = false;
    clearTimeout(aviso._t);
    aviso._t = setTimeout(function () { t.hidden = true; }, 4000);
  }

  function error(caja, mensajes) {
    var box = $(caja);
    box.querySelector('ul').innerHTML = [].concat(mensajes)
      .map(function (m) { return '<li>' + String(m).replace(/</g, '&lt;') + '</li>'; }).join('');
    box.hidden = false;
    box.focus();
  }

  function num(v) { return v === '' || v === null || v === undefined ? null : Number(v); }
  function txt(v) { return v === null || v === undefined ? '' : String(v); }
  function fecha(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }

  /* ---------- acceso ---------- */

  $('[data-acceso-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    $('[data-acceso-error]').hidden = true;
    $('[data-acceso-ok]').hidden = true;

    var correo = $('#a-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      return error('[data-acceso-error]', 'Escribe un correo electrónico válido.');
    }

    var boton = e.target.querySelector('button[type="submit"]');
    boton.setAttribute('aria-busy', 'true');
    boton.textContent = 'Enviando…';

    var res = await sb.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: window.location.origin + '/admin.html', shouldCreateUser: false }
    });

    boton.removeAttribute('aria-busy');
    boton.textContent = 'Enviarme el enlace';

    if (res.error) {
      error('[data-acceso-error]', res.error.message === 'Signups not allowed for otp'
        ? 'Ese correo no está dado de alta como personal de COMCE.'
        : res.error.message);
      return;
    }
    var ok = $('[data-acceso-ok]');
    ok.hidden = false;
    ok.focus();
  });

  async function salir() {
    await sb.auth.signOut();
    window.location.replace('admin.html');
  }
  $('[data-salir]').addEventListener('click', salir);
  $('[data-salir-2]').addEventListener('click', salir);

  /* ---------- catálogos ---------- */

  async function cargarCatalogos() {
    var r = await Promise.all([
      sb.from('estados').select('clave,nombre').order('nombre'),
      sb.from('sectores').select('*').eq('activo', true).order('nombre_es'),
      sb.from('paises').select('clave,nombre_es').order('nombre_es'),
      sb.from('certificaciones').select('clave,nombre_es').order('nombre_es')
    ]);
    catalogos.estados = r[0].data || [];
    catalogos.sectores = r[1].data || [];
    catalogos.paises = r[2].data || [];
    catalogos.certificaciones = r[3].data || [];

    $('[data-opciones="estados"]').innerHTML = catalogos.estados
      .map(function (x) { return '<option value="' + x.clave + '">' + x.nombre + '</option>'; }).join('');
    // Sectores agrupados por tipo de oferta
    $('[data-opciones="sectores"]').innerHTML = [['producto', 'Productos'], ['servicio', 'Servicios']]
      .map(function (g) {
        var ops = catalogos.sectores.filter(function (x) { return (x.tipo || 'producto') === g[0]; });
        return ops.length ? '<optgroup label="' + g[1] + '">' + ops.map(function (x) {
          return '<option value="' + x.clave + '">' + x.nombre_es + '</option>';
        }).join('') + '</optgroup>' : '';
      }).join('');

    function casillas(cont, lista, nombre) {
      $(cont).innerHTML = lista.map(function (x) {
        return '<label class="check"><input type="checkbox" name="' + nombre + '" value="' + x.clave + '">' +
               '<span>' + (x.nombre_es || x.nombre) + '</span></label>';
      }).join('');
    }
    casillas('[data-mercados]', catalogos.paises, 'mercado');
    casillas('[data-certificaciones]', catalogos.certificaciones, 'certificacion');
  }

  /* ---------- lista ---------- */

  async function cargarEmpresas() {
    var r = await sb.from('empresas')
      .select('id,slug,marca,razon_social,municipio,estado,capacidad_mensual_l,estatus,actualizado_en')
      .order('marca');
    if (r.error) { aviso('No se pudieron cargar las empresas: ' + r.error.message, true); return; }
    empresas = r.data || [];

    var conMercados = await sb.from('empresa_mercados').select('empresa_id');
    var cuenta = {};
    (conMercados.data || []).forEach(function (m) { cuenta[m.empresa_id] = (cuenta[m.empresa_id] || 0) + 1; });
    empresas.forEach(function (e) { e._mercados = cuenta[e.id] || 0; });

    pintarLista();
  }

  function pintarLista() {
    var q = $('[data-buscar]').value.trim().toLowerCase();
    var est = $('[data-filtro-estatus]').value;

    var filtradas = empresas.filter(function (e) {
      if (est && e.estatus !== est) return false;
      if (!q) return true;
      return [e.marca, e.razon_social, e.municipio].join(' ').toLowerCase().indexOf(q) > -1;
    });

    var publicadas = empresas.filter(function (e) { return e.estatus === 'publicado'; }).length;
    $('[data-conteo]').textContent = empresas.length + ' empresas en total · ' + publicadas + ' publicadas';

    $('[data-filas]').innerHTML = filtradas.length ? filtradas.map(function (e) {
      return '<tr>' +
        '<td><span class="marca">' + txt(e.marca) + '</span><span class="sub">' + txt(e.razon_social) + '</span></td>' +
        '<td>' + txt(e.municipio) + '</td>' +
        '<td class="num">' + (e.capacidad_mensual_l ? e.capacidad_mensual_l.toLocaleString('es-MX') + ' L' : '—') + '</td>' +
        '<td class="num">' + e._mercados + '</td>' +
        '<td><span class="estado-pill estado-' + e.estatus + '">' + ETIQUETAS[e.estatus] + '</span></td>' +
        '<td class="num"><button class="btn btn-outline btn-sm" type="button" data-editar="' + e.id + '">Editar</button></td>' +
        '</tr>';
    }).join('') : '<tr><td colspan="6" class="admin-vacio">Ninguna empresa coincide con la búsqueda.</td></tr>';
  }

  $('[data-buscar]').addEventListener('input', pintarLista);
  $('[data-filtro-estatus]').addEventListener('change', pintarLista);

  $('[data-filas]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-editar]');
    if (b) abrirEditor(b.getAttribute('data-editar'));
  });

  $('[data-nueva]').addEventListener('click', function () { abrirEditor(null); });
  $$('[data-volver]').forEach(function (b) {
    b.addEventListener('click', function () { vista('lista'); cargarEmpresas(); });
  });

  /* ---------- editor ---------- */

  // Las empresas de servicios no llevan litros, graduación, presentaciones, padrón ni maquila
  function esServicio() {
    var clave = $('#e-sector').value;
    var s = catalogos.sectores.filter(function (x) { return x.clave === clave; })[0];
    return !!s && s.tipo === 'servicio';
  }
  function ajustarTipo() {
    var servicio = esServicio();
    $$('[data-solo-producto]').forEach(function (el) { el.hidden = servicio; });
    $$('[data-solo-servicio]').forEach(function (el) { el.hidden = !servicio; });
    $('[data-titulo-capacidad]').textContent = servicio ? 'Trayectoria' : 'Capacidad y exportación';
    $('[data-etiqueta-desde]').textContent = servicio ? 'Opera desde (año)' : 'Exporta desde (año)';
    $('[data-etiqueta-productos]').textContent = servicio ? 'Servicios' : 'Productos';
    if (servicio) $('[data-aritmetica]').hidden = true;
  }
  $('#e-sector').addEventListener('change', ajustarTipo);

  async function abrirEditor(id) {
    $('[data-editor-error]').hidden = true;
    $('[data-guardado]').hidden = true;
    $('[data-editor-origen]').hidden = true;
    origenSolicitud = null;
    var f = $('[data-editor-form]');
    f.reset();
    $$('input[name="mercado"], input[name="certificacion"]').forEach(function (c) { c.checked = false; });

    if (!id) {
      actual = null;
      $('[data-editor-titulo]').textContent = 'Nueva empresa';
      $('[data-actualizado]').textContent = '';
      $('#e-estatus').value = 'borrador';
      $('#e-situacion').value = 'sin_dato';
      $('#e-padron').value = 'sin_dato';
      ajustarTipo();
      vista('editor');
      $('#e-marca').focus();
      return;
    }

    var r = await sb.from('empresas').select('*').eq('id', id).single();
    if (r.error) { aviso('No se pudo abrir: ' + r.error.message, true); return; }
    actual = r.data;

    var rel = await Promise.all([
      sb.from('empresa_mercados').select('pais').eq('empresa_id', id),
      sb.from('empresa_certificaciones').select('certificacion').eq('empresa_id', id)
    ]);

    $('[data-editor-titulo]').textContent = actual.marca;
    $('[data-actualizado]').textContent = 'Última edición: ' + fecha(actual.actualizado_en);

    ['marca', 'slug', 'razon_social', 'estado', 'municipio', 'sector', 'abv', 'domicilio_fiscal',
     'resumen_es', 'resumen_en', 'descripcion_es', 'descripcion_en', 'destacado_es', 'destacado_en',
     'capacidad_mensual_l', 'porcentaje_exportado', 'capacidad_exportada_l', 'exporta_desde',
     'situacion', 'padron', 'estatus', 'fuente', 'logo_url', 'foto_url',
     'contacto_email', 'contacto_tel', 'sitio_web'].forEach(function (campo) {
      var el = f.elements[campo];
      if (el) el.value = txt(actual[campo]);
    });
    f.elements.maquila.checked = !!actual.maquila;
    f.elements.productos.value = (actual.productos || []).join('\n');
    f.elements.presentaciones_ml.value = (actual.presentaciones_ml || []).join(', ');
    f.elements.notas_revision.value = (actual.notas_revision || []).join('\n');

    (rel[0].data || []).forEach(function (m) {
      var c = $('input[name="mercado"][value="' + m.pais + '"]');
      if (c) c.checked = true;
    });
    (rel[1].data || []).forEach(function (m) {
      var c = $('input[name="certificacion"][value="' + m.certificacion + '"]');
      if (c) c.checked = true;
    });

    ajustarTipo();
    if (!esServicio()) revisarAritmetica();
    vista('editor');
  }

  // Aviso cuando capacidad × porcentaje no cuadra con lo exportado
  function revisarAritmetica() {
    var f = $('[data-editor-form]');
    var cap = num(f.elements.capacidad_mensual_l.value);
    var pct = num(f.elements.porcentaje_exportado.value);
    var exp = num(f.elements.capacidad_exportada_l.value);
    var caja = $('[data-aritmetica]');
    if (cap && pct !== null && exp !== null) {
      var esperado = Math.round(cap * pct / 100);
      if (Math.abs(esperado - exp) > 1) {
        caja.textContent = 'Revisa: ' + cap.toLocaleString('es-MX') + ' L × ' + pct + '% = ' +
          esperado.toLocaleString('es-MX') + ' L, pero la capacidad exportada dice ' + exp.toLocaleString('es-MX') + ' L.';
        caja.hidden = false;
        return;
      }
    }
    caja.hidden = true;
  }
  ['capacidad_mensual_l', 'porcentaje_exportado', 'capacidad_exportada_l'].forEach(function (n) {
    $('[data-editor-form]').elements[n].addEventListener('input', revisarAritmetica);
  });

  $('[data-editor-form]').addEventListener('submit', async function (e) {
    e.preventDefault();
    $('[data-editor-error]').hidden = true;
    var f = e.target;

    var datos = {
      marca: f.elements.marca.value.trim(),
      slug: f.elements.slug.value.trim(),
      razon_social: f.elements.razon_social.value.trim() || null,
      estado: f.elements.estado.value,
      municipio: f.elements.municipio.value.trim() || null,
      domicilio_fiscal: f.elements.domicilio_fiscal.value.trim() || null,
      sector: f.elements.sector.value,
      resumen_es: f.elements.resumen_es.value.trim() || null,
      resumen_en: f.elements.resumen_en.value.trim() || null,
      descripcion_es: f.elements.descripcion_es.value.trim() || null,
      descripcion_en: f.elements.descripcion_en.value.trim() || null,
      destacado_es: f.elements.destacado_es.value.trim() || null,
      destacado_en: f.elements.destacado_en.value.trim() || null,
      capacidad_mensual_l: num(f.elements.capacidad_mensual_l.value),
      porcentaje_exportado: num(f.elements.porcentaje_exportado.value),
      capacidad_exportada_l: num(f.elements.capacidad_exportada_l.value),
      exporta_desde: num(f.elements.exporta_desde.value),
      situacion: f.elements.situacion.value,
      padron: f.elements.padron.value,
      maquila: f.elements.maquila.checked,
      abv: f.elements.abv.value.trim() || null,
      productos: f.elements.productos.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
      presentaciones_ml: f.elements.presentaciones_ml.value.split(',').map(function (s) { return parseInt(s, 10); }).filter(function (n) { return !isNaN(n); }),
      notas_revision: f.elements.notas_revision.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
      logo_url: f.elements.logo_url.value.trim() || null,
      foto_url: f.elements.foto_url.value.trim() || null,
      contacto_email: f.elements.contacto_email.value.trim() || null,
      contacto_tel: f.elements.contacto_tel.value.trim() || null,
      sitio_web: f.elements.sitio_web.value.trim() || null,
      estatus: f.elements.estatus.value,
      fuente: f.elements.fuente.value.trim() || null
    };

    // Si la empresa pasó de un sector de productos a uno de servicios, los campos
    // ocultos no deben arrastrar datos de mezcal
    if (esServicio()) {
      datos.capacidad_mensual_l = null;
      datos.porcentaje_exportado = null;
      datos.capacidad_exportada_l = null;
      datos.abv = null;
      datos.presentaciones_ml = [];
      datos.maquila = null;
      datos.situacion = 'sin_dato';
      datos.padron = 'sin_dato';
    }

    var fallas = [];
    if (!datos.marca) fallas.push('La marca es obligatoria.');
    if (!/^[a-z0-9-]+$/.test(datos.slug)) fallas.push('El identificador solo admite minúsculas, números y guiones.');
    if (!datos.estado) fallas.push('Elige un estado.');
    if (!datos.sector) fallas.push('Elige un sector.');
    if (datos.porcentaje_exportado !== null && (datos.porcentaje_exportado < 0 || datos.porcentaje_exportado > 100)) {
      fallas.push('El porcentaje exportado debe estar entre 0 y 100.');
    }
    if (fallas.length) return error('[data-editor-error]', fallas);

    var boton = f.querySelector('button[type="submit"]');
    boton.setAttribute('aria-busy', 'true');
    boton.textContent = 'Guardando…';

    var res;
    if (actual) res = await sb.from('empresas').update(datos).eq('id', actual.id).select().single();
    else res = await sb.from('empresas').insert(datos).select().single();

    if (res.error) {
      boton.removeAttribute('aria-busy');
      boton.textContent = 'Guardar cambios';
      return error('[data-editor-error]', res.error.message.indexOf('duplicate key') > -1
        ? 'Ya existe una empresa con ese identificador.' : res.error.message);
    }

    var id = res.data.id;
    actual = res.data;

    // Relaciones: se reemplazan por completo
    var mercados = $$('input[name="mercado"]:checked').map(function (c) { return { empresa_id: id, pais: c.value }; });
    var certs = $$('input[name="certificacion"]:checked').map(function (c) { return { empresa_id: id, certificacion: c.value }; });

    await sb.from('empresa_mercados').delete().eq('empresa_id', id);
    if (mercados.length) await sb.from('empresa_mercados').insert(mercados);
    await sb.from('empresa_certificaciones').delete().eq('empresa_id', id);
    if (certs.length) await sb.from('empresa_certificaciones').insert(certs);

    // Si el borrador nació de una solicitud, esta queda ligada a la empresa
    if (origenSolicitud) {
      await sb.from('solicitudes').update({ estatus: 'convertida', empresa_id: id }).eq('id', origenSolicitud.id);
      origenSolicitud = null;
      $('[data-editor-origen]').hidden = true;
      contarSolicitudes();
    }

    boton.removeAttribute('aria-busy');
    boton.textContent = 'Guardar cambios';
    $('[data-guardado]').hidden = false;
    $('[data-editor-titulo]').textContent = actual.marca;
    $('[data-actualizado]').textContent = 'Última edición: ' + fecha(actual.actualizado_en);
    aviso('Cambios guardados. Recuerda publicar para que se vean en el sitio.');
  });

  /* ---------- solicitudes de registro ---------- */

  var SOL_ETIQUETAS = {
    nueva: 'Nueva', en_proceso: 'En proceso', convertida: 'Convertida', descartada: 'Descartada'
  };
  var SOL_PILL = { nueva: 'en_revision', en_proceso: 'borrador', convertida: 'publicado', descartada: 'suspendido' };
  var SITUACION = {
    exportando: 'Ya exporta / atiende clientes en el extranjero',
    buscando_comprador: 'Busca compradores o clientes en el extranjero',
    sin_exportar: 'Se prepara para exportar / atiende a exportadores'
  };
  var PADRON = { vigente: 'Sí, vigente', tramite: 'En trámite', no: 'No', no_se: 'No sabe' };
  var SOCIO = { si: 'Sí', tramite: 'En trámite', no: 'No' };

  function esc(v) {
    return txt(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return txt(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  function slugDe(s) { return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }
  function nombreSector(clave) {
    var s = catalogos.sectores.filter(function (x) { return x.clave === clave; })[0];
    return s ? s.nombre_es : clave;
  }

  async function contarSolicitudes() {
    var r = await sb.from('solicitudes').select('id', { count: 'exact', head: true }).eq('estatus', 'nueva');
    var badge = $('[data-badge]');
    // Si la tabla aún no existe (falta correr 19-solicitudes.sql) la pestaña se oculta
    $('[data-tab="solicitudes"]').hidden = !!r.error;
    badge.hidden = r.error || !r.count;
    badge.textContent = r.count || '';
  }

  async function cargarSolicitudes() {
    var r = await sb.from('solicitudes')
      .select('id,creada_en,estatus,marca,estado,municipio,tipo,sector,sector_otro,contacto_nombre,contacto_email,empresa_id')
      .order('creada_en', { ascending: false });
    if (r.error) { aviso('No se pudieron cargar las solicitudes: ' + r.error.message, true); return; }
    solicitudes = r.data || [];
    pintarSolicitudes();
  }

  function pintarSolicitudes() {
    var filtro = $('[data-sol-filtro]').value;
    var lista = solicitudes.filter(function (s) {
      if (filtro === 'abiertas') return s.estatus === 'nueva' || s.estatus === 'en_proceso';
      return !filtro || s.estatus === filtro;
    });
    var nuevas = solicitudes.filter(function (s) { return s.estatus === 'nueva'; }).length;
    $('[data-sol-conteo]').textContent = solicitudes.length + (solicitudes.length === 1 ? ' solicitud' : ' solicitudes') +
      ' en total · ' + nuevas + (nuevas === 1 ? ' nueva' : ' nuevas');

    $('[data-sol-filas]').innerHTML = lista.length ? lista.map(function (s) {
      return '<tr>' +
        '<td>' + esc(fecha(s.creada_en)) + '</td>' +
        '<td><span class="marca">' + esc(s.marca) + '</span><span class="sub">' + esc([s.municipio, s.estado].filter(Boolean).join(', ')) + '</span></td>' +
        '<td>' + esc(s.contacto_nombre) + '<span class="sub">' + esc(s.contacto_email) + '</span></td>' +
        '<td>' + (s.tipo === 'servicio' ? 'Servicios' : 'Productos') + '<span class="sub">' + esc(s.sector_otro || nombreSector(s.sector)) + '</span></td>' +
        '<td><span class="estado-pill estado-' + SOL_PILL[s.estatus] + '">' + SOL_ETIQUETAS[s.estatus] + '</span></td>' +
        '<td class="num"><button class="btn btn-outline btn-sm" type="button" data-sol-abrir="' + s.id + '">Ver</button></td>' +
        '</tr>';
    }).join('') : '<tr><td colspan="6" class="admin-vacio">No hay solicitudes con este filtro.</td></tr>';
  }

  $('[data-sol-filtro]').addEventListener('change', pintarSolicitudes);
  $('[data-sol-filas]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-sol-abrir]');
    if (b) abrirSolicitud(b.getAttribute('data-sol-abrir'));
  });

  $$('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () { irA(b.getAttribute('data-tab')); });
  });
  $('[data-sol-volver]').addEventListener('click', function () { irA('solicitudes'); });

  async function irA(tab) {
    if (tab === 'solicitudes') {
      history.replaceState(null, '', '#solicitudes');
      vista('solicitudes');
      await cargarSolicitudes();
    } else {
      history.replaceState(null, '', location.pathname);
      vista('lista');
      cargarEmpresas();
    }
  }

  // Bloque de datos: [etiqueta, valor] se omite si el valor está vacío
  function bloque(titulo, filas, extra) {
    var dl = filas.filter(function (f) { return f[1] !== null && f[1] !== undefined && f[1] !== '' && !(Array.isArray(f[1]) && !f[1].length); })
      .map(function (f) {
        var v = Array.isArray(f[1]) ? f[1].map(esc).join('<br>') : esc(f[1]).replace(/\n/g, '<br>');
        return '<div><dt>' + esc(f[0]) + '</dt><dd>' + v + '</dd></div>';
      }).join('');
    return '<div class="panel"><h2>' + titulo + '</h2>' + (dl ? '<dl class="admin-dl">' + dl + '</dl>' : (extra ? '' : '<p class="field-help">Sin datos.</p>')) + (extra || '') + '</div>';
  }

  async function abrirSolicitud(id) {
    var r = await sb.from('solicitudes').select('*').eq('id', id).single();
    if (r.error) { aviso('No se pudo abrir la solicitud: ' + r.error.message, true); return; }
    var s = solActual = r.data;
    var servicio = s.tipo === 'servicio';

    $('[data-sol-titulo]').textContent = s.marca;
    $('[data-sol-sub]').textContent = 'Recibida el ' + fecha(s.creada_en) + ' · ' + (servicio ? 'Servicios' : 'Productos');
    $('[data-sol-estatus]').value = s.estatus;
    $('[data-sol-ver-empresa]').hidden = !s.empresa_id;
    $('[data-sol-convertir]').hidden = !!s.empresa_id;

    var avisoSol = $('[data-sol-aviso]');
    avisoSol.hidden = !s.empresa_id;
    avisoSol.textContent = s.empresa_id ? 'Esta solicitud ya se convirtió en una empresa del directorio.' : '';

    // Imágenes: enlaces firmados que vencen en una hora
    var rutas = [s.logo_path].concat(s.fotos_paths || []).filter(Boolean);
    var firmas = await Promise.all(rutas.map(function (ruta) {
      var nombre = ruta.split('/').pop();
      var archivo = slugDe(s.marca) + '-' + nombre;
      return Promise.all([
        sb.storage.from('solicitudes').createSignedUrl(ruta, 3600),
        sb.storage.from('solicitudes').createSignedUrl(ruta, 3600, { download: archivo })
      ]).then(function (x) {
        return { ruta: ruta, ver: x[0].data && x[0].data.signedUrl, bajar: x[1].data && x[1].data.signedUrl, nombre: archivo };
      });
    }));
    var galeria = firmas.length ? '<ul class="admin-galeria">' + firmas.map(function (f) {
      return '<li><img src="' + esc(f.ver) + '" alt="' + esc(f.nombre) + '" class="' + (f.ruta === s.logo_path ? 'es-logo' : '') + '">' +
        '<a class="btn btn-outline btn-sm" href="' + esc(f.bajar) + '">Descargar ' + (f.ruta === s.logo_path ? 'logotipo' : 'foto') + '</a></li>';
    }).join('') + '</ul>' +
      '<p class="field-help">' + (s.imagenes_propias ? 'La empresa declaró que las imágenes son suyas o tiene derecho a usarlas.' : 'La empresa no confirmó los derechos de las imágenes.') + '</p>'
      : '';

    var desdeEtq = servicio ? 'Opera desde' : 'Exporta desde';
    var capacidad = s.capacidad_mensual !== null ? Number(s.capacidad_mensual).toLocaleString('es-MX') + ' ' + txt(s.capacidad_unidad) + ' al mes' : '';

    $('[data-sol-detalle]').innerHTML = [
      bloque('Empresa', [
        ['Marca', s.marca], ['Razón social', s.razon_social], ['RFC', s.rfc],
        ['Ubicación', [s.municipio, s.estado].filter(Boolean).join(', ')],
        ['Sitio web', s.sitio_web], ['Socia de COMCE Sur', SOCIO[s.socio_comce]]
      ]),
      bloque('Oferta', [
        ['Sector', s.sector_otro ? s.sector_otro + ' (sector nuevo)' : nombreSector(s.sector)],
        [servicio ? 'Servicios' : 'Productos', s.productos],
        ['Capacidad mensual', capacidad], ['Presentaciones', s.presentaciones],
        ['Graduación', s.abv], ['Maquila', s.maquila === null ? '' : (s.maquila ? 'Sí' : 'No')]
      ]),
      bloque('Exportación', [
        ['Situación', SITUACION[s.situacion]], [desdeEtq, s.exporta_desde],
        ['Porcentaje exportado', s.porcentaje_exportado !== null ? s.porcentaje_exportado + ' %' : ''],
        ['Padrón de exportadores', PADRON[s.padron]],
        ['Vende hoy en', s.mercados], ['Otros países', s.mercados_otros],
        ['Mercados de interés', s.mercados_interes]
      ]),
      bloque('Certificaciones', [
        ['Declaradas', s.certificaciones], ['Otras', s.certificaciones_otras]
      ]),
      bloque('Textos', [
        ['Resumen', s.resumen_es], ['Descripción', s.descripcion_es], ['Distintivo', s.destacado_es],
        ['Resumen (inglés)', s.resumen_en], ['Descripción (inglés)', s.descripcion_en], ['Distintivo (inglés)', s.destacado_en]
      ]),
      bloque('Imágenes', [], galeria || '<p class="field-help">No envió imágenes.</p>'),
      bloque('Contacto <span class="admin-privado">no se publica</span>', [
        ['Nombre', s.contacto_nombre], ['Cargo', s.contacto_cargo],
        ['Correo', s.contacto_email], ['Teléfono', s.contacto_tel],
        ['Correo de ventas', s.comercial_email], ['Teléfono de ventas', s.comercial_tel]
      ]),
      bloque('Notas de la empresa', [['Comentarios', s.notas]])
    ].join('');

    vista('solicitud');
  }

  $('[data-sol-estatus]').addEventListener('change', async function () {
    if (!solActual) return;
    var nuevo = this.value;
    var r = await sb.from('solicitudes').update({ estatus: nuevo }).eq('id', solActual.id);
    if (r.error) { aviso('No se pudo cambiar el estatus: ' + r.error.message, true); this.value = solActual.estatus; return; }
    solActual.estatus = nuevo;
    aviso('Estatus actualizado: ' + SOL_ETIQUETAS[nuevo]);
    contarSolicitudes();
  });

  $('[data-sol-ver-empresa]').addEventListener('click', function () {
    if (solActual && solActual.empresa_id) abrirEditor(solActual.empresa_id);
  });

  // Prellena el editor con la solicitud. No guarda nada hasta que se da «Guardar cambios».
  $('[data-sol-convertir]').addEventListener('click', async function () {
    var s = solActual;
    if (!s) return;
    await abrirEditor(null);
    var f = $('[data-editor-form]');
    var notas = [];
    var poner = function (campo, v) { if (f.elements[campo] && v !== null && v !== undefined) f.elements[campo].value = v; };

    poner('marca', s.marca);
    poner('slug', slugDe(s.marca));
    poner('razon_social', s.razon_social);
    poner('municipio', s.municipio);
    poner('sitio_web', s.sitio_web);

    var estado = catalogos.estados.filter(function (e) { return norm(e.nombre) === norm(s.estado); })[0];
    if (estado) poner('estado', estado.clave);
    else notas.push('Estado «' + s.estado + '» no está en el catálogo: agrégalo en la tabla estados y elígelo aquí.');

    if (s.sector && catalogos.sectores.some(function (x) { return x.clave === s.sector; })) poner('sector', s.sector);
    else notas.push('Sector propuesto por la empresa: «' + (s.sector_otro || s.sector) + '». Elige uno existente o crea el sector.');
    ajustarTipo();

    ['resumen_es', 'resumen_en', 'descripcion_es', 'descripcion_en', 'destacado_es', 'destacado_en', 'abv', 'exporta_desde', 'porcentaje_exportado']
      .forEach(function (c) { poner(c, s[c]); });
    f.elements.productos.value = (s.productos || []).join('\n');
    f.elements.situacion.value = { exportando: 'exportando', buscando_comprador: 'buscando_comprador' }[s.situacion] || 'sin_dato';
    f.elements.padron.value = { vigente: 'vigente', tramite: 'pendiente_actualizar' }[s.padron] || 'sin_dato';
    f.elements.maquila.checked = s.maquila === true;

    if (s.capacidad_mensual !== null) {
      if (s.capacidad_unidad === 'litros') {
        poner('capacidad_mensual_l', Math.round(s.capacidad_mensual));
        if (s.porcentaje_exportado !== null) poner('capacidad_exportada_l', Math.round(s.capacidad_mensual * s.porcentaje_exportado / 100));
      } else {
        notas.push('Capacidad declarada: ' + s.capacidad_mensual + ' ' + txt(s.capacidad_unidad) + ' al mes (el directorio solo registra litros).');
      }
    }
    if (s.presentaciones) {
      var ml = (s.presentaciones.match(/\d{2,5}/g) || []).map(Number).filter(function (n) { return n >= 50 && n <= 20000; });
      if (s.abv && ml.length) f.elements.presentaciones_ml.value = ml.join(', ');
      else notas.push('Presentaciones: ' + s.presentaciones);
    }

    var marcar = function (nombre, lista, catalogo) {
      (lista || []).forEach(function (n) {
        var item = catalogo.filter(function (x) { return norm(x.nombre_es) === norm(n); })[0];
        var c = item && $('input[name="' + nombre + '"][value="' + item.clave + '"]');
        if (c) c.checked = true;
      });
    };
    marcar('mercado', s.mercados, catalogos.paises);
    marcar('certificacion', s.certificaciones, catalogos.certificaciones);

    poner('contacto_email', s.comercial_email || s.contacto_email);
    poner('contacto_tel', s.comercial_tel || s.contacto_tel);
    poner('fuente', 'Formulario de registro en sur-exporta.com (' + new Date(s.creada_en).toLocaleDateString('es-MX') + ')');

    notas.unshift('Solicitud de ' + s.contacto_nombre + (s.contacto_cargo ? ' (' + s.contacto_cargo + ')' : '') + ' · ' + s.contacto_email + ' · ' + txt(s.contacto_tel));
    if (s.rfc) notas.push('RFC: ' + s.rfc);
    if (s.socio_comce) notas.push('Socia de COMCE Sur: ' + SOCIO[s.socio_comce]);
    if (s.mercados_otros) notas.push('Otros países donde vende: ' + s.mercados_otros);
    if (s.mercados_interes) notas.push('Mercados de interés: ' + s.mercados_interes);
    if ((s.certificaciones || []).length || s.certificaciones_otras) notas.push('Pedir copia de certificados vigentes' + (s.certificaciones_otras ? '. Otras declaradas: ' + s.certificaciones_otras : '') + '.');
    if (!s.resumen_en || !s.descripcion_en) notas.push('Traducir los textos al inglés.');
    if (s.logo_path || (s.fotos_paths || []).length) notas.push('Descargar logotipo y fotos de la solicitud y subirlos como logo-' + slugDe(s.marca) + '.webp / foto-' + slugDe(s.marca) + '.webp.');
    if (s.notas) notas.push('Comentario de la empresa: ' + s.notas.replace(/\s+/g, ' '));
    f.elements.notas_revision.value = notas.join('\n');

    if (!esServicio()) revisarAritmetica();
    origenSolicitud = s;
    var origen = $('[data-editor-origen]');
    origen.textContent = 'Borrador prellenado con la solicitud de ' + s.marca + '. Revisa los datos y las notas de revisión; al guardar, la solicitud queda marcada como convertida.';
    origen.hidden = false;
    $('[data-editor-titulo]').textContent = 'Nueva empresa: ' + s.marca;
  });

  /* ---------- publicar ---------- */

  $('[data-publicar]').addEventListener('click', async function () {
    if (!confirm('Esto reconstruye el sitio público con los datos actuales de la base. ¿Continuar?')) return;

    var boton = this;
    boton.setAttribute('aria-busy', 'true');
    var etiqueta = boton.innerHTML;
    boton.textContent = 'Publicando…';

    var sesion = await sb.auth.getSession();
    var token = sesion.data.session ? sesion.data.session.access_token : '';

    try {
      var r = await fetch('/api/publicar', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
      var cuerpo = await r.json();
      if (!r.ok || !cuerpo.ok) throw new Error(cuerpo.error || 'error');
      aviso('Publicación iniciada. El sitio se actualiza en uno o dos minutos.');
    } catch (err) {
      aviso('No se pudo publicar: ' + err.message, true);
    }

    boton.removeAttribute('aria-busy');
    boton.innerHTML = etiqueta;
  });

  /* ---------- arranque ---------- */

  async function iniciar() {
    var s = await sb.auth.getSession();
    var sesion = s.data.session;

    if (!sesion) { vista('acceso'); return; }

    var p = await sb.from('personal').select('*').eq('user_id', sesion.user.id).maybeSingle();
    quien = p.data;

    if (!quien || !quien.activo) {
      $('[data-salir]').hidden = false;
      vista('sin-permiso');
      return;
    }

    $('[data-user]').textContent = (quien.nombre || sesion.user.email) +
      (quien.rol === 'vinculacion' ? ' · Vinculación' : ' · Revisor');
    $('[data-user]').hidden = false;
    $('[data-salir]').hidden = false;
    $('[data-publicar]').hidden = quien.rol !== 'vinculacion';

    await cargarCatalogos();
    contarSolicitudes();
    if (location.hash === '#solicitudes') { irA('solicitudes'); return; }
    await cargarEmpresas();
    vista('lista');
  }

  sb.auth.onAuthStateChange(function (evento) {
    if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT') iniciar();
  });

  iniciar();
})();
