-- Remover índice relacionado ao CPF
DROP INDEX IF EXISTS idx_user_cpf;

-- Remover coluna CPF da tabela user
ALTER TABLE "user" DROP COLUMN IF EXISTS cpf;

