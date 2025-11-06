-- Adiciona campo promotional_price na tabela product para preço promocional
ALTER TABLE product ADD COLUMN promotional_price INTEGER;

-- Adiciona campo show_promotion_badge na tabela product para exibir badge de promoção
ALTER TABLE product ADD COLUMN show_promotion_badge BOOLEAN DEFAULT FALSE;

-- Comentários explicativos
COMMENT ON COLUMN product.promotional_price IS 'Preço promocional em centavos para evitar problemas com ponto flutuante';
COMMENT ON COLUMN product.show_promotion_badge IS 'Indica se deve exibir o badge de promoção no produto';

