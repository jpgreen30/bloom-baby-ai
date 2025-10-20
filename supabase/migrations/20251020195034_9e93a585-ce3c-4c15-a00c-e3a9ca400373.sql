-- Create awin_products table to cache affiliate products
CREATE TABLE IF NOT EXISTS public.awin_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  awin_product_id TEXT UNIQUE NOT NULL,
  merchant_id TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT,
  subcategory TEXT,
  age_range TEXT,
  product_url TEXT NOT NULL,
  image_url TEXT,
  brand TEXT,
  stock_status TEXT DEFAULT 'in_stock',
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_awin_products_category ON public.awin_products(category);
CREATE INDEX IF NOT EXISTS idx_awin_products_age_range ON public.awin_products(age_range);
CREATE INDEX IF NOT EXISTS idx_awin_products_merchant ON public.awin_products(merchant_id);

-- Enable RLS on awin_products
ALTER TABLE public.awin_products ENABLE ROW LEVEL SECURITY;

-- Anyone can view Awin products
CREATE POLICY "Anyone can view awin products"
  ON public.awin_products
  FOR SELECT
  USING (true);

-- System can insert/update Awin products
CREATE POLICY "System can manage awin products"
  ON public.awin_products
  FOR ALL
  USING (true);

-- Create awin_recommendations table to track affiliate recommendations
CREATE TABLE IF NOT EXISTS public.awin_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  awin_product_id UUID NOT NULL REFERENCES awin_products(id) ON DELETE CASCADE,
  relevance_score NUMERIC NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  reason TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('high', 'medium', 'low')),
  clicked BOOLEAN DEFAULT false,
  purchased BOOLEAN DEFAULT false,
  commission_earned NUMERIC DEFAULT 0,
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_awin_recs_user ON public.awin_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_awin_recs_score ON public.awin_recommendations(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_awin_recs_product ON public.awin_recommendations(awin_product_id);

-- Enable RLS on awin_recommendations
ALTER TABLE public.awin_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can view their own recommendations
CREATE POLICY "Users can view own awin recommendations"
  ON public.awin_recommendations
  FOR SELECT
  USING (user_id = auth.uid());

-- System can insert recommendations
CREATE POLICY "System can insert awin recommendations"
  ON public.awin_recommendations
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own recommendations (click tracking)
CREATE POLICY "Users can update own awin recommendations"
  ON public.awin_recommendations
  FOR UPDATE
  USING (user_id = auth.uid());

-- Add Awin tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS awin_click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS awin_conversion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS awin_commission_earned NUMERIC DEFAULT 0;