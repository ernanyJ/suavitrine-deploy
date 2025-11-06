-- Migration para criar tabelas de métricas
-- V16__create_metrics_tables.sql

-- Criar tabela store_events
CREATE TABLE store_events (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              store_id UUID NOT NULL REFERENCES store(id) ON DELETE CASCADE,
                              event_type VARCHAR(50) NOT NULL,
                              entity_id UUID,
                              entity_type VARCHAR(50),
                              metadata TEXT,
                              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela store_metrics
CREATE TABLE store_metrics (
                               id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                               store_id UUID NOT NULL REFERENCES store(id) ON DELETE CASCADE,
                               date DATE NOT NULL,
                               daily_accesses INTEGER NOT NULL DEFAULT 0,
                               product_clicks INTEGER NOT NULL DEFAULT 0,
                               product_conversions INTEGER NOT NULL DEFAULT 0,
                               category_clicks INTEGER NOT NULL DEFAULT 0,
                               category_accesses INTEGER NOT NULL DEFAULT 0,
                               top_products TEXT,
                               top_categories TEXT,
                               created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                               updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices para store_events
CREATE INDEX idx_store_events_store_id ON store_events(store_id);
CREATE INDEX idx_store_events_event_type ON store_events(event_type);
CREATE INDEX idx_store_events_created_at ON store_events(created_at);
CREATE INDEX idx_store_events_store_type_date ON store_events(store_id, event_type, created_at);
CREATE INDEX idx_store_events_entity_id ON store_events(entity_id) WHERE entity_id IS NOT NULL;

-- Índices para store_metrics
CREATE INDEX idx_store_metrics_store_id ON store_metrics(store_id);
CREATE INDEX idx_store_metrics_date ON store_metrics(date);
CREATE INDEX idx_store_metrics_store_date ON store_metrics(store_id, date);

-- Índice único para evitar duplicatas de métricas diárias
-- Usando CAST para DATE (imutável)
CREATE UNIQUE INDEX idx_store_metrics_store_date_unique
    ON store_metrics(store_id, date);

-- Índices compostos para consultas otimizadas
CREATE INDEX idx_store_events_store_type_entity_date ON store_events(store_id, event_type, entity_id, created_at);
CREATE INDEX idx_store_events_type_entity_date ON store_events(event_type, entity_id, created_at);

-- Comentários para documentação
COMMENT ON TABLE store_events IS 'Tabela para armazenar eventos individuais de métricas';
COMMENT ON TABLE store_metrics IS 'Tabela para armazenar métricas agregadas por dia';

COMMENT ON COLUMN store_events.event_type IS 'Tipo do evento: STORE_ACCESS, PRODUCT_CLICK, PRODUCT_CONVERSION, CATEGORY_CLICK, CATEGORY_ACCESS';
COMMENT ON COLUMN store_events.entity_id IS 'ID da entidade relacionada (produto, categoria ou loja)';
COMMENT ON COLUMN store_events.entity_type IS 'Tipo da entidade: STORE, PRODUCT, CATEGORY';
COMMENT ON COLUMN store_events.metadata IS 'Dados adicionais do evento em formato JSON';

COMMENT ON COLUMN store_metrics.date IS 'Data das métricas (início do dia)';
COMMENT ON COLUMN store_metrics.daily_accesses IS 'Número de acessos à loja no dia';
COMMENT ON COLUMN store_metrics.product_clicks IS 'Número de cliques em produtos no dia';
COMMENT ON COLUMN store_metrics.product_conversions IS 'Número de conversões de produtos no dia';
COMMENT ON COLUMN store_metrics.category_clicks IS 'Número de cliques em categorias no dia';
COMMENT ON COLUMN store_metrics.category_accesses IS 'Número de acessos a categorias no dia';
COMMENT ON COLUMN store_metrics.top_products IS 'JSON com top produtos do dia';
COMMENT ON COLUMN store_metrics.top_categories IS 'JSON com top categorias do dia';