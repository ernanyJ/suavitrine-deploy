-- Adicionar coluna para armazenar cupons usados no pagamento (JSON string)
ALTER TABLE billing ADD COLUMN coupons_used TEXT;

-- Comentário para documentação
COMMENT ON COLUMN billing.coupons_used IS 'Cupons usados no pagamento, armazenado como JSON string (ex: ["RRFULLSTACKDEVS"])';

