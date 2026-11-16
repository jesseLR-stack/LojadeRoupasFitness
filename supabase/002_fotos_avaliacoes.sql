-- Atualização 2: fotos dos produtos e avaliações reais.
-- Como usar: no Supabase, abra "SQL Editor", cole este arquivo inteiro e clique em "Run".
-- Pode rodar mais de uma vez sem problema.

-- 1. Lista de fotos de cada produto (a primeira é a principal).
alter table public.products add column if not exists images text[] not null default '{}';

-- 2. Avaliações: começam zeradas e só aparecem na loja quando houver avaliações de clientes.
alter table public.products alter column rating set default 0;
update public.products set rating = 0, reviews = 0 where reviews > 0;

-- 3. Espaço para guardar as fotos (Supabase Storage).
--    Público para leitura (as fotos aparecem na loja); só o servidor da loja pode enviar ou apagar.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
