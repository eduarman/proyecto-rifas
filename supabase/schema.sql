-- Rifly — esquema inicial de Supabase.
-- Ejecutar una sola vez en el SQL Editor del proyecto (Supabase Dashboard > SQL Editor > New query).

-- ============ TABLAS ============

create table if not exists rifas (
  id text primary key,
  badge text not null,
  badge_bg text not null,
  badge_color text not null,
  title text not null,
  short_desc text not null,
  long_desc text not null,
  sold integer not null default 0,
  available integer not null,
  date text not null,
  price numeric not null,
  image_label text not null,
  active boolean not null default true,
  custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists winners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  prize text not null,
  rifa_title text not null,
  city text,
  date text not null,
  initials text not null,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists schedule (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prize text not null,
  mon text not null,
  day text not null,
  time text not null,
  status text not null default 'Activa',
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  rifa_id text references rifas(id),
  rifa_title text not null,
  qty integer not null,
  unit_price numeric not null,
  total numeric not null,
  payment_method text not null,
  buyer_name text not null,
  buyer_contact text not null,
  proof_path text,
  status text not null default 'pendiente',
  created_at timestamptz not null default now()
);

-- Lista blanca de administradores: qué usuarios de auth.users son admin.
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ============ HELPER: ¿el usuario actual es admin? ============

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

-- ============ ROW LEVEL SECURITY ============

alter table rifas enable row level security;
alter table winners enable row level security;
alter table schedule enable row level security;
alter table orders enable row level security;
alter table admins enable row level security;

-- Rifas: el público solo ve las activas; el admin ve y edita todo.
create policy "rifas_select_public" on rifas
  for select using (active = true or is_admin());
create policy "rifas_admin_write" on rifas
  for all using (is_admin()) with check (is_admin());

-- Ganadores: público puede leer (se muestran como testimonios en el home);
-- solo admin crea/edita/elimina.
create policy "winners_select_public" on winners
  for select using (true);
create policy "winners_admin_all" on winners
  for all using (is_admin()) with check (is_admin());

-- Agenda: pública para leer, solo admin escribe.
create policy "schedule_select_public" on schedule
  for select using (true);
create policy "schedule_admin_write" on schedule
  for all using (is_admin()) with check (is_admin());

-- Pedidos: cualquiera puede crear uno (checkout de invitado); solo admin
-- puede leer/aprobar/rechazar. Los compradores no pueden ver pedidos ajenos.
create policy "orders_insert_public" on orders
  for insert with check (true);
create policy "orders_admin_all" on orders
  for all using (is_admin()) with check (is_admin());

-- Admins: nadie necesita leer esta tabla desde el cliente; solo se usa
-- dentro de is_admin() (SECURITY DEFINER la puede leer igual).
create policy "admins_no_client_access" on admins
  for all using (false);

-- ============ STORAGE: comprobantes de pago ============

insert into storage.buckets (id, name, public)
values ('comprobantes', 'comprobantes', false)
on conflict (id) do nothing;

create policy "comprobantes_insert_public" on storage.objects
  for insert with check (bucket_id = 'comprobantes');
create policy "comprobantes_select_admin" on storage.objects
  for select using (bucket_id = 'comprobantes' and is_admin());

-- ============ DATOS SEMILLA (igual al prototipo actual) ============

insert into rifas (id, badge, badge_bg, badge_color, title, short_desc, long_desc, sold, available, date, price, image_label, active, custom) values
  ('auto', '🔥 Más popular', '#fee2e2', '#dc2626', 'Gran Sorteo Deportivo', 'Auto deportivo azul + $5.000',
   'Un auto deportivo azul 0km totalmente equipado, más $5.000 en efectivo para gastos de patentamiento y seguro.',
   82, 180, '30 de julio', 5, 'foto: auto deportivo azul', true, false),
  ('tech', 'Nueva', '#eef2ff', '#4338ca', 'Rifa Tech', 'iPhone 15 Pro Max + AirPods',
   'iPhone 15 Pro Max de 256GB con AirPods Pro incluidos, entrega sellada de fábrica con garantía oficial.',
   34, 660, '5 de agosto', 3, 'foto: iPhone 15 Pro Max', true, false),
  ('cash', 'Cierra pronto', '#fff7ed', '#b45309', 'Rifa Efectivo', '$3.000 en efectivo',
   '$3.000 en efectivo transferidos directamente a tu cuenta el mismo día del sorteo, sin retenciones.',
   80, 160, '12 de agosto', 2, 'foto: efectivo en billetes', true, false)
on conflict (id) do nothing;

insert into winners (name, prize, rifa_title, city, date, initials, comment) values
  ('María González', 'iPhone 15 Pro Max', 'Rifa Tech', 'Caracas', '2 de julio', 'MG',
   'Compré un número, gané un iPhone y recibí mi premio en dos días. Todo súper transparente.'),
  ('Carlos Rodríguez', '$1.500 en efectivo', 'Rifa Efectivo', 'Valencia', '18 de junio', 'CR',
   'El proceso es muy rápido. Pagué por Pago Móvil y me confirmaron en minutos. Recomendado.');

insert into schedule (title, prize, mon, day, time, status) values
  ('Gran Sorteo Deportivo', 'Auto + $5.000', 'JUL', '30', '8:00 PM', 'Activa'),
  ('Rifa Tech', 'iPhone 15 Pro Max', 'AGO', '05', '9:00 PM', 'Activa'),
  ('Rifa Efectivo', '$3.000 USD', 'AGO', '12', '8:30 PM', 'Activa'),
  ('Rifa Viaje', 'Viaje a Margarita', 'AGO', '20', '9:00 PM', 'Activa');
