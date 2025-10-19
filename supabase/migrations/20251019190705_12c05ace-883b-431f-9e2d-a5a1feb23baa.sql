-- Fix function search path security issue
CREATE OR REPLACE FUNCTION mark_recommendations_stale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE babies 
  SET recommendation_refresh_needed = true
  WHERE id = NEW.baby_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;