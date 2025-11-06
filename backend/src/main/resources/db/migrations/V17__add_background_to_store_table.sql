-- Add background configuration columns to store table
ALTER TABLE store ADD COLUMN IF NOT EXISTS background_type VARCHAR(20) NULL;
ALTER TABLE store ADD COLUMN IF NOT EXISTS background_enabled BOOLEAN NULL;
ALTER TABLE store ADD COLUMN IF NOT EXISTS background_opacity DOUBLE PRECISION NULL;
ALTER TABLE store ADD COLUMN IF NOT EXISTS background_color VARCHAR(20) NULL;
ALTER TABLE store ADD COLUMN IF NOT EXISTS background_config_json VARCHAR(2000) NULL;

