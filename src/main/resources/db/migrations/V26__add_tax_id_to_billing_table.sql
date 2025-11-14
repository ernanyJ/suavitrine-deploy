-- Migration para adicionar campo tax_id na tabela billing
-- V26__add_tax_id_to_billing_table.sql

-- Adicionar coluna tax_id na tabela billing (inicialmente nullable para permitir atualização de registros existentes)
ALTER TABLE billing
ADD COLUMN tax_id VARCHAR(20);

-- Atualizar registros existentes com CNPJ da loja (se disponível)
UPDATE billing b
SET tax_id = s.cnpj
FROM store s
WHERE b.store_id = s.id AND s.cnpj IS NOT NULL AND b.tax_id IS NULL;

-- Para registros existentes sem CNPJ, usar um valor temporário
-- Nota: Estes registros são antigos e não devem ser usados para novos pagamentos
-- Se necessário, estes registros precisarão ser atualizados manualmente
UPDATE billing
SET tax_id = '00000000000'
WHERE tax_id IS NULL;

-- Tornar a coluna NOT NULL após atualizar todos os registros
ALTER TABLE billing
ALTER COLUMN tax_id SET NOT NULL;

-- Comentário para documentação
COMMENT ON COLUMN billing.tax_id IS 'CPF ou CNPJ usado para o pagamento (obrigatório para compliance)';

