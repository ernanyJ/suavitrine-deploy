-- Adiciona campo display_order na tabela product para ordenação dentro da categoria
ALTER TABLE product ADD COLUMN display_order INTEGER;

-- Cria índice para melhorar performance das consultas ordenadas por categoria
CREATE INDEX idx_product_category_display_order ON product(category_id, display_order) WHERE deleted_at IS NULL;

-- Comentário explicativo
COMMENT ON COLUMN product.display_order IS 'Ordem de exibição do produto dentro da categoria. Valores menores aparecem primeiro.';
