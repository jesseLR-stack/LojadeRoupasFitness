-- Atualização 4: nova paleta de cores dos produtos.
-- Converte as cores antigas para as novas. Pode rodar mais de uma vez sem problema.
-- Como usar: no Supabase, abra "SQL Editor", cole este arquivo e clique em "Run".

update public.products set colors = array_replace(colors, 'lima',   'verde-limao') where 'lima'   = any(colors);
update public.products set colors = array_replace(colors, 'oceano', 'azul')        where 'oceano' = any(colors);
update public.products set colors = array_replace(colors, 'areia',  'bege')        where 'areia'  = any(colors);
update public.products set colors = array_replace(colors, 'coral',  'laranja')     where 'coral'  = any(colors);
-- O "verde" antigo era o Verde Militar; na paleta nova "verde" é um verde vivo.
-- Rode a linha abaixo UMA vez só (antes de cadastrar produtos com o verde novo):
update public.products set colors = array_replace(colors, 'verde', 'verde-militar') where 'verde' = any(colors) and not ('verde-militar' = any(colors));
