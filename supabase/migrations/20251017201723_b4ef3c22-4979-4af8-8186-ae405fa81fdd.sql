-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create babies table
CREATE TABLE public.babies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  gender TEXT,
  birth_weight NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;

-- RLS policies for babies
CREATE POLICY "Users can view own babies"
  ON public.babies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own babies"
  ON public.babies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own babies"
  ON public.babies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own babies"
  ON public.babies FOR DELETE
  USING (auth.uid() = user_id);

-- Create milestones reference table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('motor', 'cognitive', 'social', 'language')),
  typical_age_weeks INTEGER NOT NULL,
  age_range_weeks TEXT,
  tips TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (public read)
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view milestones"
  ON public.milestones FOR SELECT
  USING (true);

-- Create baby_milestones tracking table
CREATE TABLE public.baby_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'achieved', 'delayed')),
  achieved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(baby_id, milestone_id)
);

-- Enable RLS
ALTER TABLE public.baby_milestones ENABLE ROW LEVEL SECURITY;

-- RLS policies for baby_milestones
CREATE POLICY "Users can view own baby milestones"
  ON public.baby_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.babies WHERE babies.id = baby_milestones.baby_id AND babies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own baby milestones"
  ON public.baby_milestones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.babies WHERE babies.id = baby_milestones.baby_id AND babies.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own baby milestones"
  ON public.baby_milestones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.babies WHERE babies.id = baby_milestones.baby_id AND babies.user_id = auth.uid()
  ));

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_babies_updated_at
  BEFORE UPDATE ON public.babies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_baby_milestones_updated_at
  BEFORE UPDATE ON public.baby_milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert reference milestone data (0-24 months)
INSERT INTO public.milestones (title, description, category, typical_age_weeks, age_range_weeks, tips, order_index) VALUES
-- 0-3 months
('First Social Smile', 'Baby smiles in response to your voice or face', 'social', 6, '4-8', 'Talk and smile at your baby often. Make eye contact during feeding and play time.', 1),
('Lifts Head During Tummy Time', 'Can lift head briefly during tummy time', 'motor', 8, '6-10', 'Practice tummy time several times a day, starting with just a few minutes.', 2),
('Tracks Objects with Eyes', 'Follows moving objects with eyes', 'cognitive', 8, '6-10', 'Slowly move colorful objects across baby''s field of vision.', 3),
('Coos and Makes Sounds', 'Makes cooing sounds and gurgles', 'language', 8, '6-10', 'Respond to baby''s sounds with your own coos. This teaches conversation.', 4),

-- 4-6 months  
('Rolls Over', 'Rolls from tummy to back or back to tummy', 'motor', 16, '14-20', 'Give baby plenty of floor time to practice. Place toys just out of reach.', 5),
('Laughs Out Loud', 'Laughs and giggles in response to play', 'social', 16, '14-18', 'Play peekaboo and make silly faces to encourage laughter.', 6),
('Reaches for Toys', 'Reaches out to grab toys and objects', 'motor', 18, '16-20', 'Place interesting toys within reach during play time.', 7),
('Babbles with Consonants', 'Starts making "ba-ba" or "da-da" sounds', 'language', 20, '18-24', 'Repeat baby''s babbles back. This encourages more vocalization.', 8),

-- 7-9 months
('Sits Without Support', 'Sits up without help for several minutes', 'motor', 28, '24-32', 'Practice sitting with pillows for support, gradually removing them.', 9),
('Transfers Objects', 'Passes toys from one hand to the other', 'cognitive', 28, '26-30', 'Offer toys and watch baby explore different ways to hold them.', 10),
('Responds to Name', 'Turns head when name is called', 'social', 30, '28-34', 'Use baby''s name often during daily activities.', 11),
('Shows Stranger Anxiety', 'May be wary of unfamiliar people', 'social', 32, '28-36', 'This is normal! Give baby time to warm up to new people.', 12),

-- 10-12 months
('Crawls', 'Moves around by crawling on hands and knees', 'motor', 36, '32-40', 'Create safe spaces for exploration. Babyproof your home.', 13),
('Pulls to Stand', 'Pulls self up to standing position', 'motor', 38, '36-42', 'Ensure furniture is stable. Supervise closely during this stage.', 14),
('Says First Words', 'Says "mama" or "dada" with meaning', 'language', 40, '38-48', 'Respond enthusiastically to first words. Name objects baby points to.', 15),
('Waves Bye-Bye', 'Waves goodbye on their own or when prompted', 'social', 40, '36-44', 'Wave bye-bye regularly and help baby practice the motion.', 16),
('Uses Pincer Grasp', 'Picks up small objects with thumb and finger', 'motor', 40, '38-44', 'Offer safe finger foods to practice this skill.', 17),

-- 13-18 months
('Takes First Steps', 'Walks independently for a few steps', 'motor', 52, '48-60', 'Hold hands for support initially. Celebrate each step!', 18),
('Points to Objects', 'Points to things they want or find interesting', 'cognitive', 52, '48-56', 'Point at objects and name them. Follow baby''s pointing.', 19),
('Says 3-5 Words', 'Uses several words consistently', 'language', 60, '52-68', 'Read books together daily. Name objects during daily routines.', 20),
('Stacks 2 Blocks', 'Can stack two blocks or toys on top of each other', 'cognitive', 64, '60-72', 'Provide blocks and demonstrate stacking.', 21),
('Drinks from Cup', 'Can drink from a cup with help', 'motor', 56, '52-64', 'Offer sippy cups during meals. Expect spills!', 22),

-- 19-24 months
('Runs', 'Runs (though may fall sometimes)', 'motor', 76, '72-84', 'Provide safe spaces for active play. Supervise outdoor time.', 23),
('Kicks a Ball', 'Can kick a ball forward', 'motor', 80, '76-88', 'Play ball games together. This builds coordination.', 24),
('Says 20+ Words', 'Uses 20 or more words regularly', 'language', 88, '80-96', 'Talk throughout the day. Expand on what your toddler says.', 25),
('Follows Simple Instructions', 'Can follow two-step directions', 'cognitive', 88, '84-96', 'Give clear, simple directions. Make it a game!', 26),
('Plays Pretend', 'Engages in simple pretend play', 'cognitive', 92, '88-100', 'Provide props like toy phones and tea sets.', 27),
('Scribbles with Crayons', 'Makes marks with crayons or markers', 'motor', 80, '72-92', 'Offer large crayons and paper. Display their artwork!', 28);