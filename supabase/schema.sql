-- Sur Exporta — esquema inicial (Fase 1)
-- Ejecutar en Supabase → SQL Editor → New query → Run.
-- Diseñado para que el directorio público sea de solo lectura y toda
-- escritura pase por personal de COMCE.

-- ---------------------------------------------------------------
-- 1. Catálogos
-- ---------------------------------------------------------------

create table if not exists estados (
  clave        text primary key,              -- 'oaxaca'
  nombre       text not null,                 -- 'Oaxaca'
  activo       boolean not null default true
);

create table if not exists sectores (
  clave        text primary key,              -- 'destilados-de-agave'
  nombre_es    text not null,
  nombre_en    text not null,
  hs_partida   text,                          -- '22.08'
  fraccion_mx  text,                          -- '2208.90.03'
  fraccion_validada boolean not null default false,
  activo       boolean not null default true
);

create table if not exists paises (
  clave        text primary key,              -- 'estados-unidos'
  nombre_es    text not null,
  nombre_en    text not null
);

create table if not exists certificaciones (
  clave        text primary key,              -- 'kosher'
  nombre_es    text not null,
  nombre_en    text not null,
  descripcion_es text,
  descripcion_en text
);

-- ---------------------------------------------------------------
-- 2. Empresas
-- ---------------------------------------------------------------

create type estatus_publicacion as enum ('borrador', 'en_revision', 'publicado', 'suspendido');
create type situacion_exportadora as enum ('exportando', 'buscando_comprador', 'sin_dato');
create type estatus_padron as enum ('vigente', 'pendiente_actualizar', 'sin_dato');

create table if not exists empresas (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  marca           text not null,
  razon_social    text,
  estado          text not null references estados(clave),
  municipio       text,
  domicilio_fiscal text,
  sector          text not null references sectores(clave),

  resumen_es      text,
  resumen_en      text,
  descripcion_es  text,
  descripcion_en  text,
  destacado_es    text,
  destacado_en    text,

  capacidad_mensual_l   integer,
  capacidad_texto       text,        -- conserva el original: '1000 a 2000 Litros'
  porcentaje_exportado  smallint check (porcentaje_exportado between 0 and 100),
  capacidad_exportada_l integer,
  exporta_desde         smallint,
  situacion             situacion_exportadora not null default 'sin_dato',
  padron                estatus_padron        not null default 'sin_dato',
  maquila               boolean,

  abv             text,
  productos       text[]    not null default '{}',
  presentaciones_ml integer[] not null default '{}',

  logo_url        text,
  foto_url        text,

  -- Contacto: nunca se expone al público, el contacto pasa por COMCE
  contacto_email  text,
  contacto_tel    text,
  sitio_web       text,

  estatus         estatus_publicacion not null default 'borrador',
  fuente          text,               -- 'Catálogo SEDECO Oaxaca 2024'
  notas_revision  text[] not null default '{}',

  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create table if not exists empresa_mercados (
  empresa_id uuid not null references empresas(id) on delete cascade,
  pais       text not null references paises(clave),
  activo     boolean not null default true,   -- false = declarado pero sin operación actual
  primary key (empresa_id, pais)
);

create table if not exists empresa_certificaciones (
  empresa_id    uuid not null references empresas(id) on delete cascade,
  certificacion text not null references certificaciones(clave),
  verificada    boolean not null default false,
  vigente_hasta date,
  primary key (empresa_id, certificacion)
);

create index if not exists idx_empresas_estatus  on empresas(estatus);
create index if not exists idx_empresas_estado   on empresas(estado);
create index if not exists idx_empresas_sector   on empresas(sector);
create index if not exists idx_empresas_productos on empresas using gin(productos);

-- Actualiza la marca de tiempo en cada edición
create or replace function tocar_actualizado_en()
returns trigger language plpgsql as $$
begin
  new.actualizado_en = now();
  return new;
end $$;

drop trigger if exists trg_empresas_actualizado on empresas;
create trigger trg_empresas_actualizado
  before update on empresas
  for each row execute function tocar_actualizado_en();

-- ---------------------------------------------------------------
-- 3. Personal de COMCE
-- ---------------------------------------------------------------

create type rol_comce as enum ('vinculacion', 'revisor');

create table if not exists personal (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  nombre   text,
  rol      rol_comce not null default 'revisor',
  activo   boolean not null default true
);

create or replace function es_personal()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from personal
    where user_id = auth.uid() and activo
  );
$$;

create or replace function es_vinculacion()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from personal
    where user_id = auth.uid() and activo and rol = 'vinculacion'
  );
$$;

-- ---------------------------------------------------------------
-- 4. Seguridad por fila
-- ---------------------------------------------------------------

alter table empresas                enable row level security;
alter table empresa_mercados        enable row level security;
alter table empresa_certificaciones enable row level security;
alter table estados                 enable row level security;
alter table sectores                enable row level security;
alter table paises                  enable row level security;
alter table certificaciones         enable row level security;
alter table personal                enable row level security;

-- El público solo ve empresas publicadas
create policy "publico lee empresas publicadas"
  on empresas for select
  using (estatus = 'publicado');

create policy "personal lee todas las empresas"
  on empresas for select to authenticated
  using (es_personal());

create policy "personal edita empresas"
  on empresas for all to authenticated
  using (es_personal()) with check (es_personal());

-- Relaciones: visibles solo si la empresa está publicada
create policy "publico lee mercados de empresas publicadas"
  on empresa_mercados for select
  using (exists (select 1 from empresas e where e.id = empresa_id and e.estatus = 'publicado'));

create policy "personal edita mercados"
  on empresa_mercados for all to authenticated
  using (es_personal()) with check (es_personal());

create policy "publico lee certificaciones de empresas publicadas"
  on empresa_certificaciones for select
  using (exists (select 1 from empresas e where e.id = empresa_id and e.estatus = 'publicado'));

create policy "personal edita certificaciones de empresas"
  on empresa_certificaciones for all to authenticated
  using (es_personal()) with check (es_personal());

-- Catálogos: lectura abierta, escritura solo del personal
create policy "catalogo estados visible"        on estados         for select using (true);
create policy "catalogo sectores visible"       on sectores        for select using (true);
create policy "catalogo paises visible"         on paises          for select using (true);
create policy "catalogo certificaciones visible" on certificaciones for select using (true);

create policy "personal edita estados"         on estados         for all to authenticated using (es_personal()) with check (es_personal());
create policy "personal edita sectores"        on sectores        for all to authenticated using (es_personal()) with check (es_personal());
create policy "personal edita paises"          on paises          for all to authenticated using (es_personal()) with check (es_personal());
create policy "personal edita certificaciones" on certificaciones for all to authenticated using (es_personal()) with check (es_personal());

-- Personal: cada quien ve su propio registro; Vinculación administra el equipo
create policy "personal se ve a si mismo" on personal for select to authenticated using (user_id = auth.uid());
create policy "vinculacion ve al equipo"  on personal for select to authenticated using (es_vinculacion());
create policy "vinculacion administra"    on personal for all    to authenticated using (es_vinculacion()) with check (es_vinculacion());

-- ---------------------------------------------------------------
-- 5. Vista pública para el sitio
-- ---------------------------------------------------------------

create or replace view directorio_publico
with (security_invoker = true) as
select
  e.slug, e.marca, e.razon_social, e.estado, e.municipio, e.sector,
  e.resumen_es, e.resumen_en, e.descripcion_es, e.descripcion_en,
  e.destacado_es, e.destacado_en,
  e.capacidad_mensual_l, e.porcentaje_exportado, e.capacidad_exportada_l,
  e.exporta_desde, e.situacion, e.padron, e.maquila,
  e.abv, e.productos, e.presentaciones_ml, e.logo_url, e.foto_url,
  coalesce((select array_agg(m.pais order by m.pais) from empresa_mercados m where m.empresa_id = e.id), '{}') as mercados,
  coalesce((select array_agg(c.certificacion order by c.certificacion) from empresa_certificaciones c where c.empresa_id = e.id), '{}') as certificaciones
from empresas e
where e.estatus = 'publicado';
