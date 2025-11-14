CREATE TABLE IF NOT EXISTS "address" (
    id UUID PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS "store" (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    instagram VARCHAR(100),
    facebook VARCHAR(100),

    address_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (address_id) REFERENCES "address"(id)
);

CREATE TABLE IF NOT EXISTS "store_user" (
    id UUID PRIMARY KEY,
    store_id UUID,
    user_id UUID,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    FOREIGN KEY (store_id) REFERENCES "store"(id),
    FOREIGN KEY (user_id) REFERENCES "user"(id)
);

