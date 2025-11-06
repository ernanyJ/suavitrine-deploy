-- Adicionar coluna created_at na tabela billing
ALTER TABLE billing ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN billing.created_at IS 'Data e hora de criação do registro de faturamento';

