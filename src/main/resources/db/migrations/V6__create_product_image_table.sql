CREATE TABLE IF NOT EXISTS "product_image" (
    id UUID PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    display_order INTEGER,
    product_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES "product"(id)
);

CREATE INDEX idx_product_image_product_id ON "product_image"(product_id);
CREATE INDEX idx_product_image_deleted_at ON "product_image"(deleted_at);



