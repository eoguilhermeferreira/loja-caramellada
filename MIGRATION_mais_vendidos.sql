-- Rodar este SQL no painel do Supabase (SQL Editor) uma única vez
-- Menu: SQL Editor → New Query → colar tudo abaixo → Run

-- Coluna de cor nos tamanhos (necessária para mostrar seletor de cor no produto)
ALTER TABLE product_sizes ADD COLUMN IF NOT EXISTS color text DEFAULT null;

-- Coluna de mais vendido nos produtos
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false;
