-- Adicionar constraint UNIQUE na coluna slug da tabela store
ALTER TABLE store ADD CONSTRAINT uk_store_slug UNIQUE (slug);

-- Criar índice para melhorar performance (PostgreSQL cria automaticamente, mas é bom documentar)
CREATE INDEX IF NOT EXISTS idx_store_slug ON store(slug) WHERE deleted_at IS NULL;


