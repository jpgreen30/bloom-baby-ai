-- Create pregnancy_alerts table for medical appointments and screenings
CREATE TABLE public.pregnancy_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id UUID REFERENCES public.babies(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('appointment', 'screening', 'milestone', 'preparation')),
  title TEXT NOT NULL,
  description TEXT,
  due_week INTEGER NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pregnancy_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own pregnancy alerts" 
ON public.pregnancy_alerts
FOR SELECT 
USING (
  baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update own pregnancy alerts" 
ON public.pregnancy_alerts
FOR UPDATE 
USING (
  baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert own pregnancy alerts" 
ON public.pregnancy_alerts
FOR INSERT 
WITH CHECK (
  baby_id IN (SELECT id FROM public.babies WHERE user_id = auth.uid())
);

-- Seed common pregnancy alerts data
INSERT INTO public.parenting_tips (title, category, content, icon, min_age_weeks, max_age_weeks, priority)
VALUES
  ('First Prenatal Visit', 'Medical', 'Schedule your first prenatal checkup with your OB/GYN. This visit includes confirmation of pregnancy, estimated due date, and initial health screening.', 'Calendar', -40, -36, 10),
  ('First Trimester Screening', 'Medical', 'Optional genetic screening tests (nuchal translucency ultrasound and blood tests) to assess risk for chromosomal abnormalities.', 'FileText', -29, -26, 8),
  ('Anatomy Scan', 'Medical', 'Detailed ultrasound to check baby''s development, organs, and growth. Often when gender can be revealed!', 'Baby', -22, -18, 10),
  ('Glucose Screening', 'Medical', 'Test for gestational diabetes. You''ll drink a glucose solution and have blood drawn an hour later.', 'Activity', -16, -12, 9),
  ('Group B Strep Test', 'Medical', 'Vaginal and rectal swab to check for GBS bacteria. If positive, you''ll receive antibiotics during labor.', 'Shield', -7, -3, 8),
  ('Weekly Checkups Begin', 'Medical', 'Starting around week 36, you''ll have weekly prenatal visits to monitor baby''s position, your blood pressure, and cervical changes.', 'Calendar', -5, -1, 9);

-- Add pregnancy preparation tips
INSERT INTO public.parenting_tips (title, category, content, icon, min_age_weeks, max_age_weeks, priority)
VALUES
  ('Take Prenatal Vitamins', 'Health', 'Folic acid is crucial for baby''s neural tube development. Take 400-800 mcg daily, ideally starting before conception.', 'Heart', -40, 0, 10),
  ('Stay Hydrated', 'Health', 'Drink 8-10 glasses of water daily. Proper hydration helps with amniotic fluid levels, reduces swelling, and prevents constipation.', 'Droplet', -40, 0, 8),
  ('Gentle Exercise', 'Health', 'Walking, swimming, and prenatal yoga are safe. Aim for 30 minutes most days. Exercise reduces back pain and prepares your body for labor.', 'Activity', -40, 0, 7),
  ('Create Birth Plan', 'Preparation', 'Outline your preferences for labor: pain management, who you want present, immediate postpartum wishes. Discuss with your provider.', 'FileText', -16, -4, 8),
  ('Pack Hospital Bag', 'Preparation', 'Include: ID, insurance cards, comfortable clothes, toiletries, phone charger, going-home outfit for baby, car seat.', 'ShoppingBag', -8, -2, 9),
  ('Install Car Seat', 'Preparation', 'Have it professionally inspected by a certified technician. Many fire stations and hospitals offer free inspections.', 'Car', -6, -2, 10),
  ('Meal Prep & Freeze', 'Preparation', 'Cook and freeze 10-15 meals now. You''ll be grateful for easy dinners in the first weeks postpartum.', 'UtensilsCrossed', -8, -2, 7),
  ('Learn Baby Basics', 'Education', 'Take newborn care class covering diapering, bathing, swaddling, and safe sleep. Practice on a doll if possible.', 'Baby', -12, -4, 8),
  ('Understand Labor Signs', 'Education', 'Know the difference between Braxton Hicks and real contractions. Learn when to call your doctor and when to go to the hospital.', 'AlertCircle', -8, -2, 9),
  ('Tour Birth Facility', 'Preparation', 'Schedule a tour of your hospital or birth center. Know where to park, which entrance to use, and what to expect.', 'Building', -10, -4, 7);