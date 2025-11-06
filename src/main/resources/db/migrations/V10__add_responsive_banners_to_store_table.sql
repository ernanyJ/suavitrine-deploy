-- Add new responsive banner columns
ALTER TABLE "store" ADD COLUMN IF NOT EXISTS banner_desktop_url VARCHAR(500);
ALTER TABLE "store" ADD COLUMN IF NOT EXISTS banner_tablet_url VARCHAR(500);
ALTER TABLE "store" ADD COLUMN IF NOT EXISTS banner_mobile_url VARCHAR(500);

-- Migrate existing banner_url to banner_desktop_url if it exists
UPDATE "store" 
SET banner_desktop_url = banner_url 
WHERE banner_url IS NOT NULL;

-- Remove the old banner_url column
ALTER TABLE "store" DROP COLUMN IF EXISTS banner_url;

