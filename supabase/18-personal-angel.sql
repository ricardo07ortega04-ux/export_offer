-- Sur Exporta — 18 · Alta de Angel en el panel (rol vinculación)
--
-- ANTES de correr esto, crea su usuario en Supabase:
--   Authentication → Users → Add user → Send invitation
--   con el correo dir.vinculacion@comce-sur.org.mx
--
-- Rol 'vinculacion': edita empresas, publica cambios y administra al equipo del panel.

insert into personal (user_id, nombre, rol)
select id, 'Angel', 'vinculacion'
from auth.users
where email = 'dir.vinculacion@comce-sur.org.mx'
on conflict (user_id) do update
  set nombre = excluded.nombre,
      rol    = excluded.rol,
      activo = true;

-- Comprobación: debe aparecer Angel con rol vinculacion (y tú también)
select p.nombre, p.rol, p.activo, u.email
from personal p
join auth.users u on u.id = p.user_id
order by p.nombre;
