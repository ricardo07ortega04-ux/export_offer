-- Sur Exporta — 25 · Citas de la agenda
--
-- Guarda las reuniones que se apartan desde sur-exporta.com/agenda. Cada cita
-- tiene su evento en Google Calendar (con enlace de Google Meet); esta tabla es
-- el registro y el candado contra dos citas en el mismo horario.
--
-- Nadie del público puede leer ni escribir esta tabla directamente. La página
-- escribe a través de /api/agenda (función de Vercel), que usa la llave
-- service_role guardada solo en Vercel.

create table if not exists citas (
  id          uuid primary key default gen_random_uuid(),
  creada_en   timestamptz not null default now(),
  estatus     text not null default 'confirmada'
              check (estatus in ('confirmada', 'cancelada', 'realizada')),

  inicio      timestamptz not null,
  fin         timestamptz not null,

  -- Quién agenda (nunca se publica)
  nombre      text not null,
  empresa     text,
  email       text not null,
  tema        text,
  idioma      text not null default 'es' check (idioma in ('es', 'en')),

  -- De dónde vino: «ref» es la referencia del correo de invitación (p. ej. SE-2026-006)
  ref         text,
  origen      text,

  -- Evento de Google Calendar
  evento_id   text,
  meet_url    text,

  notas       text
);

-- Candado: un solo horario confirmado a la vez. Al cancelar una cita, el espacio se libera.
create unique index if not exists idx_citas_horario on citas(inicio) where estatus = 'confirmada';
create index if not exists idx_citas_email on citas(email, inicio desc);

alter table citas enable row level security;

-- Solo el personal de COMCE ve y gestiona las citas.
-- No hay política de inserción: el público no escribe directo en la tabla.
drop policy if exists "personal lee citas" on citas;
create policy "personal lee citas"
  on citas for select to authenticated
  using (es_personal());

drop policy if exists "personal gestiona citas" on citas;
create policy "personal gestiona citas"
  on citas for update to authenticated
  using (es_personal()) with check (es_personal());

drop policy if exists "vinculacion borra citas" on citas;
create policy "vinculacion borra citas"
  on citas for delete to authenticated
  using (es_vinculacion());

-- Comprobación: la tabla existe y está vacía
select count(*) as citas from citas;
