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

  var ETIQUETAS = {
    borrador: 'Borrador', en_revision: 'En revisión',
    publicado: 'Publicado', suspendido: 'Suspendido'
  };

  /* ---------- utilidades ---------- */

  function vista(nombre) {
    $$('[data-vista]').forEach(function (s) { s.hidden = s.getAttribute('data-vista') !== nombre; });
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
      sb.from('sectores').select('clave,nombre_es').eq('activo', true).order('nombre_es'),
      sb.from('paises').select('clave,nombre_es').order('nombre_es'),
      sb.from('certificaciones').select('clave,nombre_es').order('nombre_es')
    ]);
    catalogos.estados = r[0].data || [];
    catalogos.sectores = r[1].data || [];
    catalogos.paises = r[2].data || [];
    catalogos.certificaciones = r[3].data || [];

    $('[data-opciones="estados"]').innerHTML = catalogos.estados
      .map(function (x) { return '<option value="' + x.clave + '">' + x.nombre + '</option>'; }).join('');
    $('[data-opciones="sectores"]').innerHTML = catalogos.sectores
      .map(function (x) { return '<option value="' + x.clave + '">' + x.nombre_es + '</option>'; }).join('');

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

  async function abrirEditor(id) {
    $('[data-editor-error]').hidden = true;
    $('[data-guardado]').hidden = true;
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

    revisarAritmetica();
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

    boton.removeAttribute('aria-busy');
    boton.textContent = 'Guardar cambios';
    $('[data-guardado]').hidden = false;
    $('[data-editor-titulo]').textContent = actual.marca;
    $('[data-actualizado]').textContent = 'Última edición: ' + fecha(actual.actualizado_en);
    aviso('Cambios guardados. Recuerda publicar para que se vean en el sitio.');
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
    await cargarEmpresas();
    vista('lista');
  }

  sb.auth.onAuthStateChange(function (evento) {
    if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT') iniciar();
  });

  iniciar();
})();
