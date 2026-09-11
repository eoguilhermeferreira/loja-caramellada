-- Rodar este SQL no painel do Supabase (SQL Editor) uma única vez
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller boolean NOT NULL DEFAULT false;
