-- Migration para criar tabela de faturamento
-- V20__create_billing_table.sql

-- Criar tabela billing
CREATE TABLE billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES store(id) ON DELETE CASCADE,
    payer_id UUID REFERENCES store_user(id) ON DELETE SET NULL,
    paying_plan VARCHAR(50) NOT NULL,
    plan_duration VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    external_id VARCHAR(255),
    payment_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Índices para melhorar a performance das consultas
CREATE INDEX idx_billing_store_id ON billing(store_id);
CREATE INDEX idx_billing_payer_id ON billing(payer_id) WHERE payer_id IS NOT NULL;
CREATE INDEX idx_billing_paying_plan ON billing(paying_plan);
CREATE INDEX idx_billing_expires_at ON billing(expires_at);
CREATE INDEX idx_billing_paid_at ON billing(paid_at) WHERE paid_at IS NOT NULL;
CREATE INDEX idx_billing_external_id ON billing(external_id) WHERE external_id IS NOT NULL;

-- Índices compostos para consultas otimizadas
CREATE INDEX idx_billing_store_expires_at ON billing(store_id, expires_at);
CREATE INDEX idx_billing_store_paid_at ON billing(store_id, paid_at) WHERE paid_at IS NOT NULL;

-- Comentários para documentação
COMMENT ON TABLE billing IS 'Tabela para armazenar solicitações de faturamento e planos';
COMMENT ON COLUMN billing.store_id IS 'ID da loja associada ao faturamento';
COMMENT ON COLUMN billing.payer_id IS 'ID do usuário responsável pelo pagamento';
COMMENT ON COLUMN billing.paying_plan IS 'Plano de pagamento: FREE, BASIC, PRO';
COMMENT ON COLUMN billing.plan_duration IS 'Duração do plano: MONTHLY, YEARLY';
COMMENT ON COLUMN billing.price IS 'Preço do plano em centavos';
COMMENT ON COLUMN billing.external_id IS 'ID do billing na plataforma Abacate Pay';
COMMENT ON COLUMN billing.payment_url IS 'URL para realizar o pagamento na Abacate Pay';
COMMENT ON COLUMN billing.paid_at IS 'Data e hora em que o pagamento foi realizado';
COMMENT ON COLUMN billing.expires_at IS 'Data e hora de expiração do plano';

