-- Sur Exporta — 19 · Solicitudes de registro de empresas
--
-- Guarda lo que las empresas envían desde sur-exporta.com/registro.
-- Una solicitud NO es una empresa del directorio: el personal de COMCE la
-- revisa en el panel y, si procede, la convierte en un borrador.
--
-- Nadie del público puede leer ni escribir esta tabla directamente. El
-- formulario escribe a través de /api/registro (función de Vercel), que usa
-- la llave service_role guardada solo en Vercel.

create table if not exists solicitudes (
  id                    uuid primary key default gen_random_uuid(),
  creada_en             timestamptz not null default now(),
  estatus               text not null default 'nueva'
                        check (estatus in ('nueva', 'en_proceso', 'convertida', 'descartada')),
  empresa_id            uuid references empresas(id) on delete set null,

  -- 1. Empresa
  marca                 text not null,
  razon_social          text,
  rfc                   text,
  estado                text,
  municipio             text,
  sitio_web             text,
  socio_comce           text check (socio_comce in ('si', 'tramite', 'no')),

  -- 2. Oferta
  tipo                  text check (tipo in ('producto', 'servicio')),
  sector                text,
  sector_otro           text,
  productos             text[] not null default '{}',
  capacidad_mensual     numeric,
  capacidad_unidad      text,
  presentaciones        text,
  abv                   text,
  maquila               boolean,

  -- 3. Exportación
  situacion             text,
  exporta_desde         smallint,
  porcentaje_exportado  smallint check (porcentaje_exportado between 0 and 100),
  padron                text,
  mercados              text[] not null default '{}',
  mercados_otros        text,
  mercados_interes      text,

  -- 4. Certificaciones
  certificaciones       text[] not null default '{}',
  certificaciones_otras text,

  -- 5. Textos de la ficha
  resumen_es            text,
  descripcion_es        text,
  destacado_es          text,
  resumen_en            text,
  descripcion_en        text,
  destacado_en          text,

  -- 6. Imágenes (rutas dentro del bucket privado «solicitudes»)
  logo_path             text,
  fotos_paths           text[] not null default '{}',

  -- 7. Contacto (nunca se publica)
  contacto_nombre       text not null,
  contacto_cargo        text,
  contacto_email        text not null,
  contacto_tel          text,
  comercial_email       text,
  comercial_tel         text,

  -- 8. Autorizaciones
  acepta_privacidad     boolean not null,
  acepta_publicacion    boolean not null,
  imagenes_propias      boolean not null default false,

  notas                 text
);

create index if not exists idx_solicitudes_estatus on solicitudes(estatus, creada_en desc);

alter table solicitudes enable row level security;

-- Solo el personal de COMCE ve y gestiona las solicitudes.
-- No hay política de inserción: el público no escribe directo en la tabla.
drop policy if exists "personal lee solicitudes" on solicitudes;
create policy "personal lee solicitudes"
  on solicitudes for select to authenticated
  using (es_personal());

drop policy if exists "personal gestiona solicitudes" on solicitudes;
create policy "personal gestiona solicitudes"
  on solicitudes for update to authenticated
  using (es_personal()) with check (es_personal());

drop policy if exists "vinculacion borra solicitudes" on solicitudes;
create policy "vinculacion borra solicitudes"
  on solicitudes for delete to authenticated
  using (es_vinculacion());

-- Bucket privado para logotipos y fotos enviados con la solicitud
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('solicitudes', 'solicitudes', false, 3145728, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "personal ve imagenes de solicitudes" on storage.objects;
create policy "personal ve imagenes de solicitudes"
  on storage.objects for select to authenticated
  using (bucket_id = 'solicitudes' and public.es_personal());

drop policy if exists "vinculacion borra imagenes de solicitudes" on storage.objects;
create policy "vinculacion borra imagenes de solicitudes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'solicitudes' and public.es_vinculacion());

-- Comprobación: la tabla existe, vacía, y el bucket es privado
select
  (select count(*) from solicitudes)                         as solicitudes,
  (select public from storage.buckets where id = 'solicitudes') as bucket_publico;
