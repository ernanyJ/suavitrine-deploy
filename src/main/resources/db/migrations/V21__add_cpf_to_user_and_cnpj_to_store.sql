-- Adicionar coluna CPF obrigatória na tabela user
ALTER TABLE "user" ADD COLUMN cpf VARCHAR(11) NOT NULL;

-- Adicionar coluna CNPJ opcional na tabela store
ALTER TABLE store ADD COLUMN cnpj VARCHAR(14) NULL;

CREATE INDEX idx_user_cpf ON "user"(cpf);

CREATE INDEX idx_store_cnpj ON store(cnpj) WHERE cnpj IS NOT NULL;
