-- Create parenting_tips table for feed tip nuggets
CREATE TABLE IF NOT EXISTS parenting_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT,
  min_age_weeks INTEGER NOT NULL DEFAULT 0,
  max_age_weeks INTEGER NOT NULL DEFAULT 260,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE parenting_tips ENABLE ROW LEVEL SECURITY;

-- Everyone can read tips
CREATE POLICY "Anyone can view tips" ON parenting_tips
  FOR SELECT USING (true);

-- Seed initial tips
INSERT INTO parenting_tips (title, content, category, icon, min_age_weeks, max_age_weeks, priority) VALUES
('Teething hack', 'Frozen banana slices are safe and soothing for sore gums!', 'health', '🍌', 16, 52, 10),
('Tummy time', 'Tummy time helps prevent flat head syndrome. Aim for 3-5 minutes, 3x daily.', 'development', '🧸', 4, 24, 8),
('White noise magic', 'White noise at 50dB can improve baby sleep by 40%!', 'sleep', '😴', 0, 52, 9),
('Safe sleep', 'Always place baby on their back to sleep—reduces SIDS risk by 50%.', 'safety', '🛏️', 0, 52, 10),
('Feeding cue', 'Watch for hunger cues: hand-to-mouth, rooting, sucking motions.', 'feeding', '🍼', 0, 26, 7),
('Bath time tip', 'Test water with your elbow—it should feel warm, not hot.', 'safety', '🛁', 0, 104, 6),
('Diaper rash remedy', 'Let baby go diaper-free for short periods to air out skin naturally.', 'health', '🩹', 0, 104, 5),
('Reading benefits', 'Read aloud daily—even newborns benefit from hearing your voice and rhythm.', 'development', '📚', 0, 260, 8),
('Burping technique', 'Try different positions: over shoulder, sitting up, or lying on lap.', 'feeding', '💨', 0, 26, 6),
('Sleep schedule', 'Consistent bedtime routines help babies sleep better—start around 6-8 weeks.', 'sleep', '🌙', 8, 104, 7);

-- Create index for faster age-based queries
CREATE INDEX idx_parenting_tips_age_range ON parenting_tips(min_age_weeks, max_age_weeks);