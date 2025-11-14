-- Add theme configuration columns to store table
ALTER TABLE store ADD COLUMN primary_color VARCHAR(20) NULL;
ALTER TABLE store ADD COLUMN theme_mode VARCHAR(20) NULL;
ALTER TABLE store ADD COLUMN primary_font VARCHAR(100) NULL;
ALTER TABLE store ADD COLUMN secondary_font VARCHAR(100) NULL;
ALTER TABLE store ADD COLUMN rounded_level VARCHAR(20) NULL;

