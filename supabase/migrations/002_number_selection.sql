-- Ejecutar una sola vez en el SQL Editor del proyecto Supabase ya desplegado.
-- Agrega selección de números concretos por pedido: cada comprador elige sus
-- propios números en la página de la rifa (en vez de solo una cantidad), y
-- el admin puede ver una grilla real de vendidos/disponibles por rifa.

-- El checkout de clientes (useCustomerAuth.js) ya usa orders.user_id en
-- código sin que exista una migración commiteada para esa columna — se
-- agrega aquí de forma defensiva para que este archivo sea reproducible
-- desde cero junto con schema.sql + 001.
alter table orders add column if not exists user_id uuid references auth.users(id);

drop policy if exists "orders_select_own" on orders;
create policy "orders_select_own" on orders
  for select using (auth.uid() = user_id);

create table if not exists order_numbers (
  order_id uuid not null references orders(id) on delete cascade,
  rifa_id text not null references rifas(id) on delete cascade,
  number integer not null,
  created_at timestamptz not null default now(),
  primary key (order_id, number),
  unique (rifa_id, number)
);

alter table order_numbers enable row level security;

drop policy if exists "order_numbers_admin_all" on order_numbers;
create policy "order_numbers_admin_all" on order_numbers
  for all using (is_admin()) with check (is_admin());

drop policy if exists "order_numbers_select_own" on order_numbers;
create policy "order_numbers_select_own" on order_numbers
  for select using (
    exists (select 1 from orders o where o.id = order_numbers.order_id and o.user_id = auth.uid())
  );

-- Crea el pedido y reserva sus números en una sola transacción: si algún
-- número ya fue tomado (unique_violation en order_numbers), toda la
-- operación se revierte y el pedido no queda huérfano sin números.
-- No es SECURITY DEFINER: corre con los privilegios de quien llama, así que
-- las policies de insert de orders/order_numbers se siguen aplicando igual.
create or replace function create_order_with_numbers(
  p_rifa_id text,
  p_rifa_title text,
  p_numbers integer[],
  p_unit_price numeric,
  p_payment_method text,
  p_buyer_name text,
  p_buyer_contact text,
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
    payment_method, buyer_name, buyer_contact, proof_path
  )
  values (
    p_user_id, p_rifa_id, p_rifa_title, v_qty, p_unit_price, p_unit_price * v_qty,
    p_payment_method, p_buyer_name, p_buyer_contact, p_proof_path
  )
  returning id into v_order_id;

  insert into order_numbers (order_id, rifa_id, number)
  select v_order_id, p_rifa_id, n from unnest(p_numbers) as n;

  return v_order_id;
end;
$$;

grant execute on function create_order_with_numbers to anon, authenticated;

-- Números ocupados de una rifa (pedidos pendientes o verificados; los
-- rechazados vuelven a estar disponibles, igual que ya asume
-- AdminVentasView.vue). Público de solo lectura y solo expone el número,
-- nunca quién lo compró — así el selector de números en la página de la
-- rifa sabe qué está tomado sin necesitar acceso de lectura a orders.
create or replace function taken_numbers_for_rifa(p_rifa_id text)
returns integer[]
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(array_agg(distinct n.number), '{}')
  from order_numbers n
  join orders o on o.id = n.order_id
  where n.rifa_id = p_rifa_id and o.status <> 'rechazado';
$$;

grant execute on function taken_numbers_for_rifa to anon, authenticated;
