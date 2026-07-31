-- Ejecutar una sola vez en el SQL Editor del proyecto Supabase ya desplegado
-- (schema.sql solo corre en un proyecto nuevo, no reaplica cambios a tablas
-- existentes). Agrega el campo de comentario/testimonio a los ganadores y
-- permite que el público los lea para mostrarlos en el home.

alter table winners add column if not exists comment text;

drop policy if exists "winners_select_public" on winners;
create policy "winners_select_public" on winners
  for select using (true);
