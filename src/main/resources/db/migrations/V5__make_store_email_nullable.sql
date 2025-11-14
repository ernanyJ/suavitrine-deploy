-- Make optional fields nullable in store table
ALTER TABLE store ALTER COLUMN email DROP NOT NULL;
ALTER TABLE store ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE store ALTER COLUMN instagram DROP NOT NULL;
ALTER TABLE store ALTER COLUMN facebook DROP NOT NULL;

