-- Permite subir una imagen real por rifa desde el panel admin, en vez del
-- placeholder de texto (image_label) que usa el prototipo.

alter table rifas add column if not exists image_url text;

-- Bucket público: las imágenes se muestran en la página pública de rifas,
-- a diferencia de comprobantes (privado, solo admin).
insert into storage.buckets (id, name, public)
values ('rifa-images', 'rifa-images', true)
on conflict (id) do nothing;

create policy "rifa_images_select_public" on storage.objects
  for select using (bucket_id = 'rifa-images');
create policy "rifa_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'rifa-images' and is_admin());
create policy "rifa_images_admin_update" on storage.objects
  for update using (bucket_id = 'rifa-images' and is_admin());
create policy "rifa_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'rifa-images' and is_admin());
