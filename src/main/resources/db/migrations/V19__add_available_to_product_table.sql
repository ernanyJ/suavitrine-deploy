-- Adiciona coluna available na tabela product
ALTER TABLE product ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT true;

