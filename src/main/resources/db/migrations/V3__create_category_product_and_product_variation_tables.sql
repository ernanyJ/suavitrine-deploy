CREATE TABLE IF NOT EXISTS "category" (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    store_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (store_id) REFERENCES "store"(id)
);

CREATE TABLE IF NOT EXISTS "product" (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    image_url VARCHAR(500),
    description VARCHAR(2000),
    store_id UUID NOT NULL,
    category_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (store_id) REFERENCES "store"(id),
    FOREIGN KEY (category_id) REFERENCES "category"(id)
);

CREATE TABLE IF NOT EXISTS "product_variation" (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    product_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES "product"(id)
);

-- Índices para melhorar a performance das consultas
CREATE INDEX idx_category_store_id ON "category"(store_id);
CREATE INDEX idx_category_deleted_at ON "category"(deleted_at);

CREATE INDEX idx_product_store_id ON "product"(store_id);
CREATE INDEX idx_product_category_id ON "product"(category_id);
CREATE INDEX idx_product_deleted_at ON "product"(deleted_at);

CREATE INDEX idx_product_variation_product_id ON "product_variation"(product_id);
CREATE INDEX idx_product_variation_deleted_at ON "product_variation"(deleted_at);

