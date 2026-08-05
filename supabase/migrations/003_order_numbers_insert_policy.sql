-- Ejecutar una sola vez en el SQL Editor del proyecto Supabase ya desplegado.
-- Corrige checkout roto: create_order_with_numbers (002) no es SECURITY
-- DEFINER, así que el insert en order_numbers corre con los privilegios del
-- comprador. La 002 nunca agregó una policy de insert para esa tabla (solo
-- quedaron "admin_all" y "select_own"), así que todo checkout fallaba con
-- "new row violates row-level security policy for table order_numbers".
-- Mismo criterio que orders_insert_public: el checkout es público (invitado
-- o autenticado), solo la lectura está restringida.

drop policy if exists "order_numbers_insert_public" on order_numbers;
create policy "order_numbers_insert_public" on order_numbers
  for insert with check (true);
