-- Sur Exporta — alta de personal de COMCE en el panel
--
-- ANTES de correr esto, crea el usuario en Supabase:
--   Authentication → Users → Add user → Send invitation (o Create new user)
--   usando el correo institucional de la persona.
--
-- Después, ejecuta este archivo cambiando el correo y el rol.
-- Roles:  'vinculacion' = aprueba y publica   |   'revisor' = prepara, no publica

insert into personal (user_id, nombre, rol)
select id, 'Ricardo Ortega', 'vinculacion'
from auth.users
where email = 'ricardo07ortega04@gmail.com'
on conflict (user_id) do update
  set nombre = excluded.nombre,
      rol    = excluded.rol,
      activo = true;

-- Comprobación: debe aparecer la persona con su rol
select p.nombre, p.rol, p.activo, u.email
from personal p
join auth.users u on u.id = p.user_id;
