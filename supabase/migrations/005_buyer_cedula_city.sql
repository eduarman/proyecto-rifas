-- Agrega cédula de identidad y ciudad de residencia al comprador, pedidos
-- en el checkout junto con nombre y correo.

alter table orders add column if not exists buyer_cedula text;
alter table orders add column if not exists buyer_city text;

-- Redefine la función de creación de pedido con los dos nuevos parámetros
-- (ver 002_number_selection.sql para el resto del comportamiento, sin
-- cambios: sigue creando el pedido y reservando números atómicamente).
-- "create or replace" no alcanza porque cambia la firma de parámetros: eso
-- crea una sobrecarga nueva en vez de reemplazar la función vieja, y deja
-- dos versiones ambiguas (error 42725). Hay que borrar la vieja primero.
drop function if exists create_order_with_numbers(text, text, integer[], numeric, text, text, text, text, uuid);

create or replace function create_order_with_numbers(
  p_rifa_id text,
  p_rifa_title text,
  p_numbers integer[],
  p_unit_price numeric,
  p_payment_method text,
  p_buyer_name text,
  p_buyer_contact text,
  p_buyer_cedula text,
  p_buyer_city text,
  p_proof_path text,
  p_user_id uuid default null
) returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_qty integer := coalesce(array_length(p_numbers, 1), 0);
begin
  if v_qty < 1 then
    raise exception 'Debes seleccionar al menos un número.';
  end if;

  insert into orders (
    user_id, rifa_id, rifa_title, qty, unit_price, total,
    payment_method, buyer_name, buyer_contact, buyer_cedula, buyer_city, proof_path
  )
  values (
    p_user_id, p_rifa_id, p_rifa_title, v_qty, p_unit_price, p_unit_price * v_qty,
    p_payment_method, p_buyer_name, p_buyer_contact, p_buyer_cedula, p_buyer_city, p_proof_path
  )
  returning id into v_order_id;

  insert into order_numbers (order_id, rifa_id, number)
  select v_order_id, p_rifa_id, n from unnest(p_numbers) as n;

  return v_order_id;
end;
$$;

grant execute on function create_order_with_numbers to anon, authenticated;
