-- Track last recommendation generation time
ALTER TABLE babies 
ADD COLUMN IF NOT EXISTS last_recommendation_generated timestamptz,
ADD COLUMN IF NOT EXISTS recommendation_refresh_needed boolean DEFAULT true;

-- Optimize recommendation queries (removed WHERE clause to avoid IMMUTABLE error)
CREATE INDEX IF NOT EXISTS idx_recommendations_user_recent 
ON product_recommendations(user_id, recommended_at DESC);

-- Add urgency column for time-sensitive recommendations
ALTER TABLE product_recommendations 
ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high'));

-- Function to mark recommendations as needing refresh
CREATE OR REPLACE FUNCTION mark_recommendations_stale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE babies 
  SET recommendation_refresh_needed = true
  WHERE id = NEW.baby_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on milestone updates to refresh recommendations
DROP TRIGGER IF EXISTS refresh_recommendations_on_milestone ON baby_milestones;
CREATE TRIGGER refresh_recommendations_on_milestone
AFTER INSERT OR UPDATE ON baby_milestones
FOR EACH ROW
EXECUTE FUNCTION mark_recommendations_stale();