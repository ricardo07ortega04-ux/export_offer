/* Sur Exporta — formulario de registro de empresas
 * Sin dependencias. Usa los catálogos de data.js (sectores, países y
 * certificaciones) y envía a /api/registro.
 */
(function () {
  'use strict';

  var SE = window.SE || { sectores: {}, paises: {}, certificaciones: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var form = $('[data-registro]');
  if (!form) return;

  var BORRADOR = 'se-registro';
  var BEBIDAS = ['destilados-de-agave', 'bebidas-espirituosas'];
  var OTRO = '__otro';
  // Datos que no se guardan en el borrador del navegador
  var PRIVADOS = ['contacto_nombre', 'contacto_cargo', 'contacto_email', 'contacto_tel',
                  'comercial_email', 'comercial_tel', 'rfc', 'acepta_privacidad', 'acepta_publicacion',
                  'imagenes_propias', 'website'];
  var cargado = Date.now();

  var ESTADOS = ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato',
    'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas',
    'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function orden(a, b) { return a.localeCompare(b, 'es'); }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- Menú móvil ---------- */

  var menuBtn = $('[data-menu-toggle]');
  var menuNav = document.getElementById('nav-mobile');
  if (menuBtn && menuNav) {
    menuBtn.addEventListener('click', function () {
      var abierto = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!abierto));
      menuNav.hidden = abierto;
    });
  }

  /* ---------- Catálogos ---------- */

  $('[data-estados]').insertAdjacentHTML('beforeend', ESTADOS.map(function (e) {
    return '<option value="' + esc(e) + '">' + esc(e) + '</option>';
  }).join(''));

  function casillas(cont, nombres, name) {
    $(cont).innerHTML = nombres.sort(orden).map(function (n) {
      return '<label class="check"><input type="checkbox" name="' + name + '" value="' + esc(n) + '"><span>' + esc(n) + '</span></label>';
    }).join('');
  }
  casillas('[data-paises]', Object.keys(SE.paises || {}), 'mercados');
  casillas('[data-certs]', Object.keys(SE.certificaciones || {}), 'certificaciones');

  var selSector = $('[data-sectores]');
  function llenarSectores(tipo) {
    var previo = selSector.value;
    var claves = Object.keys(SE.sectores || {}).filter(function (k) {
      return (SE.sectores[k].tipo || 'producto') === tipo;
    }).sort(function (a, b) { return orden(SE.sectores[a].es, SE.sectores[b].es); });
    selSector.innerHTML = '<option value="">Elige un sector</option>' + claves.map(function (k) {
      return '<option value="' + esc(k) + '">' + esc(SE.sectores[k].es) + '</option>';
    }).join('') + '<option value="' + OTRO + '">Otro (escríbelo)</option>';
    selSector.disabled = false;
    if (previo && $('option[value="' + previo + '"]', selSector)) selSector.value = previo;
  }

  /* ---------- Campos que dependen de otros ---------- */

  function valor(name) {
    var el = form.elements[name];
    if (!el) return '';
    if (el instanceof RadioNodeList || (el.length && !el.tagName)) {
      var marcado = $$('input[name="' + name + '"]:checked', form)[0];
      return marcado ? marcado.value : '';
    }
    return el.type === 'checkbox' ? el.checked : el.value.trim();
  }

  function ajustar() {
    var tipo = valor('tipo');
    var servicio = tipo === 'servicio';
    var producto = tipo === 'producto';

    if (tipo && selSector.getAttribute('data-tipo') !== tipo) {
      llenarSectores(tipo);
      selSector.setAttribute('data-tipo', tipo);
    }

    $$('[data-solo-producto]').forEach(function (el) { el.hidden = !producto; });
    $('[data-sector-otro]').hidden = selSector.value !== OTRO;
    $('[data-solo-bebida]').hidden = BEBIDAS.indexOf(selSector.value) === -1;
    $('[data-ayuda-present]').textContent = BEBIDAS.indexOf(selSector.value) > -1
      ? 'Tamaños de botella en mililitros. Ejemplo: 375, 700, 750.'
      : 'Ejemplo: bolsa de 500 g, caja de 12 piezas, granel.';

    $('[data-etq-productos]').textContent = servicio ? 'Servicios que ofreces' : 'Productos que ofreces';
    $('[data-ayuda-productos]').textContent = servicio
      ? 'Escribe uno por línea, como quieres que aparezcan en tu ficha. Ejemplo: Despacho aduanal'
      : 'Escribe uno por línea, como quieres que aparezcan en tu ficha. Ejemplo: Mezcal joven espadín';

    var textos = servicio ? {
      exportando: 'Ya atiendo clientes en el extranjero',
      buscando_comprador: 'Busco mis primeros clientes en el extranjero',
      sin_exportar: 'Atiendo a empresas mexicanas que exportan o importan'
    } : {
      exportando: 'Ya exporto',
      buscando_comprador: 'Aún no exporto y busco compradores en el extranjero',
      sin_exportar: 'Todavía me estoy preparando para exportar'
    };
    $$('[data-situacion]').forEach(function (el) { el.textContent = textos[el.getAttribute('data-situacion')]; });

    $('[data-etq-desde]').textContent = servicio ? '¿Desde qué año opera tu empresa?' : '¿Desde qué año exportas?';
    $('[data-campo-desde]').hidden = !servicio && valor('situacion') !== 'exportando';
    $('[data-etq-mercados]').textContent = servicio ? '¿En qué países tienes clientes hoy?' : '¿A qué países vendes hoy?';

    avance();
  }

  form.addEventListener('change', function (e) {
    if (['tipo', 'sector', 'situacion'].indexOf(e.target.name) > -1) ajustar();
  });

  /* ---------- Contadores de caracteres ---------- */

  function contar(el) {
    var salida = $('[data-cuenta-de="' + el.id + '"]');
    if (!salida) return;
    var max = Number(el.getAttribute('maxlength'));
    var n = el.value.length;
    salida.textContent = n ? n + ' de ' + max + ' caracteres' : '';
    salida.classList.toggle('is-cerca', n > max * 0.9);
  }
  $$('[data-contar]').forEach(function (el) {
    el.addEventListener('input', function () { contar(el); });
  });

  /* ---------- Borrador en el navegador ---------- */

  var tBorrador;
  var enviado = false;
  function guardarBorrador() {
    clearTimeout(tBorrador);
    if (enviado) return;
    tBorrador = setTimeout(function () {
      var datos = {};
      $$('input, select, textarea', form).forEach(function (el) {
        if (!el.name || el.type === 'file' || PRIVADOS.indexOf(el.name) > -1) return;
        if (el.type === 'checkbox') {
          if (el.checked) (datos[el.name] = datos[el.name] || []).push(el.value);
        } else if (el.type === 'radio') {
          if (el.checked) datos[el.name] = el.value;
        } else if (el.value) {
          datos[el.name] = el.value;
        }
      });
      store.set(BORRADOR, JSON.stringify(datos));
    }, 400);
  }
  form.addEventListener('input', guardarBorrador);
  form.addEventListener('change', guardarBorrador);

  function restaurarBorrador() {
    var datos;
    try { datos = JSON.parse(store.get(BORRADOR) || 'null'); } catch (e) { datos = null; }
    if (!datos) return;
    // El tipo va primero: de él depende la lista de sectores
    if (datos.tipo) {
      var r = $('input[name="tipo"][value="' + datos.tipo + '"]', form);
      if (r) { r.checked = true; ajustar(); }
    }
    Object.keys(datos).forEach(function (name) {
      var v = datos[name];
      if (Array.isArray(v)) {
        v.forEach(function (x) {
          var c = $$('input[name="' + name + '"]', form).filter(function (i) { return i.value === x; })[0];
          if (c) c.checked = true;
        });
        return;
      }
      var radio = $$('input[type="radio"][name="' + name + '"]', form).filter(function (i) { return i.value === v; })[0];
      if (radio) { radio.checked = true; return; }
      var el = form.elements[name];
      if (el && el.tagName) el.value = v;
    });
    $$('details.rg-ingles').forEach(function (d) {
      if ($$('input, textarea', d).some(function (el) { return el.value; })) d.open = true;
    });
    $$('[data-contar]').forEach(contar);
  }

  /* ---------- Imágenes ---------- */

  // Se reducen en el navegador antes de enviarlas: la función de Vercel
  // acepta hasta 4.5 MB por solicitud.
  var imagenes = { logo: [], fotos: [] };
  // Las fotos se publican en 16:9; 1920 px conserva una foto de 1920 × 1080 tal cual
  var LIMITES = { logo: { lado: 1200, max: 1 }, fotos: { lado: 1920, max: 3 } };
  var MAX_ORIGINAL = 10 * 1024 * 1024;
  var soportaWebp = (function () {
    try { return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0; }
    catch (e) { return false; }
  })();

  function avisoImagen(txt) { $('[data-aviso-imagen]').textContent = txt || ''; }

  function cargarImagen(archivo) {
    return new Promise(function (ok, falla) {
      var url = URL.createObjectURL(archivo);
      var img = new Image();
      img.onload = function () { ok({ img: img, url: url }); };
      img.onerror = function () { URL.revokeObjectURL(url); falla(new Error('no_imagen')); };
      img.src = url;
    });
  }

  function reducir(img, lado, tipoSalida, calidad) {
    var escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(img.naturalHeight * escala);
    var ctx = c.getContext('2d');
    if (tipoSalida === 'image/jpeg') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(tipoSalida, calidad);
  }

  async function procesar(archivo, grupo) {
    if (!/^image\/(png|jpeg|webp)$/.test(archivo.type)) throw new Error('Solo se aceptan imágenes PNG, JPG o WebP.');
    if (archivo.size > MAX_ORIGINAL) throw new Error('«' + archivo.name + '» pesa más de 10 MB.');
    var r = await cargarImagen(archivo);
    // El logotipo conserva la transparencia; las fotos pueden ir en JPG
    var tipo = soportaWebp ? 'image/webp' : (grupo === 'logo' ? 'image/png' : 'image/jpeg');
    var calidad = grupo === 'logo' ? 0.92 : 0.82;
    var datos = reducir(r.img, LIMITES[grupo].lado, tipo, calidad);
    while (datos.length > 1300000 && calidad > 0.5 && tipo !== 'image/png') {
      calidad -= 0.1;
      datos = reducir(r.img, LIMITES[grupo].lado, tipo, calidad);
    }
    var aviso = '';
    var proporcion = r.img.naturalWidth / r.img.naturalHeight;
    if (grupo === 'fotos' && (proporcion < 1.3 || proporcion > 2)) aviso = 'Las fichas usan fotos horizontales en formato 16:9. Esta se mostrará completa, pero una foto horizontal se verá mejor.';
    else if (grupo === 'fotos' && r.img.naturalWidth < 1600) aviso = 'Una de las fotos mide menos de 1600 px de ancho y podría verse borrosa. Si tienes una versión más grande (ideal 1920 × 1080), úsala.';
    return { tipo: tipo, data: datos.split(',')[1], vista: r.url, aviso: aviso };
  }

  function pintarMiniaturas(grupo) {
    var caja = $('[data-subir="' + grupo + '"]');
    caja.classList.toggle('is-lleno', imagenes[grupo].length >= LIMITES[grupo].max);
    $('[data-miniaturas]', caja).innerHTML = imagenes[grupo].map(function (im, i) {
      return '<li><img src="' + im.vista + '" alt="' + (grupo === 'logo' ? 'Logotipo seleccionado' : 'Foto ' + (i + 1)) + '">' +
        '<button type="button" data-quitar="' + i + '" aria-label="Quitar ' + (grupo === 'logo' ? 'logotipo' : 'foto ' + (i + 1)) + '">' +
        '<svg aria-hidden="true"><use href="#i-x"/></svg></button></li>';
    }).join('');
    avance();
  }

  async function agregar(archivos, grupo) {
    avisoImagen('');
    var lugar = LIMITES[grupo].max - imagenes[grupo].length;
    if (grupo === 'logo') { imagenes.logo = []; lugar = 1; }
    var lista = Array.prototype.slice.call(archivos, 0, lugar);
    if (archivos.length > lugar && grupo === 'fotos') avisoImagen('Solo se aceptan 3 fotos; usamos las primeras.');
    for (var i = 0; i < lista.length; i++) {
      try {
        var im = await procesar(lista[i], grupo);
        imagenes[grupo].push(im);
        if (im.aviso) avisoImagen(im.aviso);
      } catch (err) {
        avisoImagen(err.message === 'no_imagen' ? 'No pudimos leer «' + lista[i].name + '». Prueba con otro archivo.' : err.message);
      }
    }
    pintarMiniaturas(grupo);
    if (grupo === 'logo' && imagenes.logo.length) $('[data-campo-logo]').classList.remove('has-error');
  }

  $$('[data-subir]').forEach(function (caja) {
    var grupo = caja.getAttribute('data-subir');
    var input = $('input[type="file"]', caja);
    input.addEventListener('change', function () {
      if (input.files.length) agregar(input.files, grupo);
      input.value = '';
    });
    caja.addEventListener('click', function (e) {
      var b = e.target.closest('[data-quitar]');
      if (!b) return;
      var i = Number(b.getAttribute('data-quitar'));
      URL.revokeObjectURL(imagenes[grupo][i].vista);
      imagenes[grupo].splice(i, 1);
      pintarMiniaturas(grupo);
      input.focus();
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      caja.addEventListener(ev, function (e) { e.preventDefault(); caja.classList.add('is-arrastrando'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      caja.addEventListener(ev, function () { caja.classList.remove('is-arrastrando'); });
    });
    caja.addEventListener('drop', function (e) {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length) agregar(e.dataTransfer.files, grupo);
    });
  });

  /* ---------- Validación ---------- */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Cada regla: campo que se marca, sección, mensaje y prueba
  var REGLAS = [
    { id: 'r-marca', seccion: 'empresa', msg: 'Escribe el nombre de tu empresa', ok: function () { return valor('marca'); } },
    { id: 'r-estado', seccion: 'empresa', msg: 'Elige el estado', ok: function () { return valor('estado'); } },
    { id: 'r-municipio', seccion: 'empresa', msg: 'Escribe el municipio o la ciudad', ok: function () { return valor('municipio'); } },
    { id: 'r-tipo-err', grupo: 'tipo', seccion: 'oferta', msg: 'Elige si ofreces productos o servicios', ok: function () { return valor('tipo'); } },
    { id: 'r-sector', seccion: 'oferta', msg: 'Elige tu sector o escríbelo', ok: function () {
      var s = valor('sector'); return s && (s !== OTRO || valor('sector_otro'));
    } },
    { id: 'r-productos', seccion: 'oferta', msg: 'Escribe al menos un producto o servicio', ok: function () { return valor('productos'); } },
    { id: 'r-situacion-err', grupo: 'situacion', seccion: 'exportacion', msg: 'Elige tu situación de exportación', ok: function () { return valor('situacion'); } },
    { id: 'r-resumen', seccion: 'textos', msg: 'Escribe el resumen de tu empresa', ok: function () { return valor('resumen_es'); } },
    { id: 'r-descripcion', seccion: 'textos', msg: 'Escribe la descripción de tu empresa', ok: function () { return valor('descripcion_es').length >= 40; } },
    { id: 'r-logo', campo: '[data-campo-logo]', seccion: 'imagenes', msg: 'Agrega tu logotipo', ok: function () { return imagenes.logo.length; } },
    { id: 'r-propias', seccion: 'imagenes', msg: 'Confirma que puedes compartir las imágenes', ok: function () {
      return !(imagenes.logo.length || imagenes.fotos.length) || valor('imagenes_propias');
    } },
    { id: 'r-nombre', seccion: 'contacto', msg: 'Escribe tu nombre', ok: function () { return valor('contacto_nombre'); } },
    { id: 'r-email', seccion: 'contacto', msg: 'Escribe un correo electrónico válido', ok: function () { return EMAIL_RE.test(valor('contacto_email')); } },
    { id: 'r-tel', seccion: 'contacto', msg: 'Escribe un teléfono de contacto', ok: function () { return valor('contacto_tel').replace(/\D/g, '').length >= 8; } },
    { id: 'r-cemail', seccion: 'contacto', msg: 'Revisa el correo de ventas', ok: function () { var v = valor('comercial_email'); return !v || EMAIL_RE.test(v); } },
    { id: 'r-publicacion', seccion: 'autorizaciones', msg: 'Autoriza la publicación de la ficha', ok: function () { return valor('acepta_publicacion'); } },
    { id: 'r-privacidad', seccion: 'autorizaciones', msg: 'Acepta el tratamiento de tus datos', ok: function () { return valor('acepta_privacidad'); } }
  ];

  function contenedor(regla) {
    if (regla.campo) return $(regla.campo);
    var el = document.getElementById(regla.id);
    return el && (el.closest('.rg-opciones') || el.closest('.field'));
  }
  function marcar(regla, mal) {
    var c = contenedor(regla);
    if (c) c.classList.toggle('has-error', mal);
    var el = document.getElementById(regla.id);
    if (el && !regla.grupo) el.setAttribute('aria-invalid', mal ? 'true' : 'false');
  }

  // Al corregir un campo marcado, se quita el error de inmediato
  form.addEventListener('input', revisarMarcados);
  form.addEventListener('change', revisarMarcados);
  function revisarMarcados() {
    REGLAS.forEach(function (r) {
      var c = contenedor(r);
      if (c && c.classList.contains('has-error') && r.ok()) marcar(r, false);
    });
    avance();
  }

  /* ---------- Avance en el índice ---------- */

  var OPCIONALES = {
    certificaciones: function () {
      return $$('input[name="certificaciones"]:checked', form).length || valor('certificaciones_otras');
    }
  };
  function avance() {
    $$('[data-paso]').forEach(function (a) {
      var paso = a.getAttribute('data-paso');
      var reglas = REGLAS.filter(function (r) { return r.seccion === paso; });
      var completo = reglas.length ? reglas.every(function (r) { return r.ok(); }) : !!(OPCIONALES[paso] && OPCIONALES[paso]());
      a.classList.toggle('is-completo', !!completo);
    });
  }

  var enlaces = $$('.rg-toc a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        enlaces.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    $$('[data-seccion]').forEach(function (s) { io.observe(s); });
  }

  /* ---------- Envío ---------- */

  var cajaErrores = $('[data-errores]');
  var boton = $('[data-enviar]');

  function mostrarErrores(titulo, items) {
    $('h3', cajaErrores).textContent = titulo;
    $('ul', cajaErrores).innerHTML = items.map(function (it) {
      return '<li>' + (it.id ? '<a href="#' + it.id + '">' + esc(it.msg) + '</a>' : esc(it.msg)) + '</li>';
    }).join('');
    cajaErrores.hidden = false;
    cajaErrores.focus();
    cajaErrores.scrollIntoView({ block: 'center' });
  }

  // Los enlaces a errores de grupos llevan al primer botón de opción
  cajaErrores.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var destino = document.getElementById(a.getAttribute('href').slice(1));
    if (!destino) return;
    e.preventDefault();
    var foco = destino.matches('input, select, textarea') ? destino
      : $('input', destino.closest('.rg-opciones') || destino.closest('.field'));
    (destino.closest('.rg-opciones') || destino.closest('.field') || destino).scrollIntoView({ block: 'center' });
    if (foco) foco.focus({ preventScroll: true });
  });

  var CAMPOS_SERVIDOR = {
    marca: 'r-marca', estado: 'r-estado', municipio: 'r-municipio', tipo: 'r-tipo-err', sector: 'r-sector',
    productos: 'r-productos', situacion: 'r-situacion-err', resumen_es: 'r-resumen', descripcion_es: 'r-descripcion',
    logo: 'r-logo', imagenes: 'r-logo', imagenes_propias: 'r-propias', contacto_nombre: 'r-nombre',
    contacto_email: 'r-email', contacto_tel: 'r-tel', comercial_email: 'r-cemail',
    acepta_publicacion: 'r-publicacion', acepta_privacidad: 'r-privacidad'
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var malas = REGLAS.filter(function (r) { var mal = !r.ok(); marcar(r, mal); return mal; });
    if (malas.length) {
      mostrarErrores(malas.length === 1 ? 'Falta un dato' : 'Faltan ' + malas.length + ' datos', malas);
      return;
    }
    cajaErrores.hidden = true;

    var marcadas = function (name) { return $$('input[name="' + name + '"]:checked', form).map(function (c) { return c.value; }); };
    var sector = valor('sector');
    var datos = {
      marca: valor('marca'), razon_social: valor('razon_social'), rfc: valor('rfc'),
      estado: valor('estado'), municipio: valor('municipio'), sitio_web: valor('sitio_web'),
      socio_comce: valor('socio_comce'),
      tipo: valor('tipo'),
      sector: sector === OTRO ? '' : sector,
      sector_otro: sector === OTRO ? valor('sector_otro') : '',
      productos: valor('productos').split('\n'),
      capacidad_mensual: valor('capacidad_mensual'), capacidad_unidad: valor('capacidad_unidad'),
      presentaciones: valor('presentaciones'),
      abv: BEBIDAS.indexOf(sector) > -1 ? valor('abv') : '',
      maquila: valor('maquila'),
      situacion: valor('situacion'),
      exporta_desde: $('[data-campo-desde]').hidden ? '' : valor('exporta_desde'),
      porcentaje_exportado: valor('porcentaje_exportado'), padron: valor('padron'),
      mercados: marcadas('mercados'), mercados_otros: valor('mercados_otros'), mercados_interes: valor('mercados_interes'),
      certificaciones: marcadas('certificaciones'), certificaciones_otras: valor('certificaciones_otras'),
      resumen_es: valor('resumen_es'), descripcion_es: form.elements.descripcion_es.value, destacado_es: valor('destacado_es'),
      resumen_en: valor('resumen_en'), descripcion_en: form.elements.descripcion_en.value, destacado_en: valor('destacado_en'),
      contacto_nombre: valor('contacto_nombre'), contacto_cargo: valor('contacto_cargo'),
      contacto_email: valor('contacto_email'), contacto_tel: valor('contacto_tel'),
      comercial_email: valor('comercial_email'), comercial_tel: valor('comercial_tel'),
      notas: form.elements.notas.value,
      acepta_privacidad: valor('acepta_privacidad') === true,
      acepta_publicacion: valor('acepta_publicacion') === true,
      imagenes_propias: valor('imagenes_propias') === true,
      logo: imagenes.logo[0] ? { type: imagenes.logo[0].tipo, data: imagenes.logo[0].data } : null,
      fotos: imagenes.fotos.map(function (f) { return { type: f.tipo, data: f.data }; }),
      website: valor('website'),
      elapsed: Date.now() - cargado
    };

    boton.setAttribute('aria-busy', 'true');
    boton.textContent = 'Enviando…';

    try {
      var r = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      var res = await r.json().catch(function () { return { ok: r.ok, error: r.status === 413 ? 'muy_grande' : 'error' }; });

      if (!res.ok) {
        if (res.error === 'validation' && res.fields) {
          var items = res.fields.map(function (f) {
            var regla = REGLAS.filter(function (x) { return x.id === CAMPOS_SERVIDOR[f]; })[0];
            if (regla) marcar(regla, true);
            return { id: CAMPOS_SERVIDOR[f], msg: regla ? regla.msg : (f === 'imagenes' ? 'Revisa las imágenes: usa PNG, JPG o WebP' : 'Revisa el campo ' + f) };
          });
          mostrarErrores('Revisa estos datos', items);
        } else if (res.error === 'demasiadas') {
          mostrarErrores('Ya recibimos tus solicitudes', [{ msg: 'Recibimos varias solicitudes con este correo hoy. Si necesitas corregir algo, escríbenos y lo ajustamos.' }]);
        } else if (res.error === 'muy_grande') {
          mostrarErrores('Las imágenes pesan demasiado', [{ id: 'r-fotos', msg: 'Quita una foto o usa imágenes más ligeras e inténtalo de nuevo.' }]);
        } else {
          mostrarErrores('No pudimos enviar la solicitud', [{ msg: 'Hubo un problema de conexión. Tus datos siguen aquí: inténtalo de nuevo en unos minutos.' }]);
        }
        return;
      }

      // Un guardado pendiente no debe revivir el borrador ya enviado
      enviado = true;
      clearTimeout(tBorrador);
      store.del(BORRADOR);
      $('[data-formulario]').hidden = true;
      var listo = $('[data-listo]');
      listo.hidden = false;
      $$('[data-paso]').forEach(function (a) { a.classList.add('is-completo'); });
      window.scrollTo(0, 0);
      listo.focus();
    } catch (err) {
      mostrarErrores('No pudimos enviar la solicitud', [{ msg: 'Hubo un problema de conexión. Tus datos siguen aquí: inténtalo de nuevo en unos minutos.' }]);
    } finally {
      boton.removeAttribute('aria-busy');
      boton.textContent = 'Enviar solicitud';
    }
  });

  /* ---------- Arranque ---------- */

  restaurarBorrador();
  ajustar();
})();
